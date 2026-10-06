<script setup lang="ts">
import { computed, ref, useId } from 'vue';
import { api, errorText } from '../../api';
import { t } from '../../i18n';
import type { BulkStatusRow } from '../../bulkStatus';
const props=defineProps<{entity:'product'|'category';ids:(number|string)[];disabled?:boolean}>();
const emit=defineEmits(['busy','saved','clear']);
const dialog=ref<HTMLDialogElement>(), titleId=useId(), working=ref(false), active=ref(true), done=ref(false);
const rows=ref<(BulkStatusRow & {success?:boolean})[]>([]), message=ref('');
const allowed=computed(()=>rows.value.filter(row=>row.allowed));
const label=computed(()=>active.value?'批量启用':'批量停用');
function busy(value:boolean){working.value=value;emit('busy',value);}
function close(){if(!working.value)dialog.value?.close();}
async function open(value:boolean){
 if(working.value||props.disabled||!props.ids.length)return;
 active.value=value;done.value=false;message.value='';rows.value=[];dialog.value?.showModal();busy(true);
 try{rows.value=(await api('bulk_set_active',{entity:props.entity,ids:props.ids.map(Number),active:value,preview:true})).rows;}
 catch(e){message.value=errorText(e);rows.value=props.ids.map(id=>({id:Number(id),name:`#${id}`,allowed:false,reason:message.value}));}
 finally{busy(false);}
}
async function execute(){
 if(working.value||!allowed.value.length||done.value)return;
 busy(true);message.value='';const eligible=allowed.value.map(row=>row.id);
 try{const result=await api('bulk_set_active',{entity:props.entity,ids:eligible,active:active.value});const byId=new Map<number,any>(result.rows.map((row:any)=>[row.id,row]));rows.value=rows.value.map(row=>byId.get(row.id)||row);done.value=true;busy(false);emit('saved');}
 catch(e){message.value=errorText(e);rows.value=rows.value.map(row=>row.allowed?{...row,success:false,reason:message.value}:row);done.value=true;}
 finally{if(working.value)busy(false);}
}
</script>
<template>
<div class="bulk-status-actions">
 <span>{{t('已选')}} {{ids.length}} {{t('条')}}</span>
 <button type="button" :disabled="disabled||working||!ids.length" @click="open(true)">{{t('批量启用')}}</button>
 <button type="button" :disabled="disabled||working||!ids.length" @click="open(false)">{{t('批量停用')}}</button>
 <button v-if="ids.length" type="button" :disabled="disabled||working" @click="emit('clear')">{{t('取消选择')}}</button>
 <dialog ref="dialog" class="bulk-status-dialog" :aria-labelledby="titleId" @cancel.prevent="close">
  <header><h3 :id="titleId">{{t(label)}} · {{t(done?'处理结果':'操作确认')}}</h3></header>
  <p v-if="working" role="status">{{t('处理中…')}}</p>
  <p v-else-if="done" role="status">{{t('成功')}} {{rows.filter(r=>r.success).length}} / {{rows.length}}</p>
  <p v-else>{{t('可执行')}} {{allowed.length}} · {{t('不可执行')}} {{rows.length-allowed.length}}</p>
  <p class="bulk-explanation">{{t(entity==='category'?'停用分类会隐藏其下级商品；启用仅改变自身状态，下级分类保留原状态。':'停用商品后不可在收银端销售，历史订单保留。')}} {{t('启用后仍受上级分类状态影响。')}}</p>
  <p v-if="message" role="alert" class="error">{{message}}</p>
  <div class="bulk-results"><table><colgroup><col style="width:35%" /><col style="width:15%" /><col style="width:50%" /></colgroup><thead><tr><th>{{t('名称')}}</th><th>{{t('操作')}}</th><th>{{t('结果 / 原因')}}</th></tr></thead><tbody><tr v-for="row in rows" :key="row.id"><td>{{row.name}}<small>#{{row.id}}</small></td><td>{{t(active?'启用':'停用')}}</td><td>{{t(row.reason||(done?'未执行':'可执行'))}}</td></tr></tbody></table></div>
  <footer><button type="button" :disabled="working" @click="close">{{t(done?'关闭':'取消')}}</button><button v-if="!done" type="button" class="primary" :disabled="working||!allowed.length" @click="execute">{{t(allowed.length<rows.length?'仅处理可执行项':'确认执行')}}</button></footer>
 </dialog>
</div>
</template>
<style scoped>
.bulk-status-actions{display:flex;align-items:center;flex-wrap:wrap;gap:8px;font-size:13px}
.bulk-status-dialog{width:min(720px,calc(100vw - 32px));max-height:calc(100dvh - 40px);padding:0;border:1px solid var(--theme-line,#dce3ec);border-radius:8px;background:var(--theme-surface,#fff);color:var(--theme-ink,#27313d)}
.bulk-status-dialog::backdrop{background:rgb(0 0 0/.35)}
.bulk-status-dialog header,.bulk-status-dialog footer{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 20px}
.bulk-status-dialog h3{margin:0;font-size:18px}.bulk-status-dialog p{margin:12px 20px;white-space:normal}.bulk-status-dialog footer{justify-content:flex-end;border-top:1px solid var(--theme-line,#dce3ec)}
.bulk-results{max-height:45dvh;overflow:auto;margin:16px 20px}.bulk-results table{width:100%;border-collapse:collapse;table-layout:fixed}.bulk-results th,.bulk-results td{padding:10px;text-align:left;border-bottom:1px solid var(--theme-line,#dce3ec);white-space:normal;overflow-wrap:anywhere}.bulk-results th{position:sticky;top:0;background:var(--theme-subtle,#f5f7fa)}.bulk-results small{display:block;color:var(--theme-muted,#667085)}
#app .bulk-status-dialog .bulk-explanation{margin:12px 20px;font-size:12px;line-height:1.6;color:var(--theme-muted,#667085)}
#app .bulk-status-dialog .bulk-results :is(th,td){text-align:left;width:auto}
#app .bulk-status-dialog header>button{width:32px;min-width:32px;height:32px;min-height:32px;padding:0}
</style>
