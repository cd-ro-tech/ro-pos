<script setup lang="ts">
import { computed,onMounted,ref } from 'vue';
import { api,errorText,money,session,storeId } from '../../api';
import { standalone } from '../../mode';
import { activeCurrency } from '../../currency';
import { backendUser } from '../../localIdentity';
import { t } from '../../i18n';
import { confirmDiscard } from '../../formEditing';
import { downloadWorkbook,exportWorkbook } from '../../excel';
import ListTable from '../../components/ListTable.vue';
const props=defineProps<{mode:'manual'|'import'}>();const emit=defineEmits(['close','saved']);
const productKeyword=ref(''),products=ref<any[]>([]),chosenId=ref('');
async function searchProducts(){if(busy.value)return;busy.value=true;error.value='';try{products.value=(await api('products',{keyword:productKeyword.value})).items;}catch(e){error.value=errorText(e);}finally{busy.value=false;}}
function addProduct(){const product=products.value.find(p=>p.id===Number(chosenId.value));if(!product)return;const row={...blank(),code:product.barcode||product.sku||'#'+product.id,product};if(rows.value.length===1&&!rows.value[0].code)rows.value=[row];else rows.value.push(row);chosenId.value='';changed();}
const blank=()=>({order_ref:'',code:'',qty:1,price:'',member:'',reason:''});
const rows=ref<any[]>([blank()]),checks=ref<any[]>([]),groups=ref<any[]>([]),busy=ref(false),error=ref(''),attempted=ref(false);
const cacheKey=`ro-pos-order-entry:${standalone.value?'local':backendUser(session.value?.user.id)}:${storeId.value}`;
const fields=[['order_ref','导入单号'],['code','商品条码或编码'],['qty','数量'],['price','单价'],['member','会员卡号或手机号'],['reason','改价原因']];
const columns=[{key:'row_number',label:'行号',width:'70px'},...fields.map(([key,label])=>({key,label,width:'150px'})),{key:'name',label:'商品名称',width:'180px'},{key:'error',label:'校验结果',width:'260px'}];
const valid=computed(()=>checks.value.length>0&&checks.value.every(row=>!row.error)&&groups.value.length>0);
const total=computed(()=>groups.value.reduce((n,g)=>n+Number(g.total||0),0));
function changed(){checks.value=[];groups.value=[];error.value='';}
async function close(){if(busy.value)return;if(await confirmDiscard(!(groups.value.length&&groups.value.every(g=>g.saved))&&(rows.value.some(r=>r.code)||groups.value.some(g=>!g.saved))))emit('close');}
onMounted(()=>{try{const pending=JSON.parse(sessionStorage.getItem(cacheKey)||'null');if(pending){rows.value=pending.rows;groups.value=pending.groups;checks.value=pending.checks;attempted.value=true;}}catch{error.value='无法恢复待提交订单，请核对订单列表';}});
async function template(){try{downloadWorkbook(await exportWorkbook([{order_ref:'IMPORT-001',code:'填写已有商品条码',qty:1,price:'',member:'',reason:''}],fields.map(([key,label])=>({key,label})),'订单导入模板'));}catch(e){error.value=errorText(e);}}
async function upload(event:Event){const input=event.target as HTMLInputElement,file=input.files?.[0];if(!file)return;busy.value=true;error.value='';try{
 if(file.size>5*1024*1024)throw Error('文件不能超过 5MB');
 const XLSX=await import('xlsx'),book=XLSX.read(await file.arrayBuffer(),{type:'array',sheetRows:502}),sheet=book.Sheets[book.SheetNames[0]];
 const range=XLSX.utils.decode_range(sheet['!fullref']||sheet['!ref']||'A1');if(range.e.r>500)throw Error('每次最多导入 500 行商品明细');
 const data=XLSX.utils.sheet_to_json<any[]>(sheet,{header:1,defval:'',raw:true});
 const headers=(data.shift()||[]).map(String);if(!fields.every(([,label])=>headers.includes(label)))throw Error('表头不正确，请使用订单导入模板');
 const parsed=data.filter(row=>row.some(v=>String(v).trim())).map(row=>Object.fromEntries(fields.map(([key,label])=>[key,row[headers.indexOf(label)]])));
 if(!parsed.length)throw Error('文件没有订单明细');rows.value=parsed;changed();
 }catch(e){error.value=errorText(e);}finally{busy.value=false;input.value='';}}
async function importKey(reference:string){const scope=`${standalone.value?'local':backendUser(session.value?.user.id)}:${storeId.value}:order-import:${reference}`;const bytes=new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(scope)));bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;const hex=Array.from(bytes.slice(0,16),b=>b.toString(16).padStart(2,'0')).join('');return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;}
async function validate(){if(busy.value||attempted.value)return;busy.value=true;error.value='';checks.value=[];groups.value=[];
 try{
 if(!rows.value.length||rows.value.length>500)throw Error('请填写 1 至 500 行商品明细');
 const checked=rows.value.map((row,i)=>({...row,row_number:i+1,error:'',name:''}));const map=new Map<string,any>();
 for(const row of checked){try{
 const reference=props.mode==='manual'?'手工创建':String(row.order_ref||'').trim(),code=String(row.code||'').trim(),member=String(row.member||'').trim();
 if(!reference||reference.length>100)throw Error('请填写导入单号，最多 100 字');if(!code)throw Error('商品条码或编码不能为空');
 if(standalone.value&&member)throw Error('单机版不支持会员建单，请留空会员列');
 const qty=Number(row.qty);if(!Number.isFinite(qty)||qty<=0||qty>1000000||Math.abs(qty*1000-Math.round(qty*1000))>1e-6)throw Error('数量须大于 0，最多三位小数');
 const result=props.mode==='manual'&&row.product&&code===(row.product.barcode||row.product.sku||'#'+row.product.id)?{items:[row.product]}:await api('products',{keyword:code,scan:'true'}),matches=result.items.filter((p:any)=>[p.barcode,p.sku,props.mode==='manual'?'#'+p.id:undefined].includes(code));
 if(matches.length!==1)throw Error('找不到唯一可售商品，请检查条码或编码');const product=matches[0];row.name=product.name;
 const price=String(row.price).trim()===''?product.price:Number(row.price);if(!Number.isFinite(price)||price<0||price>1000000||Math.abs(price*100-Math.round(price*100))>1e-6)throw Error('单价须为非负金额，最多两位小数');
 row.price=price;row.qty=qty;
 let group=map.get(reference);if(!group){group={reference,member,params:{order_line:[],currency_code:activeCurrency.value,note:props.mode==='import'?'导入单号：'+reference:''},indexes:[],total:0};map.set(reference,group);}
 if(group.member!==member)throw Error('同一导入单号的会员信息必须一致');
 if(group.params.order_line.some((l:any)=>l.id===product.id))throw Error('同一订单商品重复，请合并数量');
 group.params.order_line.push({id:product.id,qty,sale_price:price,checked_service_data:[],ro_pos_price_reason:String(row.reason||'').trim()});group.indexes.push(row.row_number-1);
 }catch(e){row.error=errorText(e);}}
 if(map.size>50)throw Error('每次最多导入 50 张订单');
 for(const group of map.values()){try{
 const quote=await api('quote',group.params);group.total=quote.total;group.params.request_key=props.mode==='import'?await importKey(group.reference):crypto.randomUUID();
 }catch(e){group.indexes.forEach((index:number)=>checked[index].error=errorText(e));}}
 checks.value=checked;groups.value=[...map.values()];
 }catch(e){error.value=errorText(e);}finally{busy.value=false;}}
async function save(){if(busy.value||!valid.value)return;busy.value=true;error.value='';attempted.value=true;
 try{
 sessionStorage.setItem(cacheKey,JSON.stringify({rows:rows.value,checks:checks.value,groups:groups.value}));
 for(const group of groups.value){if(group.saved)continue;try{const order=await api('create_order',group.params);group.saved=true;group.result=`${order.number} · ${t(order.state_name)}`;}catch(e){group.result=errorText(e);break;}finally{sessionStorage.setItem(cacheKey,JSON.stringify({rows:rows.value,checks:checks.value,groups:groups.value}));}}
 if(groups.value.every(g=>g.saved))sessionStorage.removeItem(cacheKey);
 emit('saved');
 }catch(e){error.value=errorText(e);}finally{busy.value=false;}}
</script>
<template>
<section class="order-entry">
 <header><button type="button" :disabled="busy" @click="close">{{t('返回')}}</button><h2>{{t(mode==='manual'?'创建订单':'导入订单')}}</h2><button class="primary" :disabled="busy || !valid || groups.every(g=>g.saved)" @click="save">{{t(attempted?'继续提交未完成订单':'确认创建待付款订单')}}</button></header>
 <p>{{t('保存后为待付款，不计入实收。相同导入单号的多行商品合为一单；已导入的单号重复提交不会重复建单。')}}</p>
 <p v-if="error" class="error" role="alert">{{t(error)}}</p>
 <div v-if="mode==='manual' && !checks.length" class="entry-tools"><input v-model="productKeyword" :disabled="busy||attempted" :placeholder="t('商品名称、条码、编码')" :aria-label="t('查找商品')" @keydown.enter.prevent="searchProducts" /><button :disabled="busy||attempted" @click="searchProducts">{{t('查找商品')}}</button><select v-model="chosenId" :disabled="busy||attempted" :aria-label="t('选择商品')" @change="addProduct"><option value="">{{t('选择商品')}}</option><option v-for="product in products" :key="product.id" :value="product.id">{{product.name}} · {{money(product.price)}}</option></select></div>
 <div class="entry-tools"><template v-if="mode==='import'"><button :disabled="busy" @click="template">{{t('下载 Excel 模板')}}</button><label>{{t('上传 Excel')}}<input type="file" accept=".xlsx,.xls" :disabled="busy||attempted" @change="upload" /></label></template><button v-else :disabled="busy||attempted" @click="rows.push(blank());changed()">{{t('添加商品')}}</button><button :disabled="busy||attempted" @click="validate">{{t(busy?'处理中…':'预览校验')}}</button></div>
 <div v-if="!checks.length" class="entry-grid"><table><thead><tr><th v-for="[key,label] in fields.filter(([key])=>mode==='import'||key!=='order_ref')" :key="key">{{t(label)}}</th><th>{{t('操作')}}</th></tr></thead><tbody><tr v-for="(row,index) in rows" :key="index"><td v-for="[key,label] in fields.filter(([key])=>mode==='import'||key!=='order_ref')" :key="key"><input v-model="row[key]" :aria-label="`${t(label)} ${index+1}`" :disabled="busy||attempted||(standalone&&key==='member')" :type="['qty','price'].includes(key)?'number':'text'" :step="key==='qty'?'0.001':'0.01'" :placeholder="key==='price'?t('留空使用售价'):key==='member'&&standalone?t('散客'):''" @input="changed" /></td><td><button :disabled="busy||attempted" @click="rows.splice(index,1);changed()">{{t('移除')}}</button></td></tr></tbody></table></div>
 <template v-else><button v-if="!attempted" :disabled="busy" @click="changed">{{t('返回修改')}}</button><ListTable :rows="checks.map(r=>({...r,error:r.error||t('校验通过')}))" :columns="columns" row-key="row_number" label="订单导入校验" :busy="busy" /><p>{{t('订单数')}}：{{groups.length}} · {{t('金额合计')}}：{{money(total)}}</p></template>
 <div v-if="attempted" role="status"><p v-for="group in groups" :key="group.reference">{{group.reference}}：{{group.result||t('尚未提交')}} <b v-if="group.saved">{{t('创建成功')}}</b></p></div>
</section>
</template>
<style scoped>
.order-entry{display:flex;flex-direction:column;min-height:0;flex:1;overflow:auto;gap:8px}.order-entry>header{display:flex;align-items:center;gap:12px;flex-shrink:0}.order-entry h2{margin:0;font-size:18px}.order-entry>header>.primary{margin-left:auto}.order-entry p{margin:4px 0}.entry-tools{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.entry-tools label{display:flex;align-items:center;gap:8px}.entry-grid{overflow:auto;min-height:160px}.entry-grid table{width:100%;min-width:760px;border-collapse:collapse}.entry-grid :is(th,td){padding:8px;text-align:left;border-bottom:1px solid var(--theme-line,#ddd)}.entry-grid input{width:100%;min-width:90px;box-sizing:border-box;height:36px;margin:0}.order-entry>.list-table{min-height:220px}
</style>