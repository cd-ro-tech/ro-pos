import { portugueseDemo } from './portuguese';
// Bundled demo records are added only when the user requests them.
const uid=(n:number)=>`${n>=2001&&n<=2009?'de00'+String(n):'de000000'}-0000-4000-8000-${String(n).padStart(12,'0')}`;
const translations=(field:string,values:string[]):Record<string,Record<string,string>>=>({...Object.fromEntries(['zh-CN','en-US','it-IT','es-ES'].map((lang,i)=>[lang,{[field]:values[i]}])), 'pt-PT':{[field]:portugueseDemo(values[0])||values[0]}});
export const demoTargets={categories:28,products:90,members:0,orders:20};
export function addDemoData(state:any) {
  const definitions=[
    [['经典咖啡','Classic coffee','Caffè classico','Café clásico'],18.5,['250克','250 g','250 g','250 g']],
    [['纯牛奶','Whole milk','Latte intero','Leche entera'],6,['1升','1 L','1 L','1 L']],
    [['黄油饼干','Butter biscuits','Biscotti al burro','Galletas de mantequilla'],12,['200克','200 g','200 g','200 g']],
  ] as const;
  definitions.forEach(([names,price,specs],index)=>{
    if(state.products.some((r:any)=>r.uid===uid(10+index)))return;
    const barcode=`DEMO${index+1}`;
    if(state.products.some((r:any)=>r.barcode===barcode||r.default_code===barcode))throw new Error('演示条码已被使用，未加载演示数据');
    const tr=translations('name',[...names]);for(const [i,lang]of ['zh-CN','en-US','it-IT','es-ES'].entries())tr[lang].product_attrs=specs[i];tr['pt-PT'].product_attrs=portugueseDemo(specs[0])||specs[0];
    state.products.push({uid:uid(10+index),id:Math.max(0,...state.products.map((r:any)=>r.id))+1,name:names[0],sale_price:price,barcode,default_code:barcode,product_attrs:specs[0],description_sale:'',image:'',category_uid:uid(200+index),translations:tr});
  });
  if(!state.orders.some((r:any)=>r.uid===uid(30)))state.orders.push({uid:uid(30),currency_code:state.currency_code,at:new Date().toISOString(),member_uid:'',customer_name:'散客',member_number:'',lines:[{product_uid:uid(10),name:'经典咖啡',spec:'250克',qty:1,price:18.5}],amount:18.5,received:20});
  const groups=[
    ['米面粮油','Grains and oils','Cereali e oli','Cereales y aceites'],
    ['零食饮料','Snacks and drinks','Snack e bevande','Aperitivos y bebidas'],
    ['生鲜果蔬','Fresh produce','Frutta e verdura','Frutas y verduras'],
    ['乳品冷藏','Chilled dairy','Latticini refrigerati','Lácteos refrigerados'],
    ['调味干货','Seasonings and dry goods','Condimenti e prodotti secchi','Condimentos y productos secos'],
    ['日用百货','Everyday essentials','Articoli quotidiani','Artículos cotidianos'],
    ['家庭清洁','Household cleaning','Pulizia della casa','Limpieza del hogar'],
    ['酒水茶饮','Wine and tea','Vini e tè','Vinos y té'],
    ['母婴用品','Baby care','Prodotti per bambini','Productos para bebés'],
    ['宠物生活','Pet supplies','Prodotti per animali','Productos para mascotas'],
  ];
  const leaves=[['咖啡茶饮','Coffee and tea','Caffè e tè','Café y té'],['乳品','Dairy','Latticini','Lácteos'],['饼干零食','Biscuits and snacks','Biscotti e snack','Galletas y aperitivos'],['洗衣用品','Laundry','Bucato','Lavandería'],['厨房清洁','Kitchen cleaning','Pulizia cucina','Limpieza de cocina'],['家居清洁','Home cleaning','Pulizia casa','Limpieza del hogar'],['洗发护发','Hair care','Cura capelli','Cuidado capilar'],['沐浴用品','Bath care','Bagno','Baño'],['口腔护理','Oral care','Igiene orale','Higiene bucal'],['纸品','Paper goods','Prodotti di carta','Productos de papel'],['厨房用品','Kitchenware','Utensili cucina','Utensilios de cocina'],['文具','Stationery','Cancelleria','Papelería']];
  function addCategory(n:number,names:string[],parent:string){if(!state.categories.some((r:any)=>r.uid===uid(n)))state.categories.push({uid:uid(n),id:Math.max(0,...state.categories.map((r:any)=>r.id))+1,name:names[0],parent_uid:parent,translations:translations('name',names)});}
  groups.forEach((names,i)=>addCategory(400+i,names,''));
  const parents=[7,3,1,6,6,6,5,5,5,5,5,5,0,2,4,8,9,1];
  leaves.push(['大米杂粮','Rice and grains','Riso e cereali','Arroz y cereales'],['新鲜水果','Fresh fruit','Frutta fresca','Fruta fresca'],['调味酱料','Sauces','Salse','Salsas'],['婴儿护理','Baby care','Cura del bambino','Cuidado del bebé'],['宠物食品','Pet food','Alimenti per animali','Comida para mascotas'],['瓶装饮料','Bottled drinks','Bevande in bottiglia','Bebidas embotelladas']);
  leaves.forEach((names,i)=>{
    addCategory(200+i,names,uid(400+parents[i]));
    const leaf=state.categories.find((r:any)=>r.uid===uid(200+i));
    // Preserve custom moves; only relocate leaves still under the old demo groups.
    if(i<12&&leaf.parent_uid===uid(100+Math.floor(i/3)))leaf.parent_uid=uid(400+parents[i]);
  });
  // Move only the original demo products out of their now-parent category.
  [10,11,12].forEach((n,i)=>{const product=state.products.find((r:any)=>r.uid===uid(n));if(product?.category_uid===uid(1))product.category_uid=uid(200+i);});
  // Retire empty legacy scaffolding without removing user-owned categories or products.
  for(const n of [100,101,102,103,1]){
    const legacyNames=['食品饮料','日用清洁','个人护理','生活用品'];
    const row=state.categories.find((r:any)=>r.uid===uid(n));
    if(row&&row.name===(n===1?'演示商品':legacyNames[n-100])&&!state.categories.some((r:any)=>r.parent_uid===row.uid)&&!state.products.some((r:any)=>r.category_uid===row.uid))state.categories=state.categories.filter((r:any)=>r.uid!==row.uid);
  }
  const names=[['香醇咖啡','Aromatic coffee','Caffè aromatico','Café aromático'],['鲜牛奶','Fresh milk','Latte fresco','Leche fresca'],['燕麦饼干','Oat biscuits','Biscotti di avena','Galletas de avena'],['洗衣液','Laundry detergent','Detersivo bucato','Detergente de ropa'],['洗洁精','Dishwashing liquid','Detersivo piatti','Lavavajillas'],['地板清洁剂','Floor cleaner','Detergente pavimenti','Limpiador de suelos'],['洗发水','Shampoo','Shampoo','Champú'],['沐浴露','Shower gel','Bagnoschiuma','Gel de ducha'],['牙膏','Toothpaste','Dentifricio','Pasta dental'],['抽纸','Facial tissues','Fazzoletti','Pañuelos'],['保鲜袋','Food storage bags','Sacchetti alimentari','Bolsas alimentarias'],['笔记本','Notebook','Quaderno','Cuaderno']];
  names.push(['精选大米','Selected rice','Riso selezionato','Arroz selecto'],['新鲜苹果','Fresh apples','Mele fresche','Manzanas frescas'],['酿造酱油','Soy sauce','Salsa di soia','Salsa de soja'],['婴儿湿巾','Baby wipes','Salviette per bambini','Toallitas para bebés'],['成猫粮','Adult cat food','Cibo per gatti adulti','Comida para gatos adultos'],['气泡水','Sparkling water','Acqua frizzante','Agua con gas']);
  for(let categoryIndex=0;categoryIndex<names.length;categoryIndex++)for(let variant=0;variant<5;variant++){
    if(categoryIndex<3&&variant===0)continue;
    const n=categoryIndex*5+variant,productUid=uid(1000+n),barcode=`DEMO${n+100}`;
    if(state.products.some((r:any)=>r.uid===productUid))continue;
    if(state.products.some((r:any)=>r.barcode===barcode||r.default_code===barcode))throw new Error('演示条码已被使用，未加载演示数据');
    const label=names[categoryIndex].map(v=>`${v} ${variant+1}`),tr=translations('name',label),spec=['单件','1 item','1 pezzo','1 unidad'];
    for(const [i,lang]of ['zh-CN','en-US','it-IT','es-ES'].entries())tr[lang].product_attrs=spec[i];tr['pt-PT'].product_attrs=portugueseDemo(spec[0])||spec[0];
    state.products.push({uid:productUid,id:Math.max(0,...state.products.map((r:any)=>r.id))+1,name:label[0],sale_price:Number((5.5+categoryIndex*2+variant*3.2).toFixed(2)),barcode,default_code:barcode,product_attrs:spec[0],description_sale:'',image:'',category_uid:uid(200+categoryIndex),translations:tr});
  }
  const products=state.products.filter((r:any)=>r.uid.startsWith('de000000-'));
  for(let i=1;i<20;i++){
    if(state.orders.some((r:any)=>r.uid===uid(3000+i)))continue;
    const product=products[i%products.length],qty=1+i%3,amount=Number((product.sale_price*qty).toFixed(2)),date=new Date();date.setHours(Math.min(date.getHours(),8+i%12),i*3%60,0,0);
    date.setTime(Math.min(date.getTime(),Date.now()));
    state.orders.push({uid:uid(3000+i),currency_code:state.currency_code,at:date.toISOString(),member_uid:'',customer_name:'散客',member_number:'',lines:[{product_uid:product.uid,name:product.name,spec:product.product_attrs,qty,price:product.sale_price}],amount,received:Math.ceil(amount/10)*10});
  }
  return state;
}
