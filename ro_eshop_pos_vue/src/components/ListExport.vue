<script setup lang="ts">
import { exportWorkbook, downloadWorkbook, type ExportColumn } from '../excel';
import { t } from "../i18n";
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { api, errorText, notice, session, storeId } from '../api';
import { offline } from '../offline';
import { standalone } from '../mode';
import PosIcon from './PosIcon.vue';
const props=defineProps<{selectedIds:(number|string)[];operation?:string;values?:Record<string,unknown>;busy?:boolean;rows?:any[];columns?:ExportColumn[];rowKey?:string;label?:string;hideSelection?:boolean}>();
const emit=defineEmits(['clear']);
const exporting=ref(false);
const unavailable=computed(()=>props.rows ? false : standalone.value ? props.operation!=='orders' : offline.value);
let controller:AbortController|undefined;
function cancel(){controller?.abort();}
watch(()=>[storeId.value,session.value?.user.id],cancel);
onBeforeUnmount(cancel);
async function download(){
  if(!props.selectedIds.length || exporting.value || props.busy || unavailable.value)return;
  exporting.value=true;controller=new AbortController();
  const signal=controller.signal;
  try{
    const ids=new Set(props.selectedIds.map(String));
    const result=props.rows && props.columns ? await exportWorkbook(props.rows.filter(row=>ids.has(String(row[props.rowKey||'id']))),props.columns,props.label||'数据列表') : await api('list_export',{...props.values,list_operation:props.operation,selected_ids:[...props.selectedIds]},{signal});
    if(signal.aborted)return;
    downloadWorkbook(result);
    notice.value=`已导出 ${result.count} 条记录`;
  }catch(e){if(!signal.aborted)notice.value=`导出失败：${errorText(e)}`;}
  finally{exporting.value=false;}
}
</script>
<template>
<div class="list-export-selection"><span v-if="selectedIds.length && !hideSelection" role="status">{{ t("已选") }} {{selectedIds.length}} {{ t("条") }}</span><button v-if="selectedIds.length && !hideSelection" type="button" :disabled="exporting || busy" @click="emit('clear')">{{ t("清空选择") }}</button><button type="button" :disabled="!selectedIds.length || busy || exporting || unavailable" :aria-busy="exporting" :title="unavailable?t('Excel 导出需连接在线门店'):selectedIds.length?t('仅导出勾选的记录，沿用当前排序'):t('请先勾选需要导出的记录')" @click="download"><PosIcon name="download" />{{exporting?t("正在导出…"):t("导出 Excel")}}</button></div>
</template>

<style scoped>
.list-export-selection{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.list-export-selection>span{font-size:13px;color:var(--theme-text-accent, #285bd4);white-space:nowrap}
</style>
