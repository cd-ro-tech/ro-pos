<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue';
import { t } from '../i18n';
import PosIcon from './PosIcon.vue';
import { demoTargets } from '../demoData';
const props=defineProps<{loading:boolean;counts?:Record<string,number>|null;error?:string}>();
const cards=[{key:'categories',label:'分类',icon:'product'},{key:'products',label:'商品',icon:'product'},{key:'orders',label:'现金订单',icon:'documents'}] as const;
const percentage=ref(0);
const completed=ref(0),active=ref(-1),result=ref<Record<string,number>|null>(null);
let disposed=false,timer:ReturnType<typeof setTimeout>|undefined,release:(()=>void)|undefined;
watch(()=>props.loading,value=>{if(value){percentage.value=0;completed.value=0;active.value=0;result.value=null;}else active.value=-1;});
async function animate(counts:Record<string,number>){
  result.value=counts;
  for(let index=0;index<cards.length&&!disposed;index++){
    active.value=index;
    const target=Math.floor((index+1)*100/cards.length);
    while(percentage.value<target&&!disposed){
      await new Promise<void>(resolve=>{release=resolve;timer=setTimeout(resolve,45);});
      if(!disposed)percentage.value++;
    }
    if(disposed)return;
    completed.value=index+1;
  }
  active.value=-1;
}
onBeforeUnmount(()=>{disposed=true;clearTimeout(timer);release?.();});
const done=(index:number)=>!!props.counts||index<completed.value;

defineExpose({animate});
</script>
<template>
<section class="demo-data-progress" :aria-busy="loading">
<div class="demo-stat-cards">
  <article v-for="(card,index) in cards" :key="card.key" :class="{'is-active':loading&&active===index,'is-complete':done(index)}">
    <header><PosIcon :name="card.icon" /><span>{{t(card.label)}}</span><PosIcon v-if="done(index)" name="check" class="completed-icon" /></header>
    <div class="demo-count"><strong>{{done(index)?(counts||result)?.[card.key]:demoTargets[card.key]}}</strong><span>{{t(done(index)?'本次新增':'预计记录')}}</span></div>
    <div class="demo-card-status"><span v-if="loading&&active===index" class="demo-spinner" />{{t(done(index)?'已完成':error?'未完成':loading&&active===index?'加载中…':loading?'等待处理':'准备就绪')}}</div>
    <div v-if="loading&&result&&active===index" class="demo-card-track"><span /></div>
  </article>
</div>
<div v-if="loading||counts||error" class="demo-progress-heading" role="status"><span>{{t(error?'加载未完成，请重试':counts?'演示数据已加载':result?'正在完成数据准备…':'正在写入本机数据…')}}</span><strong v-if="!error">{{percentage}}%</strong></div>
<progress v-if="loading||counts" :value="percentage" max="100" :aria-label="t('加载进度')" />
<p>{{t('重复记录自动跳过，完成后显示本次新增数量。')}}</p>
</section>
</template>
<style scoped>
.demo-stat-cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:20px 0}.demo-stat-cards article{position:relative;overflow:hidden;padding:16px;border:1px solid var(--theme-line, #dce5f2);border-radius:6px;background:var(--theme-surface, #fff);transition:border-color 180ms,background 180ms}.demo-stat-cards header{display:flex;align-items:center;gap:8px;font-size:14px;color:var(--theme-muted, #526586)}.demo-stat-cards header>.icon{width:18px;height:18px}.demo-stat-cards header .completed-icon{margin-left:auto;color:#278263}.demo-count{display:flex;align-items:baseline;gap:8px;margin:14px 0 10px}.demo-count strong{font-size:26px;font-weight:650;color:var(--theme-ink, #253858);font-variant-numeric:tabular-nums}.demo-count>span,.demo-card-status{font-size:12px;color:var(--theme-muted, #60718a)}.demo-card-status{display:flex;align-items:center;gap:6px;min-height:18px}.demo-stat-cards .is-active{border-color:var(--theme-accent, #285bd4);background:var(--theme-surface, #f5f8ff)}.demo-stat-cards .is-complete{border-color:#b9d9cf}.demo-spinner{width:12px;height:12px;border:2px solid var(--theme-line, #d8e4fb);border-top-color:var(--theme-accent, #285bd4);border-radius:50%;animation:demo-spin 800ms linear infinite}.demo-card-track{position:absolute;bottom:0;left:0;right:0;height:3px;background:var(--theme-subtle, #e5edfb)}.demo-card-track>span{display:block;height:100%;background:var(--theme-accent-fill, #285bd4);transform-origin:left;animation:demo-fill 1500ms linear both}.demo-progress-heading{display:flex;justify-content:space-between;gap:16px;font-size:13px;margin-bottom:10px}.demo-data-progress progress{display:block;width:100%;height:8px;accent-color:#285bd4}.demo-data-progress p{font-size:13px;line-height:1.7;color:var(--theme-muted, #60718a);margin:12px 0}@keyframes demo-spin{to{transform:rotate(360deg)}}@keyframes demo-fill{from{transform:scaleX(0)}to{transform:scaleX(1)}}@media(max-width:600px){.demo-stat-cards{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(prefers-reduced-motion:reduce){.demo-spinner,.demo-card-track>span{animation:none}.demo-stat-cards article{transition:none}}
</style>
