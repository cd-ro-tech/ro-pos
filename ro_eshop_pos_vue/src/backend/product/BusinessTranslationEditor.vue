<script setup lang="ts">
import '../../pure-admin.css';
import { ElInput } from 'element-plus';
import 'element-plus/es/components/input/style/css';
import PosIcon from "../../components/PosIcon.vue";
import { useUnsavedForm, confirmDiscard } from "../../formEditing";
import ListExport from '../../components/ListExport.vue';
import ListTable from "../../components/ListTable.vue";
import PosSelect from "../../components/WorkbenchSelect.vue";
import { ref, onMounted, watch, useId } from 'vue';
import { t, languageOptions } from '../../i18n';
import { api, errorText } from '../../api';
import { standalone } from '../../mode';
import ListPagination from '../../components/ListPagination.vue';
const selectedIds=ref<(number|string)[]>([]);
const formId=useId();
const props=defineProps<{embedded?:boolean;productId?:number}>();
const emit=defineEmits(['close','saved','busy']);
const dialog=ref<HTMLDialogElement>(),entity=ref('product'),keyword=ref(''),page=ref(1),pageSize=ref(20),total=ref(0),rows=ref<any[]>([]),record=ref<any>(null),busy=ref(false),error=ref('');
watch(busy,value=>emit('busy',value),{flush:'sync'});
async function search(p=1,size=pageSize.value){if(busy.value)return;busy.value=true;error.value='';record.value=null;try{const data=await api('translation_list',{entity:entity.value,keyword:keyword.value,page:p,page_size:size});pageSize.value=size;rows.value=data.record_data;total.value=data.total;page.value=p;}catch(e){error.value=errorText(e);}finally{busy.value=false;}}
async function open(row:any){busy.value=true;error.value='';try{record.value=await api('translation_get',{entity:entity.value,record_id:row.id,product_id:props.productId});for(const option of languageOptions)record.value.translation_data[option.value] ||= {};}catch(e){error.value=errorText(e);}finally{busy.value=false;}}
async function save(){if(busy.value||!record.value)return;busy.value=true;error.value='';try{await api('translation_save',{entity:entity.value,record_id:record.value.record_id,product_id:props.productId,translation_data:record.value.translation_data});emit('saved');record.value=null;}catch(e){error.value=errorText(e);}finally{busy.value=false;}if(!props.productId&&!error.value)await search(page.value);}
const {dirty,close:closeRecord}=useUnsavedForm(record);
async function close(){if(!busy.value && await confirmDiscard(dirty.value))emit('close');}
defineExpose({close});
onMounted(()=>{if(!props.embedded)dialog.value?.showModal();if(props.productId)void open({id:props.productId});else void search();});
</script>
<template>
<component :is="embedded ? 'section' : 'dialog'" ref="dialog" class="pure-admin-page business-translation-dialog" :class="{embedded}" @cancel.prevent="close" :aria-label="t('业务数据翻译')">
<header class="translation-header"><button type="button" :disabled="busy" @click="record && !productId ? closeRecord() : close()"><PosIcon name="prev" />{{t('返回')}}</button><h2>{{t(productId ? '商品多语言翻译' : '业务数据翻译')}}</h2><button v-if="record" type="submit" :form="formId" class="primary" :disabled="busy">{{t(busy?'保存中…':'保存')}}</button></header>
<p class="hint">{{t('译文为空时显示原文；条码、编号和会员姓名不翻译。')}}</p>
<p v-if="error" role="alert" class="error">{{t(error)}}</p>
<p v-if="!record && productId">{{busy ? t('正在加载…') : t('无法加载商品翻译')}} <button v-if="!busy" @click="open({id:productId})">{{t('重试')}}</button></p>
<div v-else-if="!record"><form @submit.prevent="search()" class="list-filter"><div class="filter-fields"><label>{{t('搜索')}}<ElInput v-model="keyword" :placeholder="t('搜索')" :disabled="busy" /></label><div class="filter-field"><span>{{t('类型')}}</span><PosSelect v-model="entity" :disabled="busy" :aria-label="t('类型')" :options="[{value:'product',label:t('商品')},{value:'category',label:t('商品分类')},...(!standalone?[{value:'attribute',label:t('规格')}]:[])]" /></div></div><div class="list-toolbar"><div class="list-actions"><button class="primary" :disabled="busy"><PosIcon name="search" />{{t('查询')}}</button><button type="button" :disabled="busy" @click="keyword='';entity='product';search()">{{t('重置')}}</button></div><div class="list-actions"><ListExport :rows="rows" :columns="[{key:'name',label:'名称'}]" label="业务翻译列表" :selected-ids="selectedIds" :busy="busy || !!error" @clear="selectedIds=[]" /><button type="button" :disabled="busy" @click="search(page)"><PosIcon name="refresh" />{{t('刷新')}}</button></div></div></form><ListTable selectable v-model:selected-ids="selectedIds" storage-key="translations" :rows="rows" :columns="[{key:'name',label:'名称'},{key:'actions',label:'操作',width:'160px'}]" :page="page" :page-size="pageSize" :busy="busy" :error="error" :filtered="!!keyword" @retry="search(page)"><template #actions="{row}"><button type="button" :disabled="busy" @click="open(row)">{{t('编辑翻译')}}</button></template></ListTable><ListPagination :page="page" :page-size="pageSize" :total="total" :busy="busy" @change="search" /></div>
<form v-else :id="formId" class="translation-form" @submit.prevent="save"><h3>{{record.record_name}}</h3><div class="translation-grid"><section v-for="language in languageOptions" :key="language.value"><h4>{{language.label}}</h4><label v-for="field in record.field_data" :key="field.key">{{t(field.label)}}<ElInput v-if="!['description_sale','sub_title'].includes(field.key)" v-model="record.translation_data[language.value][field.key]" :placeholder="record.source_data?.[field.key] || ''" :disabled="busy" maxlength="200" /><ElInput type="textarea" v-else v-model="record.translation_data[language.value][field.key]" :placeholder="record.source_data?.[field.key] || ''" :disabled="busy" :maxlength="field.key==='description_sale'||field.key==='sub_title'?5000:200" :rows="2" /></label></section></div></form>
</component>
</template>
<style scoped>
.business-translation-dialog{width:min(1000px,calc(100vw - 32px));max-height:90dvh;padding:16px;overflow:auto;color:var(--theme-ink, #243047)}header,footer,.translation-search{display:flex;align-items:center;gap:12px;justify-content:space-between;margin-bottom:8px}h2{font-size:18px}.translation-search{justify-content:flex-start}.translation-search .pos-select{width:210px;flex-shrink:0}.translation-search input{flex:1;min-width:0}.translation-search button{flex-shrink:0}.translation-grid label{display:block}.translation-grid h4{margin:0 0 8px}.translation-grid :is(input,textarea){margin-top:4px;width:100%;box-sizing:border-box}.translation-grid input{height:36px}.hint{margin:4px 0 8px;font-size:12px;color:var(--theme-muted,#71809a)}.translation-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:10px 0}.translation-grid section{border:1px solid var(--theme-line, #dce3ed);padding:12px}.translation-grid label{margin-top:8px}textarea{width:100%;resize:vertical;box-sizing:border-box}table{width:100%;border-collapse:collapse}th,td{border:1px solid var(--theme-line, #dce3ed);padding:10px;text-align:left}footer{justify-content:flex-end;margin-top:16px}@media(max-width:650px){.translation-grid{grid-template-columns:1fr}.translation-search{flex-wrap:wrap}.translation-search .pos-select{width:100%}}
.business-translation-dialog.embedded{width:100%;max-height:none;min-height:0;flex:1;padding:0 4px 0 0;display:flex;flex-direction:column;overflow:hidden;overscroll-behavior:contain;box-sizing:border-box}
.translation-form{display:block;margin:0;flex:1;min-height:0;overflow:auto;padding:0 4px 12px 0}.translation-form>h3{margin:4px 0;font-size:14px}.translation-form>footer{position:sticky;bottom:0;z-index:1;margin:0;padding:10px 0;background:var(--theme-surface,#fff);border-top:1px solid var(--theme-line,#dce3ed)}
.business-translation-dialog>header h2{margin:0}.business-translation-dialog>header{min-height:40px;margin:0 0 4px;padding:0}
.translation-header{flex-shrink:0;justify-content:flex-start;gap:10px}.translation-header button{display:inline-flex;align-items:center;gap:4px}.translation-header .primary{margin-left:auto}.business-translation-dialog.embedded>div{flex:1;min-height:0;overflow:auto}.business-translation-dialog>.hint{flex-shrink:0}
</style>
