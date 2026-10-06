<script setup lang="ts">
import { exportLocalData } from '../standalone';
import { businessText } from '../businessTranslations';
import OrderBarcode from '../components/OrderBarcode.vue';
import { receiptSettings } from '../receiptSettings';
import { standalone } from '../mode';
import PosSelect from "../components/PosSelect.vue";
import { t } from "../i18n";
import PosIcon from "../components/PosIcon.vue";
import { useShortcuts } from "../shortcuts";
import ShortcutHint from "../components/ShortcutHint.vue";
import { computed, nextTick, ref, watch } from "vue";
import { money as formatMoney, notice } from "../api";
const props = defineProps<{ order: any; compact?: boolean; preview?: boolean; draftText?: { header: string; footer: string } }>(),
  width = ref("80"),
  printing = ref(false);
const customText = computed(() => props.draftText ?? (standalone.value ? receiptSettings.value : null));
const products=ref<any[]>([]);
watch(()=>props.order, async order=>{products.value=[];if(standalone.value&&order.is_offline){try{const data=await exportLocalData();if(props.order===order)products.value=data.products;}catch{ /* Keep historical receipt text if local catalog cannot be read. */ }}},{immediate:true});
function lineText(line:any,field:'name'|'spec'){
 const product=products.value.find(p=>p.uid===line.product_uid),source=field==='spec'?'product_attrs':'name';
 return product && product[source]===line[field] ? businessText(product,source) : line[field];
}
const emit = defineEmits(["done"]);
const money = (value: any) => formatMoney(value, props.order.currency_code);
const paymentNames: Record<string, string> = {
  cash: "现金净收",
  alipay: "支付宝",
  wallet: "会员钱包",
  online: "微信支付",
};
const paid = computed(
  () =>
    !["draft", "closed"].includes(props.order.state) &&
    props.order.paid + 0.005 >= props.order.total,
);
async function print() {
  printing.value = true;
  await nextTick();
  try {
    await Promise.all(
      Array.from(
        document.querySelectorAll<HTMLImageElement>(".receipt-paper img"),
      ).map((img) => img.decode().catch(() => {})),
    );
    window.print();
    notice.value = "已打开浏览器打印窗口，请在窗口中确认打印结果";
  } finally {
    printing.value = false;
  }
}
useShortcuts({ print }, () => !props.preview && !printing.value, true);
</script>
<template>
  <div class="receipt-paper" :style="{ '--receipt-width': width + 'mm' }">
    <div v-if="customText" class="receipt-custom-text receipt-custom-header">{{ customText.header }}</div>
    <div v-else class="receipt-store"><b v-if="order.store?.name">{{ standalone ? t(order.store.name) : order.store.name }}</b><span v-if="order.store?.address">{{ order.store.address }}</span><span v-if="order.store?.phone">{{ order.store.phone }}</span></div>
    <p v-if="order.state === 'closed'">{{ t("已取消 · 非收款凭证") }}</p>
    <p v-else-if="!paid">{{ t("待付款订单 · 非收款凭证") }}</p>
    <p v-else-if="order.is_recharge">{{ t("会员充值") }}</p>
    <hr />
    <div class="receipt-order-code">
      <p>{{ t("订单号") }} {{ order.number }}</p>
      <OrderBarcode v-if="order.number" :value="String(order.number)" />
    </div>
    <dl class="receipt-info">
      <div><dt>{{ t("时间") }}</dt><dd>{{ order.created_at }}</dd></div>
      <div><dt>{{ t("收银") }}</dt><dd>{{ standalone ? t(order.cashier) : (order.cashier || '—') }}</dd></div>
      <div v-if="order.member_number"><dt>{{ t("会员") }}</dt><dd>{{ order.member_number }}</dd></div>
      <div v-if="order.fulfillment_type !== 'pos'"><dt>{{ t("方式") }}</dt><dd>{{ order.fulfillment_type === 'pickup' ? t("到店自提") : t("送货上门") }}</dd></div>
    </dl>
    <hr />
    <div v-for="line in order.lines" :key="line.id" class="receipt-line">
      <b>{{ lineText(line,'name') }}</b
      ><span>{{ lineText(line,'spec') }}</span>
      <div>
        <span>{{ line.qty }} × {{ money(line.price) }}</span
        ><span>{{ money(line.total) }}</span>
      </div>
    </div>
    <hr />
    <div class="receipt-total">
      <span>{{ t("商品小计") }}</span><span>{{ money(order.subtotal) }}</span>
    </div>
    <div v-if="order.discount" class="receipt-total"><span>{{t("优惠合计")}}</span><span>{{money(order.discount)}}</span></div><div v-if="order.points_used" class="receipt-total"><span>{{t("抵扣积分")}}</span><span>{{order.points_used}}</span></div><div v-if="order.points_earned" class="receipt-total"><span>{{t("获得积分")}}</span><span>{{order.points_earned}}</span></div><div v-if="order.is_offline" v-for="payment in order.payments" :key="payment.type" class="receipt-total"><span>{{t(paymentNames[payment.type] || payment.type)}}</span><span>{{money(payment.amount)}}</span></div><div class="receipt-total"><b>{{ t("实付") }}</b><b>{{ money(order.paid) }}</b></div>
    <div class="receipt-total"><span>{{ t("找零") }}</span><span>{{ money(order.cash_change) }}</span></div>
    <template v-if="order.is_recharge">
      <div class="receipt-total"><span>{{ t("充值金额") }}</span><span>{{ money(order.total) }}</span></div>
      <div class="receipt-total"><span>{{ t("赠送金额") }}</span><span>{{ money(order.ro_pos_recharge_gift) }}</span></div>
      <div class="receipt-total"><span>{{ order.wallet_credited ? t("钱包到账") : t("待入账") }}</span><span>{{ money(order.wallet_credit) }}</span></div>
      <div v-if="order.wallet_credited" class="receipt-total"><span>{{ t("钱包余额") }}</span><span>{{ money(order.wallet_balance) }}</span></div>
    </template>
    <template v-if="paid && order.fulfillment_type === 'pickup'"
      ><hr />
      <img v-if="order.qrcode" :src="order.qrcode" :alt="t('提货二维码')" />
      <p>
        {{ order.pickup_code }}<br />{{
          order.pickup_state === "verified" ? t("已核销提货") : t("请凭此码提货")
        }}
      </p></template
    >
    <hr />
    <p v-if="order.refund_total">{{t("已退款")}} {{money(order.refund_total)}}</p>
    <p class="receipt-custom-text">{{ customText ? customText.footer : t("请妥善保管小票 · 感谢惠顾") }}</p>
  </div>
  <div class="print-actions">
    <label
      >{{ t("小票宽度") }}<PosSelect v-model="width" :options="[{value:'80',label:'80mm'},{value:'58',label:'58mm'}]" /></label
    ><button v-if="!preview" @click="print" :disabled="printing" class="action-with-icon"><PosIcon name="print" />{{ t("打印小票") }}<ShortcutHint action="print" /></button
    ><button v-if="compact" class="primary action-with-icon" @click="emit('done')"><PosIcon name="check" />{{ t("完成，下一单") }}</button><small v-else-if="!preview">{{ t("浏览器打印时选择同宽纸张，关闭页眉页脚。") }}</small>
  </div>
</template>

<style scoped>
.receipt-order-code{margin:2mm 0 3mm;break-inside:avoid;page-break-inside:avoid;text-align:center}
.receipt-order-code p{margin:0 0 2mm;font-size:10pt;font-weight:700;overflow-wrap:anywhere}
.receipt-custom-text{white-space:pre-wrap;overflow-wrap:anywhere;text-align:center}.receipt-custom-header{font-weight:700}.receipt-custom-text:empty{display:none}
</style>
