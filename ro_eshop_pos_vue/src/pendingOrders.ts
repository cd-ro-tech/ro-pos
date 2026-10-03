import { quoteLocal, cashRound } from './cashLedger';
const fail=(message:string):never=>{throw new Error(message)};
const uuid=(value:any)=>typeof value==='string'&&/^[a-f\d]{8}(-[a-f\d]{4}){3}-[a-f\d]{12}$/i.test(value)?value:fail('数据标识不正确');
export function createPendingOrder(state:any,args:any){
 const uid=uuid(args.request_key);
 if(Number(args.member_id))fail('单机版暂不支持会员建单');
 if(args.currency_code && args.currency_code!==state.currency_code)fail('币种已变化，请重新核对订单');
 const request=JSON.stringify([args.order_line,args.currency_code||state.currency_code,args.note||'']);
 const old=state.orders.find((o:any)=>o.uid===uid);
 if(old){if(old.creation_request!==request)fail('原订单内容不同，请核对原订单');return old;}
 const quote=quoteLocal(state,{order_line:args.order_line});
 const at=new Date().toISOString(),date=new Date(at),prefix=`${date.getFullYear()}${String(date.getMonth()+1).padStart(2,'0')}${String(date.getDate()).padStart(2,'0')}`;
 const sequence=state.orders.reduce((max:number,o:any)=>/^\d{14}$/.test(o.number||'')&&o.number.startsWith(prefix)?Math.max(max,Number(o.number.slice(8))):max,0)+1;
 if(sequence>999999)fail('当日订单流水已用完');
 const note=String(args.note||'');if(note.length>500)fail('备注不能超过 500 字');
 const order={uid,number:prefix+String(sequence).padStart(6,'0'),creation_request:request,state:'draft',at,currency_code:state.currency_code,member_uid:'',member_number:'',customer_name:'散客',lines:quote.lines,subtotal:quote.subtotal,amount:quote.total,discount:0,received:0,payment_method:'',note};
 state.orders.push(order);return order;
}
export function settlePendingOrder(state:any,args:any){
 const order=state.orders.find((o:any)=>o.uid===args.order_id)||fail('找不到本机订单');
 const key=uuid(args.request_key),received=Number(args.received);
 if(!Number.isFinite(received)||received<order.amount||received>1000000||Math.abs(cashRound(received)-received)>1e-6)fail('现金实收不能小于应收，且最多两位小数');
 if(order.payment_key===key){if(order.received!==received)fail('相同收款请求的金额不一致');return order;}
 if(order.state!=='draft')fail('当前订单不是待付款状态');
 // Revalidate sale eligibility without changing the previously agreed prices.
 quoteLocal(state,{order_line:order.lines.map((line:any)=>({id:state.products.find((p:any)=>p.uid===line.product_uid)?.id,qty:line.qty,sale_price:line.price}))});
 Object.assign(order,{state:'done',paid_at:new Date().toISOString(),received,payment_method:'cash',payment_key:key});return order;
}
export function closePendingOrder(state:any,args:any){
 const order=state.orders.find((o:any)=>o.uid===args.order_id)||fail('找不到本机订单');
 if(order.state==='closed')return order;
 if(order.state!=='draft')fail('只有待付款订单可以关闭');
 order.state='closed';return order;
}
export function isPaidOrder(order:any){return !order.state||order.state==='done';}
