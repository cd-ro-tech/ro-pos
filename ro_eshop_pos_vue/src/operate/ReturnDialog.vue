<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { api, money, errorText, storeId } from '../api';
import { standalone } from '../mode';

import { t } from '../i18n';
import { refundAmount } from '../localReturns';
import ManagementDialog from '../components/ManagementDialog.vue';
import OrderBarcode from '../components/OrderBarcode.vue';
import PosIcon from '../components/PosIcon.vue';
const props=defineProps<{open:boolean}>();
const emit=defineEmits(['close']);
const verifiedCode=ref('');
const doneButton=ref<HTMLButtonElement|null>(null);
const receiptInput=ref<HTMLInputElement|null>(null), productInput=ref<HTMLInputElement|null>(null);
async function focusScan(){await nextTick();if(props.open&&!busy.value&&!pending.value&&!result.value)(order.value?productInput:receiptInput).value?.focus();}
watch(()=>props.open, value=>{if(value){if(result.value){result.value=null;code.value='';barcode.value='';quantities.value={};error.value='';}void focusScan();}},{flush:'post'});
const code=ref(''), order=ref<any>(null), reason=ref(''), barcode=ref(''), busy=ref(false), error=ref(''), result=ref<any>(null), quantities=ref<Record<number,number>>({});
const key=()=>`ro-pos-pending-return:local:${storeId.value}`;
const pending=ref<any>(null);
try{pending.value=JSON.parse(localStorage.getItem(key())||'null');}catch{}
const lines=computed(()=>order.value?.return_lines||[]);
const total=computed(()=>lines.value.reduce((n:number,l:any)=>n+refundAmount(l,Number(quantities.value[l.id]||0)),0));
async function lookup(){busy.value=true;error.value='';order.value=null;result.value=null;quantities.value={};try{order.value=await api('return_lookup',{receipt_code:code.value.trim()});verifiedCode.value=code.value.trim();}catch(e){error.value=errorText(e);}finally{busy.value=false;void focusScan();}}
function scanProduct(){if(busy.value)return;const scanned=barcode.value.trim();if(!scanned){void focusScan();return;}const candidates=lines.value.filter((l:any)=>l.barcode===scanned&&l.remaining_qty>Number(quantities.value[l.id]||0));if(candidates.length===1){const l=candidates[0];quantities.value[l.id]=Math.min(l.remaining_qty,Number(quantities.value[l.id]||0)+1);error.value='';}else error.value='未找到唯一可退商品，请在列表选择';barcode.value='';void focusScan();}
async function submit(){
 busy.value=true;error.value='';try{
 if(!pending.value){
 const selected=lines.value.filter((l:any)=>Number(quantities.value[l.id])>0).map((l:any)=>({line_id:l.id,qty:Number(quantities.value[l.id])}));
 if(!selected.length||!reason.value.trim())throw new Error('请选择退货商品并填写原因');
 pending.value={order_id:order.value.id,receipt_code:verifiedCode.value,reason:reason.value.trim(),lines:selected,request_key:crypto.randomUUID()};

 }
 localStorage.setItem(key(),JSON.stringify(pending.value));
 result.value=await api('return_create',pending.value);localStorage.removeItem(key());pending.value=null;order.value=null;reason.value='';
 }catch(e:any){error.value=errorText(e);if(e.code===400){localStorage.removeItem(key());pending.value=null;}}finally{busy.value=false;if(result.value){await nextTick();doneButton.value?.focus();}}
}
</script>
<template>
<ManagementDialog class="return-dialog" :class="{'return-completed-dialog':result}" :open="props.open" :title="result ? '退货已完成' : '退货'" :busy="busy" @close="emit('close')">
<section v-if="result" class="return-completed" role="status" aria-live="polite">
  <span class="return-success-icon"><PosIcon name="check" /></span>
  <h3>{{t('退货已完成')}}</h3>
  <p class="return-refund-label">{{t('现金退款')}}</p>
  <strong class="return-refund-amount">{{money(result.amount,result.currency_code)}}</strong>
  <p class="return-result-number">{{t('退货单号')}} <span>{{result.number}}</span></p>
  <button ref="doneButton" type="button" class="primary" @click="emit('close')">{{t('完成')}}</button>
</section>
<div v-else class="return-body">
<p class="muted">{{t('扫描原小票，选择商品并填写原因。退款以现金退还。')}}</p>
<form v-if="!pending&&!order" class="return-scan" @submit.prevent="lookup"><input ref="receiptInput" v-model="code" autofocus :disabled="busy" :placeholder="t('扫描原小票条码 / 输入订单号')" required/><button class="primary" :disabled="busy">{{t('查询')}}</button></form>
<p v-if="error" role="alert" class="return-error">{{t(error)}}</p>
<div v-if="pending" class="return-error">{{t('上次退货结果待确认，请重试原请求，勿重复退现金。')}}<button :disabled="busy" @click="submit">{{t('核实原退货')}}</button></div>
<template v-if="order&&!pending">
<form class="return-scan" @submit.prevent="scanProduct"><input ref="productInput" v-model="barcode" :disabled="busy" :placeholder="t('扫描退货商品条码')"/></form>
<div class="return-table"><table><thead><tr><th>{{t('商品')}}</th><th class="return-barcode-column">{{t('商品条码')}}</th><th>{{t('单价')}}</th><th>{{t('购买数量')}}</th><th>{{t('退货数量')}}</th><th>{{t('退款金额')}}</th></tr></thead><tbody><tr v-for="line in lines" :key="line.id"><td>{{line.name}}<small>{{line.spec}}</small></td><td class="return-barcode-column"><div v-if="line.barcode" class="return-product-barcode"><OrderBarcode :value="String(line.barcode)" :label="t('商品条码')+': '+line.barcode" invalid-text="此条码无法生成一维码" /><span>{{line.barcode}}</span></div><span v-else class="muted">{{t('暂无条码')}}</span></td><td>{{money(line.price,order.currency_code)}}</td><td>{{line.qty}}</td><td><input v-model.number="quantities[line.id]" type="number" min="0" :max="line.remaining_qty" step="0.001" :disabled="!line.remaining_qty||busy" /></td><td>{{money(refundAmount(line,Number(quantities[line.id]||0)),order.currency_code)}}</td></tr></tbody></table></div>
<label>{{t('退货原因')}}<textarea v-model="reason" maxlength="500" :disabled="busy" /></label>
<div class="return-actions"><strong>{{t('现金退款')}} {{money(total,order.currency_code)}}</strong><button class="primary" :disabled="busy||!reason.trim()||!Object.values(quantities).some(q=>q>0)" @click="submit">{{t('确认退款')}} {{money(total,order.currency_code)}}</button></div>
</template>

</div>
</ManagementDialog>
</template>
<style scoped>
#app dialog.return-dialog{width:min(1120px,calc(100vw - 40px));max-height:calc(100dvh - 48px);padding:0;overflow:hidden}
#app dialog.return-dialog> :deep(header){padding:18px 24px;margin:0}
#app dialog.return-dialog .return-body{max-height:calc(100dvh - 130px);box-sizing:border-box;gap:16px}
#app dialog.return-dialog form{max-width:none;margin:0}
.return-barcode-column{width:220px;min-width:180px}.return-product-barcode{width:220px;max-width:100%;text-align:center;background:var(--theme-surface, #fff);color:var(--theme-ink, #263750)}.return-product-barcode :deep(.order-barcode){height:48px}.return-product-barcode>span{display:block;margin-top:5px;font:12px ui-monospace,monospace;overflow-wrap:anywhere}.return-table table{min-width:760px}
.return-scan button{flex-shrink:0;white-space:nowrap}
@media(max-width:600px){.return-scan{flex-wrap:wrap}.return-scan input{flex-basis:100%}.return-actions{flex-wrap:wrap}}

.return-body{padding:24px;display:grid;gap:18px;max-height:75vh;overflow:auto}.return-body p{margin:0}.return-scan,.return-actions{display:flex;align-items:center;gap:12px}.return-scan{width:100%;box-sizing:border-box}.return-scan input{flex:1;min-width:0}.return-actions{justify-content:space-between}.return-table{overflow:auto;max-height:320px}table{width:100%;border-collapse:collapse}td,th{padding:12px;text-align:left;border:1px solid var(--theme-line, #dce3ed)}td input{width:90px}small{display:block;color:var(--theme-muted, #718096)}.return-body label{display:grid;gap:8px}.return-body textarea{min-height:76px}.return-error{padding:12px;background:var(--theme-surface, #fff1f0);color:#b42318}.muted{color:var(--theme-muted, #64748b)}
#app dialog.return-dialog.return-completed-dialog{width:min(440px,calc(100vw - 32px))}
#app .return-completed{display:flex;flex-direction:column;align-items:center;gap:12px;padding:24px 32px 28px;text-align:center;max-height:calc(100dvh - 150px);overflow:auto}
.return-success-icon{display:flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:50%;background:var(--theme-subtle, #e9f6ef);color:#24824c}
.return-success-icon :deep(.icon){width:30px;height:30px}
#app .return-completed h3{margin:0;font-size:20px;color:var(--theme-ink, #263d5e)}
#app .return-completed p{margin:0;line-height:1.6}
.return-refund-label{color:var(--theme-muted, #64748b);font-size:13px;padding-top:8px}
.return-refund-amount{font-size:30px;font-variant-numeric:tabular-nums;color:var(--theme-ink, #263d5e)}
.return-result-number{font-size:12px;color:var(--theme-muted, #718096);overflow-wrap:anywhere}
.return-result-number span{display:block;color:var(--theme-ink, #425672)}
#app .return-completed>button{width:100%;margin-top:12px;min-height:40px;flex-shrink:0}
</style>
