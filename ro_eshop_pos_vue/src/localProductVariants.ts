import { productAttributes, variantSignature, variantSpec } from './productVariants';
const fail=(message:string):never=>{throw Object.assign(new Error(message),{code:400});};
export function localProductDetail(state:any, id:number) {
 const row=state.products.find((p:any)=>p.id===id)||fail('商品不存在'),group=row.template_uid||row.uid;
 return {id:row.id,name:row.name,sub_title:row.description_sale||'',eshop_categ_id:state.categories.find((c:any)=>c.uid===row.category_uid)?.id||0,
 variant_data:state.products.filter((p:any)=>(p.template_uid||p.uid)===group).map((p:any)=>({id:p.id,variant_uid:p.uid,sale_price:p.sale_price,barcode:p.barcode||'',default_code:p.default_code||'',product_attrs:p.product_attrs||'',attribute_data:p.attribute_data||[],image_url:p.image?'data:image/png;base64,'+p.image:''}))};
}
export function saveLocalVariants(state:any,args:any,category:any,validate:(row:any)=>any,language:string){
 const root=state.products.find((p:any)=>p.id===Number(args.id))||fail('商品不存在');
 const signature=JSON.stringify(args);
 if(root.last_product_request_key===args.request_key){if(root.last_product_request!==signature)fail('原请求内容不同，请先核实上次保存结果');return;}
 const input=args.variant_data;if(!Array.isArray(input)||!input.length||input.length>100)fail('请提供 1 至 100 条变体');
 const group=root.template_uid||root.uid,existing=state.products.filter((p:any)=>(p.template_uid||p.uid)===group),ids=new Set<number>(),combinations=new Set<string>(),uids=new Set<string>();
 let nextId=Math.max(0,...state.products.map((p:any)=>p.id));
 const staged=input.map((source:any)=>{
  if(!source||typeof source!=='object')fail('变体数据格式不正确');
  const prior=source.id?existing.find((p:any)=>p.id===Number(source.id)):null;
  if(source.id&&(!prior||ids.has(prior.id)))fail('变体不存在或重复');if(prior)ids.add(prior.id);
  const uid=prior?.uid||source.variant_uid;if(uids.has(uid)||(!prior&&state.products.some((p:any)=>p.uid===uid)))fail('变体标识重复');uids.add(uid);
  const attributes=productAttributes(source.attribute_data),spec=attributes.length?variantSpec(attributes):String(source.product_attrs||'').trim();
  const key=variantSignature(attributes,spec);if(combinations.has(key))fail('属性组合或规格重复');combinations.add(key);
  const row=validate({...prior,uid,id:prior?.id||++nextId,template_uid:group,attribute_data:attributes,name:args.name,description_sale:args.sub_title,category_uid:category.uid,sale_price:Number(source.sale_price),barcode:source.barcode,default_code:source.default_code,product_attrs:spec,image:source.image===undefined?prior?.image||'':source.image});
  row.translations[language]={...(row.translations[language]||{}),name:row.name,description_sale:row.description_sale,product_attrs:spec};return row;
 });
 if(existing.some((p:any)=>!ids.has(p.id)))fail('商品变体已变化，请重新打开编辑窗口');
 const others=state.products.filter((p:any)=>(p.template_uid||p.uid)!==group);
 for(const field of ['barcode','default_code']){const seen=new Set(others.map((p:any)=>p[field]).filter(Boolean));for(const p of staged){if(p[field]&&seen.has(p[field]))fail('商品条码或编码重复');if(p[field])seen.add(p[field]);}}
 const savedRoot=staged.find((p:any)=>p.id===root.id);savedRoot.last_product_request_key=args.request_key;savedRoot.last_product_request=signature;
 state.products=state.products.map((p:any)=>staged.find((v:any)=>v.id===p.id)||p).concat(staged.filter((p:any)=>!existing.some((v:any)=>v.id===p.id)));
}
