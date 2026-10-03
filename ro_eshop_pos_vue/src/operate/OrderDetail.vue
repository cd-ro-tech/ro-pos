<script setup lang="ts">
import { computed } from 'vue';
import Receipt from './Receipt.vue';
import { t } from '../i18n';
const props=defineProps<{order:any;initialMethod?:string;readOnly?:boolean}>();
const receiptOnly=computed(()=>!props.readOnly && !['draft','closed'].includes(props.order.state));
const emit=defineEmits(['updated','close','cancelled','locked','cash-paid']);
</script>
<template>
  <section class="order-detail" :class="{'receipt-only':receiptOnly}">
    <div v-if="receiptOnly" class="order-overview"><Receipt :order="order" compact @done="emit('close')" /></div>
    <div v-else class="order-overview">
      <div class="section-head"><div><span class="eyebrow">{{order.number}}</span><h2>{{t(order.state_name)}}</h2></div><button class="plain" @click="emit('close')">{{t('返回单据列表')}}</button></div>
      <Receipt :order="order" />
    </div>
  </section>
</template>
