<script setup lang="ts">
import { ElInput } from 'element-plus';
import 'element-plus/es/components/input/style/css';
import '../../pure-admin.css';
import { computed, ref, nextTick } from 'vue';
import { t, translationVariants } from '../../i18n';
import { errorText } from '../../api';
import { productAttributes, variantSpec, variantSignature } from '../../productVariants';
import CategoryTransfer from '../../components/CategoryTransfer.vue';
import PosIcon from '../../components/PosIcon.vue';
import ProductImage from '../../components/ProductImage.vue';
const props=defineProps<{form:any;categories:any[];disabled?:boolean}>();
const emit=defineEmits<{busy:[value:boolean]}>();
const root=ref<HTMLElement>(),attempted=ref(false);
const imageError=ref(''),uploading=ref(false),active=ref(0),categoryOpen=ref(false);
const variants=computed(()=>props.form.variant_data || []);
const selected=computed(()=>variants.value[active.value]);
const category=computed(()=>props.categories.find(c=>c.eshop_categ_id===props.form.eshop_categ_id));
function addVariant(){attempted.value=false;variants.value.push({id:0,variant_uid:crypto.randomUUID(),sale_price:selected.value?.sale_price??0,barcode:'',default_code:'',product_attrs:'',attribute_data:[],image:'',image_url:''});active.value=variants.value.length-1;}
function removeDraft(){if(selected.value?.id || variants.value.length<=1)return;variants.value.splice(active.value,1);active.value=Math.max(0,active.value-1);}
function syncSpec(){try{selected.value.product_attrs=variantSpec(productAttributes(selected.value.attribute_data));}catch{/* Incomplete attributes remain editable until submission. */}}
async function variantTemplate(){
 const XLSX=await import('xlsx');const book=XLSX.utils.book_new();
 const sheet=XLSX.utils.aoa_to_sheet([['规格','售价*','条码','商品编码','属性:颜色','属性:尺寸'].map(key=>t(key))]);
 sheet['!cols']=Array.from({length:6},()=>({wch:22}));
 XLSX.utils.book_append_sheet(book,sheet,t('变体'));
 XLSX.utils.book_append_sheet(book,XLSX.utils.aoa_to_sheet([['每行一个实际变体，不生成属性组合。'],['售价必填，条码和商品编码列请设置为文本，保留前导零。'],['属性列以“属性:”开头，例如“属性:口味”。无属性时填写规格。'],['相同属性组合或规格覆盖当前草稿，其余新增；导入后检查并点击保存。']].map(row=>row.map(key=>t(key)))),t('填写说明'));
 XLSX.writeFile(book,t('商品变体.xlsx'));
}
async function importVariants(event:Event){
 const input=event.target as HTMLInputElement,file=input.files?.[0];if(!file)return;
 uploading.value=true;emit('busy',true);imageError.value='';
 try{
  if(file.size>5*1024*1024||!file.name.toLowerCase().endsWith('.xlsx'))throw new Error('请上传不超过 5MB 的 XLSX 文件');
  const XLSX=await import('xlsx'),book=XLSX.read(await file.arrayBuffer()),sheet=book.Sheets[book.SheetNames[0]];
  const matrix=XLSX.utils.sheet_to_json<any[]>(sheet,{header:1,defval:''}),headers=(matrix.shift()||[]).map(value=>{
   const label=String(value).trim();
   const field=['规格','售价*','条码','商品编码'].find(key=>translationVariants(key).includes(label));
   if(field)return field;
   const prefix=translationVariants('属性:').find(prefix=>label.startsWith(prefix));
   return prefix?'属性:'+label.slice(prefix.length):label;
  });
  if(!headers.includes('售价*')||!headers.includes('条码'))throw new Error('表头不匹配，请使用变体模板');
  const rows=matrix.filter(row=>row.some(v=>v!==''));if(!rows.length||rows.length>100)throw new Error('请提供 1 至 100 条变体');
  const draft=structuredClone(props.form.variant_data.map((row:any)=>({...row,attribute_data:row.attribute_data.map((a:any)=>({...a}))}))),seen=new Set<string>();
  for(const row of rows){
   const get=(key:string)=>row[headers.indexOf(key)]??'';
   if(typeof get('条码')!=='string'||typeof get('商品编码')!=='string')throw new Error('条码和商品编码必须使用文本格式');
   const attributes=productAttributes(headers.flatMap((key,index)=>key.startsWith('属性:')&&row[index]!==''?[{name:key.slice(3),value:String(row[index])}]:[]));
   const spec=attributes.length?variantSpec(attributes):String(get('规格')),price=Number(get('售价*'));
   if(get('售价*')===''||!Number.isFinite(price)||price<0||price>1000000||Math.abs(price*100-Math.round(price*100))>0.00001)throw new Error('售价须为有效金额，最多两位小数');
   const key=variantSignature(attributes,spec);if(seen.has(key))throw new Error('属性组合或规格重复');seen.add(key);
   const old=draft.find((v:any)=>variantSignature(v.attribute_data,v.product_attrs)===key);
   const values={product_attrs:spec,attribute_data:attributes,sale_price:price,barcode:get('条码'),default_code:get('商品编码')};
   if(old)Object.assign(old,values);else draft.push({id:0,variant_uid:crypto.randomUUID(),image:'',image_url:'',...values});
  }
  if(draft.length>100)throw new Error('请提供 1 至 100 条变体');props.form.variant_data=draft;active.value=0;
 }catch(e){imageError.value=errorText(e);}finally{input.value='';uploading.value=false;emit('busy',false);}
}
async function upload(event:Event){
 const input=event.target as HTMLInputElement,file=input.files?.[0],row=selected.value;if(!file)return;
 uploading.value=true;emit('busy',true);imageError.value='';
 try{
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024)throw new Error('请选择不超过 5MB 的 JPG、PNG 或 WebP 图片');
  const bitmap=await createImageBitmap(file);const pixels=bitmap.width*bitmap.height;bitmap.close();if(pixels>20000000)throw new Error('图片不能超过 2000 万像素');
  const data=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(new Error('文件读取失败'));reader.readAsDataURL(file);});
  row.image=data.split(',')[1];row.image_url=data;
 }catch(e){imageError.value=errorText(e);}finally{input.value='';uploading.value=false;emit('busy',false);}
}

function variantIssue(row:any,index:number) {
 try { productAttributes(row.attribute_data); } catch(e) { return {field:'attributes',message:errorText(e)}; }
 const price=Number(row.sale_price);
 if(row.sale_price==='' || row.sale_price==null || !Number.isFinite(price) || price<0 || price>1000000 || Math.abs(price*100-Math.round(price*100))>0.00001) return {field:'price',message:'售价须为有效金额，最多两位小数'};
 for(const field of ['barcode','default_code']) {const value=String(row[field]||'').trim();if(value && variants.value.slice(0,index).some((other:any)=>String(other[field]||'').trim()===value))return {field,message:'商品条码或编码重复'};}
 const signature=variantSignature(productAttributes(row.attribute_data),String(row.product_attrs||''));
 if(variants.value.slice(0,index).some((other:any)=>{try{return variantSignature(productAttributes(other.attribute_data),String(other.product_attrs||''))===signature;}catch{return false;}}))return {field:row.attribute_data.length?'attributes':'spec',message:'属性组合或规格重复'};
 return null;
}
const issues=computed(()=>variants.value.map(variantIssue));
async function validate(){
 attempted.value=true;
 let field='';
 if(!String(props.form.name||'').trim())field='name';
 else if(!category.value || category.value.is_leaf===false)field='category';
 else { const index=issues.value.findIndex((issue:any)=>issue); if(index>=0){active.value=index;field=issues.value[index]!.field;} }
 if(!field && variants.value.length)return true;
 await nextTick();
 const target=root.value?.querySelector<HTMLElement>(`[data-field="${field||'price'}"]`);
 target?.scrollIntoView({block:'center'});(target?.querySelector<HTMLElement>('input,textarea') || target)?.focus();
 return false;
}
defineExpose({validate});
</script>
<template>
<div ref="root" class="product-edit-layout">
<section class="product-common"><h3>{{t('基本资料')}}</h3>
<p v-if="imageError" class="error" role="alert">{{t(imageError)}}</p>
<label>{{t('商品名称')}} *<ElInput data-field="name" :aria-invalid="attempted && !form.name.trim()" v-model="form.name" required maxlength="200" :disabled="disabled" /></label>
<label>{{t('商品分类')}} *<button data-field="category" :aria-invalid="attempted && (!category || category.is_leaf===false)" type="button" class="category-choice" :disabled="disabled" @click="categoryOpen=!categoryOpen"><span>{{category?.eshop_categ_name || t('选择商品分类')}}</span><PosIcon name="down" /></button></label>
<div v-if="categoryOpen" class="edit-category-picker"><CategoryTransfer v-model="form.eshop_categ_id" :categories="categories" /><button type="button" :disabled="disabled" @click="categoryOpen=false">{{t('完成')}}</button></div><p v-if="attempted && (!category || category.is_leaf===false)" class="error">{{t('只能选择最末级商品分类')}}</p>
<details class="editor-details"><summary>{{t("商品描述（选填）")}}</summary><label>{{t('商品描述')}}<ElInput type="textarea" v-model="form.sub_title" maxlength="5000" :rows="4" :disabled="disabled" /></label></details><p class="hint">{{t('名称、分类和描述由所有变体共用。')}}</p>
</section>
<section class="product-variants"><header><h3>{{t('商品变体')}} <small>{{variants.length}}</small></h3><button type="button" class="action-with-icon" :disabled="disabled || uploading || variants.length>=100" @click="addVariant"><PosIcon name="plus" />{{t('添加变体')}}</button></header>
<p class="hint">{{t('逐条添加实际销售的规格，条码由您录入或扫码填写。')}}</p>
<details class="editor-details"><summary>{{t("批量导入规格")}}</summary><div class="variant-import"><button type="button" :disabled="disabled || uploading" @click="variantTemplate">{{t('下载变体模板')}}</button><label class="file-upload" :class="{disabled:disabled || uploading}"><PosIcon name="upload" />{{t('导入变体')}}<input type="file" accept=".xlsx" :disabled="disabled || uploading" @change="importVariants" /></label></div></details>
<div v-if="variants.length>1" class="variant-tabs" role="group" :aria-label="t('商品变体')"><button v-for="(row,index) in variants" :key="row.id || row.variant_uid" type="button" :aria-pressed="active===index" :class="{selected:active===index}" :disabled="uploading" @click="active=Number(index)">{{row.product_attrs || t('变体 {0}',[Number(index)+1])}}<span v-if="attempted && issues[Number(index)]" class="variant-error-mark"> · {{t("待修正")}}</span></button></div>
<details v-if="variants.length>1" class="editor-details"><summary>{{t('规格总览')}} · {{variants.length}}</summary><div class="variant-overview"><button v-for="(row,index) in variants" :key="row.id || row.variant_uid" type="button" :disabled="uploading" @click="active=Number(index)"><b>{{row.product_attrs || t('默认规格')}}</b><span>{{row.barcode || t('未填写条码')}}</span><span>{{row.sale_price}}</span><small v-if="attempted && issues[Number(index)]">{{t(issues[Number(index)]!.message)}}</small></button></div></details>
<fieldset v-if="selected" class="variant-fields" :disabled="disabled || uploading"><div v-if="selected" class="variant-picture"><div class="variant-image-preview"><ProductImage :src="selected.image_url" /></div><div><label class="image-upload file-upload"><PosIcon name="upload" />{{t('当前规格图片')}}<input type="file" :disabled="disabled || uploading" accept="image/png,image/jpeg,image/webp" @change="upload" /></label><p class="hint">{{selected.product_attrs || t("默认规格")}} · JPG / PNG / WebP · ≤ 5MB</p><button v-if="selected.image_url" type="button" :disabled="disabled || uploading" @click="selected.image='';selected.image_url=''">{{t('移除图片')}}</button></div></div><p v-if="attempted && issues[active]" class="error" role="alert">{{t(issues[active]!.message)}}</p>
<details class="variant-attributes" :open="!!selected.attribute_data.length"><summary>{{t("规格属性（选填）")}}</summary><header><h4>{{t('属性')}}</h4><button type="button" :disabled="selected.attribute_data.length>=12" @click="selected.attribute_data.push({name:'',value:''})"><PosIcon name="plus" />{{t('添加属性')}}</button></header>
<div v-for="(attr,index) in selected.attribute_data" :key="index" class="attribute-row"><ElInput data-field="attributes" v-model="attr.name" :aria-label="t('属性')" :placeholder="t('例如：颜色')" required maxlength="40" @input="syncSpec" /><ElInput v-model="attr.value" :aria-label="t('属性值')" :placeholder="t('例如：红色')" required maxlength="80" @input="syncSpec" /><button type="button" :aria-label="t('移除属性')" @click="selected.attribute_data.splice(index,1);syncSpec()"><PosIcon name="close" /></button></div>
<p v-if="!selected.attribute_data.length" class="hint">{{t('可添加颜色、尺寸、口味等属性。')}}</p></details>
<div class="variant-details"><label>{{t('规格')}}<ElInput data-field="spec" v-model="selected.product_attrs" maxlength="120" :readonly="!!selected.attribute_data.length" /></label><label>{{t('售价')}} *<ElInput data-field="price" :aria-invalid="attempted && issues[active]?.field==='price'" v-model="selected.sale_price" type="number" required min="0" max="1000000" step="0.01" /></label><label>{{t('商品编码')}}<ElInput data-field="default_code" v-model="selected.default_code" maxlength="80" /></label><label>{{t('条码')}}<ElInput data-field="barcode" v-model="selected.barcode" maxlength="80" :placeholder="t('可扫描商品条码')" @keydown.enter.prevent /></label></div>
<button v-if="!selected.id && variants.length>1" type="button" class="remove-draft" @click="removeDraft">{{t('移除此未保存变体')}}</button>
</fieldset></section></div>
</template>
<style scoped>
.product-edit-layout{display:grid;grid-template-columns:minmax(230px, .85fr) minmax(360px,1.65fr);gap:32px;padding:24px}
.product-edit-layout h3{font-size:16px;margin:0 0 20px}.product-edit-layout h4{margin:0;font-size:14px}.product-common>label{margin-bottom:20px}.product-common .hint,.product-variants .hint{font-size:12px;line-height:1.7;color:var(--theme-muted, #687a94);margin:10px 0 16px}
.product-variants{min-width:0;border-left:1px solid var(--theme-line, #e4eaf2);padding-left:28px}.product-variants header,.variant-attributes header{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:12px}.product-variants header h3{margin:0}.product-variants h3 small{display:inline;color:var(--theme-muted, #687a94);font-weight:400;margin-left:8px}
.category-choice{display:flex;align-items:center;justify-content:space-between;gap:8px;text-align:left}.category-choice span{overflow:hidden;text-overflow:ellipsis}.edit-category-picker{grid-column:1/-1;margin-bottom:20px}.edit-category-picker :deep(.category-transfer){min-width:0}.edit-category-picker :deep(.transfer-grid){grid-template-columns:1fr}
#app .management-editor .file-upload{position:relative;display:inline-flex;flex-direction:row;align-items:center;gap:6px;border:1px solid var(--theme-line, #c3d1e8);border-radius:4px;padding:9px 12px;background:var(--theme-surface, #fff);cursor:pointer;font-size:13px;color:var(--theme-text-accent, #285bd4)}.file-upload:focus-within{outline:2px solid var(--brand);outline-offset:2px}.file-upload.disabled{opacity:.5;cursor:default}.file-upload input{position:absolute;width:1px;height:1px;opacity:0;overflow:hidden;clip-path:inset(50%);padding:0;border:0}
.variant-import{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:16px}.variant-import label{font-size:12px}.variant-import input{max-width:230px;font-size:12px}
.variant-tabs{display:flex;gap:8px;overflow:auto;padding-bottom:12px;margin-bottom:12px}.variant-tabs button{white-space:nowrap;max-width:220px;overflow:hidden;text-overflow:ellipsis;flex-shrink:0}.variant-tabs .selected{background:var(--theme-selected, #edf3ff);color:var(--theme-text-accent, #285bd4);border-color:var(--brand)}
#app .management-editor fieldset.variant-fields{display:block;margin:0;min-width:0}.variant-picture{display:flex;gap:16px;align-items:center;margin-bottom:24px}.variant-image-preview{width:88px;height:88px;flex-shrink:0;border:1px solid var(--theme-line, #dfe6ef);border-radius:8px;overflow:hidden}.variant-image-preview :deep(img),.variant-image-preview :deep(.product-placeholder){width:100%;height:100%;object-fit:contain}.image-upload{font-size:13px;max-width:240px}.image-upload input{font-size:12px;max-width:100%}
.variant-attributes{padding:16px;background:var(--theme-surface, #f7f9fc);border-radius:6px;margin-bottom:20px}.variant-attributes button{display:inline-flex;align-items:center;gap:6px}.attribute-row{display:grid;grid-template-columns:1fr 1fr 32px;gap:8px;margin-top:10px}.attribute-row input{min-width:0}.attribute-row button{padding:0;justify-content:center;border:0;background:transparent}.variant-details{display:grid;grid-template-columns:1fr 1fr;gap:20px}.remove-draft{margin-top:20px;color:#b42318}
@media(max-width:760px){.product-edit-layout{grid-template-columns:1fr;padding:20px;gap:20px}.product-variants{border-left:0;border-top:1px solid var(--theme-line, #e4eaf2);padding:20px 0 0}.variant-details{grid-template-columns:1fr}}
.editor-details{margin:12px 0 20px}.editor-details summary,.variant-attributes summary{cursor:pointer;color:var(--theme-text-accent,#285bd4);padding:8px 0;font-size:13px}.editor-details[open]>summary{margin-bottom:12px}.variant-error-mark,.variant-overview small{color:#b4232d}.variant-overview{display:grid;gap:4px;max-height:220px;overflow:auto}.variant-overview button{display:grid;grid-template-columns:1fr 1fr auto;gap:10px;text-align:left}.variant-overview small{grid-column:1/-1}.variant-overview span{overflow-wrap:anywhere}.variant-attributes>header{margin-top:12px}
</style>
