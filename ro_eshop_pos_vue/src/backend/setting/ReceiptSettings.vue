<script setup lang="ts">
import '../../pure-admin.css';
import { ElInput } from 'element-plus';
import 'element-plus/es/components/input/style/css';
import { useId } from "vue";
const settingsFormId=useId();
import { computed, ref } from 'vue';
import { receiptSettings, saveReceiptSettings } from '../../receiptSettings';
import { t } from '../../i18n';
import { notice, errorText } from '../../api';
import Receipt from '../../operate/Receipt.vue';
import { activeCurrency } from '../../currency';
import { formatDateTime } from '../../i18n';
import PosIcon from '../../components/PosIcon.vue';
const header = ref(receiptSettings.value?.header ?? t('本机门店'));
const footer = ref(receiptSettings.value?.footer ?? t('请妥善保管小票 · 感谢惠顾'));
const error = ref('');
const now = new Date();
const previewOrder = computed(() => ({
  number: `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}000001`,
  currency_code: activeCurrency.value, created_at: formatDateTime(now.toISOString()),
  state: 'done', fulfillment_type: 'pos', cashier: t('单机收银员'),
  lines: [{ id: 1, name: t('示例商品'), spec: '', qty: 2, price: 12, total: 24 }],
  subtotal: 24, total: 24, paid: 24, cash_change: 6,
}));
function save(reset = false) {
  try {
    saveReceiptSettings(reset ? null : { header: header.value, footer: footer.value });
    if (reset) {
      header.value = t('本机门店');
      footer.value = t('请妥善保管小票 · 感谢惠顾');
    }
    error.value = '';
    notice.value = '小票设置已保存';
  } catch (e) { error.value = errorText(e); }
}
</script>
<template>
  <section class="pure-admin-page management-page receipt-settings" :aria-label="t('小票设置')">
    <header class="settings-action-bar"><span class="settings-header-actions"><button type="submit" :form="settingsFormId" class="primary">{{ t('保存设置') }}</button></span></header>
    <div class="receipt-settings-layout">
    <form :id="settingsFormId" @submit.prevent="save()">
      <p class="hint">{{ t('支持多行文字，留空则不显示。保存后应用于本机小票预览和打印。') }}</p>
      <label>{{ t('顶部字样') }}<ElInput type="textarea" v-model="header" :rows="4" maxlength="500" /></label>
      <label>{{ t('底部字样') }}<ElInput type="textarea" v-model="footer" :rows="4" maxlength="500" /></label>
      <p v-if="error" class="error" role="alert">{{ t(error) }}</p>
      <footer><button type="button" @click="save(true)">{{ t('恢复默认') }}</button></footer>
    </form>
    <aside class="receipt-preview" :aria-label="t('预览示例')">
      <h3>{{ t('预览示例') }}</h3>
      <p class="hint">{{ t('修改即时预览，保存后生效。示例不生成订单。') }}</p>
      <Receipt :order="previewOrder" preview :draft-text="{ header, footer }" />
    </aside>
    </div>
  </section>
</template>
<style scoped>
.receipt-settings{padding:0 12px 12px}.receipt-settings h2{display:flex;align-items:center;gap:8px}.receipt-settings form{min-width:0;margin:0;padding:16px;background:var(--theme-surface, #fff);border:1px solid var(--theme-line, #dce5f2);border-radius:4px}.receipt-settings label{display:flex;flex-direction:column;gap:10px;margin:12px 0}.receipt-settings textarea{width:100%;box-sizing:border-box;resize:vertical;min-height:110px;line-height:1.6}.receipt-settings .hint{line-height:1.8;color:var(--theme-muted, #687a94)}.receipt-settings footer{display:flex;justify-content:flex-end;gap:12px}
.receipt-settings-layout{display:grid;grid-template-columns:minmax(320px,760px) minmax(340px,1fr);gap:12px;align-items:start;margin-top:12px}.receipt-preview{min-width:0;padding:16px;background:var(--theme-subtle, #edf1f7);border:1px solid var(--theme-line, #dce5f2);border-radius:4px}.receipt-preview h3{font-size:16px;margin:0 0 8px}.receipt-preview :deep(.print-actions){justify-content:center;flex-wrap:wrap;margin:16px 0}.receipt-preview :deep(.print-actions label){margin:0;flex-direction:row;align-items:center;white-space:nowrap}.receipt-preview :deep(.pos-select){width:120px;flex:none}.receipt-preview :deep(.pos-select-option){white-space:nowrap}.receipt-preview :deep(.receipt-paper){margin:0 auto;box-sizing:border-box;max-width:100%}@media(max-width:1050px){.receipt-settings-layout{grid-template-columns:minmax(0,1fr)}}
</style>
