<script setup lang="ts">
import { ref } from 'vue';
import { api,errorText,money } from '../../api';
import { t } from '../../i18n';
import { confirmAction } from '../../confirmation';
import ListTable from '../../components/ListTable.vue';
const props=defineProps<{order:any}>();const emit=defineEmits(['updated','close']);
const busy=ref(false),error=ref(''),received=ref(String(props.order.total)),requestKey=crypto.randomUUID();
async function action(operation:string){if(busy.value)return;if(!await confirmAction({title:operation==='pending_cash'?'确认现金收款':'关闭订单',message:operation==='pending_cash'?`确认已收到现金 ${money(Number(received.value),props.order.currency_code)}？`:'确认关闭此待付款订单？',confirmLabel:'确认',icon:'check'}))return;busy.value=true;error.value='';try{emit('updated',await api(operation,{order_id:props.order.id,request_key:requestKey,received:Number(received.value)}));}catch(e){error.value=errorText(e);}finally{busy.value=false;}}
const columns=[{key:'name',label:'商品名称'},{key:'spec',label:'规格'},{key:'qty',label:'数量',align:'right'},{key:'price',label:'单价',align:'right'},{key:'total',label:'金额',align:'right'}];
</script>
<template>
<section class="pending-order-detail"><header><button :disabled="busy" @click="emit('close')">{{t('返回列表')}}</button><h2>{{order.number}} · {{t(order.state_name)}}</h2></header><p>{{t('会员')}}：{{order.customer_name}} · {{t('下单时间')}}：{{order.created_at}}</p><p v-if="error" class="error" role="alert">{{t(error)}}</p><ListTable :rows="order.lines" :columns="columns" label="订单明细" :busy="busy" /><footer><strong>{{t('应收')}} {{money(order.total,order.currency_code)}}</strong><template v-if="order.state==='draft'"><label>{{t('现金实收')}}<input v-model="received" type="number" step="0.01" :min="order.total" max="1000000" :disabled="busy" /></label><button :disabled="busy" @click="action('pending_close')">{{t('关闭订单')}}</button><button class="primary" :disabled="busy||!received||!Number.isFinite(Number(received))||Number(received)<order.total" @click="action('pending_cash')">{{t('确认现金收款')}}</button></template></footer></section>
</template>
<style scoped>
.pending-order-detail{display:flex;flex:1;min-height:0;flex-direction:column;gap:8px}.pending-order-detail>header,.pending-order-detail>footer{display:flex;align-items:center;flex-wrap:wrap;gap:12px;padding:8px 12px}.pending-order-detail h2{margin:0;font-size:18px}.pending-order-detail footer{flex-shrink:0}.pending-order-detail footer strong{margin-right:auto}.pending-order-detail footer label{display:flex;align-items:center;gap:8px}.pending-order-detail footer input{width:140px}
</style>
