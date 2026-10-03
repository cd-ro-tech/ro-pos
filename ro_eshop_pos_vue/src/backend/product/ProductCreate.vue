<script setup lang="ts">
import { confirmDiscard } from "../../formEditing";
import { backendUser } from '../../localIdentity';
import { activeCurrency } from "../../currency";
import { t } from "../../i18n";
import CategoryTransfer from '../../components/CategoryTransfer.vue';
import ListTable from '../../components/ListTable.vue';
import ListPagination from '../../components/ListPagination.vue';
import ProductSheet from '../../components/ProductSheet.vue';
import PosIcon from '../../components/PosIcon.vue';
import { onMounted, ref, computed, watch } from 'vue';
import { api, errorText, notice, session, storeId } from '../../api';
import { offline, read, write } from '../../offline';
import { standalone } from '../../mode';
const props=defineProps<{embedded?:boolean}>();
const emit=defineEmits(['close','created','busy']);
const unavailable=computed(()=>offline.value && !standalone.value);
const dialog=ref<HTMLDialogElement|null>(null),step=ref(1),mode=ref('manual'),busy=ref(false),error=ref('');
const categories=ref<any[]>([]),preview=ref<any>(null),pending=ref<any>(null),draftRows=ref<any[]>([]);
const form=ref({name:'',eshop_categ_id:0,eshop_categ_name:'',sale_price:'',barcode:'',default_code:'',product_attrs:'',description_sale:'',image:''});
const pendingKey=`ro-pos-product-request:${backendUser(session.value.user.id)}:${storeId.value}`;
const fields=[['name','商品名称'],['eshop_categ_name','分类'],['sale_price','售价'],['barcode','条码'],['default_code','商品编码'],['product_attrs','规格'],['description_sale','描述']];
const fieldKeys=fields.map(f=>f[0]);
const previewPage=ref(1),previewSize=ref(20);
const previewRows=computed(()=>mode.value==='manual'?(preview.value?.product_data || []):draftRows.value);
const visibleRows=computed(()=>previewRows.value.slice((previewPage.value-1)*previewSize.value,previewPage.value*previewSize.value));
const columns=[{key:'row_number',label:'行号',width:'66px'},...fields.map(([key,label])=>({key,label,width:key==='eshop_categ_name'?'240px':'150px',align:key==='sale_price'?'right':undefined})),{key:'validation',label:'校验结果',width:'240px'}];
const filledRows=computed(()=>draftRows.value.filter(row=>fieldKeys.some(key=>String(row[key]??'').trim())));
const selectedCategory=computed(()=>categories.value.find(c=>c.eshop_categ_id===form.value.eshop_categ_id));
watch(busy,v=>emit('busy',v),{flush:'sync'});
watch(form,()=>preview.value=null,{deep:true,flush:'sync'});
watch(draftRows,()=>preview.value=null,{deep:true,flush:'sync'});
watch(mode,()=>{preview.value=null;error.value='';previewPage.value=1;});
const emptyForm=JSON.stringify(form.value);
async function close(){if(!busy.value && await confirmDiscard(!pending.value && (JSON.stringify(form.value)!==emptyForm || !!filledRows.value.length)))emit('close');}
defineExpose({close});
function back(){if(busy.value)return;error.value='';step.value=step.value===4?(mode.value==='manual'?3:1):Math.max(1,step.value-1);}
function manualRows(){return [{...form.value,eshop_categ_name:selectedCategory.value?.eshop_categ_name || ''}];}
async function validate(){
  if(busy.value || unavailable.value)return;
  busy.value=true;error.value='';preview.value=null;
  try {preview.value=await api('product_preview',{product_data:mode.value==='manual'?manualRows():filledRows.value});step.value=4;previewPage.value=1;}
  catch(e){error.value=errorText(e);}finally{busy.value=false;}
}
function pasted(){step.value=4;void validate();}
function validationText(row:any){const checked=preview.value?.product_data.find((r:any)=>r.row_number===row.row_number);return checked?.errors?.map((message:string)=>t(message)).join('; ') || (preview.value?(checked?.category_will_create?'校验通过 · 将新建分类':'校验通过'):'待校验');}
async function fileData(file: File) {
  if (file.size > 5 * 1024 * 1024) throw new Error('文件不能超过 5MB');
  return new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result).split(',')[1]); reader.onerror = () => reject(new Error('文件读取失败')); reader.readAsDataURL(file); });
}
async function uploadImage(event: Event) {
  error.value = '';
  const input = event.target as HTMLInputElement, file = input.files?.[0]; if (!file) return;
  busy.value = true;
  try {
    if (!['image/jpeg','image/png','image/webp'].includes(file.type)) throw new Error('请选择 JPG、PNG 或 WebP 图片');
    const content = await fileData(file);
    const bitmap = await createImageBitmap(file);
    const valid = bitmap.width * bitmap.height <= 20000000; bitmap.close();
    if (!valid) throw new Error('图片不能超过 2000 万像素');
    form.value.image = content;
  } catch (e) { error.value = errorText(e); input.value = ''; } finally { busy.value = false; }
}
async function downloadTemplate() {
  busy.value = true; error.value = '';
  try {
    if (standalone.value) {
      const XLSX=await import('xlsx');
      const sheet=XLSX.utils.aoa_to_sheet([fields.map(field=>field[1]),['示例商品','食品 / 休闲零食 / 坚果','19.90','6900000000001','SP001','500g / 袋','可选']]);
      sheet['!cols']=[{wch:24},{wch:34},{wch:12},{wch:20},{wch:18},{wch:18},{wch:32}];
      const book=XLSX.utils.book_new();XLSX.utils.book_append_sheet(book,sheet,'商品导入');XLSX.writeFile(book,'RO-POS-单机商品导入模板.xlsx');return;
    }
    const data = await api('product_template');
    const blob = new Blob([Uint8Array.from(atob(data.content), c => c.charCodeAt(0))], {type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
    const url = URL.createObjectURL(blob), link = document.createElement('a'); link.href = url; link.download = data.filename; link.click(); URL.revokeObjectURL(url);
  } catch(e) { error.value = errorText(e); } finally { busy.value = false; }
}
async function uploadExcel(event: Event) {
  const input = event.target as HTMLInputElement, file = input.files?.[0]; if (!file) return;
  busy.value = true; error.value = ''; preview.value = null;
  try {
    if (!file.name.toLowerCase().endsWith('.xlsx')) throw new Error('请上传 .xlsx 文件');
    let result:any;
    if (standalone.value) {
      const XLSX=await import('xlsx'),book=XLSX.read(await file.arrayBuffer(),{type:'array'}),sheet=book.Sheets[book.SheetNames[0]];
      const values:any[][]=XLSX.utils.sheet_to_json(sheet,{header:1,raw:false,defval:''});
      if(!values.length)throw new Error('Excel 中没有可导入的数据');
      const labels=new Map(fields.map(([key,label])=>[label,key]));
      const header=values[0].map(value=>labels.get(String(value).trim())||'');
      if(!header.includes('name')||!header.includes('sale_price')||!header.includes('eshop_categ_name'))throw new Error('表头必须包含商品名称、分类和售价');
      const rows=values.slice(1).filter(row=>row.some(value=>String(value).trim())).map(row=>Object.fromEntries(header.map((key,index)=>key?[key,String(row[index]??'').trim()]:null).filter(Boolean) as any));
      if(rows.length>500)throw new Error('每次最多导入 500 行商品');
      result=await api('product_preview',{product_data:rows});
    } else result = await api('product_preview', {content:await fileData(file)});
    result.product_data=result.product_data.map((row:any,index:number)=>({...row,row_number:index+1}));
    draftRows.value=result.product_data.map((row:any)=>Object.fromEntries([...fieldKeys,'row_number'].map(key=>[key,row[key]])));
    preview.value=result; step.value=4; previewPage.value=1;
  } catch(e) { error.value = errorText(e); } finally { input.value = ''; busy.value = false; }
}
async function create(){
  if(busy.value || unavailable.value || (!pending.value && (!preview.value || preview.value.error_count || !preview.value.valid_count)))return;
  busy.value=true;error.value='';
  try {
    if(!pending.value){
      const rows=preview.value.product_data.map((row:any)=>Object.fromEntries([...fieldKeys,'eshop_categ_id','row_number','image'].filter(key=>row[key]!==undefined).map(key=>[key,row[key]])));
      const task={product_data:rows,request_key:crypto.randomUUID()};await write(pendingKey,task);pending.value=task;
    }
    const result=await api('product_create',pending.value);await write(pendingKey,null);pending.value=null;
    notice.value=`已创建 ${result.created_count} 件商品`;emit('created');emit('close');
  }catch(e:any){error.value=errorText(e);if(e.code===400){await write(pendingKey,null);pending.value=null;preview.value=null;}}
  finally{busy.value=false;}
}
onMounted(async()=>{if(!props.embedded)dialog.value?.showModal();busy.value=true;try{pending.value=await read(pendingKey);categories.value=(await api('product_options')).category_data;}catch(e){error.value=errorText(e);}finally{busy.value=false;}});
</script>
<template>
<component :is="embedded?'section':'dialog'" ref="dialog" :class="embedded?'product-create-inline product-wizard':'product-create-dialog product-wizard'" :aria-label="t('商品新建')" @cancel.prevent="close">
<header v-if="!embedded"><h2>{{ t("商品新建") }}</h2><button :disabled="busy" @click="close" :aria-label="t('关闭')"><PosIcon name="close" /></button></header>
<ol class="product-steps" :aria-label="t('商品新建步骤')"><li v-for="(label,index) in ['选择方式','选择分类','填写数据','预览校验']" :key="label" :class="{current:step===index+1,complete:step>index+1,skipped:mode!=='manual' && step===4 && (index===1 || index===2)}" :aria-current="step===index+1?'step':undefined"><span>{{mode!=='manual' && step===4 && (index===1 || index===2)?'—':index+1}}</span>{{ t(label) }}</li></ol>
<div class="wizard-body">
<p v-if="unavailable" class="error">{{ t("当前离线，请联网后维护商品。") }}</p><p v-if="error" class="error" role="alert">{{ t(error) }}</p>
<div v-if="pending" class="product-pending"><p>{{ t("上次") }} {{pending.product_data.length}} {{ t("件商品的提交结果待确认，请核实原提交，避免重复创建。") }}</p></div>
<template v-else>
<section v-if="step===1" class="wizard-methods"><h3>{{ t("选择商品录入方式") }}</h3><div class="method-options"><button v-for="choice in [{id:'manual',name:'手动新建',detail:'选择分类，填写单件商品资料'},{id:'excel',name:'Excel 导入',detail:'上传模板文件，批量预览校验'},{id:'paste',name:'Excel 粘贴',detail:'复制表格内容，直接预览校验'}]" :key="choice.id" :aria-pressed="mode===choice.id" :disabled="busy" @click="mode=choice.id"><b>{{ t(choice.name) }}</b><small>{{ t(choice.detail) }}</small></button></div>
<div v-if="mode==='excel'" class="wizard-source"><button :disabled="busy || unavailable" @click="downloadTemplate">{{ t("下载导入模板") }}</button><label>{{ t("上传 Excel") }}<input type="file" accept=".xlsx" :disabled="busy || unavailable" @change="uploadExcel" /></label><p class="hint">{{ t("使用模板中的完整分类名称；每批最多 500 行，上传后直接进入预览校验。") }}</p></div>
<div v-else-if="mode==='paste'" class="wizard-source"><ProductSheet v-model="draftRows" :fields="fields" :busy="busy || unavailable" @pasted="pasted" /></div>
<p v-else class="hint">{{ t('创建一件单规格商品，先选择一个末级商品分类。') }}</p>
</section>
<section v-if="step===2"><h3>{{ t("选择商品分类") }}</h3><fieldset :disabled="busy || unavailable"><CategoryTransfer v-model="form.eshop_categ_id" :categories="categories" /></fieldset></section>
<form v-if="step===3" id="product-data-form" @submit.prevent="validate"><h3>{{ t("填写商品资料") }}</h3><p class="chosen-category">{{ t("分类：") }} {{selectedCategory?.eshop_categ_name || t('未分类')}}</p><fieldset :disabled="busy || unavailable"><div class="product-fields"><label>{{ t("商品名称 *") }}<input v-model="form.name" required maxlength="200" /></label><label>{{ t("售价（{0}）*", [activeCurrency]) }}<input v-model="form.sale_price" type="number" required min="0" max="1000000" step="0.01" /></label><label>{{ t("条码") }}<input v-model="form.barcode" maxlength="80" :placeholder="t('可扫描商品条码')" /></label><label>{{ t("商品编码") }}<input v-model="form.default_code" maxlength="80" /></label><label>{{ t("规格") }}<input v-model="form.product_attrs" maxlength="120" :placeholder="t('例如：500g / 袋')" /></label></div><label>{{ t("商品描述") }}<textarea v-model="form.description_sale" maxlength="5000" rows="3" /></label><label>{{ t("商品图片") }}<input type="file" accept="image/png,image/jpeg,image/webp" @change="uploadImage" /></label><div v-if="form.image" class="product-image-preview"><img :src="'data:image/png;base64,'+form.image" :alt="t('待上传商品图片')" /><button type="button" @click="form.image=''">{{ t("移除图片") }}</button></div><p class="hint">{{ t("图片最大 5MB；商品创建后上架，采用无库存下单。") }}</p></fieldset></form>
<section v-if="step===4" class="wizard-preview"><div class="preview-heading"><h3>{{ t("预览校验") }}</h3><span v-if="preview" :class="preview.error_count?'error':'preview-success'">{{preview.valid_count}} {{ t("行通过 ·") }} {{preview.error_count}} {{ t("行错误") }}</span><span v-else>{{ t("数据已修改，请重新校验") }}</span><button :disabled="busy || unavailable" @click="validate">{{ t("重新校验") }}</button></div><p class="hint">{{mode==='manual'?t("核对资料后确认创建；如需修改，请返回上一步。"):t("可直接修改表格；修改后需重新校验，全部通过后才能创建。")}}</p>
<ProductSheet v-if="mode!=='manual'" v-model="draftRows" :fields="fields" :busy="busy || unavailable" :validation="preview" />
<template v-else><ListTable :rows="visibleRows" :columns="columns" row-key="row_number" :busy="busy" :label="t('商品校验预览')">
<template v-for="field in fields" #[field[0]]="{row}" :key="field[0]"><input v-if="mode!=='manual'" v-model="row[field[0]]" :disabled="busy" :aria-label="t('{0} 第 {1} 行', [t(field[1]), row.row_number])" /><span v-else :title="String(row[field[0]] ?? '')">{{row[field[0]]}}</span></template><template #validation="{row}"><span :title="validationText(row)" :class="validationText(row)==='校验通过'?'preview-success':'validation-message'">{{ t(validationText(row)) }}</span></template>
</ListTable><ListPagination :page="previewPage" :page-size="previewSize" :total="previewRows.length" :busy="busy" @change="(p,s)=>{previewPage=p;previewSize=s}" /></template>
</section>
</template>
</div>
<footer class="wizard-footer"><button :disabled="busy" @click="close">{{ t("取消") }}</button><button v-if="step>1 && !pending" :disabled="busy" @click="back">{{ t("上一步") }}</button><span class="wizard-footer-spacer" /><button v-if="pending" class="primary" :disabled="busy || unavailable" @click="create">{{ t("确认原提交结果") }}</button><template v-else><button v-if="step===1 && mode==='manual'" class="primary" :disabled="busy || unavailable" @click="step=2">{{ t("下一步") }}</button><button v-else-if="step===1 && mode==='paste'" class="primary" :disabled="busy || unavailable || !filledRows.length" @click="validate">{{ t("预览校验") }}</button><button v-else-if="step===2" class="primary" :disabled="busy || unavailable || !selectedCategory || selectedCategory?.is_leaf===false" @click="step=3">{{ t("下一步") }}</button><button v-else-if="step===3" class="primary" :disabled="busy || unavailable" form="product-data-form" type="submit">{{ t("下一步：校验") }}</button><button v-else-if="step===4" class="primary" :disabled="busy || unavailable || !preview || !!preview.error_count || !preview.valid_count" @click="create">{{ t("确认创建") }} {{preview?.valid_count ? ' '+preview.valid_count+t("件商品"):''}}</button></template></footer>
</component>
</template>

<style scoped>
.product-wizard:has(.category-transfer){max-width:none;width:100%;box-sizing:border-box}.product-wizard :deep(.category-transfer){font-size:14px}.product-wizard fieldset{min-width:0}
</style>
