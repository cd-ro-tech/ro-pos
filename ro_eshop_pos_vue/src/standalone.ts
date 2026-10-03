import { createPendingOrder, settlePendingOrder, closePendingOrder, isPaidOrder } from './pendingOrders';
import { planBulkStatus } from './bulkStatus';
import { amountTotals } from './amountTotals';
import { localProductDetail, saveLocalVariants } from './localProductVariants';
import { productAttributes } from './productVariants';
import { returnLines, saveLocalReturn, validateReturns } from './localReturns';
import { assertLocalEdition } from './edition';
import { quoteLocal, saveCashSale, validateLocalScope } from './cashLedger';
import { localCurrency, rememberCurrency, validCurrency } from './currency';
import { categoryDescendants, disabledCategoryUids } from './categoryTree';
import { sortRows } from './listSort';
import { read, mutate, preparedAt, pending, resetStandaloneRecords } from './offline';
import { businessText, validateTranslations } from './businessTranslations';
import { formatDateTime, locale, t } from './i18n';
import { standalone } from './mode';

const KEY='standalone-ledger-v1', FORMAT='ro-pos-standalone', VERSION=7, MAX_ROWS=500;
const uuid=()=>crypto.randomUUID();
const round=(n:number)=>Math.round((n+Number.EPSILON)*100)/100;
const fail=(message:string):never=>{throw Object.assign(new Error(message),{code:400});};
const text=(value:any,max=200)=>typeof value==='string'&&value.length<=max?value:fail('数据文本格式或长度不正确');
const id=(value:any)=>/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value)?String(value):fail('数据标识不正确');
const amount=(value:any)=>typeof value==='number'&&Number.isFinite(value)&&value>=0&&value<=1000000&&Math.abs(round(value)-value)<.000001?value:fail('金额须为有效金额，最多两位小数');
const blank=()=>({format:FORMAT,version:VERSION,installation:uuid(),currency_code:localCurrency.value,categories:[],products:[],members:[],orders:[],member_rules:{},member_entries:[]});

export const localSession={user:{id:-1,name:'单机收银员'},stores:[{id:-1,name:'本机门店',address:'',phone:'',can_manage_business:true}],can_manage:true,locked:false};

function migrate(value:any){
  const state=value?.format===FORMAT?structuredClone(value):blank();
  if(!Array.isArray(state.categories))state.categories=[];
  state.categories=state.categories.map((row:any,index:number)=>({uid:/^[a-f0-9-]{36}$/i.test(row.uid||'')?row.uid:uuid(),id:Number(row.id)||index+1,name:String(row.name||'本机商品').trim()||'本机商品',translations:validateTranslations(row.translations,['name']),active:row.active!==false,parent_uid:String(row.parent_uid||'')}));
  state.products=(Array.isArray(state.products)?state.products:[]).map((row:any)=>({...row,category_uid:row.category_uid||(Number(state.version)<5?state.categories[0]?.uid:'')||'',translations:validateTranslations(row.translations,['name','product_attrs','description_sale'])}));
  state.currency_code=validCurrency(state.currency_code||'CNY');
  state.orders=(state.orders||[]).map((row:any)=>({...row,currency_code:validCurrency(row.currency_code||'CNY')}));
  state.members=Array.isArray(state.members)?state.members:[];state.orders=Array.isArray(state.orders)?state.orders:[];state.member_rules={};state.member_entries=state.member_entries||[];state.version=VERSION;return state;
}
export async function initStandalone(){const ledger=await mutate(KEY,migrate);rememberCurrency(ledger.currency_code);preparedAt.value=new Date().toISOString();pending.value=[];void navigator.storage?.persist?.();return localSession;}
export async function exportLocalData(){return migrate(await read(KEY));}

const children=(state:any,uid:string)=>state.categories.filter((row:any)=>row.parent_uid===uid);
const categoryById=(state:any,value:any)=>state.categories.find((row:any)=>row.id===Number(value));
function categoryPath(state:any,row:any,localized=true){const names:string[]=[],seen=new Set<string>();let current=row;while(current){if(seen.has(current.uid))fail('商品分类层级存在循环');seen.add(current.uid);names.unshift(localized?businessText(current,'name'):current.name);current=current.parent_uid?state.categories.find((item:any)=>item.uid===current.parent_uid):null;}return names.join(' / ');}
function categoryLevel(state:any,row:any){let level=1,current=row;const seen=new Set([row.uid]);while(current.parent_uid){current=state.categories.find((item:any)=>item.uid===current.parent_uid);if(!current)break;if(seen.has(current.uid))fail('商品分类层级存在循环');seen.add(current.uid);level++;}return level;}
function categoryRows(state:any){const disabled=disabledCategoryUids(state.categories);return state.categories.map((row:any)=>({id:row.id,active:row.active!==false,effective_active:!disabled.has(row.uid),level:categoryLevel(state,row),eshop_categ_id:row.id,name:businessText(row,'name'),source_name:row.name,eshop_categ_name:categoryPath(state,row),parent_id:row.parent_uid?state.categories.find((parent:any)=>parent.uid===row.parent_uid)?.id||0:0,is_leaf:!children(state,row.uid).length,product_count:state.products.filter((product:any)=>product.category_uid===row.uid).length}));}
function pathParts(value:any){const parts=text(String(value||''),500).split('/').map(part=>part.trim()).filter(Boolean);if(!parts.length)fail('请选择商品分类或填写完整分类路径');if(parts.length>8||parts.some(part=>part.length>80))fail('商品分类最多 8 级，每级不超过 80 个字符');return parts;}
function findPath(state:any,value:any,create=false){let parent='',found:any=null;for(const name of pathParts(value)){found=state.categories.find((row:any)=>row.parent_uid===parent&&row.name===name);if(!found){if(!create)return null;if(parent&&state.products.some((p:any)=>p.category_uid===parent))fail('该分类已有商品，不能添加下级分类');found={uid:uuid(),id:Math.max(0,...state.categories.map((row:any)=>row.id))+1,name,parent_uid:parent};state.categories.push(found);}parent=found.uid;}return found;}
function resolveCategory(state:any,row:any,create=false){if(!Number(row.eshop_categ_id)&&!String(row.eshop_categ_name||'').trim())fail('请选择末级商品分类，或填写完整分类路径');const category=categoryById(state,row.eshop_categ_id)||(row.eshop_categ_name?findPath(state,row.eshop_categ_name,create):null);if(!category)fail('请选择末级商品分类，或填写完整分类路径');if(children(state,category.uid).length)fail('只能选择最末级商品分类');return category;}
function asProduct(row:any,state:any){const category=state.categories.find((item:any)=>item.uid===row.category_uid);return {...row,active:row.active!==false,name:businessText(row,'name'),description_sale:businessText(row,'description_sale'),sub_title:businessText(row,'description_sale'),source_name:row.name,price:row.sale_price,spec:businessText(row,'product_attrs')||'标准规格',sku:row.default_code,image:row.image?'data:image/png;base64,'+row.image:'',tax_rate:0,services:[],category_ids:category?[category.id]:[],eshop_categ_id:category?.id||0,eshop_categ_name:categoryPath(state,category)};}
function validateProduct(row:any){const image=text(row.image||'',7*1024*1024);if(image&&(!/^(iVBOR|\/9j\/|UklGR)/.test(image)||!/^[A-Za-z0-9+/]*={0,2}$/.test(image)))fail('商品图片格式不正确');const name=text(row.name).trim();if(!name)fail('商品名称不能为空');return {active:row.active!==false,uid:id(row.uid),template_uid:id(row.template_uid||row.uid),attribute_data:productAttributes(row.attribute_data),id:Number(row.id)||0,name,sale_price:amount(row.sale_price),barcode:text(row.barcode||'',80).trim(),default_code:text(row.default_code||'',80).trim(),product_attrs:text(row.product_attrs||'',120),description_sale:text(row.description_sale||'',5000),image,translations:validateTranslations(row.translations,['name','product_attrs','description_sale']),category_uid:row.category_uid?id(row.category_uid):''};}

export function localReceipt(order:any){return {id:order.uid,currency_code:order.currency_code||'CNY',receipt_code:'RO_POS_ORDER:'+order.uid,refunds:order.refunds||[],refund_total:round((order.refunds||[]).reduce((n:number,r:any)=>n+r.amount,0)),number:order.number||'单机-'+order.uid.slice(0,8),display_number:order.number||t('单机-{0}',[order.uid.slice(0,8)]),state:order.state||'done',state_name:order.state==='draft'?'待付款':order.state==='closed'?'已关闭':order.payment_method==='wallet'?'余额已支付':'现金已收',payment_method:isPaidOrder(order)?order.payment_method||'cash':'',note:order.note||'',is_local_pending:!!order.creation_request,is_offline:true,is_pos:false,fulfillment_type:'pos',store:localSession.stores[0],created_at:formatDateTime(order.at),cashier:'单机收银员',customer_name:!order.member_uid&&order.customer_name==='散客'?t('散客'):/^de[0-9a-f]{6}-0000-4000-8000-/.test(order.member_uid||'')&&/^Demo Customer(?: \d+)?$/.test(order.customer_name||'')?t('演示会员 {0}',[order.customer_name.replace('Demo Customer','').trim()||'1']):order.customer_name,member_number:order.member_number,lines:order.lines.map((line:any,index:number)=>({...line,id:index,total:round(line.qty*line.price)})),subtotal:order.subtotal??order.amount,tax:0,discount:order.discount||0,point_price:order.point_price||0,points_used:order.points_used||0,points_earned:order.points_earned||0,delivery_fare:0,total:order.amount,paid:isPaidOrder(order)?order.amount:0,payments:isPaidOrder(order)?[{type:order.payment_method||'cash',amount:order.amount}]:[],payment_data:[],cash_received:order.received,cash_change:!isPaidOrder(order)||order.payment_method==='wallet'?0:round(order.received-order.amount)};}
export async function saveLocalOrder(data:any){assertLocalEdition('sale',data);let order:any;await mutate(KEY,saved=>{const state=migrate(saved);order=saveCashSale(state,data);return state;});return localReceipt(order);}

function filteredOrders(state:any,args:any){const today=new Date().toLocaleDateString('en-CA'),from=String(args.date_from||today),to=String(args.date_to||today);return state.orders.filter((row:any)=>{const date=new Date(row.at).toLocaleDateString('en-CA');const paidDate=row.paid_at?new Date(row.paid_at).toLocaleDateString('en-CA'):'';return (date>=from&&date<=to)||(paidDate>=from&&paidDate<=to);});}

export async function standaloneApi(op:string,args:any={}){
  assertLocalEdition(op,args);
  const state=await exportLocalData(),term=String(args.keyword||'').replace(/^RO_MEMBER:/,'').trim().toLowerCase(),pageSize=[20,50,100].includes(Number(args.page_size))?Number(args.page_size):20;
  if(op==='session')return localSession;
  if(op==='product_detail')return localProductDetail(state,Number(args.id));
  if(op==='product_save'&&args.variant_data){await mutate(KEY,saved=>{const current=migrate(saved);saveLocalVariants(current,args,resolveCategory(current,args,true),validateProduct,locale.value);return current;});return {id:Number(args.id)};}
  if(op==='quote')return quoteLocal(state,args);
  if(['create_order','pending_cash','pending_close'].includes(op)){let order:any;await mutate(KEY,saved=>{const current=migrate(saved);order=op==='create_order'?createPendingOrder(current,args):op==='pending_cash'?settlePendingOrder(current,args):closePendingOrder(current,args);return current;});return localReceipt(order);}
  if(op.startsWith('translation_')) {
    const category=args.entity==='category', fields=category?['name']:['name','product_attrs','description_sale'];
    if(!['product','category'].includes(args.entity))fail('不支持的翻译类型');
    const collection=category?'categories':'products';
    if(op==='translation_list') { const rows=state[collection].filter((row:any)=>!term||businessText(row,'name').toLowerCase().includes(term));const page=Math.max(1,Number(args.page)||1);return {record_data:rows.slice((page-1)*pageSize,page*pageSize).map((row:any)=>({id:row.id,name:businessText(row,'name')})),total:rows.length,page}; }
    if(op==='translation_save')await mutate(KEY,saved=>{const current=migrate(saved),row=current[collection].find((row:any)=>row.id===Number(args.record_id));if(!row)fail('记录不存在');row.translations=validateTranslations(args.translation_data,fields);return current;});
    const current=op==='translation_save'?await exportLocalData():state,row=current[collection].find((row:any)=>row.id===Number(args.record_id));if(!row)fail('记录不存在');
    return {record_id:row.id,record_name:row.name,field_data:fields.map(key=>({key,label:({name:category?'分类名称':'商品名称',product_attrs:'规格',description_sale:'商品描述'} as any)[key]})),source_data:Object.fromEntries(fields.map(key=>[key,row[key]||''])),translation_data:row.translations||{}};
  }

  if(op==='manage_products'){const selectedIds=categoryDescendants(categoryRows(state),Number(args.category_id)),all=state.products.map((row:any)=>({...asProduct(row,state),source_spec:businessText(row,'product_attrs'),source_description:row.description_sale,sub_title:businessText(row,'description_sale')})),rows=all.filter((row:any)=>(!Number(args.category_id)||selectedIds.has(row.eshop_categ_id))&&(!term||[row.name,row.number,row.phone,row.barcode,row.default_code].some(value=>String(value||'').toLowerCase().includes(term)))),page=Math.min(Math.max(1,Number(args.page)||1),Math.max(1,Math.ceil(rows.length/pageSize)));return {product_data:sortRows(rows,args.sort_key==='value'?'sale_price':args.sort_key,args.sort_direction).slice((page-1)*pageSize,page*pageSize),page,page_size:pageSize,total:rows.length,can_edit:true,category_data:categoryRows(state)};}
  if(op==='manage_categories'){const rows=categoryRows(state).filter((row:any)=>!term||row.eshop_categ_name.toLowerCase().includes(term));return {category_data:rows,total:rows.length,can_edit:true};}
  if(op==='category_save'){let result:any;await mutate(KEY,saved=>{const current=migrate(saved),editing=args.id?categoryById(current,args.id):null;if(args.id&&!editing)fail('分类不存在');const name=text(String(args.name||''),80).trim();if(!name)fail('分类名称不能为空');const parent=args.parent_id?categoryById(current,args.parent_id):null;if(args.parent_id&&!parent)fail('上级分类不存在');if(parent&&current.products.some((p:any)=>p.category_uid===parent.uid))fail('该分类已有商品，不能添加下级分类');if(editing&&parent){let cursor:any=parent;while(cursor){if(cursor.uid===editing.uid)fail('不能把分类移动到自身或下级分类');cursor=cursor.parent_uid?current.categories.find((row:any)=>row.uid===cursor.parent_uid):null;}}const parentUid=parent?.uid||'';if(current.categories.some((row:any)=>row.uid!==editing?.uid&&row.parent_uid===parentUid&&row.name===name))fail('同一上级下已有同名分类');const row=editing||{uid:uuid(),id:Math.max(0,...current.categories.map((item:any)=>item.id))+1,name,parent_uid:parentUid};Object.assign(row,{name,parent_uid:parentUid});if(!editing)current.categories.push(row);result={id:row.id};return current;});return result;}
  if(op==='bulk_set_active'){
    if(!['product','category'].includes(args.entity)||typeof args.active!=='boolean'||!Array.isArray(args.ids)||!args.ids.length||args.ids.length>500||args.ids.some((id:any)=>!Number.isSafeInteger(id)||id<=0))fail('批量操作参数不正确，每次最多 500 条');
    const collection=args.entity==='product'?'products':'categories';
    if(args.preview===true)return {rows:planBulkStatus(state[collection],args.ids,args.active)};
    let result:any[]=[];
    await mutate(KEY,saved=>{const current=migrate(saved);result=planBulkStatus(current[collection],args.ids,args.active);for(const item of result)if(item.allowed)current[collection].find((row:any)=>row.id===item.id).active=args.active;return current;});
    return {rows:result.map(row=>({...row,success:row.allowed,reason:row.reason||(args.active?'已启用':'已停用')}))};
  }
  if(op==='category_set_active'){
    if(typeof args.active!=='boolean')fail('分类状态格式不正确');
    await mutate(KEY,saved=>{const current=migrate(saved),row=categoryById(current,args.id);if(!row)fail('分类不存在');row.active=args.active;return current;});
    return {id:Number(args.id),active:args.active};
  }
  if(op==='category_delete'){await mutate(KEY,saved=>{const current=migrate(saved),row=categoryById(current,args.id);if(!row)fail('分类不存在');if(children(current,row.uid).length)fail('该分类包含下级分类，不能删除');if(current.products.some((product:any)=>product.category_uid===row.uid))fail('该分类已有商品，不能删除');current.categories=current.categories.filter((item:any)=>item.uid!==row.uid);return current;});return {deleted:true};}
  if(op==='product_save'){await mutate(KEY,saved=>{const current=migrate(saved);const row=current.products.find((item:any)=>item.id===Number(args.id));if(!row)fail('商品不存在');const category=resolveCategory(current,args,true),updated=validateProduct({...row,name:args.name,sale_price:Number(args.sale_price),barcode:args.barcode,default_code:args.default_code,description_sale:args.sub_title,product_attrs:args.product_attrs,category_uid:category?.uid||''});if(current.products.some((item:any)=>item.id!==row.id&&((updated.barcode&&item.barcode===updated.barcode)||(updated.default_code&&item.default_code===updated.default_code))))fail('商品条码或编码重复');updated.translations ||= {}; updated.translations[locale.value] ||= {}; updated.translations[locale.value].product_attrs=updated.product_attrs;Object.assign(row,{...updated,id:row.id});return current;});return {id:Number(args.id)};}
  if(op==='product_preview'){const input=Array.isArray(args.product_data)?args.product_data:[];if(!input.length)fail('请至少填写一行商品');if(input.length>MAX_ROWS)fail(`每次最多导入 ${MAX_ROWS} 行商品`);const barcodes=new Set<string>(),codes=new Set<string>(),rows=input.map((source:any,index:number)=>{const errors:string[]=[];let category_will_create=false;try{if(!Number(source.eshop_categ_id)&&!String(source.eshop_categ_name||'').trim())fail('请选择末级商品分类，或填写完整分类路径');validateProduct({...source,uid:uuid(),sale_price:Number(source.sale_price),category_uid:''});const category=categoryById(state,source.eshop_categ_id)||(source.eshop_categ_name?findPath(state,source.eshop_categ_name):null);if(category&&children(state,category.uid).length)throw new Error('只能选择最末级商品分类');if(!category&&String(source.eshop_categ_name||'').trim()){pathParts(source.eshop_categ_name);category_will_create=true;}else if(!category&&Number(source.eshop_categ_id)){fail('商品分类不存在');}const barcode=String(source.barcode||'').trim(),code=String(source.default_code||'').trim();if((barcode&&(barcodes.has(barcode)||state.products.some((item:any)=>item.barcode===barcode)))||(code&&(codes.has(code)||state.products.some((item:any)=>item.default_code===code))))throw new Error('商品条码或编码重复');if(barcode)barcodes.add(barcode);if(code)codes.add(code);}catch(error:any){errors.push(error.message);}return {...source,row_number:index+1,errors,category_will_create};});return {product_data:rows,valid_count:rows.filter((row:any)=>!row.errors.length).length,error_count:rows.filter((row:any)=>row.errors.length).length};}
  if(op==='product_options')return {category_data:categoryRows(state)};
  if(op==='categories')return {category_data:categoryRows(state).filter((row:any)=>row.effective_active)};
  if(op==='products'){
    const disabled=disabledCategoryUids(state.categories);
    const selected=categoryById(state,args.category_id),categoryUids=new Set<string>();
    if(selected){categoryUids.add(selected.uid);for(const parent of categoryUids)for(const child of children(state,parent))categoryUids.add(child.uid);}
    let items=state.products.filter((row:any)=>row.active!==false&&!disabled.has(row.category_uid)&&(!Number(args.category_id)||categoryUids.has(row.category_uid))).map((row:any)=>asProduct(row,state)).filter((row:any)=>!term||[row.name,row.barcode,row.sku].some(value=>String(value).toLowerCase().includes(term)));if(args.scan==='true'){const exact=items.filter((row:any)=>[row.barcode,row.sku].some(value=>String(value).toLowerCase()===term));if(exact.length)items=exact;}const page=Math.min(Math.max(1,Number(args.page)||1),Math.max(1,Math.ceil(items.length/30)));return {items:items.slice((page-1)*30,page*30),total:items.length,page,page_size:30,categories:categoryRows(state).filter((row:any)=>row.effective_active)};}
  if(op==='product_create'){let result:any;await mutate(KEY,saved=>{const current=migrate(saved),requestKey=id(args.request_key);const input=Array.isArray(args.product_data)?args.product_data:[];if(!input.length||input.length>MAX_ROWS)fail(`每次只能创建 1 至 ${MAX_ROWS} 件商品`);const existing=current.products.filter((row:any)=>String(row.creation_key||'').startsWith(requestKey+':'));if(existing.length){result={created_count:existing.length,product_data:existing.map((row:any)=>({product_id:row.id,product_name:row.name}))};return current;}const staged=structuredClone(current),created:any[]=[];input.forEach((source:any,index:number)=>{const category=resolveCategory(staged,source,true),row=validateProduct({...source,uid:uuid(),sale_price:Number(source.sale_price),category_uid:category?.uid||''});if(staged.products.some((item:any)=>(row.barcode&&item.barcode===row.barcode)||(row.default_code&&item.default_code===row.default_code)))fail(`第 ${index+1} 行商品条码或编码重复`);row.id=Math.max(0,...staged.products.map((item:any)=>item.id))+1;(row as any).creation_key=`${requestKey}:${index}`;staged.products.push(row);created.push(row);});if(staged.products.some((p:any)=>p.category_uid&&children(staged,p.category_uid).length))fail('只能选择最末级商品分类');Object.assign(current,staged);result={created_count:created.length,product_data:created.map(row=>({product_id:row.id,product_name:row.name}))};return current;});return result;}
  let orders=filteredOrders(state,args);
  if(op==='list_export'&&args.list_operation==='orders'){
    const selection=new Set(Array.isArray(args.selected_ids)?args.selected_ids.map(String):[]);if(!selection.size)fail('请先勾选需要导出的记录');
    const rows=sortRows(orders.map(localReceipt).reverse().filter((row:any)=>selection.has(String(row.id))&&(!args.state||args.state===row.state)&&(!term||[row.number,row.customer_name,row.member_number].some(value=>value.toLowerCase().includes(term)))),args.sort_key,args.sort_direction);
    if(!rows.length)fail('暂无匹配记录，请调整搜索条件。');
    const XLSX=await import('xlsx'),book=XLSX.utils.book_new();
    const sheet=XLSX.utils.aoa_to_sheet([[t('订单号'),t('会员姓名'),t('下单时间'),t('金额'),t('币种'),t('状态')],...rows.map((row:any)=>[row.number,row.customer_name,row.created_at,row.total,row.currency_code,t(row.state_name)])]);
    sheet['!cols']=[{wch:24},{wch:20},{wch:30},{wch:16},{wch:12},{wch:18}];
    rows.forEach((_:any,index:number)=>{sheet['D'+(index+2)].z='0.00';});
    XLSX.utils.book_append_sheet(book,sheet,t('订单管理'));
    return {filename:t('订单管理')+'.xlsx',content:XLSX.write(book,{type:'base64',bookType:'xlsx'}),count:rows.length};
  }
  if(op==='orders'){const rows=orders.map(localReceipt).reverse().filter((row:any)=>(!args.state||args.state===row.state)&&(!term||[row.number,row.customer_name,row.member_number].some(value=>value.toLowerCase().includes(term)))),page=Math.min(Math.max(1,Number(args.page)||1),Math.max(1,Math.ceil(rows.length/pageSize)));return {amount_total_data:amountTotals(rows,'total'),order_data:sortRows(rows,args.sort_key,args.sort_direction).slice((page-1)*pageSize,page*pageSize),total:rows.length,page,page_size:pageSize};}
  if(op==='order')return localReceipt(state.orders.find((row:any)=>row.uid===args.order_id)||fail('找不到本机订单'));
  if(op==='return_lookup'){
    const code=String(args.receipt_code||'').trim();
    const matches=state.orders.filter((o:any)=>'RO_POS_ORDER:'+o.uid===code || (code && o.number===code));
    if(matches.length!==1)fail('找不到唯一本机订单');
    const order=matches[0];
    if(!isPaidOrder(order))fail('未收款或已关闭订单不能退货');
    if(order.refunds?.length)fail('该小票已办理退货');
    return {...localReceipt(order),return_lines:returnLines(order,state.products)};
  }
  if(op==='return_create'){let result:any;await mutate(KEY,value=>{const current=migrate(value);result=saveLocalReturn(current,args);return current;});return result;}
  if(op==='returns'){const rows=state.orders.flatMap((o:any)=>(o.refunds||[]).map((r:any)=>({...r,id:r.uid,order_number:o.number||'单机-'+o.uid.slice(0,8),currency_code:o.currency_code,created_at:formatDateTime(r.at)}))).filter((r:any)=>(!term||[r.number,r.order_number,r.reason].some(v=>v.toLowerCase().includes(term)))&&(!args.date_from||new Date(r.at).toLocaleDateString('en-CA')>=args.date_from)&&(!args.date_to||new Date(r.at).toLocaleDateString('en-CA')<=args.date_to)).reverse();const page=Math.min(Math.max(1,Number(args.page)||1),Math.max(1,Math.ceil(rows.length/pageSize)));return {amount_total_data:amountTotals(rows,'amount'),rows:rows.slice((page-1)*pageSize,page*pageSize),total:rows.length,page};}
  if(op==='summary'){
    const currency_code=validCurrency(args.currency_code||state.currency_code),currency_codes=[...new Set([state.currency_code,...state.orders.map((row:any)=>row.currency_code)])];
    orders=filteredOrders({...state,orders:state.orders.filter(isPaidOrder).map((row:any)=>({...row,at:row.paid_at||row.at}))},args).filter((row:any)=>row.currency_code===currency_code && (!row.payment_method || row.payment_method==='cash'));
    const today=new Date().toLocaleDateString('en-CA'),from=String(args.date_from||today),to=String(args.date_to||today);

    const refund_total=round(state.orders.filter((o:any)=>o.currency_code===currency_code).flatMap((o:any)=>o.refunds||[]).filter((r:any)=>new Date(r.at).toLocaleDateString('en-CA')>=from&&new Date(r.at).toLocaleDateString('en-CA')<=to).reduce((n:number,r:any)=>n+r.amount,0));
    const cashOrders=orders;
    const receipts:{at:string;amount:number}[]=cashOrders.map((o:any)=>({at:o.at,amount:o.amount}));
    const sum=(rows:any[],key='amount')=>round(rows.reduce((total:number,row:any)=>total+row[key],0));
    const total=sum(receipts),sales_total=sum(orders),recharge_total=0,singleDay=from===to;
    const labels=singleDay?Array.from({length:24},(_,hour)=>`${String(hour).padStart(2,'0')}:00`):Array.from(new Set(receipts.map(row=>new Date(row.at).toLocaleDateString('en-CA')))).sort();
    const trend=labels.map(label=>({label,amount:sum(receipts.filter(row=>(singleDay?`${String(new Date(row.at).getHours()).padStart(2,'0')}:00`:new Date(row.at).toLocaleDateString('en-CA'))===label))}));
    const cash_received=round(sum(cashOrders,'received')+recharge_total);
    return {currency_code,currency_codes,date_from:from,date_to:to,timezone:Intl.DateTimeFormat().resolvedOptions().timeZone,count:orders.length,total,sales_total,sales_count:orders.length,recharge_total,wallet_spent:sum(orders.filter((o:any)=>o.payment_method==='wallet')),net_total:round(total-refund_total),average:orders.length?round(sales_total/orders.length):0,refund_total,methods:{cash:total},cash_received,cash_change:round(cash_received-total),trend,trend_granularity:singleDay?'hour':'day'};
  }

  fail('开源版不支持此功能');
}

export function validateBackup(value:any){if(value?.format!==FORMAT||![1,2,3,4,5,6,7].includes(Number(value.version)))fail('不是受支持的 RO POS 单机备份');validateLocalScope(value);const migrated=migrate(value);for(const key of ['categories','products','members','orders'])if(!Array.isArray(migrated[key])||migrated[key].length>50000)fail('备份集合格式错误或超过 50000 条');const categories=migrated.categories.map((row:any,index:number)=>({uid:id(row.uid),id:index+1,name:text(row.name,80).trim()||fail('分类名称为空'),translations:validateTranslations(row.translations,['name']),active:row.active!==false,parent_uid:row.parent_uid?id(row.parent_uid):''}));for(const row of categories)if(row.parent_uid&&!categories.some((parent:any)=>parent.uid===row.parent_uid))fail('分类上级引用不存在');const state:any={format:FORMAT,version:VERSION,installation:id(migrated.installation),currency_code:validCurrency(migrated.currency_code||'CNY'),categories,products:migrated.products.map((row:any)=>validateProduct(row)),members:migrated.members.map((row:any)=>({uid:id(row.uid),id:0,name:text(row.name).trim()||fail('会员姓名为空'),phone:text(row.phone||'',24),email:text(row.email||'',254)})),orders:[],member_rules:migrated.member_rules,member_entries:migrated.member_entries};for(const product of state.products)if(product.category_uid&&!categories.some((category:any)=>category.uid===product.category_uid))fail('商品分类引用不存在');for(const key of ['categories','products','members','orders']){const ids=migrated[key].map((row:any)=>row.uid);if(new Set(ids).size!==ids.length)fail('备份包含重复标识');}state.orders=migrated.orders.map((order:any)=>{if(!Array.isArray(order.lines)||!order.lines.length||order.lines.length>1000)fail('订单明细格式错误');const lines=order.lines.map((line:any)=>{if(!state.products.some((row:any)=>row.uid===line.product_uid)||!Number.isFinite(line.qty)||line.qty<=0||line.qty>1000000)fail('订单商品引用或数量错误');return {...(line.barcode?{barcode:text(line.barcode,120)}:{}),product_uid:id(line.product_uid),name:text(line.name),spec:text(line.spec||'',120),qty:line.qty,price:amount(line.price)};});if(!Number.isFinite(Date.parse(order.at))||Date.parse(order.at)>Date.now()+300000)fail('订单日期不正确');if(order.member_uid&&!state.members.some((row:any)=>row.uid===order.member_uid))fail('订单会员引用不存在');if(order.state&&!['draft','done','closed'].includes(order.state))fail('订单状态不正确');if(!isPaidOrder(order)&&(order.received!==0||order.refunds?.length||order.member_uid))fail('未收款订单数据不正确');const total=amount(order.amount),received=amount(order.received);const payment_method=order.payment_method||'cash',subtotal=amount(order.subtotal??total),discount=amount(order.discount||0);if(!['cash','wallet'].includes(payment_method)||(isPaidOrder(order)&&(payment_method==='cash'?received<total:received!==0))||Math.abs(round(lines.reduce((sum:number,line:any)=>sum+round(line.qty*line.price),0))-subtotal)>.004||Math.abs(round(subtotal-discount)-total)>.004)fail('订单合计或收款金额不一致');return {note:text(order.note||'',500),...(order.state?{state:order.state}:{}),...(order.creation_request?{creation_request:text(order.creation_request,500000),note:text(order.note||'',500),payment_method:isPaidOrder(order)?payment_method:''}:{}),...(order.paid_at?{paid_at:Number.isFinite(Date.parse(order.paid_at))&&Date.parse(order.paid_at)<=Date.now()+300000?order.paid_at:fail('收款时间不正确')}:{}),...(order.payment_key?{payment_key:id(order.payment_key)}:{}),...(order.refunds?{refunds:order.refunds}:{}),uid:id(order.uid),...(order.number?{number:/^\d{14}$/.test(order.number)?order.number:fail('订单编号格式不正确')}:{}),currency_code:validCurrency(order.currency_code||'CNY'),at:text(order.at,50),member_uid:order.member_uid||'',customer_name:text(order.customer_name),member_number:text(order.member_number||'',80),lines,amount:total,received,...(order.request?{request:text(order.request,500000),payment_method,subtotal,discount,point_price:amount(order.point_price||0),points_used:order.points_used||0,points_earned:order.points_earned||0}:{})};});state.orders.forEach(validateReturns);return validateLocalScope(state);}
function canonical(value:any):string {return JSON.stringify(value,(_key,item)=>item&&typeof item==='object'&&!Array.isArray(item)?Object.fromEntries(Object.keys(item).sort().filter(key=>item[key]!==undefined).map(key=>[key,item[key]])):item);}
function merge(local:any,incoming:any){const state=migrate(local);const normalizedOrders=new Map(validateBackup(state).orders.map((o:any)=>[o.uid,o]));if(!state.products.length&&!state.orders.length&&!state.members.length)state.currency_code=incoming.currency_code;if(state.products.length&&incoming.products.length&&state.currency_code!==incoming.currency_code)fail('备份商品币种与当前币种不同，不能直接合并');const counts:any={categories:0,products:0,members:0,orders:0,member_entries:0,skipped:0},categoryMap=new Map<string,string>();const sorted=[...incoming.categories].sort((a:any,b:any)=>categoryPath(incoming,a,false).split('/').length-categoryPath(incoming,b,false).split('/').length);for(const row of sorted){const parentUid=row.parent_uid?categoryMap.get(row.parent_uid)||'':'',old=state.categories.find((item:any)=>item.parent_uid===parentUid&&item.name===row.name),target=old||{...row,id:Math.max(0,...state.categories.map((item:any)=>item.id))+1,parent_uid:parentUid};if(!old){state.categories.push(target);counts.categories++;}else {for(const [lang,values] of Object.entries(row.translations||{}) as [string,Record<string,string>][]) {old.translations[lang] ||= {}; for(const [field,value] of Object.entries(values)) {if(old.translations[lang][field]&&value&&old.translations[lang][field]!==value)fail('同一标识内容冲突，请核对后重新导入');if(value)old.translations[lang][field]=value;}}counts.skipped++;}categoryMap.set(row.uid,target.uid);}for(const source of incoming.products){const row={...source,category_uid:source.category_uid?categoryMap.get(source.category_uid)||fail('商品分类引用不存在'):''},old=state.products.find((item:any)=>item.uid===row.uid);if(old){if(canonical({...validateProduct(old),id:0})!==canonical({...validateProduct(row),id:0}))fail('同一标识内容冲突，请核对后重新导入');counts.skipped++;continue;}if(state.products.some((item:any)=>(row.barcode&&row.barcode===item.barcode)||(row.default_code&&row.default_code===item.default_code)))fail('商品条码或编码重复，不能自动合并');state.products.push({...row,id:Math.max(0,...state.products.map((item:any)=>item.id))+1});counts.products++;}for(const key of ['orders'])for(const row of incoming[key]){const old=state[key].find((item:any)=>item.uid===row.uid);if(old){if(canonical({...normalizedOrders.get(old.uid) as any,id:0})!==canonical({...row,id:0}))fail('同一标识内容冲突，请核对后重新导入');counts.skipped++;continue;}if(key==='members'&&row.phone&&state.members.some((item:any)=>item.phone===row.phone))fail('会员手机号重复，不能自动合并');state[key].push({...row,...(key==='orders'?{}:{id:Math.max(0,...state[key].map((item:any)=>item.id))+1})});counts[key]++;}for(const entry of incoming.member_entries){const old=state.member_entries.find((e:any)=>e.uid===entry.uid);if(old){if(canonical(old)!==canonical(entry))fail('同一标识内容冲突，请核对后重新导入');counts.skipped++;}else {state.member_entries.push(entry);counts.member_entries++;}}const numbers=state.orders.filter((o:any)=>o.number).map((o:any)=>o.number);if(new Set(numbers).size!==numbers.length)fail('订单编号重复，请核对后导入');validateLocalScope(state);return {state,counts};}
export async function previewLocalImport(value:any){return merge(await exportLocalData(),validateBackup(value)).counts;}
export async function importLocalData(value:any){const incoming=validateBackup(value);let counts:any;await mutate(KEY,local=>{const result=merge(local,incoming);counts=result.counts;return result.state;});rememberCurrency((await exportLocalData()).currency_code);return counts;}

export async function loadDemoData() {
  if (!standalone.value) fail('仅单机版可操作');
  const { addDemoData } = await import('./demoData');
  let counts={categories:0,products:0,members:0,orders:0};
  await mutate(KEY, value => {const state=migrate(value);const before=Object.fromEntries(Object.keys(counts).map(key=>[key,state[key].length]));addDemoData(state);counts=Object.fromEntries(Object.keys(counts).map(key=>[key,state[key].length-before[key]])) as typeof counts;return state;});
  return counts;
}
export async function clearLocalData(confirmation: string) {
  if (!standalone.value || confirmation !== '确认清理') fail('请输入确认清理');
  await resetStandaloneRecords(blank());
}

export async function setLocalCurrency(code:string) {
  if(!standalone.value)fail('仅单机版可操作');
  validCurrency(code);
  await mutate(KEY,value=>{const state=migrate(value);if(state.currency_code!==code&&(state.products.length||state.orders.length))fail('已有商品或订单，不能直接更改本机币种');return {...state,currency_code:code};});
  rememberCurrency(code);
}
export function hasLocalProducts(state:any){return state.products.some((product:any)=>String(product.name||'').trim()&&Number.isFinite(product.sale_price)&&product.sale_price>=0);}
export async function needsFirstRunGuide() {
  const state=await exportLocalData();
  return !hasLocalProducts(state)||localStorage.getItem('ro-pos-setup-complete:'+state.installation)!=='1';
}
export async function dismissFirstRunGuide() {
  const state=await exportLocalData();
  if(!hasLocalProducts(state))fail('请先准备至少一件有效商品，再开始收银');
  localStorage.setItem('ro-pos-setup-complete:'+state.installation,'1');
}
