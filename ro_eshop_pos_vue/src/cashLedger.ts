import { disabledCategoryUids } from './categoryTree';
// Cash-only calculations. Persist mutations in one IndexedDB transaction.
export const cashRound=(n:number)=>Math.round((n+Number.EPSILON)*100)/100;
const fail=(message:string):never=>{throw Object.assign(new Error(message),{code:400});};
const uuid=(value:any)=>typeof value==='string'&&/^[a-f\d]{8}(-[a-f\d]{4}){3}-[a-f\d]{12}$/i.test(value)?value:fail('数据标识不正确');
const text=(value:any,max=200)=>typeof value==='string'&&value.trim()&&value.length<=max?value.trim():fail('请填写有效名称或原因');
const number=(value:any,min=0,max=100000000)=>typeof value==='number'&&Number.isFinite(value)&&value>=min&&value<=max?value:fail('数值超出允许范围');
const money=(value:any)=>{number(value);if(Math.abs(cashRound(value)-value)>0.000001)fail('金额须为有效金额，最多两位小数');return value as number;};
export function quoteLocal(state:any,args:any){
 if(!Array.isArray(args.order_line)||!args.order_line.length||args.order_line.length>1000)fail('订单明细格式错误');
 if(args.member_id||args.use_points===true||args.use_points==='true')fail('开源版不支持会员资产');
 const disabled=disabledCategoryUids(state.categories||[]);
 const lines=args.order_line.map((line:any)=>{
  const product=state.products.find((p:any)=>p.id===line.id);if(!product)fail('商品已不存在，请重新选择');if(product.active===false)fail('商品已停用，请移除该商品');if(disabled.has(product.category_uid))fail('商品所属分类已停用，请移除该商品');
  number(line.qty,0.001,1000000);const price=money(line.sale_price??product.sale_price);
  return {product_uid:product.uid,barcode:product.barcode||'',name:product.name,spec:product.product_attrs||'',qty:line.qty,price};
 });
 const subtotal=money(cashRound(lines.reduce((sum:number,l:any)=>sum+cashRound(l.qty*l.price),0)));
 number(subtotal,0,1000000);
 return {lines,subtotal,total:subtotal,tax:0,delivery_fare:0,discount:0,level_discount:0,point_price:0,points_used:0,points_earned:0,balance:0,member:null,coupon_data:[]};
}
export function saveCashSale(state:any,args:any){
 const uid=uuid(args.request_key),payment_method=args.payment_method||'cash';
 if(payment_method!=='cash')fail('开源版仅支持现金收款');
 const request=JSON.stringify([args.member_id||0,args.order_line,args.currency_code||'CNY',args.use_points==='true'||args.use_points===true,payment_method,args.amount,args.received]);
 const old=state.orders.find((o:any)=>o.uid===uid);
 if(old){if(old.request!==request)fail('相同订单号的内容不一致，不能再次登记');return old;}
 if((args.currency_code||'CNY')!==state.currency_code)fail('币种已变化，请重新核对订单');
 const quote=quoteLocal(state,args),received=money(args.received);number(received,0,1000000);
 if(args.expected_quote&&Object.entries(args.expected_quote).some(([key,value])=>quote[key as keyof typeof quote]!==value))fail('订单金额已变化，请重新核算后确认');
 if(Math.abs(quote.total-money(args.amount))>.004)fail('商品合计有变化，请重新结算');
 if(payment_method==='cash'&&received<quote.total)fail('现金实收不能小于应收');
 const at=new Date().toISOString();
 const date=new Date(at);
 const prefix=`${date.getFullYear()}${String(date.getMonth()+1).padStart(2,'0')}${String(date.getDate()).padStart(2,'0')}`;
 const sequence=state.orders.reduce((max:number,o:any)=>/^\d{14}$/.test(o.number||'')&&o.number.startsWith(prefix)?Math.max(max,Number(o.number.slice(8))):max,0)+1;
 if(sequence>999999)fail('当日订单流水已用完');
 const note=String(args.note||'');if(note.length>500)fail('备注不能超过 500 字');
 const order={uid,note,number:prefix+String(sequence).padStart(6,'0'),request,currency_code:state.currency_code,at,member_uid:'',customer_name:'散客',member_number:'',lines:quote.lines,subtotal:quote.subtotal,discount:quote.discount,point_price:quote.point_price,points_used:quote.points_used,points_earned:quote.points_earned,amount:quote.total,received,payment_method};
 state.orders.push(order);return order;
}
// Reject unsupported assets explicitly; never silently discard them during import.
export function validateLocalScope(state:any){
 if((state.members?.length||0)||(state.member_entries?.length||0)||(state.orders||[]).some((o:any)=>o.member_uid||(o.payment_method&&!['cash'].includes(o.payment_method))||o.points_used||o.points_earned||o.point_price||o.discount))fail('备份包含会员、积分、余额或非现金交易，开源版不支持导入');
 return state;
}
