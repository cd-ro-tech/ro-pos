<script setup lang="ts">
import { useListState } from "../../listState";
import { computed, ref, watch } from 'vue';
import { t } from '../../i18n';
import PosIcon from '../../components/PosIcon.vue';
import { categoryId, categoryTreeRows, categoryProductCounts } from '../../categoryTree';
const props=defineProps<{storageKey?:string;categories:any[];modelValue:number;leafOnly?:boolean;disabledIds?:number[];disabled?:boolean;all?:boolean}>();
const emit=defineEmits(['update:modelValue']);
const query=ref(''),expanded=ref<number[]>([]);
if(props.storageKey)useListState('tree-'+props.storageKey,{query,expanded});
const rows=computed(()=>categoryTreeRows(props.categories,expanded.value,query.value));
const counts=computed(()=>categoryProductCounts(props.categories));
const branches=computed(()=>[...new Set<number>(props.categories.map(row=>Number(row.parent_id)).filter(Boolean))]);
const allExpanded=computed(()=>!!query.value || (branches.value.length>0 && branches.value.every(id=>expanded.value.includes(id))));
function toggleAll(){if(allExpanded.value){expanded.value=[];query.value='';}else expanded.value=[...branches.value];}
const total=computed(()=>props.categories.reduce((sum,row)=>sum+(Number(row.product_count)||0),0));
function toggle(id:number){expanded.value=expanded.value.includes(id)?expanded.value.filter(n=>n!==id):[...expanded.value,id];}
function unavailable(row:any){return props.disabled||props.disabledIds?.includes(row.id)||(props.leafOnly&&(row.children||row.is_leaf===false));}
watch(()=>[props.modelValue,props.categories],()=>{let row=props.categories.find(r=>categoryId(r)===props.modelValue);const seen=new Set<number>();while(row?.parent_id&&!seen.has(row.parent_id)){seen.add(row.parent_id);if(!expanded.value.includes(row.parent_id))expanded.value.push(row.parent_id);row=props.categories.find(r=>categoryId(r)===row.parent_id);}},{immediate:true});
</script>
<template>
<div class="category-tree-panel">
 <div class="tree-search"><input v-model="query" :placeholder="t('分类搜索')" :aria-label="t('分类搜索')" :disabled="disabled" /><button v-if="!all" type="button" class="tree-toggle-all" :disabled="disabled||!branches.length" :title="t(allExpanded?'全部收起':'全部展开')" :aria-label="t(allExpanded?'全部收起':'全部展开')" :aria-expanded="allExpanded" @click="toggleAll"><PosIcon name="down" :class="{'is-expanded':allExpanded}" /></button></div>

 <div class="tree-scroll" role="tree" :aria-label="t('商品分类')">
  <div v-if="all" class="tree-all-row" :class="{selected:modelValue===0}"><button type="button" class="tree-all" :disabled="disabled" @click="emit('update:modelValue',0)"><span>{{t('全部分类')}}</span><span class="category-count">{{total}}</span></button><button type="button" class="tree-toggle-all" :disabled="disabled||!branches.length" :title="t(allExpanded?'全部收起':'全部展开')" :aria-label="t(allExpanded?'全部收起':'全部展开')" :aria-expanded="allExpanded" @click="toggleAll"><PosIcon name="down" :class="{'is-expanded':allExpanded}" /></button></div>
  <div v-for="row in rows" :key="row.id" class="tree-row" :class="{selected:modelValue===row.id}" :style="{paddingLeft:8+row.depth*16+'px'}" role="treeitem" :aria-level="row.depth+1" :aria-selected="modelValue===row.id" :aria-expanded="row.children?expanded.includes(row.id)||!!query:undefined">
   <button v-if="row.children" class="tree-toggle" type="button" :aria-label="t(expanded.includes(row.id)?'收起':'展开')+' '+row.name" :disabled="disabled" @click="toggle(row.id)"><PosIcon :name="expanded.includes(row.id)||query?'down':'arrow'" /></button><span v-else class="tree-spacer" />
   <button type="button" class="tree-name" :title="row.eshop_categ_name" :disabled="unavailable(row)" @click="emit('update:modelValue',row.id)">{{row.name||row.eshop_categ_name}}</button><span class="category-count" :aria-label="t('商品数：{0}',[counts.get(row.id)||0])">{{counts.get(row.id)||0}}</span>
  </div>
  <p v-if="!rows.length" class="tree-empty">{{t('暂无分类')}}</p>
 </div>
</div>
</template>
<style scoped>
.category-tree-panel{min-width:0;background:var(--theme-surface, #fff)}.tree-search{padding:12px}.tree-search input{box-sizing:border-box;width:100%;min-width:0;height:34px;font-size:13px}.tree-tools{display:flex;gap:12px;padding:0 12px 10px;border-bottom:1px solid var(--theme-line, #edf0f5)}.tree-tools button{border:0;background:none;padding:0;min-height:26px;font-size:12px;color:var(--theme-muted, #526985)}.tree-scroll{max-height:440px;overflow:auto;padding:6px}.tree-row{display:flex;align-items:center;min-height:36px;border-radius:4px}.tree-row.selected,.tree-all-row.selected{background:var(--theme-subtle, #eaf2ff);color:var(--theme-text-accent, #245bce)}.tree-row:hover{background:var(--theme-surface, #f1f5fb)}.tree-toggle,.tree-spacer{width:24px;flex:0 0 24px}.tree-row button{border:0;background:transparent;box-shadow:none;min-height:34px;color:inherit;margin:0}.tree-toggle{padding:0}.tree-name{flex:1;min-width:0;text-align:left;padding:6px 4px;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.tree-name:disabled{color:var(--theme-muted, #8793a5);opacity:1}.tree-all{width:100%;border:0;text-align:left;background:none;min-height:36px;padding:8px 12px;font-size:13px}.tree-empty{padding:20px;color:var(--theme-muted, #8793a5);text-align:center;font-size:13px}
.tree-toggle{display:inline-flex;align-items:center;justify-content:center}.tree-toggle .icon{width:16px;height:16px}.category-count{flex-shrink:0;display:inline-block;min-width:24px;padding:2px 6px;margin-right:6px;border-radius:4px;background:var(--theme-subtle, #edf1f7);color:var(--theme-muted, #526780);font-size:12px;line-height:18px;text-align:center;font-variant-numeric:tabular-nums}.selected .category-count{background:var(--theme-subtle, #dae7ff);color:var(--theme-text-accent, #245bce)}.tree-all{display:flex;align-items:center;justify-content:space-between;gap:8px}
.tree-search{display:flex;align-items:center;gap:8px}.tree-search input{flex:1}.tree-all-row{display:flex;align-items:center;border-radius:4px}.tree-all-row .tree-all{flex:1;min-width:0;color:inherit}.tree-toggle-all{display:flex;align-items:center;justify-content:center;flex:0 0 32px;width:32px;min-height:32px;padding:6px;margin-right:4px;border:0;border-radius:4px;background:transparent;color:var(--theme-muted, #526985);box-shadow:none}.tree-toggle-all:hover:not(:disabled){background:var(--theme-subtle, #dae7ff);color:var(--theme-text-accent, #245bce)}.tree-toggle-all:focus-visible{outline:2px solid var(--theme-accent, #245bce);outline-offset:-2px}.tree-toggle-all .icon{width:18px;height:18px}.tree-toggle-all .is-expanded{transform:rotate(180deg)}
</style>
