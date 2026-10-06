<script setup lang="ts">
import { useListState } from "../../listState";
import { standalone } from '../../mode';
import { t } from "../../i18n";
import { ElInput, ElButton, ElSelect, ElOption } from 'element-plus';
import 'element-plus/es/components/input/style/css';
import 'element-plus/es/components/button/style/css';
import PosDateRange from '../../components/PosDateRange.vue';
import 'element-plus/es/components/select/style/css';
import type { AmountTotal } from '../../amountTotals';
import OrderEntry from './OrderEntry.vue';
import PendingOrderDetail from './PendingOrderDetail.vue';
import ListExport from '../../components/ListExport.vue';
import ListTable from '../../components/ListTable.vue';
import ListPagination from '../../components/ListPagination.vue';
import type { OrderSummary } from "../../types";
import PosIcon from "../../components/PosIcon.vue";
import { nextTick, onMounted, ref, watch } from "vue";
import { computed } from "vue";
import { api, money, errorText, session, storeId } from "../../api";
import OrderDetail from "../../operate/OrderDetail.vue";
import { afterInitialPaint } from "../../afterInitialPaint";

const props = defineProps<{ todayOnly?: boolean }>();
// Split only known payment labels; preserve server-provided status names otherwise.
function paymentLabel(row:any) {
 const methods:Record<string,string>={cash:'现金',wallet:'余额',online:'微信',alipay:'支付宝'};
 const types=row.payment_methods||row.payments?.map((p:any)=>p.type)||(row.payment_method?[row.payment_method]:[]);
 const labels=[...new Set<string>(types)];
 return labels.length?labels.map(type=>t(methods[type]||type)).join(' / '):row.state_name==='现金已收'?t('现金'):row.state_name==='余额已支付'?t('余额'):'—';
}
const entry=ref<'manual'|'import'|null>(null);
const exportRows=computed(()=>rows.value.map(row=>({...row,state_name:t(['现金已收','余额已支付'].includes(row.state_name)?'已完成':row.state_name),payment_label:paymentLabel(row)})));
function statusTone(state: string) {
  return ['done', 'verified'].includes(state) ? 'status-success' : ['draft', 'pending', 'wait_pick'].includes(state) ? 'status-pending' : 'status-neutral';
}
const detailDialog = ref<HTMLDialogElement | null>(null);
const rows = ref<OrderSummary[]>([]),
  selected = ref<any>(null),
  keyword = ref(""),
  state = ref(""),
  busy = ref(false),
  error = ref("");
watch(selected, async value => {
  if (!props.todayOnly) return;
  await nextTick();
  if (value && !detailDialog.value?.open) detailDialog.value?.showModal();
  else if (!value) detailDialog.value?.close();
});
const amountTotals = ref<AmountTotal[] | null>(null);
const appliedState = ref(state.value);
const moreFilters = ref(false);
const statusOptions = computed(() => [['','全部'],['draft','待付款'],['done','已完成'],['closed','已关闭']].map(([value,label])=>({value,label:t(label)})));
const amountSummary = computed(() => amountTotals.value === null ? undefined : ({ total: amountTotals.value.length ? amountTotals.value.map(item=>money(item.amount,item.currency_code)) : ['—'] }));
const page = ref(1), total = ref(0), pageSize = ref(20), appliedKeyword=ref('');
const today = () => {
  const date = new Date(), offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10);
};
const dateFrom=ref(today()), dateTo=ref(today());
const storeOptions=computed(() => (session.value?.stores || []).filter((item:any) => session.value?.can_manage || item.can_manage_business));
const storeIds=ref<number[]>([storeId.value]);
const appliedDateFrom=ref(dateFrom.value), appliedDateTo=ref(dateTo.value), appliedStoreIds=ref<number[]>([...storeIds.value]);
async function load(scan = false, nextPage = 1, apply = true) {
  if (busy.value) return;
  if (!standalone.value && !storeIds.value.length) { error.value = '请至少选择一家门店'; return; }
  if (!scan && dateFrom.value > dateTo.value) { error.value = '结束日期不能早于开始日期'; return; }
  if(apply && !scan) {
    appliedState.value=state.value; appliedKeyword.value=keyword.value.trim(); appliedDateFrom.value=dateFrom.value;
    appliedDateTo.value=dateTo.value; appliedStoreIds.value=[...storeIds.value];
  }
  busy.value = true;
  error.value = "";
  try {
    const data = await api("orders", {
      keyword: scan ? keyword.value : appliedKeyword.value,
      sort_key:sortKey.value,sort_direction:sortDirection.value,page_size:pageSize.value,
      page: nextPage,
      source: props.todayOnly ? "today" : "all",
      state: scan ? "" : appliedState.value,
      date_from: scan ? '' : appliedDateFrom.value, date_to: scan ? '' : appliedDateTo.value,
      store_ids: scan ? storeIds.value : appliedStoreIds.value,
    });
    if (scan) selected.value = data;
    else { amountTotals.value = data.amount_total_data ?? null; rows.value = data.order_data; page.value = data.page; total.value = data.total; pageSize.value = data.page_size; }
  } catch (e) {
    amountTotals.value = null; error.value = errorText(e);
  } finally {
    busy.value = false;
  }
}
async function open(row: OrderSummary) {
  if (busy.value) return;
  busy.value = true;
  error.value = "";
  try {
    selected.value = await api("order", { order_id: row.id, store_id: row.store_id });
  } catch (e) {
    amountTotals.value = null; error.value = errorText(e);
  } finally {
    busy.value = false;
  }
}
function paginate(target:number,size:number){if(busy.value)return;pageSize.value=size;return load(false,target,false);}
const columns=computed(()=>[{key:'number',label:'订单号',width:'210px'},{key:'customer_name',label:'会员',width:'140px'},{key:'created_at',label:'下单时间',width:'220px'},{key:'total',label:'金额',width:'120px',align:'right'},{key:'state_name',label:'订单状态',width:'110px'},{key:'payment_label',label:'支付方式',width:'110px'},{key:'actions',label:'操作',width:'160px'}]);
onMounted(() => {
  busy.value = true;
  afterInitialPaint(() => {
    busy.value = false;
    void load(false,page.value,false);
  });
});
const sortKey=ref(''),sortDirection=ref('');
const sortableKeys=['number','created_at','state_name'];
function changeSort(key:string,direction:string){if(busy.value)return;sortKey.value=direction?key:'';sortDirection.value=direction;load(false,1,false);}
const selectedIds=ref<(number|string)[]>([]);
watch([keyword,state,dateFrom,dateTo,storeIds,()=>props.todayOnly],()=>selectedIds.value=[],{flush:'sync',deep:true});
watch(storeId, value => { storeIds.value=[value]; appliedStoreIds.value=[value]; });
function reset(){keyword.value='';state.value='';dateFrom.value=today();dateTo.value=today();storeIds.value=[storeId.value];void load();}
useListState("orders-"+(props.todayOnly?"today":"all"),{keyword,appliedKeyword,page,pageSize,state,appliedState,sortKey,sortDirection,dateFrom,dateTo,storeIds,appliedDateFrom,appliedDateTo,appliedStoreIds});
</script>
<template>
  <div class="content-page pure-admin-page" :class="{'standalone-orders':standalone}">
    <OrderEntry v-if="entry" :mode="entry" @close="entry=null;load(false,page,false)" @saved="load(false,page,false)" />
    <PendingOrderDetail v-else-if="selected && standalone && selected.is_local_pending && selected.state!=='done'" :key="selected.id" :order="selected" @updated="selected=$event" @close="selected=null;load(false,page,false)" />
    <OrderDetail
      v-else-if="selected && !todayOnly"
      :key="selected.id"
      :order="selected"
      :read-only="todayOnly"
      @updated="selected = $event"
      @cancelled="selected = null; load()"
      @close="
        selected = null;
        load(false,page,false);
      "
    /><template v-else
      > <form class="list-filter" @submit.prevent="load()">
        <div class="filter-fields order-filter-fields"><label>{{t("订单搜索")}}<ElInput clearable v-model="keyword" :disabled="busy" :placeholder="t('订单号')" /></label><div class="date-range-field"><span>{{t("日期范围")}}</span><PosDateRange v-model:from="dateFrom" v-model:to="dateTo" :disabled="busy" /></div><div v-show="moreFilters" class="filter-field"><span>{{t("状态")}}</span><ElSelect :empty-values="[null, undefined]" :placeholder="t('全部')" v-model="state" :disabled="busy" :aria-label="t('订单状态')" popper-class="pos-select-popper"><ElOption v-for="option in statusOptions" :key="option.value" :label="option.label" :value="option.value" /></ElSelect></div></div>
        <div class="list-toolbar"><div class="list-actions"><ElButton type="primary" native-type="submit" :disabled="busy"><PosIcon name="search" />{{t("查询")}}</ElButton><ElButton :disabled="busy" @click="reset">{{ t("重置") }}</ElButton><button type="button" class="more-filters" :aria-expanded="moreFilters" @click="moreFilters=!moreFilters">{{t(moreFilters?'收起筛选':'更多筛选')}}<span v-if="!moreFilters && state"> · {{statusOptions.find(option=>option.value===state)?.label}}</span><PosIcon name="down" /></button></div><div class="list-actions"><button v-if="!todayOnly" type="button" :disabled="busy" @click="entry='import'">{{t("导入订单")}}</button><button v-if="!todayOnly" type="button" class="primary" :disabled="busy" @click="entry='manual'">{{t("创建订单")}}</button><ListExport :rows="standalone ? exportRows : undefined" :columns="[...columns,{key:'currency_code',label:'币种'}]" label="订单管理" :selected-ids="selectedIds" @clear="selectedIds=[]" operation="orders" :values="{keyword:appliedKeyword,source:todayOnly?'today':'all',state:appliedState,date_from:appliedDateFrom,date_to:appliedDateTo,store_ids:appliedStoreIds,sort_key:sortKey,sort_direction:sortDirection}" :busy="busy" /><ElButton :disabled="busy" @click="load(false,page,false)"><PosIcon name="refresh" />{{ t("刷新") }}</ElButton></div></div>
      </form>
      <p v-if="!todayOnly" class="muted">{{ t("展示所选期间新建或收到款项的订单，支持查看和补打小票。") }}</p>
      <ListTable :summary="amountSummary" :storage-key="'orders-v2'" selectable v-model:selected-ids="selectedIds" :page="page" :page-size="pageSize" :sort-key="sortKey" :sort-direction="sortDirection" :sortable-keys="sortableKeys" @sort="changeSort" :rows="rows" :columns="columns" :busy="busy" :error="error" :filtered="!!appliedKeyword || !!appliedState || appliedDateFrom!==today() || appliedDateTo!==today()" empty-text="所选期间暂无订单。" @retry="load(false,page,false)">
        <template #number="{row}"><b>{{row.display_number || row.number}}</b></template>
        <template #total="{row}"><strong>{{money(row.total,row.currency_code)}}</strong></template>
        <template #state_name="{row}"><span class="badge" :class="statusTone(row.state)">{{ t(['现金已收','余额已支付'].includes(row.state_name) ? '已完成' : row.state_name) }}</span></template>
        <template #payment_label="{row}">{{paymentLabel(row)}}</template>

        <template #actions="{row}"><button :disabled="busy" @click="open(row)">{{t("查看详情")}}</button></template>
      </ListTable>
      <ListPagination :page="page" :page-size="pageSize" :total="total" :busy="busy" @change="paginate" /></template
    >
    <dialog v-if="todayOnly" ref="detailDialog" class="performance-detail-dialog" :aria-label="t('单据与小票')" @cancel.prevent="selected = null">
      <header><h2>{{ t("单据与小票") }}</h2></header>
      <OrderDetail v-if="selected" :order="selected" read-only @close="selected = null" />
    <footer class="dialog-footer-actions"><button @click="selected = null" class="action-with-icon"><PosIcon name="close" />{{ t("关闭") }}</button></footer></dialog>
  </div>
</template>
