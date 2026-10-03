<script setup lang="ts">
import '../../pure-admin.css';
import { useId } from "vue";
const settingsFormId=useId();
import PosIcon from "../../components/PosIcon.vue";
import CurrencyPicker from "../../components/CurrencyPicker.vue";
import { onMounted, ref } from 'vue';
import { t } from '../../i18n';
import { currencies } from '../../currencies';
import { activeCurrency } from '../../currency';
import { standalone } from '../../mode';
import { api, session, notice, errorText } from '../../api';
import { setLocalCurrency } from '../../standalone';
const emit=defineEmits(['close','saved']);
const dialog=ref<HTMLDialogElement>(),selected=ref(activeCurrency.value),previous=ref(activeCurrency.value),busy=ref(false),error=ref(''),company=ref('');
const canEdit=ref(standalone.value),options=ref(currencies.map(c=>({currency_code:c.code,currency_name:c.name,symbol:c.symbol})));
async function save(){if(busy.value||!canEdit.value)return;busy.value=true;error.value='';try{if(standalone.value)await setLocalCurrency(selected.value);else{const data=await api('currency_save',{currency_code:selected.value,previous_currency_code:previous.value});for(const store of session.value.stores)if(store.company_id===data.company_id)store.currency_code=data.currency_code;}notice.value='币种设置已保存';emit('saved');emit('close');}catch(e){error.value=errorText(e);}finally{busy.value=false;}}
function close(){if(!busy.value)emit('close');}
onMounted(async()=>{dialog.value?.showModal();if(standalone.value)return;busy.value=true;try{const data=await api('currency_options');options.value=data.currency_data;company.value=data.company_name;canEdit.value=data.can_edit;selected.value=previous.value=data.currency_code;}catch(e){error.value=errorText(e);}finally{busy.value=false;}});
</script>
<template>
<dialog ref="dialog" class="pure-admin-page currency-dialog" :aria-label="t('币种设置')" @cancel.prevent="close">
<header><h2>{{t('币种设置')}}</h2><button type="button" class="currency-close" :aria-label="t('关闭')" :title="t('关闭')" :disabled="busy" @click="close"><PosIcon name="close" /></button></header>
<form :id="settingsFormId" @submit.prevent="save">
<div class="currency-content">
<div class="currency-description">
<p>{{standalone?t('设置本机收银币种。'):t('当前公司下所有门店统一使用此币种。')}} <strong>{{company}}</strong></p>
<p class="hint">{{t('修改币种不会自动换算商品价格；历史订单保留原币种。')}}</p>

</div>
<div class="currency-field">
<span class="currency-label">{{t("币种")}}</span>
<CurrencyPicker v-model="selected" :disabled="busy||!canEdit" :options="options" />
</div><p v-if="!canEdit&&!busy" class="hint">{{t('仅管理员可以修改公司币种')}}</p>
<p v-if="error" role="alert" class="error">{{t(error)}}</p>
</div>
<footer><button type="button" :disabled="busy" @click="close">{{t('取消')}}</button><button type="submit" :form="settingsFormId" class="primary" :disabled="busy||!canEdit||!selected||selected===previous">{{busy?t('正在保存…'):t('保存')}}</button></footer>
</form>
</dialog>
</template>
<style scoped>
.currency-dialog{box-sizing:border-box;width:min(580px,calc(100vw - 32px));max-height:90dvh;padding:0;overflow:auto;color:var(--theme-ink, #253858)}
.currency-dialog header,.currency-dialog footer{display:flex;align-items:center;gap:12px;margin:0;padding:12px 16px}
#app dialog.currency-dialog.pure-admin-page>header{justify-content:space-between;margin:0;padding:12px 16px;border-bottom:1px solid var(--theme-line, #dce5f2)}
.currency-dialog .currency-close{display:flex;align-items:center;justify-content:center;width:32px;height:32px;min-height:32px;padding:6px;border:0;border-radius:4px;background:transparent;box-shadow:none;color:var(--theme-muted, #526586)}
.currency-dialog .currency-close:hover:not(:disabled){background:var(--theme-surface, #edf3ff);color:var(--theme-text-accent, #245bd0)}
.currency-dialog .currency-close:focus-visible{outline:2px solid var(--theme-accent, #245bd0);outline-offset:2px}
.currency-close :deep(.icon){width:20px;height:20px}
.currency-dialog h2{font-size:18px;margin:0}
.currency-dialog form{display:block;margin:0;padding:0;max-width:none}
.currency-content{display:grid;gap:16px;padding:16px}
.currency-description{display:grid;gap:8px}
.currency-dialog p{margin:0;line-height:1.7}
.currency-dialog .hint{font-size:13px;color:var(--theme-muted, #526586)}
.currency-field{display:grid;gap:10px;min-width:0}
.currency-label{font-size:14px;font-weight:600}
.currency-field :deep(.currency-picker-trigger){box-sizing:border-box;min-height:46px}
.currency-field :deep(.currency-picker-trigger>span){flex-wrap:wrap;min-width:0}
.currency-dialog footer{justify-content:flex-end;border-top:1px solid var(--theme-line, #e1e7ef);background:var(--theme-surface, #f8fafc)}
.currency-dialog footer button{min-width:88px;min-height:40px}
dialog::backdrop{background:rgb(20 39 66 / .45)}
@media(max-width:480px){.currency-dialog header,.currency-dialog footer{padding:12px 16px}.currency-content{padding:16px;gap:16px}}
</style>
