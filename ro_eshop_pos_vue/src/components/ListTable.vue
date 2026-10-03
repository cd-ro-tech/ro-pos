<script setup lang="ts">
import ListExport from './ListExport.vue';
import PosIcon from "./PosIcon.vue";
import { t } from "../i18n";
import '../lists.css';
import { useListState } from '../listState';
import { computed, ref, watch, onBeforeUnmount, nextTick } from 'vue';
const props=withDefaults(defineProps<{summary?:Record<string,string[]>;storageKey?:string;filtered?:boolean;emptyText?:string;selectable?:boolean;selectedIds?:(number|string)[];page?:number;pageSize?:number;sortKey?:string;sortDirection?:string;sortableKeys?:string[];rows:any[];columns:{key:string;label:string;width?:string;align?:string}[];busy?:boolean;error?:string;rowKey?:string;label?:string}>(),{filtered:false,emptyText:'暂无记录。',selectable:false,selectedIds:()=>[],page:1,pageSize:20,sortKey:'',sortDirection:'',sortableKeys:()=>[],busy:false,error:'',rowKey:'id',label:'数据列表'});
const emit=defineEmits(['retry','sort','update:selectedIds']);

const scroll=ref<HTMLElement>(),scrollPosition=ref({top:0,left:0});
let restoreScroll=props.storageKey ? useListState('table-'+props.storageKey,{scrollPosition}) : false;
watch(()=>[props.busy,props.rows],async()=>{if(!restoreScroll || props.busy || !props.rows.length)return;await nextTick();scroll.value?.scrollTo(scrollPosition.value);restoreScroll=false;},{flush:'post',immediate:true});
function rememberScroll(){if(!restoreScroll && scroll.value)scrollPosition.value={top:scroll.value.scrollTop,left:scroll.value.scrollLeft};}
function dateParts(value:unknown){const text=String(value??'—');const match=text.match(/^(\d{4})[年/-](\d{1,2})[月/-](\d{1,2})日?[ T]+(\d{1,2}:\d{2}(?::\d{2})?)/);return match?[`${match[1]}-${match[2].padStart(2,'0')}-${match[3].padStart(2,'0')}`,match[4]]:[text];}
const dateKeys=['created_at','offline_at','date','time','payment_date'];
const table = ref<HTMLTableElement>();
const widths = ref<Record<string, number>>({});
const widthKey = computed(() => 'ro-pos-column-widths:' + (props.storageKey || props.columns.map(c=>c.key).join('|')));
watch(widthKey, key => { try { const saved=JSON.parse(localStorage.getItem(key)||'{}'); widths.value=Object.fromEntries(Object.entries(saved).filter(([,v])=>typeof v==='number'&&v>=80&&v<=1600)) as Record<string,number>; } catch { widths.value={}; } }, {immediate:true});
const minimumWidth=computed(()=>44+(props.columns.some(c=>c.key==='row_number')?0:64)+props.columns.reduce((n,c)=>n+(parseInt(c.width||'')||160),0));
const tableWidth = computed(() => Object.keys(widths.value).length ? 44 + (props.columns.some(c=>c.key==='row_number')?0:64) + props.columns.reduce((n,c)=>n+(widths.value[c.key]||parseInt(c.width||'')||160),0) : undefined);
function rememberWidths(){try{localStorage.setItem(widthKey.value,JSON.stringify(widths.value));}catch{/* Resizing remains usable when storage is unavailable. */}}
function measure(){const cells=table.value?.querySelectorAll<HTMLTableCellElement>('th[data-column]');cells?.forEach(cell=>{const key=cell.dataset.column!;if(!widths.value[key])widths.value[key]=Math.max(80,Math.round(cell.getBoundingClientRect().width));});}
let cleanup: (()=>void)|undefined;
function resize(event:PointerEvent,key:string){
 if(event.button!==0)return;cleanup?.();measure();
 const handle=event.currentTarget as HTMLElement,start=event.clientX,width=widths.value[key]||160;
 handle.setPointerCapture(event.pointerId);
 const move=(e:PointerEvent)=>{widths.value[key]=Math.max(80,Math.min(1600,width+e.clientX-start));};
 const finish=()=>{handle.removeEventListener('pointermove',move);handle.removeEventListener('pointerup',finish);handle.removeEventListener('pointercancel',finish);handle.removeEventListener('lostpointercapture',finish);if(handle.hasPointerCapture(event.pointerId))handle.releasePointerCapture(event.pointerId);rememberWidths();cleanup=undefined;};
 handle.addEventListener('pointermove',move);handle.addEventListener('pointerup',finish);handle.addEventListener('pointercancel',finish);handle.addEventListener('lostpointercapture',finish);cleanup=finish;
}
function resizeKey(event:KeyboardEvent,key:string){if(!['ArrowLeft','ArrowRight'].includes(event.key))return;event.preventDefault();measure();widths.value[key]=Math.max(80,Math.min(1600,(widths.value[key]||160)+(event.key==='ArrowRight'?16:-16)));rememberWidths();}
onBeforeUnmount(()=>cleanup?.());

const ownSelection=ref<(number|string)[]>([]);
const selection=computed(()=>props.selectable?props.selectedIds:ownSelection.value);
function updateSelection(ids:(number|string)[]){ownSelection.value=ids;emit('update:selectedIds',ids);}
watch(()=>[props.rows,props.page],()=>updateSelection([]));
const selectedSet=computed(()=>new Set(selection.value));
const pageIds=computed(()=>(props.rows.map(row=>row[props.rowKey]) as (number|string)[]).filter(id=>id!==undefined && id!==null));
const allSelected=computed(()=>pageIds.value.length>0 && pageIds.value.every(id=>selectedSet.value.has(id)));
const partlySelected=computed(()=>!allSelected.value && pageIds.value.some(id=>selectedSet.value.has(id)));
function selectRow(id:number|string,checked:boolean){if(props.busy || props.error)return;const next=new Set(selection.value);if(checked)next.add(id);else next.delete(id);updateSelection([...next]);}
function selectPage(checked:boolean){if(props.busy || props.error)return;const next=new Set(selection.value);pageIds.value.forEach(id=>checked?next.add(id):next.delete(id));updateSelection([...next]);}
function sort(key:string){emit('sort',key,props.sortKey!==key?'asc':props.sortDirection==='asc'?'desc':props.sortDirection==='desc'?'':'asc');}
function centered(c:{key:string;align?:string}){return c.align==='center'||(!c.align&&['state','state_name','status','count'].includes(c.key));}
function cellTitle(row:any,key:string){const v=row[key];return typeof v==='string'||typeof v==='number'?String(v):undefined;}
</script>
<template>
<div class="list-table" :class="{'is-empty':!rows.length && !busy && !error}" :aria-busy="busy">
  <div v-if="!selectable" class="table-export-toolbar"><ListExport :rows="rows" :columns="columns" :label="label" :row-key="rowKey" :selected-ids="ownSelection" :busy="busy || !!error" @clear="updateSelection([])" /></div>
  <div ref="scroll" class="list-table-scroll" tabindex="0" @scroll.passive="rememberScroll"><table ref="table" :style="{minWidth:(tableWidth || minimumWidth)+'px',...(tableWidth?{width:tableWidth+'px'}:{})}" :aria-label="t(label)"><colgroup><col style="width:44px" /><col v-if="!columns.some(c=>c.key==='row_number')" style="width:64px" /><col v-for="c in columns" :key="c.key" :style="{width:widths[c.key] ? widths[c.key]+'px' : c.width}" /></colgroup><thead><tr><th class="cell-select" scope="col"><input type="checkbox" :aria-label="t('全选当前页')" :checked="allSelected" :indeterminate="partlySelected" :disabled="busy || !!error || !rows.length" @change="selectPage(($event.target as HTMLInputElement).checked)" /></th><th v-if="!columns.some(c=>c.key==='row_number')" scope="col" class="cell-index">{{ t("序号") }}</th><th v-for="c in columns" :key="c.key" :data-column="c.key" :class="{ 'cell-number':c.align==='right','cell-actions':c.key==='actions','cell-center':centered(c),'cell-date':dateKeys.includes(c.key)}" :aria-sort="sortableKeys.includes(c.key)?(sortKey===c.key && sortDirection?(sortDirection==='asc'?'ascending':'descending'):'none'):undefined" scope="col"><button v-if="sortableKeys.includes(c.key)" class="column-sort" :disabled="busy" @click="sort(c.key)">{{ t(c.label) }}<span class="sort-arrows" aria-hidden="true"><i :class="{active:sortKey===c.key && sortDirection==='asc'}">▴</i><i :class="{active:sortKey===c.key && sortDirection==='desc'}">▾</i></span></button><template v-else>{{ t(c.label) }}</template><span class="column-resize" role="separator" tabindex="0" aria-orientation="vertical" :aria-label="t('调整列宽：{0}',[t(c.label)])" :aria-valuenow="widths[c.key] || 160" :aria-valuemin="80" :aria-valuemax="1600" @pointerdown.prevent.stop="resize($event,c.key)" @click.stop @keydown="resizeKey($event,c.key)" /></th></tr></thead>
  <tbody><tr v-for="(row,index) in rows" :key="row[rowKey] ?? index"><td class="cell-select"><input type="checkbox" :aria-label="t('选择第 {0} 行', [(page-1)*pageSize+index+1])" :checked="selectedSet.has(row[rowKey])" :disabled="busy || !!error || row[rowKey]==null" @change="selectRow(row[rowKey],($event.target as HTMLInputElement).checked)" /></td><td v-if="!columns.some(c=>c.key==='row_number')" class="cell-index">{{(page-1)*pageSize+index+1}}</td><td v-for="c in columns" :key="c.key" :data-column="c.key" :class="{'cell-number':c.align==='right','cell-actions':c.key==='actions','cell-center':centered(c),'cell-date':dateKeys.includes(c.key)}"><div class="cell-content" :title="cellTitle(row,c.key)"><slot :name="c.key" :row="row" :index="index"><template v-if="dateKeys.includes(c.key)"><span v-for="(part,n) in dateParts(row[c.key])" :key="n" class="date-part">{{part}}</span></template><template v-else>{{row[c.key] ?? '—'}}</template></slot></div></td></tr><tr class="list-space" :aria-hidden="rows.length || busy || error ? true : undefined"><td :colspan="columns.length + 1 + (columns.some(c=>c.key==='row_number') ? 0 : 1)"><div v-if="!rows.length && !busy && !error" class="list-empty" role="status"><PosIcon name="documents" aria-hidden="true" /><p>{{t(filtered?"未找到匹配记录":emptyText)}}</p><small v-if="filtered">{{t("请调整搜索条件")}}</small></div></td></tr></tbody><tfoot v-if="summary && !busy && !error"><tr class="list-summary"><td></td><td v-if="!columns.some(c=>c.key==='row_number')"></td><td v-for="(c,index) in columns" :key="c.key" :class="{'cell-number':c.align==='right'}"><span v-if="index===0" :title="t('当前筛选条件下的全部记录')">{{t('筛选合计')}}</span><strong v-for="(value,n) in summary[c.key] || []" :key="n">{{value}}</strong></td></tr></tfoot></table>
  </div>
  <div v-if="busy" class="list-feedback" role="status">{{ t("正在加载…") }}</div>
  <div v-else-if="error" class="list-feedback list-failure" role="alert"><p>{{ t(error) }}</p><button @click="$emit('retry')">{{ t("重新加载") }}</button></div>
</div>
</template>

<style scoped>
.list-summary td{position:sticky;bottom:0;background:var(--theme-surface,#fff);border-top:2px solid var(--theme-line,#dce3ed);padding:12px 16px;font-weight:600;white-space:nowrap}
.list-summary strong{display:block;font-variant-numeric:tabular-nums}

th[data-column]{position:relative;padding-right:18px}
.column-resize{position:absolute;right:-4px;top:0;bottom:0;width:9px;cursor:col-resize;touch-action:none;z-index:2;user-select:none}
.column-resize::after{content:'';position:absolute;left:4px;top:20%;bottom:20%;width:2px;background:transparent}
.column-resize:hover::after,.column-resize:focus-visible::after{background:var(--brand,#285bd4)}
.column-resize:focus-visible{outline:2px solid var(--brand,#285bd4);outline-offset:-2px}
</style>

<style scoped>
.table-export-toolbar{display:flex;justify-content:flex-end;padding:8px 12px;border-bottom:1px solid var(--theme-line,#dce3ec);flex-shrink:0}
</style>
