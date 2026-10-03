<script setup lang="ts">
import '../../pure-admin.css';
import { ElInput } from 'element-plus';
import 'element-plus/es/components/input/style/css';
import { t } from "../../i18n";
import DemoDataProgress from "../../components/DemoDataProgress.vue";
import PosIcon from "../../components/PosIcon.vue";
import { onMounted, ref, watch } from 'vue';
import { errorText, notice } from '../../api';
import { standalone } from '../../mode';
import { exportLocalData, previewLocalImport, importLocalData, loadDemoData, clearLocalData } from '../../standalone';
const props=defineProps<{ mode: 'import' | 'export' | 'demo' | 'clear'; embedded?:boolean }>();
const emit = defineEmits(['close','imported','busy']);
const fileInput = ref<HTMLInputElement | null>(null);
const dialog = ref<HTMLDialogElement | null>(null), busy=ref(false), error=ref('');
watch(busy,value=>emit('busy',value),{flush:'sync'});
const demoProgress=ref<InstanceType<typeof DemoDataProgress>|null>(null);
const confirmation=ref(''),demoCounts=ref<Record<string,number>|null>(null);
async function loadDemo(){busy.value=true;error.value='';try{demoCounts.value=null;await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));const result=await loadDemoData();await refresh();await demoProgress.value?.animate(result);demoCounts.value=result;emit('imported');notice.value='演示数据已加载';}catch(e){error.value=errorText(e);}finally{busy.value=false;}}
async function clearAll(){if(busy.value||confirmation.value!==t('确认清理'))return;busy.value=true;error.value='';try{await clearLocalData('确认清理');window.location.reload();}catch(e){error.value=errorText(e);busy.value=false;}}
const counts=ref<any>(null), preview=ref<any>(null), incoming=ref<any>(null), filename=ref('');
async function refresh() { const s=await exportLocalData(); counts.value={categories:s.categories.length,products:s.products.length,members:s.members.length,orders:s.orders.length}; }
async function download() {
  busy.value=true;error.value='';
  try {
    const data=await exportLocalData();
    const url=URL.createObjectURL(new Blob([JSON.stringify(data)],{type:'application/json'}));
    const link=document.createElement('a');link.href=url;link.download=`RO-POS-单机备份-${new Date().toISOString().slice(0,10)}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    notice.value='已导出本机分类、商品与历史现金订单';
  } catch(e) {error.value=errorText(e);} finally {busy.value=false;}
}
async function choose(event:Event) {
  const input=event.target as HTMLInputElement,file=input.files?.[0];if(!file)return;
  busy.value=true;error.value='';preview.value=null;incoming.value=null;filename.value=file.name;
  try {
    if(file.size>100*1024*1024)throw new Error('备份文件不能超过 100MB');
    const data=JSON.parse(await file.text());
    preview.value=await previewLocalImport(data);incoming.value=data;
  } catch(e) {error.value=errorText(e);} finally {busy.value=false;input.value='';}
}
async function confirmImport() {
  if(!incoming.value || busy.value)return;
  busy.value=true;error.value='';
  try {
    await importLocalData(incoming.value);incoming.value=null;preview.value=null;
    await refresh();emit('imported');notice.value='离线资料已合并保存；未覆盖原有数据，也未发起收款';
  } catch(e) {error.value=errorText(e);} finally {busy.value=false;}
}
function close() {if(!busy.value)emit('close');}
onMounted(async()=>{if(!props.embedded)dialog.value?.showModal();try{await refresh();}catch(e){error.value=errorText(e);}});
</script>
<template>
  <component :is="embedded ? 'section' : 'dialog'" ref="dialog" class="pure-admin-page" :class="embedded ? 'offline-data-inline' : 'offline-data-dialog'" aria-labelledby="offline-data-title" @cancel.prevent="close">
    <header v-if="!embedded"><h2 id="offline-data-title"><PosIcon :name="mode === 'clear' ? 'trash' : mode === 'demo' ? 'data' : mode === 'import' ? 'upload' : 'download'" />{{ mode === 'demo' ? t("加载演示数据") : mode === 'clear' ? t("清理所有数据") : mode === 'import' ? t("导入数据") : t("导出数据") }}</h2><button :disabled="busy" @click="close" class="dialog-close" :aria-label="t('关闭')"><PosIcon name="close" /></button></header>
    <div class="offline-data-body">
      <p class="hint">{{ mode==='clear'?t("以下是本机当前数据，清理前建议先导出备份。"):mode==='demo'?t("演示订单会计入本机看板，适合体验和试用。"):t("备份本机分类、商品图片、历史订单与现金收款。导入时保留原记录，相同记录自动跳过。") }}</p>
      <dl v-if="counts && mode!=='demo'" class="offline-data-counts"><div><dt>{{ t("分类") }}</dt><dd>{{ counts.categories }}</dd></div><div><dt>{{ t("商品") }}</dt><dd>{{ counts.products }}</dd></div><div><dt>{{ t("现金订单") }}</dt><dd>{{ counts.orders }}</dd></div></dl>
      <DemoDataProgress ref="demoProgress" :error="error" v-if="mode==='demo'" :loading="busy" :counts="demoCounts" /><section v-if="mode === 'demo'" class="offline-import-preview"><p>{{t("演示数据包含分类、商品和示例现金订单，会计入本机看板；重复加载不会覆盖现有记录。")}}</p><button class="primary" :disabled="busy" @click="loadDemo">{{t("加载演示数据")}}</button></section><form v-if="mode === 'clear'" @submit.prevent="clearAll" class="offline-import-preview clear-data-form"><p>{{t("将删除本机全部业务数据、挂单和购物车，保留语言及币种。此操作不能撤销。")}}</p><button type="button" :disabled="busy" @click="download">{{t("先导出备份")}}</button><label>{{t("请输入“{0}”以继续", [t("确认清理")])}}<ElInput v-model="confirmation" autocomplete="off" :disabled="busy" /></label><button class="primary danger" :disabled="busy || confirmation !== t('确认清理')">{{t("确认清理")}}</button></form><div class="offline-data-tools"><button v-if="mode === 'export'" class="action-with-icon primary" :disabled="busy || !counts" @click="download"><PosIcon name="download" />{{ t("导出数据") }}</button><button v-if="mode === 'import'" :disabled="busy" @click="fileInput?.click()" class="action-with-icon"><PosIcon name="upload" />{{ t("选择备份文件") }}</button><input ref="fileInput" hidden type="file" accept=".json,application/json" :disabled="busy" @change="choose" /></div>
      <p v-if="error" class="error" role="alert">{{ t(error) }}</p>
      <section v-if="mode === 'import' && preview" class="offline-import-preview"><h3>{{ t("导入预览") }}</h3><p>{{ filename }}</p><p>{{ t("新增分类") }} {{ preview.categories }} {{ t("个 · 商品") }} {{ preview.products }} {{ t("件") }} · {{ t("现金订单") }} {{ preview.orders }} {{ t("笔") }}</p><p>{{ t("跳过相同记录") }} {{ preview.skipped }} {{ t("条。确认后只写入本机，不会再次收款。") }}</p><button class="action-with-icon primary" :disabled="busy" @click="confirmImport"><PosIcon name="upload" />{{ busy ? t("正在保存…") : t("确认合并导入") }}</button></section>
      <p v-if="standalone" class="hint">{{t("含会员资产或非现金交易的备份不支持导入；恢复不会再次收款。")}}</p><p class="hint">{{ t("数据保存在当前浏览器，请定期导出，清理浏览器数据会删除本机账本。") }}</p>
      <p v-if="mode==='import'||mode==='export'" class="hint">{{ t("升级在线版时，请保留此备份用于迁移。备份包含原始唯一标识、商品关联、交易时间、实收与找零，便于核对，避免重复入账。") }}</p>
    </div>
  </component>
</template>
<style scoped>
.offline-data-dialog{width:min(720px,calc(100vw - 32px));max-height:90dvh;padding:0;border:1px solid var(--theme-line, #ccd9ed);border-radius:12px;color:var(--theme-ink, #253858);background:var(--theme-surface, #fff);overflow:auto}
header{display:flex;align-items:center;justify-content:space-between;padding:18px 24px;border-bottom:1px solid var(--theme-line, #dce5f2)}h2{margin:0;font-size:18px}.offline-data-body{padding:24px}.offline-data-counts{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin:24px 0}.offline-data-counts>div{padding:16px;border:1px solid var(--theme-line, #dce5f2);border-radius:6px;background:var(--theme-surface, #f8faff)}dt{font-size:13px;color:var(--theme-muted, #526586)}dd{font-size:28px;font-weight:600;margin:8px 0}.offline-data-tools{display:flex;align-items:center;flex-wrap:wrap;gap:12px}.offline-file-button{display:flex;align-items:center;gap:8px}.offline-file-button input{max-width:240px}.offline-import-preview{margin:24px 0;padding:18px;background:var(--theme-surface, #eef4ff);border-radius:8px}.hint{line-height:1.8}dialog::backdrop{background:rgb(20 39 66 / .45)}
.clear-data-form{display:flex;flex-direction:column;align-items:stretch;gap:18px;background:var(--theme-surface, #fff8f7);border:1px solid #efd9d6}.clear-data-form p{margin:0;line-height:1.8}.clear-data-form label{display:flex;flex-direction:column;gap:10px;margin:0}.clear-data-form input{width:100%;margin:0}.clear-data-form>button{align-self:flex-start}#app .clear-data-form button.danger{background:#c33439;color:var(--theme-on-color, #fff);border-color:#c33439}#app .clear-data-form button.danger:disabled{background:var(--theme-subtle, #f6e3e3);color:#8d4e52;border-color:#e7c5c5;opacity:1;cursor:not-allowed}@media(max-width:600px){.offline-data-counts{grid-template-columns:repeat(2,minmax(0,1fr))}}
</style>
