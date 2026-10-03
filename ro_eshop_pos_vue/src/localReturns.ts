const fail=(message:string):never=>{throw Object.assign(new Error(message),{code:400});};
const cents=(n:number)=>Math.round(n*100);
export function returnLines(order:any,products:any[]=[]){
 const weights=order.lines.map((l:any)=>cents(l.qty*l.price)),sum=weights.reduce((a:number,b:number)=>a+b,0),budget=cents(order.amount);let before=0;
 return order.lines.map((line:any,index:number)=>{const allocation=sum?Math.floor(budget*(before+weights[index])/sum)-Math.floor(budget*before/sum):0;before+=weights[index];
  const returned=(order.refunds||[]).flatMap((r:any)=>r.lines).filter((r:any)=>r.line_id===index).reduce((n:number,r:any)=>n+r.qty,0);
  return {...line,id:index,barcode:line.barcode||products.find(p=>p.uid===line.product_uid)?.barcode||'',refunded_qty:returned,remaining_qty:Math.max(0,Math.round((line.qty-returned)*1000)/1000),refund_budget:allocation/100};
 });
}
export function refundAmount(line:any,qty:number){return (Math.floor(cents(line.refund_budget)*(line.refunded_qty+qty)/line.qty+1e-7)-Math.floor(cents(line.refund_budget)*line.refunded_qty/line.qty+1e-7))/100;}
export function saveLocalReturn(state:any,args:any){return recordLocalReturn(state,args,false);}
function recordLocalReturn(state:any,args:any, historical:boolean){
 if(typeof args.request_key!=='string'||! /^[a-f\d]{8}(-[a-f\d]{4}){3}-[a-f\d]{12}$/i.test(args.request_key))fail('数据标识不正确');
 const order=state.orders.find((o:any)=>o.uid===args.order_id);if(!order)fail('找不到本机订单');
 if(order.state&&order.state!=='done')fail('未收款或已关闭订单不能退货');
 if(args.receipt_code!=='RO_POS_ORDER:'+order.uid && (!order.number || args.receipt_code!==order.number))fail('请先扫描原小票条码');
 const reason=String(args.reason||'').trim();if(!reason||reason.length>500)fail('请填写退货原因');
 if(!Array.isArray(args.lines)||!args.lines.length)fail('请选择退货商品');
 const request=JSON.stringify([args.order_id,args.receipt_code,reason,args.lines]);
 const existing=state.orders.flatMap((o:any)=>o.refunds||[]).find((r:any)=>r.uid===args.request_key);
 if(existing){if(existing.request!==request)fail('相同请求的内容不一致');return existing;}
 if(!historical && order.refunds?.length)fail('该小票已办理退货');
 const available=returnLines(order,state.products),seen=new Set<number>();
 const lines=args.lines.map((row:any)=>{const line=available.find((l:any)=>l.id===row.line_id),qty=Number(row.qty);
 if(!line||seen.has(row.line_id)||!Number.isFinite(qty)||qty<=0||Math.abs(qty*1000-Math.round(qty*1000))>1e-6||qty>line.remaining_qty+1e-8)fail('退货数量超过剩余可退数量');
 seen.add(row.line_id);return {line_id:row.line_id,name:line.name,qty,amount:refundAmount(line,qty)};
 });
 const amount=lines.reduce((n:number,l:any)=>n+cents(l.amount),0)/100;
 const refund={uid:args.request_key,number:'R'+String(order.number||order.uid.slice(0,8))+'-'+String((order.refunds||[]).length+1).padStart(3,'0'),at:new Date().toISOString(),currency_code:order.currency_code||'CNY',reason,lines,amount,payment_method:'cash',request};
 order.refunds||=[];order.refunds.push(refund);return refund;
}
export function validateReturns(order:any){
 if(!order.refunds)return;
 if(!Array.isArray(order.refunds)||order.refunds.length>10000)fail('退货记录格式错误');
 const copy={...order,refunds:[]},state={orders:[copy],products:[]};
 for(const row of order.refunds){
  if(!Number.isFinite(Date.parse(row.at))||Date.parse(row.at)>Date.now()+300000||row.payment_method!=='cash')fail('退货记录格式错误');
  const request=JSON.parse(row.request);const rebuilt=recordLocalReturn(state,{request_key:row.uid,order_id:request[0],receipt_code:request[1],reason:request[2],lines:request[3]},true);
  if(rebuilt.amount!==row.amount||rebuilt.reason!==row.reason||JSON.stringify(rebuilt.lines)!==JSON.stringify(row.lines)||rebuilt.number!==row.number)fail('退货记录与原订单不一致');
 }
 if(copy.refunds.length!==order.refunds.length)fail('退货记录重复');
}
