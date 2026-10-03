<script setup lang="ts">
import '../../pure-admin.css';
import { computed, onMounted, ref, watch, useId } from 'vue';
import { ElInput } from 'element-plus';
import 'element-plus/es/components/input/style/css';
import BulkStatusActions from './BulkStatusActions.vue';
import CategoryTree from './CategoryTree.vue';
import ProductEditFields from './ProductEditFields.vue';
import BusinessTranslationEditor from './BusinessTranslationEditor.vue';
import ListExport from '../../components/ListExport.vue';
import ListTable from '../../components/ListTable.vue';
import ListPagination from '../../components/ListPagination.vue';
import ProductCreate from './ProductCreate.vue';
import ManagementDialog from '../../components/ManagementDialog.vue';
import PosIcon from '../../components/PosIcon.vue';
import { api,errorText,money,notice } from '../../api';
import { activeCurrency } from '../../currency';
import { t } from '../../i18n';
import { productAttributes } from '../../productVariants';
import { useUnsavedForm } from '../../formEditing';
import { useListState } from '../../listState';
const props=defineProps<{kind?:string;initialCreate?:boolean}>();
const kind:string='product',title='商品管理',listOperation:Record<string,string>={product:'manage_products'},states:Record<string,string>={};
const emit=defineEmits(['close','saved','busy']);
const editorFormId=useId(),profileDirection='forward';
const busy=ref(false),error=ref(''),creating=ref(false),creationBusy=ref(false),translating=ref<any>(null);
const form=ref<any>(null),pending=ref<any>(null),canEdit=ref(true);
const keyword=ref(''),appliedKeyword=ref(''),page=ref(1),total=ref(0),pageSize=ref(20),rows=ref<any[]>([]),categories=ref<any[]>([]);
const categoryFilter=ref(0),categoriesCollapsed=ref(false),selectedIds=ref<(number|string)[]>([]),sortKey=ref(''),sortDirection=ref('');
const productCreate=ref<InstanceType<typeof ProductCreate>|null>(null),productFields=ref<InstanceType<typeof ProductEditFields>|null>(null),translationEditor=ref<InstanceType<typeof BusinessTranslationEditor>|null>(null);
const readOnly=computed(()=>!canEdit.value);
const columns=[{key:'name',label:'商品',width:'220px'},{key:'barcode',label:'条码',width:'160px'},{key:'value',label:'售价',width:'120px',align:'right'},{key:'detail',label:'分类',width:'200px'},{key:'active',label:'状态',width:'100px'},{key:'actions',label:'操作',width:'180px'}];
const exportColumns=[{key:'name',label:'商品名称'},{key:'barcode',label:'条码'},{key:'default_code',label:'商品编码'},{key:'sale_price',label:'售价'},{key:'currency_code',label:'币种'},{key:'eshop_categ_name',label:'分类'},{key:'active',label:'状态'}];
const exportRows=computed(()=>rows.value.map(row=>({...row,currency_code:activeCurrency.value})));
const sortableKeys=['name','value'];
watch([busy,creationBusy],()=>emit('busy',busy.value||creationBusy.value),{flush:'sync'});
async function search(target=1,apply=true){if(busy.value)return;if(apply)appliedKeyword.value=keyword.value.trim();busy.value=true;error.value='';try{const data=await api('manage_products',{keyword:appliedKeyword.value,category_id:categoryFilter.value,page:target,page_size:pageSize.value,sort_key:sortKey.value,sort_direction:sortDirection.value});rows.value=data.product_data;categories.value=data.category_data||[];total.value=data.total;page.value=data.page;pageSize.value=data.page_size;}catch(e){error.value=errorText(e);}finally{busy.value=false;}}
function selectCategory(id:number){if(busy.value)return;categoryFilter.value=id;selectedIds.value=[];void search(1,false);}
function paginate(target:number,size:number){pageSize.value=size;void search(target,false);}
function changeSort(key:string,direction:string){sortKey.value=direction?key:'';sortDirection.value=direction;void search(1,false);}
async function edit(row:any){busy.value=true;error.value='';try{form.value=await api('product_detail',{id:row.id});form.value.variant_data.forEach((v:any)=>v.sale_price=Number(v.sale_price).toFixed(2));}catch(e){error.value=errorText(e);}finally{busy.value=false;}}
async function save(){if(busy.value||!await productFields.value?.validate())return;busy.value=true;error.value='';try{const f=form.value;await api('product_save',{id:f.id,name:f.name,sub_title:f.sub_title,eshop_categ_id:f.eshop_categ_id,variant_data:f.variant_data.map((row:any)=>({...row,sale_price:Number(row.sale_price),attribute_data:productAttributes(row.attribute_data)}))});form.value=null;notice.value='保存成功';emit('saved');}catch(e){error.value=errorText(e);}finally{busy.value=false;}if(!form.value)await search(page.value,false);}
function create(){creating.value=true;}
async function closeCreation(){await productCreate.value?.close();}
async function created(){creating.value=false;creationBusy.value=false;emit('saved');await search();}
async function translationSaved(){translating.value=null;emit('saved');await search(page.value,false);}
async function bulkSaved(){selectedIds.value=[];await search(page.value,false);emit('saved');}
const {close:closeForm,dirty:formDirty}=useUnsavedForm(form);
useListState('business-product',{keyword,appliedKeyword,page,pageSize,sortKey,sortDirection,categoryFilter,categoriesCollapsed});
watch([keyword,page,pageSize],()=>selectedIds.value=[]);
onMounted(async()=>{await search(page.value,false);if(props.initialCreate)create();});
defineExpose({refresh:()=>search(page.value,false)});
</script>
<template><div class="pure-admin-page content-switch-stage" :class="{ 'switch-backward': false }">
  <Transition name="content-switch" @before-leave="el => (el as HTMLElement).inert = true" @before-enter="el => (el as HTMLElement).inert = false">
  <section  class="management-page business-manage-page" :class="{'inventory-page':true}" :data-kind="kind" :aria-label="t(title)">
    <div class="business-manage-body" :aria-busy="busy || creationBusy">
      <BusinessTranslationEditor ref="translationEditor" v-if="translating" embedded :product-id="translating.id" @busy="creationBusy=$event" @close="translating=null" @saved="translationSaved" /><template v-else>
      <ManagementDialog :open="creating" :title="t('商品新建')" :busy="creationBusy" @close="closeCreation">
        <ProductCreate ref="productCreate"  embedded @busy="creationBusy = $event" @close="creating = false" @created="created" />
      </ManagementDialog><p v-if="error && pending" class="error" role="alert" tabindex="-1">{{ t(error) }}</p><div v-if="pending" class="payment-warning"><p>{{ t("上次保存结果待确认，请核实原请求后再修改。") }}</p><button :disabled="busy || !canEdit" @click="save()">{{ t("核实 / 重试原保存") }}</button></div><div :class="{'product-category-layout':true,'categories-collapsed':categoriesCollapsed}"><aside  v-show="!categoriesCollapsed" class="product-category-nav"><h3 class="category-nav-heading"><span>{{t("商品分类")}}</span><button type="button" :aria-label="t('收起分类')" :aria-expanded="true" @click="categoriesCollapsed=true"><PosIcon name="prev" />{{t("收起")}}</button></h3><CategoryTree storage-key="products" :model-value="categoryFilter" @update:model-value="selectCategory" :categories="categories" :disabled="busy" all /></aside><div class="product-list-content">
        <form class="management-search list-filter" @submit.prevent="search()"><div class="filter-fields"><label>{{ t("商品搜索") }}<ElInput v-model="keyword" :disabled="busy" :placeholder="t('商品名称、条码、编码')" /></label></div><div class="list-toolbar"><div class="list-actions"><button v-if="categoriesCollapsed" type="button" :aria-expanded="false" @click="categoriesCollapsed=false"><PosIcon name="arrow" />{{t("展开分类")}}</button><button :disabled="busy" class="primary action-with-icon"><PosIcon name="search" />{{ t("查询") }}</button><button type="button" :disabled="busy" @click="keyword = ''; categoryFilter=0; search()">{{ t("重置") }}</button></div><div class="list-actions"><BulkStatusActions  entity="product" :ids="selectedIds" :disabled="busy || !canEdit" @busy="busy=$event" @saved="bulkSaved" @clear="selectedIds=[]" /><ListExport :rows="exportRows" :columns="exportColumns" :label="title" :hide-selection="true" :selected-ids="selectedIds" @clear="selectedIds=[]" :operation="listOperation[kind]" :values="{keyword:appliedKeyword,sort_key:sortKey,sort_direction:sortDirection}" :busy="busy" /><button type="button" :disabled="busy" @click="search(page,false)"><PosIcon name="refresh" />{{ t("刷新") }}</button><button v-if="true || canEdit" type="button" :disabled="busy || !!pending" @click="create" class="primary"><PosIcon name="plus" />{{ t("新建商品") }}</button></div></div></form><ListTable :storage-key="'business-'+kind" selectable v-model:selected-ids="selectedIds" :page="page" :page-size="pageSize" :sort-key="sortKey" :sort-direction="sortDirection" :sortable-keys="sortableKeys" @sort="changeSort" :rows="rows" :columns="columns" :busy="busy" :error="form ? '' : error" :filtered="!!appliedKeyword || !!categoryFilter" :empty-text="'尚无商品，请新建商品。'" :label="t(title)" @retry="search(page,false)">
          <template #name="{row}"><b >{{row.name}}</b><small>{{row.product_attrs || row.default_code}}</small></template><template #barcode="{row}">{{row.barcode || '—'}}</template><template #active="{row}">{{t(row.active===false?'停用':'启用')}}</template><template #value="{row}">{{money(row.sale_price)}}</template><template #detail="{row}"><span :class="{'product-category-text':true}">{{row.eshop_categ_name}}</span></template><template #actions="{row}"><button  :class="{'product-row-action product-edit-action':true}" :disabled="busy || !!pending" @click="edit(row)"><PosIcon  :name="canEdit?'note':'search'" />{{canEdit?t("编辑"):t("查看")}}</button><button v-if="canEdit" class="product-row-action product-translate-action" :disabled="busy || !!pending" @click="translating=row"><PosIcon name="language" />{{ t("翻译") }}</button></template>
        </ListTable><ListPagination :page="page" :page-size="pageSize" :total="total" :busy="busy" @change="paginate" />
      </div>
      </div><ManagementDialog :open="!!form" :error="error" :class="{'product-edit-dialog':true}" :title="t(title) + ' · ' + (form?.id ? t('编辑详情') : t('新建商品'))" :busy="busy || creationBusy" @close="closeForm"><template #actions><button type="submit" :form="editorFormId" v-if="!readOnly" class="primary" :disabled="busy || creationBusy">{{ busy ? t("保存中…") : t("保存") }}</button></template><p v-if="error" class="error" role="alert" tabindex="-1">{{ t(error) }}</p><form v-if="form" :id="editorFormId" class="editor-form" @submit.prevent="save()">
        <ProductEditFields ref="productFields"  :form="form" :categories="categories" :disabled="busy || readOnly" @busy="creationBusy=$event" />

      </form>
      </ManagementDialog>
      </template>
    </div>
  </section>
  </Transition>
  </div></template>

<style scoped>
.product-row-action :deep(.icon){width:16px;height:16px;flex-shrink:0}

.product-category-text{display:block;white-space:normal;overflow-wrap:anywhere;line-height:1.5}

.product-category-nav{min-height:300px;border:1px solid var(--theme-line, #dce3ed);background:var(--theme-surface, #fff);border-radius:4px;overflow:hidden}.product-category-nav h3{font-size:14px;padding:14px;margin:0;border-bottom:1px solid var(--theme-line, #e4eaf2)}.product-list-content{min-width:0}.product-category-field{grid-column:1 / -1;min-width:0}.product-category-field>span{font-size:13px}
#app .product-list-content :deep(.list-table-scroll table){min-width:920px}

</style>
