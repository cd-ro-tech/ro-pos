<script setup lang="ts">
import { computed } from 'vue';
import { ElConfigProvider, ElDatePicker } from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import en from 'element-plus/es/locale/lang/en';
import it from 'element-plus/es/locale/lang/it';
import es from 'element-plus/es/locale/lang/es';
import pt from 'element-plus/es/locale/lang/pt';
import 'element-plus/es/components/date-picker/style/css';
import '../pure-admin.css';
import { locale, t } from '../i18n';
const props=defineProps<{from:string;to:string;disabled?:boolean}>();
const emit=defineEmits<{ 'update:from':[value:string]; 'update:to':[value:string] }>();
const language=computed(()=>({'zh-CN':zhCn,'en-US':en,'it-IT':it,'es-ES':es,'pt-PT':pt}[locale.value]));
const range=computed({get:()=>[props.from,props.to],set:(value:string[]|null)=>{if(value?.length===2){emit('update:from',value[0]);emit('update:to',value[1]);}}});
function dates(offset:number,month=false){const end=new Date();end.setHours(0,0,0,0);const start=new Date(end);if(month)start.setDate(1);else start.setDate(start.getDate()+offset);return [start,offset===-1?new Date(start):end];}
const shortcuts=computed(()=>[{text:t('今天'),value:()=>dates(0)},{text:t('昨天'),value:()=>dates(-1)},{text:t('近 7 天'),value:()=>dates(-6)},{text:t('本月'),value:()=>dates(0,true)}]);
</script>
<template><ElConfigProvider :locale="language"><ElDatePicker v-model="range" class="pos-date-range" type="daterange" value-format="YYYY-MM-DD" format="YYYY-MM-DD" :disabled="disabled" :clearable="false" :shortcuts="shortcuts" :start-placeholder="t('开始日期')" :end-placeholder="t('结束日期')" :aria-label="t('日期范围')" :teleported="true" popper-class="pos-date-popper" unlink-panels /></ElConfigProvider></template>
