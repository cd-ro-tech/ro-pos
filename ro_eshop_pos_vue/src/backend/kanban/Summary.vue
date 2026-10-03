<script setup lang="ts">
import PosDateRange from '../../components/PosDateRange.vue';
import '../../pure-admin.css';
import CurrencyPicker from "../../components/CurrencyPicker.vue";
import { t, locale } from "../../i18n";
import PosIcon from "../../components/PosIcon.vue";
import { computed, onMounted, onBeforeUnmount, ref, watch } from "vue";
import { api, money as formatAmount, errorText, session, storeId } from "../../api";
import { afterInitialPaint } from "../../afterInitialPaint";

import { activeCurrency } from '../../currency';
import { standalone } from '../../mode';
const currencyCode=ref(activeCurrency.value);
const money=(value:any)=>formatAmount(value,data.value?.currency_code||currencyCode.value);
const data = ref<any>(null), busy = ref(false), error = ref('');
const progress = ref(1), animationRun = ref(0);
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let frame = 0, disposed = false;
function finishAnimation() { cancelAnimationFrame(frame); progress.value = 1; }
function animateDashboard() {
  cancelAnimationFrame(frame); animationRun.value++;
  if (reducedMotion.matches) { progress.value = 1; return; }
  progress.value = 0;
  let start: number | undefined;
  const tick = (now: number) => {
    start ??= now;
    const elapsed = Math.min(1, (now - start) / 2000);
    progress.value = 1 - (1 - elapsed) ** 3;
    if (elapsed < 1) frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);
}
function motionChanged() { if (reducedMotion.matches) finishAnimation(); }
reducedMotion.addEventListener('change', motionChanged);
onBeforeUnmount(() => { disposed = true; finishAnimation(); reducedMotion.removeEventListener('change', motionChanged); });
const animatedAmount = (value: number) => Number(value || 0) * progress.value;
const animatedCount = (value: number) => Math.round(animatedAmount(value));
const today = () => {
  const date = new Date(), offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10);
};
const dateFrom=ref(today()), dateTo=ref(today());
const storeOptions=computed(() => (session.value?.stores || []).filter((item:any) => session.value?.can_manage || item.can_manage_business));
const storeIds=ref<number[]>([storeId.value]);
const methods = computed(() => ([{id:'cash',name:'现金',color:'var(--brand)'}]).map(m => ({...m, amount: Number(data.value?.methods?.[m.id] || 0)})));
const trend = computed(() => data.value?.trend || []);
const peak = computed(() => Math.max(1, ...trend.value.map((item: any) => item.amount)));
const axisMax = computed(() => {
  const step = 10 ** Math.floor(Math.log10(peak.value));
  return Math.ceil(peak.value / step) * step;
});
const chartWidth = computed(() => Math.max(720, trend.value.length * 34 + 100));
const trendItems = computed(() => trend.value.map((item: any, index: number) => ({
  ...item, index, x: 84 + index * ((chartWidth.value - 116) / Math.max(1, trend.value.length - 1)),
  y: 202 - Number(item.amount) / axisMax.value * 174,
})));
const trendPoints = computed(() => trendItems.value.map((item: any) => `${item.x},${item.y}`).join(' '));
const labelStep = computed(() => Math.max(1, Math.ceil(trendItems.value.length / 10)));
const pieSlices = computed(() => {
  const positive = methods.value.filter(m => m.amount > 0);
  const total = positive.reduce((sum, m) => sum + m.amount, 0);
  let angle = -Math.PI / 2;
  return positive.map(m => {
    const start = angle;
    angle += m.amount / total * Math.PI * 2 * progress.value;
    const point = (a: number) => `${100 + 88 * Math.cos(a)},${100 + 88 * Math.sin(a)}`;
    return { ...m, full: positive.length === 1 && progress.value === 1,
      path: `M100,100 L${point(start)} A88,88 0 ${angle - start > Math.PI ? 1 : 0},1 ${point(angle)} Z` };
  });
});
async function load() {
  if (busy.value) return;
  if (!standalone.value && !storeIds.value.length) { error.value='请至少选择一家门店'; return; }
  if (dateFrom.value > dateTo.value) { error.value='结束日期不能早于开始日期'; return; }
  busy.value = true; error.value = '';
  finishAnimation();
  try {
    const [result] = await Promise.allSettled([
      api('summary', {date_from:dateFrom.value,date_to:dateTo.value,store_ids:storeIds.value,currency_code:currencyCode.value}),
      new Promise<void>(resolve => setTimeout(resolve, 1000)),
    ]);
    if (disposed) return;
    if (result.status === 'rejected') throw result.reason;
    data.value = result.value;
    animateDashboard();
  }
  catch (e) { if (!disposed) error.value = errorText(e); }
  finally { if (!disposed) busy.value = false; }
}
onMounted(() => {
  busy.value = true;
  afterInitialPaint(() => {
    if (disposed) return;
    busy.value = false;
    void load();
  });
});
watch(activeCurrency, value => { currencyCode.value=value; void load(); });
watch(storeId, value => { storeIds.value=[value]; });
function reset(){dateFrom.value=today();dateTo.value=today();storeIds.value=[storeId.value];void load();}
</script>
<template>
  <section class="pure-admin-page performance-dashboard" :aria-busy="busy">
    <form class="performance-filter dashboard-filter" :class="{'local-dashboard-filter':standalone}" @submit.prevent="load"><div class="date-range-field"><span>{{t("日期范围")}}</span><PosDateRange v-model:from="dateFrom" v-model:to="dateTo" :disabled="busy" /></div><div class="dashboard-filter-actions"><button class="primary action-with-icon" :disabled="busy"><PosIcon name="search" />{{ t("查询") }}</button><button type="button" :disabled="busy" @click="reset">{{ t("重置") }}</button><button type="button" :disabled="busy" @click="load" class="action-with-icon"><PosIcon name="refresh" />{{ busy ? t("更新中…") : t("刷新数据") }}</button></div></form>
    <section :aria-label="t('业绩看板')">
    <p v-if="error" class="error" role="alert">{{ t(error) }}</p>
    <div v-if="busy" class="dashboard-skeleton" role="status" :aria-label="t('正在加载业绩数据…')">
      <div class="performance-kpis" aria-hidden="true">
        <article v-for="n in 5" :key="n"><span class="skeleton-line skeleton-label" /><span class="skeleton-line skeleton-value" /><span class="skeleton-line skeleton-note" /></article>
      </div>
      <div class="performance-charts" aria-hidden="true">
        <section v-for="n in 2" :key="n" class="dashboard-section"><span class="skeleton-line skeleton-label" /><div class="skeleton-chart" /><span class="skeleton-line skeleton-note" /></section>
      </div>
    </div>
    <template v-else-if="data">
        <label v-if="data.currency_codes?.length>1" class="summary-currency">{{t("币种")}}<CurrencyPicker v-model="currencyCode" :disabled="busy" :options="data.currency_codes.map((code:string)=>({currency_code:code}))" @change="load" /></label>
      <div class="performance-kpis" :key="'kpis-'+animationRun">
<article class="primary-kpi"><span>{{ t("期间实收") }}</span><strong>{{ money(animatedAmount(data.total)) }}</strong><small>{{t("本机现金销售")}}</small></article>
        <article><span>{{ t("收款订单") }}</span><strong>{{ animatedCount(data.count) }}<em>{{ t("单") }}</em></strong></article>
        <article><span>{{ t("销售收款客单价") }}</span><strong>{{ money(animatedAmount(data.average)) }}</strong></article>
        <article><span>{{ t("退款金额") }}</span><strong>{{ data.refund_total == null ? '—' : money(animatedAmount(data.refund_total)) }}</strong><small>{{ data.refund_total == null ? t("暂不可统计") : t("已完成退款") }}</small></article>
        <article><span>{{ t("商品销售收款") }}</span><strong>{{ money(animatedAmount(data.sales_total)) }}</strong><small>{{ t("{0} 笔销售订单", [animatedCount(data.sales_count)]) }}</small></article>


      </div>
      <div class="performance-charts" :key="'charts-'+animationRun">
        <section class="dashboard-section trend-section"><header><h2>{{data.trend_granularity==='hour'?t("分时收款"):t("每日收款")}}</h2><span>{{ data.timezone }}</span></header>
          <div v-if="data.total > 0 && trendItems.length" class="hourly-combo">
            <div class="chart-legend"><span><i class="bar-key" />{{ t("收款金额") }}</span><span><i class="line-key" />{{ t("金额趋势") }}</span></div>
            <div class="combo-scroll">
              <svg class="combo-chart" :viewBox="`0 0 ${chartWidth} 240`" :style="{width:chartWidth+'px'}" role="img" :aria-label="data.trend_granularity==='hour'?t('所选日期每小时收款趋势'):t('所选期间每日收款趋势')">
                <text x="8" y="14" class="chart-label">{{ t("金额（{0}）", [activeCurrency]) }}</text>
                <g v-for="tick in [0, 1, 2, 3, 4]" :key="tick">
                  <line x1="70" :y1="202 - tick * 43.5" :x2="chartWidth-16" :y2="202 - tick * 43.5" stroke="var(--theme-line, #e3eaf2)" />
                  <text x="62" :y="206 - tick * 43.5" text-anchor="end" class="chart-label">{{ (axisMax * tick / 4).toLocaleString(locale, { maximumFractionDigits: 2 }) }}</text>
                </g>
                <rect v-for="item in trendItems" :key="'bar-' + item.index" :x="item.x - 8" :y="202 - (202 - item.y) * progress" width="16" :height="(202 - item.y) * progress" rx="3" fill="var(--theme-accent, #73a6e8)" />
                <polyline pathLength="1" stroke-dasharray="1" :stroke-dashoffset="1-progress" :points="trendPoints" fill="none" stroke="var(--theme-accent, #24549a)" stroke-width="2.5" stroke-linejoin="round" />
                <g v-for="item in trendItems" :key="item.index">
                  <circle :opacity="progress" :cx="item.x" :cy="item.y" r="3" fill="var(--theme-surface, white)" stroke="var(--theme-accent, #24549a)" stroke-width="2" />
                  <text v-if="item.index % labelStep === 0 || item.index === trendItems.length-1" :x="item.x" y="228" text-anchor="middle" class="chart-label">{{item.label}}</text>
                  <rect :x="item.x - 13" y="24" width="26" height="184" fill="transparent" tabindex="0" :aria-label="`${item.label} ${money(item.amount)}`"><title>{{item.label}} {{money(item.amount)}}</title></rect>
                </g>
              </svg>
            </div>
          </div>
          <div v-else class="chart-empty">{{ t("暂无收款") }}</div>
          <footer>{{data.trend_granularity==='hour'?t("时段"):t("单日")}} {{ t("峰值") }}<b>{{ money(Math.max(0, ...trend.map((item: any) => item.amount))) }}</b></footer>
        </section>
        <section class="dashboard-section method-section"><header><h2>{{ t("收款方式") }}</h2><span>{{ t("占期间实收") }}</span></header>
          <svg v-if="pieSlices.length" class="method-pie" viewBox="0 0 200 200" role="img" :aria-label="t('所选期间各收款方式金额占比饼图')">
            <g v-for="m in pieSlices" :key="m.id"><title>{{ t(m.name) }}：{{ money(m.amount) }}（{{ data.total ? (m.amount / data.total * 100).toFixed(1) : '0.0' }}%）</title>
              <circle v-if="m.full" cx="100" cy="100" r="88" :fill="m.color" />
              <path v-else :d="m.path" :fill="m.color" stroke="white" stroke-width="2" stroke-linejoin="round" />
            </g>
          </svg>
          <div v-else class="chart-empty">{{ t("暂无收款") }}</div>
          <div v-for="m in methods" :key="m.id" class="method-row"><span><i :style="{background:m.color}" />{{ t(m.name) }}</span><b>{{ money(animatedAmount(m.amount)) }}</b><small>{{ data.total ? (m.amount / data.total * 100).toFixed(1) : '0.0' }}%</small></div>
          <footer>{{ t("现金实收") }} {{ money(animatedAmount(data.cash_received)) }} <span>{{ t("／ 找零") }} {{ money(animatedAmount(data.cash_change)) }}</span></footer>
        </section>
      </div>

    </template>
    </section>
  </section>
</template>

<style scoped>
.performance-dashboard .performance-kpis {
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 180px), 1fr));
  gap: 8px;
  margin-bottom: 8px;
}
.performance-dashboard .performance-kpis article { min-width: 0; padding: 12px; }
.performance-dashboard .performance-kpis article,.performance-charts>.dashboard-section { animation:dashboard-arrive 350ms ease-out; }
@keyframes dashboard-arrive{from{opacity:.35}to{opacity:1}}
@media(prefers-reduced-motion:reduce){.performance-dashboard .performance-kpis article,.performance-charts>.dashboard-section{animation:none}}
.dashboard-skeleton .performance-kpis article,.dashboard-skeleton .dashboard-section{animation:none}
.skeleton-line{display:block;height:14px;border-radius:4px;background:var(--theme-subtle, #e9eef5)}
.skeleton-label{width:40%;max-width:110px}.skeleton-value{width:65%;height:30px;margin:12px 0 8px}.skeleton-note{width:55%;height:12px}
.skeleton-chart{height:190px;margin:24px 0;background:var(--theme-subtle, #edf1f7);border-radius:4px}
.dashboard-skeleton .skeleton-line,.dashboard-skeleton .skeleton-chart{animation:dashboard-loading-pulse 1s ease-in-out infinite alternate}
@keyframes dashboard-loading-pulse{from{opacity:.45}to{opacity:1}}
@media(prefers-reduced-motion:reduce){.dashboard-skeleton .skeleton-line,.dashboard-skeleton .skeleton-chart{animation:none}}
.performance-dashboard .performance-kpis strong {
  font-variant-numeric:tabular-nums;
  font-size: 24px;
  line-height: 1.25;
  margin: 8px 0 0;
  overflow-wrap: anywhere;
}
.performance-dashboard .performance-kpis small { margin-top: 4px; }

/* The range picker is one field; let whole groups wrap without overlapping. */
.dashboard-filter{display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:12px;margin:0 0 8px;border:1px solid var(--theme-line,#d8e1ed);background:var(--theme-surface,#fff)}
.dashboard-store-filter{display:flex;align-items:center;gap:12px;flex:1 1 260px;min-width:0;color:var(--theme-ink,#475b76);font-size:13px}
.dashboard-store-filter>span{white-space:nowrap}
.dashboard-store-filter :deep(.store-multi-select){width:100%;min-width:0}
.dashboard-filter-actions{display:flex;flex-wrap:wrap;align-items:center;gap:8px}
.dashboard-filter-actions button{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:38px;min-height:38px;padding:0 14px;white-space:nowrap}
.performance-dashboard .chart-empty{height:132px}
.performance-charts>.dashboard-section{min-height:250px}
@media(max-width:700px){.dashboard-store-filter{flex-basis:100%}.dashboard-filter-actions{width:100%}}

.hourly-combo { margin-bottom: 18px; }
.chart-legend { display: flex; justify-content: flex-end; gap: 18px; margin-bottom: 8px; color: var(--theme-muted, #526780); font-size: 12px; }
.chart-legend span { display: inline-flex; align-items: center; gap: 6px; }
.bar-key { width: 10px; height: 10px; background: var(--theme-selected, #73a6e8); border-radius: 2px; }
.line-key { width: 18px; height: 2px; background: var(--theme-accent-fill, #24549a); }
.combo-scroll { overflow-x: auto; }
.combo-chart { display: block; width: 100%; min-width: 560px; }
.chart-label { fill: var(--theme-muted, #526780); font-size: 11px; }
.combo-chart rect[tabindex]:hover { fill: rgb(36 84 154 / 7%); }
.combo-chart rect[tabindex]:focus-visible { outline: 2px solid var(--theme-accent, #24549a); outline-offset: -2px; }
.method-pie { display: block; width: 180px; height: 180px; flex-shrink: 0; margin: 0 auto 12px; }
</style>

<style scoped>
.summary-currency{display:flex;align-items:center;gap:12px;margin:0 0 16px}.summary-currency .currency-picker-trigger{width:240px}
</style>
