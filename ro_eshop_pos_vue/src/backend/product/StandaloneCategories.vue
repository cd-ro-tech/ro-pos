<script setup lang="ts">
import '../../pure-admin.css';
import BulkStatusActions from './BulkStatusActions.vue';
import { ElInput } from 'element-plus';
import 'element-plus/es/components/input/style/css';
import { useId } from "vue";
const categoryFormId=useId();
import { confirmDiscard } from "../../formEditing";
import { useListState } from "../../listState";
import ListExport from '../../components/ListExport.vue';
import ListTable from '../../components/ListTable.vue';
import CategoryTree from './CategoryTree.vue';
import CategoryTransfer from '../../components/CategoryTransfer.vue';
import { categoryDescendants, categoryTreeRows, categoryProductCounts } from '../../categoryTree';
import { t, locale } from "../../i18n";
import { computed, onMounted, ref, watch, nextTick } from 'vue';
import { api, errorText, notice } from '../../api';
import PosIcon from '../../components/PosIcon.vue';
import { confirmAction } from '../../confirmation';

const emit=defineEmits(['busy','saved']);
const rows=ref<any[]>([]),keyword=ref(''),busy=ref(false),error=ref('');
const editing=ref<any|null>(null),name=ref(''),parentId=ref(0);
const dialog=ref<HTMLDialogElement|null>(null);
const categoriesCollapsed=ref(false);
const selectedIds=ref<(number|string)[]>([]);
async function bulkSaved(){selectedIds.value=[];await load();emit('saved');}
function bulkBusy(value:boolean){busy.value=value;emit('busy',value);}
const selectedId=ref(0),expanded=ref<number[]>([]),appliedKeyword=ref('');
const disabledParents=computed(()=>[...(editing.value?categoryDescendants(rows.value,editing.value.id):[]),...rows.value.filter(row=>row.product_count>0).map(row=>row.id)]);
const productCounts=computed(()=>categoryProductCounts(rows.value));
const visibleRows=computed(()=>{const ids=selectedId.value?categoryDescendants(rows.value,selectedId.value):null;return categoryTreeRows(rows.value,expanded.value,appliedKeyword.value).filter(row=>!ids||ids.has(row.id));});
function selectCategory(id:number){selectedIds.value=[];selectedId.value=id;if(id&&!expanded.value.includes(id))expanded.value.push(id);let row=rows.value.find(r=>r.id===id);const seen=new Set<number>();while(row?.parent_id&&!seen.has(row.parent_id)){seen.add(row.parent_id);if(!expanded.value.includes(row.parent_id))expanded.value.push(row.parent_id);row=rows.value.find(r=>r.id===row.parent_id);}}
function toggleRow(id:number){expanded.value=expanded.value.includes(id)?expanded.value.filter(n=>n!==id):[...expanded.value,id];}
function query(){selectedIds.value=[];appliedKeyword.value=keyword.value.trim();}

async function load(){busy.value=true;emit('busy',true);error.value='';try{rows.value=(await api('manage_categories')).category_data;}catch(e){error.value=errorText(e);}finally{busy.value=false;emit('busy',false);}}
let originalDraft='';
async function closeEditor(){if(!busy.value && await confirmDiscard(originalDraft!==JSON.stringify([name.value,parentId.value])))dialog.value?.close();}
function open(row:any=null){error.value='';editing.value=row;name.value=row?.source_name||row?.name||'';parentId.value=row?row.parent_id||0:(rows.value.find(r=>r.id===selectedId.value)?.product_count?0:selectedId.value);originalDraft=JSON.stringify([name.value,parentId.value]);dialog.value?.showModal();}
async function save(){if(busy.value)return;busy.value=true;emit('busy',true);error.value='';try{await api('category_save',{id:editing.value?.id||0,name:name.value,parent_id:parentId.value});dialog.value?.close();emit('saved');notice.value=editing.value?'分类已更新':'分类已创建';await load();}catch(e){error.value=errorText(e);await nextTick();dialog.value?.querySelector<HTMLElement>('.error')?.focus();}finally{busy.value=false;emit('busy',false);}}
async function remove(row:any){if(row.product_count||!row.is_leaf){error.value='该分类包含商品或下级分类，不能删除';return;}if(!await confirmAction({title:'删除商品分类',message:`确认删除分类“${row.eshop_categ_name}”？`,confirmLabel:'确认删除',icon:'product'}))return;busy.value=true;emit('busy',true);try{await api('category_delete',{id:row.id});emit('saved');notice.value='分类已删除';await load();}catch(e){error.value=errorText(e);}finally{busy.value=false;emit('busy',false);}}
async function setActive(row:any){
 if(busy.value)return;
 const active=row.active===false;
 if(!await confirmAction({title:active?'启用分类':'停用分类',message:active?`确认启用“${row.name}”？下级分类保留各自原有状态。`:`停用“${row.name}”后，该分类及下级商品将从收银端隐藏，历史数据保留。`,confirmLabel:active?'确认启用':'确认停用',icon:'product'}))return;
 busy.value=true;emit('busy',true);error.value='';
 try{await api('category_set_active',{id:row.id,active});await load();emit('saved');notice.value=active?'分类已启用':'分类已停用';}
 catch(e){error.value=errorText(e);}finally{busy.value=false;emit('busy',false);}
}
onMounted(load);
watch(locale,load);
const exportColumns=[{key:'name',label:'分类名称'},{key:'eshop_categ_name',label:'完整路径'},{key:'count',label:'商品数'},{key:'level',label:'级次'},{key:'active',label:'启用状态'},{key:'effective_active',label:'实际生效状态'}];
const columns=[{key:'name',label:'分类名称',width:'220px'},{key:'eshop_categ_name',label:'完整路径'},{key:'count',label:'商品数',width:'120px'},{key:'level',label:'级次',width:'120px',align:'center'},{key:'state',label:'状态',width:'140px'},{key:'actions',label:'操作',width:'220px'}];
useListState("categories",{keyword,selectedId,expanded,appliedKeyword,categoriesCollapsed});
</script>
<template>
<section class="pure-admin-page category-manage inventory-page" :aria-label="t('商品分类')">
  <div class="category-management-layout" :class="{'categories-collapsed':categoriesCollapsed}"><aside v-show="!categoriesCollapsed" class="category-navigation"><h3 class="category-nav-heading"><span>{{t("商品分类")}}</span><button type="button" :aria-label="t('收起分类')" :aria-expanded="true" @click="categoriesCollapsed=true"><PosIcon name="prev" />{{t("收起")}}</button></h3>  <CategoryTree storage-key="categories" :model-value="selectedId" @update:model-value="selectCategory" :categories="rows" :disabled="busy" all /></aside><div class="category-list-content">
  <form class="list-filter" @submit.prevent="query"><div class="filter-fields"><label>{{t("分类搜索")}}<ElInput v-model="keyword" :disabled="busy" :placeholder="t('分类名称或完整路径')" /></label></div><div class="list-toolbar"><div class="list-actions"><button v-if="categoriesCollapsed" type="button" :aria-expanded="false" @click="categoriesCollapsed=false"><PosIcon name="arrow" />{{t("展开分类")}}</button><button class="primary" :disabled="busy"><PosIcon name="search" />{{t("查询")}}</button><button type="button" :disabled="busy" @click="keyword='';appliedKeyword='';selectedId=0;load()">{{t("重置")}}</button></div><div class="list-actions"><ListExport :rows="visibleRows.map(row=>({...row,count:productCounts.get(row.id)||0}))" :columns="exportColumns" label="商品分类" :selected-ids="selectedIds" hide-selection :busy="busy" @clear="selectedIds=[]" /><BulkStatusActions entity="category" :ids="selectedIds" :disabled="busy" @busy="bulkBusy" @saved="bulkSaved" @clear="selectedIds=[]" /><button type="button" :disabled="busy" @click="load()"><PosIcon name="refresh" />{{t("刷新")}}</button><button type="button" class="primary" :disabled="busy" @click="open()"><PosIcon name="plus" />{{t("新建分类")}}</button></div></div></form>

  <p v-if="error && !dialog?.open" class="error" role="alert" tabindex="-1">{{ t(error) }}</p>
  <ListTable selectable v-model:selected-ids="selectedIds" storage-key="categories" :rows="visibleRows" :columns="columns" :busy="busy" :filtered="!!appliedKeyword || !!selectedId" empty-text="尚无分类，请新建分类。" label="商品分类">
<template #name="{row}"><div class="category-name-cell" :style="{paddingLeft:row.depth*16+'px'}"><button v-if="row.children" type="button" :aria-expanded="expanded.includes(row.id)||!!appliedKeyword" :aria-label="t(expanded.includes(row.id)?'收起':'展开')+row.name" @click="toggleRow(row.id)"><PosIcon :name="expanded.includes(row.id)||appliedKeyword?'down':'arrow'" /></button><span v-else class="tree-indent" />{{row.name}}</div></template>
<template #count="{row}"><span class="category-count">{{productCounts.get(row.id)||0}}</span></template>
<template #level="{row}"><span>{{t('第 {0} 级',[row.level || row.depth+1])}}</span><small v-if="row.is_leaf">{{t('末级')}}</small></template>
<template #state="{row}"><span :class="row.effective_active===false?'branch-tag':'leaf-tag'">{{t(row.effective_active===false?'停用':'启用')}}</span><small v-if="row.active!==false && row.effective_active===false">{{t('上级已停用')}}</small></template>
<template #actions="{row}"><div class="category-row-actions"><button :disabled="busy" @click="open(row)">{{t('编辑')}}</button><button :disabled="busy" @click="setActive(row)">{{t(row.active===false?'启用':'停用')}}</button><span :title="!row.is_leaf?t('含下级，无法删除'):row.product_count?t('含商品，无法删除'):undefined"><button class="danger-text" :disabled="busy||!row.is_leaf||!!row.product_count" @click="remove(row)">{{t('删除')}}</button></span></div></template>
</ListTable>
  </div></div>
  <dialog ref="dialog" class="category-dialog" @cancel.prevent="closeEditor"><header><button type="button" :disabled="busy" @click="closeEditor"><PosIcon name="prev" />{{t("返回")}}</button><h3>{{editing?t("编辑分类"):t("新建分类")}}</h3><button :form="categoryFormId" class="primary" :disabled="busy" type="submit">{{busy?t("保存中…"):t("保存")}}</button></header><form :id="categoryFormId" class="editor-form" @submit.prevent="save"><p v-if="error" class="error" role="alert" tabindex="-1">{{t(error)}}</p><label>{{ t("分类名称 *") }}<ElInput v-model="name" required maxlength="80" autofocus /></label><CategoryTransfer v-model="parentId" :categories="rows" parent-mode :disabled-ids="disabledParents" /><p class="hint">{{ t("选择上级后会移动整个分类；不能移动到自身或下级。") }}</p></form></dialog>
</section>
</template>
<style scoped>
.category-manage{padding:16px 18px}.management-page-title{display:flex;align-items:center;justify-content:space-between;gap:24px;margin-bottom:14px}.management-page-title h2{margin:0 0 5px;font-size:20px}.management-page-title p{margin:0;color:var(--theme-muted, #71809a);font-size:13px}.category-filter{display:flex;align-items:flex-end;gap:12px;padding:14px 16px;border:1px solid var(--theme-line, #d9e2ef);border-bottom:0;background:var(--theme-surface, #fff)}.category-filter label{display:grid;grid-template-columns:auto minmax(260px,380px);align-items:center;gap:12px;font-size:13px;color:var(--theme-ink, #475b76)}.category-filter input{width:100%;height:36px;box-sizing:border-box}.category-filter-actions{display:flex;align-items:center;gap:8px}.category-filter-actions button{height:36px;min-height:36px}.category-table-wrap{overflow:auto;border:1px solid var(--theme-line, #d5deeb);background:var(--theme-surface, #fff)}.category-table-wrap table{width:100%;table-layout:fixed;border-collapse:collapse}.category-table-wrap .sequence-column{width:76px}.category-table-wrap .name-column{width:220px}.category-table-wrap .count-column{width:120px}.category-table-wrap .status-column{width:140px}.category-table-wrap .operation-column{width:160px}.category-table-wrap th,.category-table-wrap td{height:46px;padding:0 14px;border-right:1px solid var(--theme-line, #d5deeb);border-bottom:1px solid var(--theme-line, #d5deeb);text-align:left;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.category-table-wrap th{background:var(--theme-subtle, #f1f4f8);color:var(--theme-muted, #52627c);font-weight:500}.category-table-wrap th:first-child,.category-table-wrap td:first-child{text-align:center}.leaf-tag,.branch-tag{padding:3px 8px;border-radius:2px;font-size:12px}.leaf-tag{color:#16815a;background:var(--theme-subtle, #e9f8f1)}.branch-tag{color:var(--theme-muted, #52627c);background:var(--theme-subtle, #edf1f6)}.text-action{border:0;background:transparent;color:var(--theme-text-accent, #1762d7);padding:6px 10px}.danger-text{color:#c43e45}.empty-cell{text-align:center!important;color:var(--theme-muted, #8190a7)}.category-dialog{width:min(520px,calc(100vw - 32px));padding:0;border:1px solid var(--theme-line, #ccd7e7);border-radius:8px}.category-dialog::backdrop{background:rgb(20 39 66/.42)}.category-dialog header{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid var(--theme-line, #e1e7f0)}.category-dialog h3{margin:0}.category-dialog header button{border:0;background:transparent}.category-dialog form{display:grid;gap:12px;padding:16px}.category-dialog label{display:grid;grid-template-columns:100px minmax(0,1fr);align-items:center;gap:12px}.category-dialog :is(input,select){box-sizing:border-box;width:100%;height:38px}.category-dialog .hint{margin:0 0 0 112px}.category-dialog footer{display:flex;justify-content:flex-end;gap:10px;padding-top:16px;border-top:1px solid var(--theme-line, #e8edf4)}@media(max-width:720px){.management-page-title{align-items:flex-start}.category-filter{align-items:stretch;flex-direction:column}.category-filter label{grid-template-columns:1fr}.category-filter-actions{justify-content:flex-start}.category-dialog label{grid-template-columns:1fr}.category-dialog .hint{margin-left:0}}
.category-navigation{border:1px solid var(--theme-line, #dce3ed);background:var(--theme-surface, white);border-radius:4px;overflow:hidden}.category-navigation h3{font-size:14px;padding:14px;margin:0;border-bottom:1px solid var(--theme-line, #e4eaf2)}.category-list-content{min-width:0}.category-filter label{grid-template-columns:auto minmax(120px,280px)}.category-table-tools{display:flex;gap:12px;padding:8px 12px;background:var(--theme-surface, #fff);border:1px solid var(--theme-line, #dce3ed);border-bottom:0}.category-table-tools button{font-size:12px;background:none;border:0;min-height:28px}.category-name-cell{display:flex;align-items:center;white-space:nowrap;gap:6px}.category-name-cell button,.tree-indent{width:22px;flex:0 0 22px}.category-name-cell button{border:0;background:none;padding:0;min-height:26px}.category-dialog{width:min(820px,94vw)}.category-dialog form>.hint{margin:0}.category-dialog :deep(.category-transfer){margin:0}.category-dialog :deep(.tree-search input){height:34px}
#app .category-table-wrap table{min-width:980px}#app .category-table-wrap th,#app .category-table-wrap td{border:1px solid var(--theme-line, #dce3ed)}.category-dialog{max-height:calc(100dvh - 32px);overflow:auto}

/* Keep the category toolbar and table independent of generic list button rules. */
#app .category-manage .category-filter{align-items:center;flex-wrap:wrap;gap:12px;padding:14px 16px;margin:0 0 12px;border:1px solid var(--theme-line,#d9e2ef);border-radius:4px}
#app .category-manage .category-filter label{display:flex;align-items:center;gap:12px;min-width:0;margin:0}
#app .category-manage .category-filter label>span{white-space:nowrap}
#app .category-manage .category-filter input{width:clamp(180px,22vw,320px);height:36px;min-height:36px;margin:0;padding:0 12px}
#app .category-manage .category-filter button{height:36px;min-height:36px;padding:0 14px;margin:0;display:inline-flex;align-items:center;justify-content:center;gap:6px;font-size:13px;line-height:1;box-sizing:border-box}
#app .category-manage .category-table-tools{margin-left:auto;padding:0;border:0;display:flex;gap:8px;background:transparent}
#app .category-manage .category-table-tools button{border:1px solid var(--theme-line,#d9e2ef);border-radius:4px;background:var(--theme-surface,#fff);color:var(--theme-muted,#52627c)}
#app .category-manage :deep(.list-table th){height:42px;background:var(--theme-subtle,#f1f4f8);font-size:13px}
#app .category-manage :deep(.list-table td){height:48px;padding:8px 14px;vertical-align:middle}
#app .category-manage :deep(.list-table th[data-column="count"]),#app .category-manage :deep(.list-table th[data-column="level"]),#app .category-manage :deep(.list-table .cell-actions){text-align:center}
#app .category-manage :deep(.list-table td[data-column="count"] .cell-content),#app .category-manage :deep(.list-table td[data-column="level"] .cell-content){text-align:center}
#app .category-manage .category-row-actions{display:flex;align-items:center;justify-content:center;gap:8px}
#app .category-manage .category-row-actions button{height:30px;min-height:30px;margin:0;padding:0 10px;border:1px solid var(--theme-line,#d9e2ef);border-radius:4px;background:var(--theme-surface,#fff);font-size:13px;color:var(--theme-text-accent,#1762d7)}
#app .category-manage .category-row-actions .danger-text{color:#b4232d;border-color:#edc9cb}
#app .category-manage .category-row-actions button:disabled{color:#92979e;border-color:#e3e5e8;background:#f5f6f7;opacity:1;cursor:not-allowed}
#app .category-manage .category-name-cell button{width:22px;min-height:24px;height:24px;margin:0;padding:0;flex:0 0 22px}
@media(max-width:720px){#app .category-manage .category-filter{align-items:stretch}#app .category-manage .category-filter label{width:100%}#app .category-manage .category-filter input{flex:1;width:0}#app .category-manage .category-table-tools{margin-left:0}}

</style>
