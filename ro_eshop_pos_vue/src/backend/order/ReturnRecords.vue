<script setup lang="ts">
import PosDateRange from '../../components/PosDateRange.vue';
import '../../pure-admin.css';
import { ElInput } from 'element-plus';
import 'element-plus/es/components/input/style/css';
import { useListState } from "../../listState";
import type { AmountTotal } from '../../amountTotals';
import { computed,ref,onMounted } from 'vue';
import StoreMultiSelect from '../../components/StoreMultiSelect.vue';
import ListExport from '../../components/ListExport.vue';
import ListTable from '../../components/ListTable.vue';
import ListPagination from '../../components/ListPagination.vue';
import PosIcon from '../../components/PosIcon.vue';
import { api,money,errorText,session,storeId } from '../../api';
import { standalone } from '../../mode';
import { t,formatDateTime } from '../../i18n';
import ReturnDialog from '../../operate/ReturnDialog.vue';
const selectedIds=ref<(number|string)[]>([]);
const today=()=>new Date().toLocaleDateString('en-CA');
const storeIds=ref<number[]>([storeId.value]);
const rows=ref<any[]>([]),error=ref(''),busy=ref(false),page=ref(1),pageSize=ref(20),total=ref(0),open=ref(false),keyword=ref(''),date_from=ref(today()),date_to=ref(today());
const columns=[{key:'number',label:'退货单号'},{key:'order_number',label:'订单号'},{key:'created_at',label:'时间',width:'220px'},{key:'reason',label:'退货原因'},{key:'amount',label:'现金退款',align:'right',width:'150px'}];
const amountTotals=ref<AmountTotal[] | null>(null);
const amountSummary=computed(()=>amountTotals.value===null?undefined:({amount:amountTotals.value.length?amountTotals.value.map(item=>money(item.amount,item.currency_code)):['—']}));
const moreFilters=ref(false);
const filters=ref<any>({});
const restored=useListState("returns",{keyword,page,pageSize,date_from,date_to,storeIds,filters});
async function load(target=page.value,apply=false){
 if(busy.value)return;
 if(apply)filters.value={keyword:keyword.value,date_from:date_from.value,date_to:date_to.value,...(!standalone.value?{store_ids:[...storeIds.value]}:{})};
 busy.value=true;error.value='';
 try{const data=await api('returns',{...filters.value,page:target,page_size:pageSize.value});amountTotals.value=data.amount_total_data??null;rows.value=data.rows;total.value=data.total;page.value=data.page??target;}catch(e){amountTotals.value=null;rows.value=[];error.value=errorText(e);}finally{busy.value=false;}
}
function reset(){keyword.value='';date_from.value=today();date_to.value=today();storeIds.value=[storeId.value];void load(1,true);}
function paginate(target:number,size:number){pageSize.value=size;void load(target);}
onMounted(()=>load(page.value,!restored));
</script>
<template>
<section class="pure-admin-page content-page return-records-page">
 <form class="list-filter" @submit.prevent="load(1,true)">
  <div class="filter-fields order-filter-fields">
   <label>{{t('订单搜索')}}<ElInput v-model="keyword" :disabled="busy" :placeholder="t('订单号')" /></label>
   <div class="date-range-field"><span>{{t("日期范围")}}</span><PosDateRange v-model:from="date_from" v-model:to="date_to" :disabled="busy" /></div>
   <div v-if="!standalone" v-show="moreFilters" class="filter-field"><span>{{t('门店')}}</span><StoreMultiSelect v-model="storeIds" :options="session?.stores||[]" :disabled="busy" /></div>
  </div>
  <div class="list-toolbar">
   <div class="list-actions"><button class="primary" :disabled="busy"><PosIcon name="search" />{{t('查询')}}</button><button type="button" :disabled="busy" @click="reset">{{t('重置')}}</button><button v-if="!standalone" type="button" class="more-filters" :aria-expanded="moreFilters" @click="moreFilters=!moreFilters">{{t(moreFilters?'收起筛选':'更多筛选')}}<PosIcon name="down" /></button></div>
   <div class="list-actions"><ListExport :rows="rows" :columns="columns" label="退货记录" :selected-ids="selectedIds" :busy="busy || !!error" @clear="selectedIds=[]" /><button type="button" :disabled="busy" @click="load()"><PosIcon name="refresh" />{{t('刷新')}}</button><button type="button" class="primary" @click="open=true"><PosIcon name="return" />{{t('退货')}}</button></div>
  </div>
 </form>
 <ListTable selectable v-model:selected-ids="selectedIds" :summary="amountSummary" storage-key="returns" :rows="rows" :columns="columns" :page="page" :page-size="pageSize" :busy="busy" :error="error" :filtered="!!filters.keyword || filters.date_from!==today() || filters.date_to!==today()" empty-text="暂无退货记录" label="退货记录" @retry="load()">
  <template #amount="{row}">{{money(row.amount,row.currency_code)}}</template>
 </ListTable>
 <ListPagination :page="page" :page-size="pageSize" :total="total" :busy="busy" @change="paginate" />
 <ReturnDialog :open="open" @close="open=false;load()" />
</section>
</template>
<style scoped>
#app .return-records-page{display:flex;flex-direction:column;flex:1;min-height:0;overflow:hidden}
#app .return-records-page>.list-filter,#app .return-records-page>h2,#app .return-records-page>.list-pagination{flex-shrink:0}
#app .return-records-page>.list-table{flex:1;min-height:140px}
#app .return-records-page :deep(.list-table-scroll){max-height:none;flex:1}
</style>
