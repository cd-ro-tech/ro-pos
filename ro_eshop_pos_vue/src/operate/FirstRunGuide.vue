<script setup lang="ts">
import DemoDataProgress from "../components/DemoDataProgress.vue";
import CurrencyPicker from "../components/CurrencyPicker.vue";
import PosIcon from '../components/PosIcon.vue';
import { onMounted, ref, watch } from 'vue';
import { t, locale } from '../i18n';
import { errorText } from '../api';
import { standalone } from '../mode';
import { currencies } from '../currencies';
import { localCurrency } from '../currency';
import { exportLocalData, hasLocalProducts, setLocalCurrency, validateBackup, previewLocalImport, importLocalData, loadDemoData } from '../standalone';
import ProductCreate from '../backend/product/ProductCreate.vue';


const demoProgress=ref<InstanceType<typeof DemoDataProgress>|null>(null);
const linking=ref(false),demoCounts=ref<Record<string,number>|null>(null);
defineProps<{completionError?:string}>();
const emit=defineEmits<{complete:[];logout:[];connected:[data:any]}>();
const dialog=ref<HTMLDialogElement>(),step=ref(1),mode=ref(''),busy=ref(false),error=ref('');
const state=ref<any>(null),currency=ref(localCurrency.value),incoming=ref<any>(null),preview=ref<any>(null),filename=ref('');
let progressKey='';
function persist(){if(progressKey)localStorage.setItem(progressKey,JSON.stringify({version:2,step:step.value,mode:mode.value,currency:currency.value}));}
watch([step,mode,currency],persist);
function choose(value:string){if(busy.value)return;mode.value=value;error.value='';if(value==='excel')void next();}
async function chooseBackup(event:Event){
  const input=event.target as HTMLInputElement,file=input.files?.[0];if(!file)return;
  busy.value=true;error.value='';incoming.value=null;preview.value=null;
  try{if(file.size>100*1024*1024)throw new Error('备份文件不能超过 100MB');const data=validateBackup(JSON.parse(await file.text()));if(!hasLocalProducts(data))throw new Error('备份必须包含有效商品');preview.value=await previewLocalImport(data);incoming.value=data;filename.value=file.name;if(data.currency_code!==currency.value)throw new Error(t('备份币种为 {0}，请返回第一步确认币种后再导入', [data.currency_code]));}
  catch(e){error.value=errorText(e);}finally{busy.value=false;input.value='';}
}
async function refresh(){state.value=await exportLocalData();}
async function verified(){
  error.value='';try{await refresh();if(!hasLocalProducts(state.value))throw new Error('请先准备至少一件有效商品，再开始收银');currency.value=state.value.currency_code;step.value=4;}catch(e){error.value=errorText(e);}
}
async function next(){
  if(busy.value)return;busy.value=true;error.value='';
  try{
    if(step.value===1){await refresh();if((state.value.products.length||state.value.orders.length)&&currency.value!==state.value.currency_code)throw new Error('已有商品或订单，请保留原币种');await setLocalCurrency(currency.value);step.value=2;}
    else if(step.value===2){if(!mode.value)throw new Error('请选择数据来源');if(mode.value==='import'){if(!incoming.value)throw new Error('请选择备份文件');if(incoming.value.currency_code!==currency.value)throw new Error(t('备份币种为 {0}，请返回第一步确认币种后再导入', [incoming.value.currency_code]));}await refresh();if(mode.value==='existing')await verified();else step.value=3;}
    else if(step.value===3){if(mode.value==='demo'){if(!demoCounts.value){await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));const result=await loadDemoData();await refresh();await demoProgress.value?.animate(result);demoCounts.value=result;return;}await verified();return;}else if(mode.value==='import'){if(!incoming.value)throw new Error('请返回第二步重新选择备份文件');if(incoming.value.currency_code!==currency.value)throw new Error('备份币种与所选币种不一致，请返回确认');await importLocalData(incoming.value);}await verified();}
    else{await refresh();if(!hasLocalProducts(state.value))throw new Error('请先准备至少一件有效商品，再开始收银');emit('complete');}
  }catch(e){error.value=errorText(e);}finally{busy.value=false;}
}
function back(){if(busy.value)return;error.value='';step.value=Math.max(1,step.value-1);}
onMounted(async()=>{dialog.value?.showModal();if(!standalone.value)return;busy.value=true;try{await refresh();progressKey='ro-pos-setup-progress:'+state.value.installation;const saved=JSON.parse(localStorage.getItem(progressKey)||'null');if(saved?.version===2&&['','demo','excel','import','existing'].includes(saved.mode)){mode.value=saved.mode;currency.value=currencies.some(c=>c.code===saved.currency)?saved.currency:state.value.currency_code;step.value=Math.max(1,Math.min(4,Number(saved.step)||1));if(mode.value==='import'&&step.value>2)step.value=2;if(step.value===4&&!hasLocalProducts(state.value))step.value=3;}else currency.value=state.value.currency_code;}catch(e){error.value=errorText(e);}finally{busy.value=false;}});
</script>
<template>
<dialog ref="dialog" class="first-run-guide" :class="{'guide-wide':!standalone || (step===3 && mode==='excel')}" :aria-label="t('设置向导')" closedby="none" @keydown.esc.prevent.stop @cancel.prevent="() => {}">
<header class="guide-header"><h2>{{t('设置向导')}}</h2></header><p v-if="completionError" class="error" role="alert">{{t(completionError)}}</p>

<ol class="guide-steps" :aria-label="t('单机版设置步骤')"><li v-for="(label,index) in ['币种设置','选择数据','准备商品','完成设置']" :key="label" :class="{current:step===index+1,done:step>index+1}" :aria-current="step===index+1?'step':undefined"><b>{{step>index+1?'✓':index+1}}</b><span>{{t(label)}}</span></li></ol>
<div class="guide-content">
<section v-if="step===1"><h3>{{t('确认收银币种')}}</h3><p>{{t('先设置收银币种，再准备商品数据。')}}</p><label class="setup-field">{{t('币种')}}<CurrencyPicker v-model="currency" :disabled="busy||!!state?.products.length||!!state?.orders.length" /></label><p v-if="state?.products.length||state?.orders.length">{{t('已有商品或订单，保留原币种。')}}</p><button type="button" class="cloud-entry" :disabled="busy" @click="error='此功能需升级开通，请联系升级购买'">{{t('关联云端')}}</button></section>
<section v-else-if="step===2">
<h3>{{t('先确认你的数据来源')}}</h3><p>{{t('使用已有资料，或为这台设备准备商品数据。')}}</p>
<div class="guide-actions"><button v-if="state && hasLocalProducts(state)" :aria-pressed="mode==='existing'" @click="choose('existing')"><strong>{{t('使用本机数据')}}</strong><span>{{t('共 {0} 件商品',[state.products.length])}}</span></button><button :aria-pressed="mode==='demo'" @click="choose('demo')"><strong>{{t('加载演示数据')}}</strong><span>{{t('体验示例商品和现金订单')}}</span></button><button :aria-pressed="mode==='excel'" @click="choose('excel')"><strong>{{t('导入商品')}}</strong><span>{{t('Excel 导入、粘贴或手动录入')}}</span></button><button :aria-pressed="mode==='import'" @click="choose('import')"><strong>{{t('恢复 JSON 备份')}}</strong><span>{{t('读取备份资料和币种')}}</span></button></div>
<label v-if="mode==='import'" class="setup-field">{{t('选择备份文件')}}<input type="file" accept=".json,application/json" :disabled="busy" @change="chooseBackup" /><span v-if="incoming">{{filename}} · {{incoming.currency_code}} · {{t('共 {0} 件商品',[incoming.products.length])}}</span></label>
</section>

<section v-else-if="step===3"><h3>{{t('准备商品数据')}}</h3><ProductCreate v-if="mode==='excel'" embedded @busy="busy=$event" @created="verified" @close="verified" /><template v-else-if="mode==='demo'"><p>{{t('演示数据包含商品和示例订单，会计入本机看板。')}}</p><DemoDataProgress ref="demoProgress" :error="error" :loading="busy" :counts="demoCounts" /></template><p v-else-if="mode==='import'">{{filename}} · {{currency}} · {{t('新增商品')}} {{preview?.products||0}} · {{t('相同记录不会重复导入')}}</p><p v-else>{{t('已有数据不会重复创建。')}}</p></section>
<section v-else class="guide-ready"><PosIcon name="check" aria-hidden="true" /><h3>{{t('一切就绪')}}</h3></section>
<p v-if="busy" role="status">{{t('正在处理，请稍候…')}}</p><p v-if="error" class="error" role="alert">{{t(error)}}</p>
</div>
<footer class="guide-footer"><button v-if="step>1" :disabled="busy" @click="back">{{t('上一步')}}</button><button v-if="step!==3||mode!=='excel'" class="primary" :disabled="busy||!state" @click="next">{{step===4?t('开始使用'):step===3?(demoCounts&&mode==='demo'?t('下一步'):t('确认加载数据')):t('下一步')}}</button></footer>
</dialog>
</template>
<style scoped>
.first-run-guide{width:min(760px,calc(100vw - 32px));box-sizing:border-box;padding:0;max-height:90dvh;overflow:auto;color:var(--theme-ink, #253858);border:0;border-radius:8px;background:var(--theme-surface, #fff)}
.first-run-guide[open]{display:flex;flex-direction:column}
.first-run-guide.guide-wide{width:min(1040px,calc(100vw - 32px))}
.guide-header{padding:22px 28px;border-bottom:1px solid var(--theme-line, #e1e7ef);flex-shrink:0}
h2{font-size:20px;margin:0}
.guide-steps{display:flex;list-style:none;padding:22px 28px;margin:0;gap:0;background:var(--theme-surface, #f8fafc);flex-shrink:0;border-bottom:1px solid var(--theme-line, #e1e7ef)}
.guide-steps li{flex:1;position:relative;display:flex;flex-direction:column;align-items:center;gap:8px;color:var(--theme-muted, #526586);text-align:center;font-size:13px}
.guide-steps li:not(:last-child)::after{content:'';position:absolute;top:15px;left:calc(50% + 22px);width:calc(100% - 44px);height:1px;background:var(--theme-subtle, #dce5f1)}
.guide-steps li.done::after{background:var(--theme-accent-fill, #2458ce)}
.guide-steps b{display:grid;place-items:center;box-sizing:border-box;width:32px;height:32px;border:1px solid var(--theme-line, #c5d2e2);border-radius:50%;background:var(--theme-surface, #fff);z-index:1}
.guide-steps .current{color:var(--theme-text-accent, #2458ce);font-weight:600}
.guide-steps .current b,.guide-steps .done b{background:var(--theme-accent-fill, #2458ce);border-color:var(--theme-accent, #2458ce);color:var(--theme-on-color, white)}
.guide-content{padding:28px;overflow:auto;min-height:0;flex:1}
.guide-content h3{font-size:17px;line-height:1.5;margin:0 0 8px}
.guide-content p{line-height:1.7;color:var(--theme-muted, #526586);margin:0 0 20px}
.guide-content p:last-child{margin-bottom:0}
.guide-ready{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;min-height:180px;text-align:center}
.guide-ready :deep(.icon){width:88px;height:88px;color:#22a05a;stroke-width:2.5}
.guide-content .guide-ready h3{margin:0;font-size:24px}
.setup-field{display:grid;gap:10px;margin:24px 0;min-width:0;font-size:14px}
.setup-field :deep(.currency-picker-trigger){box-sizing:border-box;min-height:44px}
.guide-content .cloud-entry{padding:0;min-height:32px;border:0;background:transparent;color:var(--theme-text-accent, #2458ce);font-size:13px;box-shadow:none}
.cloud-entry:hover:not(:disabled){text-decoration:underline}
.guide-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.guide-actions button{min-width:0;padding:18px;text-align:left;white-space:normal}
.guide-actions strong{display:block;font-size:15px}
.guide-actions span{display:block;margin-top:6px;font-size:13px;line-height:1.6}
.guide-actions button[aria-pressed="true"]{border-color:var(--theme-accent, #2458ce);background:var(--theme-surface, #edf3ff);color:var(--theme-text-accent, #204fa5)}
.guide-footer{display:flex;gap:12px;margin:0;padding:18px 28px;border-top:1px solid var(--theme-line, #e1e7ef);background:var(--theme-surface, #f8fafc);flex-shrink:0}
.guide-footer button{min-width:96px;min-height:40px}
.guide-footer>.primary{margin-left:auto}
.guide-cloud{margin:24px 28px}
dialog::backdrop{background:rgb(20 39 66 / .45)}
@media(max-width:600px){.guide-header{padding:18px 20px}.guide-content{padding:24px 20px}.guide-steps{padding:18px 12px}.guide-steps li{gap:6px;font-size:12px}.guide-actions{grid-template-columns:1fr}.guide-footer{padding:16px 20px}.guide-cloud{margin:20px}}
</style>
