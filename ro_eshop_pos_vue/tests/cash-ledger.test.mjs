import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {runInNewContext} from 'node:vm';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';
const base=resolve(dirname(fileURLToPath(import.meta.url)),'../src');
const cache=new Map(),memory=new Map();
const localStorage={getItem:()=>null,setItem:()=>{}};
const offline={preparedAt:{value:''},pending:{value:[]},read:async key=>structuredClone(memory.get(key)),mutate:async(key,update)=>{const result=update(structuredClone(memory.get(key)));memory.set(key,structuredClone(result));return result;}};
function load(name){if(name==='offline')return offline;const filename=resolve(base,name+'.ts');if(cache.has(filename))return cache.get(filename);const module={exports:{}};cache.set(filename,module.exports);const code=ts.transpileModule(readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;runInNewContext(code,{module,exports:module.exports,Date,crypto,structuredClone,localStorage,navigator:{},document:{documentElement:{lang:''}},require:spec=>spec.startsWith('.')?load(resolve(dirname(filename),spec).slice(base.length+1)):createRequire(import.meta.url)(spec)});return module.exports;}
const cash=load('cashLedger'),pending=load('pendingOrders');
const productUid='10000000-0000-4000-8000-000000000001';
function state(){return {currency_code:'CNY',categories:[],products:[{uid:productUid,id:1,name:'Milk',sale_price:6,barcode:'MILK',active:true}],orders:[],members:[],member_entries:[]};}
function sale(overrides={}){return {request_key:crypto.randomUUID(),order_line:[{id:1,qty:2}],currency_code:'CNY',amount:12,received:20,...overrides};}
test('cash total, change inputs, and duplicate requests remain consistent',()=>{const db=state(),args=sale();const order=cash.saveCashSale(db,args);assert.equal(order.amount,12);assert.equal(order.received,20);assert.equal(cash.saveCashSale(db,args),order);assert.equal(db.orders.length,1);assert.throws(()=>cash.saveCashSale(db,{...args,received:30}),/内容不一致/);});
test('reject unsupported payment, member assets, insufficient tender and stale totals',()=>{for(const args of [{payment_method:'wallet'},{member_id:1},{use_points:true},{received:10},{amount:10}]){const db=state();assert.throws(()=>cash.saveCashSale(db,sale(args)));assert.equal(db.orders.length,0);}});
test('disabled product and ancestor category cannot be sold',()=>{let db=state();db.products[0].active=false;assert.throws(()=>cash.quoteLocal(db,{order_line:[{id:1,qty:1}]}),/停用/);db=state();db.categories=[{uid:'root',active:false},{uid:'child',parent_uid:'root'}];db.products[0].category_uid='child';assert.throws(()=>cash.quoteLocal(db,{order_line:[{id:1,qty:1}]}),/分类已停用/);});
test('manual and imported orders are unpaid until cash settlement; retries are idempotent',()=>{const db=state(),args=sale();const order=pending.createPendingOrder(db,args);assert.equal(order.state,'draft');assert.equal(pending.isPaidOrder(order),false);assert.equal(pending.createPendingOrder(db,args),order);assert.throws(()=>pending.createPendingOrder(db,{...args,order_line:[{id:1,qty:3}]}),/内容不同/);const pay={order_id:order.uid,request_key:crypto.randomUUID(),received:20};pending.settlePendingOrder(db,pay);assert.equal(order.state,'done');assert.equal(pending.settlePendingOrder(db,pay),order);assert.equal(db.orders.length,1);assert.throws(()=>pending.settlePendingOrder(db,{...pay,request_key:crypto.randomUUID()}),/不是待付款/);});
test('closed pending orders cannot be collected',()=>{const db=state();const order=pending.createPendingOrder(db,sale());pending.closePendingOrder(db,{order_id:order.uid});assert.equal(pending.isPaidOrder(order),false);assert.throws(()=>pending.settlePendingOrder(db,{order_id:order.uid,request_key:crypto.randomUUID(),received:20}));});
test('backup scope rejects premium data instead of silently dropping it',()=>{for(const extra of [{members:[{uid:'x'}]},{member_entries:[{}]},{orders:[{payment_method:'wallet'}]},{orders:[{points_used:1}]},{orders:[{member_uid:'x'}]}])assert.throws(()=>cash.validateLocalScope({...state(),...extra}),/不支持导入/);assert.doesNotThrow(()=>cash.validateLocalScope(state()));});

test('local API demo, order creation, cash collection, backup round trip and import conflicts',async()=>{
 const app=load('standalone');await app.initStandalone();await app.loadDemoData();
 let db=await app.exportLocalData();assert.equal(db.products.length,90);assert.equal(db.members.length,0);
 const verified=app.validateBackup(db);assert.equal(verified.orders.length,20);
 const product=db.products[0],request={request_key:crypto.randomUUID(),order_line:[{id:product.id,qty:2}],currency_code:'CNY',note:'test-local'};
 const pendingOrder=await app.standaloneApi('create_order',request);assert.equal(pendingOrder.state,'draft');
 assert.equal((await app.standaloneApi('create_order',request)).id,pendingOrder.id);
 const received=pendingOrder.total+10;
 const paid=await app.standaloneApi('pending_cash',{order_id:pendingOrder.id,request_key:crypto.randomUUID(),received});assert.equal(paid.cash_change,10);
 db=await app.exportLocalData();assert.equal(app.validateBackup(db).orders.length,21);
 const preview=await app.previewLocalImport(db);assert.equal(preview.orders,0);assert.ok(preview.skipped>0);
 const changed=structuredClone(db);changed.products[0].sale_price+=1;
 await assert.rejects(app.importLocalData(changed),/冲突/);
 assert.equal((await app.exportLocalData()).products[0].sale_price,product.sale_price);
 await assert.rejects(app.standaloneApi('members',{keyword:'x'}),/升级/);
});
