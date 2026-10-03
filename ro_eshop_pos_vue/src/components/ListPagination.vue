<script setup lang="ts">
import PosSelect from "./WorkbenchSelect.vue";
import { t } from "../i18n";
import { computed, ref, watch } from 'vue';
const props=withDefaults(defineProps<{page:number;pageSize:number;total:number;busy?:boolean}>(),{busy:false});
const emit=defineEmits<{change:[page:number,size:number]}>();
const pages=computed(()=>Math.max(1,Math.ceil(props.total/props.pageSize)));
const jump=ref(props.page);
watch(()=>props.page,v=>jump.value=v);
const buttons=computed(()=>{const set=new Set([1,pages.value]);for(let n=Math.max(1,props.page-2);n<=Math.min(pages.value,props.page+2);n++)set.add(n);const result:(number|string)[]=[];let last=0;for(const n of [...set].sort((a,b)=>a-b)){if(n-last>1)result.push('gap'+n);result.push(n);last=n;}return result;});
function go(value:number){if(!props.busy){const n=Math.max(1,Math.min(pages.value,Math.trunc(Number(value)||1)));jump.value=n;if(n!==props.page)emit('change',n,props.pageSize);}}
</script>
<template>
<nav class="list-pagination" :aria-label="t('列表分页')">
  <span class="pagination-total">{{ t("共 {0} 条", [total]) }}</span>
  <PosSelect :aria-label="t('每页条数')" :model-value="pageSize" :disabled="busy" @change="value=>emit('change',1,Number(value))" :options="[20,50,100].map(size=>({value:size,label:t('{0} 条/页',[size])}))" />
  <button :aria-label="t('上一页')" :disabled="busy || page<=1" @click="go(page-1)">‹ {{t("上一页")}}</button>
  <template v-for="item in buttons" :key="item"><button v-if="typeof item==='number'" :aria-label="t('第 {0} 页', [item])" :aria-current="page===item?'page':undefined" :disabled="busy" @click="go(item)">{{item}}</button><span v-else class="pagination-gap">…</span></template>
  <button :aria-label="t('下一页')" :disabled="busy || page>=pages" @click="go(page+1)">{{t("下一页")}} ›</button>
  <form v-if="pages>5" @submit.prevent="go(jump)"><label>{{ t("前往") }}<input v-model.number="jump" :aria-label="t('跳转页码')" type="number" min="1" :max="pages" :disabled="busy" />{{ t("页") }}</label><button :disabled="busy">{{ t("跳转") }}</button></form>
</nav>
</template>

<style scoped>
#app .list-pagination{display:flex;flex-flow:row wrap;align-items:center;gap:8px}
#app .list-pagination form,#app .list-pagination label{display:flex;flex-direction:row;align-items:center;gap:6px;width:auto;margin:0;white-space:nowrap}
#app .list-pagination input{display:inline-block;flex:0 0 56px;width:56px;min-width:0;max-width:56px;height:32px;box-sizing:border-box}
#app .list-pagination select{width:auto;flex:0 0 auto}
#app .list-pagination :is(select,input){box-sizing:border-box;height:32px;min-height:32px;padding:4px 8px;line-height:22px;font-size:13px}
@media(min-width:761px){#app .list-pagination{flex-wrap:nowrap}#app .list-pagination form{flex:0 0 auto}}
</style>
