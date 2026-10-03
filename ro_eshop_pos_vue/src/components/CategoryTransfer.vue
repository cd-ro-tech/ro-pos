<script setup lang="ts">
import { t } from '../i18n';
import { computed, ref, watch } from 'vue';
import CategoryTree from '../backend/product/CategoryTree.vue';
import { categoryId } from '../categoryTree';
const props=defineProps<{modelValue:number;categories:any[];parentMode?:boolean;disabledIds?:number[]}>();
const emit=defineEmits(['update:modelValue']);
const candidate=ref(0);
watch(()=>props.modelValue,value=>candidate.value=value,{immediate:true});
const selected=computed(()=>props.categories.find(c=>categoryId(c)===props.modelValue));
const validCandidate=computed(()=>candidate.value>0&&!props.disabledIds?.includes(candidate.value)&&props.categories.some(c=>categoryId(c)===candidate.value&&(props.parentMode||c.is_leaf!==false&&!props.categories.some(child=>Number(child.parent_id)===candidate.value))));
</script>
<template>
 <div class="category-transfer">
  <section class="transfer-pane"><h3>{{t(parentMode?'上级分类':'商品分类')}}</h3><CategoryTree v-model="candidate" :categories="categories" :leaf-only="!parentMode" :disabled-ids="disabledIds" /></section>
  <div class="transfer-actions"><button type="button" :disabled="!validCandidate" :aria-label="t('选入分类')" @click="emit('update:modelValue',candidate)">→</button><button type="button" :disabled="!modelValue" :aria-label="t('移除分类')" @click="emit('update:modelValue',0)">←</button></div>
  <section class="transfer-pane"><h3>{{t('已选分类 ·')}} {{selected?1:0}} / 1</h3><button v-if="parentMode" type="button" class="root-choice" :class="{active:!modelValue}" @click="emit('update:modelValue',0)">{{t('无（一级分类）')}}</button><div v-if="selected" class="selected-category"><small>{{t('完整路径')}}</small><p>{{selected.eshop_categ_name||selected.name}}</p></div><p v-else-if="!parentMode" class="transfer-hint">{{t('逐级展开，选择最末级分类')}}<br />{{t('选择后点击箭头移入')}}</p></section>
 </div>
</template>
<style scoped>
.category-transfer{display:grid;grid-template-columns:minmax(0,1fr) 40px minmax(0,1fr);gap:12px;margin:12px 0;width:100%;min-width:0}.transfer-pane{min-width:0;border:1px solid var(--theme-line, #dce3ed);border-radius:5px;background:var(--theme-surface, #fff);overflow:hidden}.category-transfer h3{font-size:13px;font-weight:600;margin:0;padding:12px 14px;background:var(--theme-surface, #f6f8fb);border-bottom:1px solid var(--theme-line, #dce3ed)}.category-transfer :deep(.tree-scroll){height:230px;max-height:230px}.transfer-actions{display:flex;flex-direction:column;justify-content:center;gap:10px}.transfer-actions button{padding:0;min-height:36px;width:36px}.selected-category{margin:14px;padding:14px;background:var(--theme-surface, #edf3ff);border:1px solid var(--theme-line, #d5e3fc);border-radius:4px;color:var(--theme-text-accent, #2456b7);overflow-wrap:anywhere}.selected-category small{font-size:12px;color:var(--theme-muted, #71809a)}.selected-category p{font-size:14px;line-height:1.7;margin:8px 0 0}.transfer-hint{padding:24px 16px;font-size:13px;color:var(--theme-muted, #8290a5);line-height:1.9}.root-choice{margin:12px;max-width:calc(100% - 24px);font-size:13px}.root-choice.active{background:var(--theme-surface, #edf3ff);color:var(--theme-text-accent, #2456b7);border-color:var(--theme-line, #9cb9ee)}@media(max-width:600px){.category-transfer{grid-template-columns:minmax(0,1fr) 32px minmax(0,1fr);gap:6px}.transfer-actions button{width:30px;min-width:30px}.selected-category{margin:8px;padding:8px}}
</style>
