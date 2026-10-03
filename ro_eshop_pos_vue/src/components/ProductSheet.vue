<script setup lang="ts">
import { t } from "../i18n";
import { computed, nextTick, ref, watch } from 'vue';
import { parseClipboardMatrix, stripProductHeader } from '../productClipboard';
import ListPagination from './ListPagination.vue';
import PosIcon from './PosIcon.vue';
type Row=Record<string,any>;
const props=defineProps<{modelValue:Row[];fields:string[][];busy?:boolean;validation?:{product_data:Row[]}|null}>();
const emit=defineEmits<{ 'update:modelValue':[rows:Row[]]; pasted:[] }>();
const root=ref<HTMLElement|null>(null),page=ref(1),size=ref(20),active=ref({row:0,col:0}),message=ref('');
const rows=computed(()=>Array.from({length:Math.max(5,props.modelValue.length)},(_,index)=>props.modelValue[index] || {}));
const visible=computed(()=>rows.value.slice((page.value-1)*size.value,page.value*size.value));
const reports=computed(()=>new Map((props.validation?.product_data || []).map(row=>[Number(row.row_number),row])));
const coordinate=computed(()=>`${String.fromCharCode(65+active.value.col)}${active.value.row+1}`);
watch(()=>rows.value.length,length=>{page.value=Math.min(page.value,Math.ceil(length/size.value));active.value.row=Math.min(active.value.row,length-1);});
function nonempty(row:Row){return props.fields.some(([key])=>String(row[key]??'').trim());}
function report(index:number){return reports.value.get(index+1);}
function cellError(index:number,key:string){return report(index)?.field_errors?.[key]?.map((message:string)=>t(message)).join('; ') || '';}
function status(index:number){return !nonempty(rows.value[index])?'空白行':report(index)?.errors?.map((message:string)=>t(message)).join('; ') || (report(index)?'校验通过':'待校验');}
function commit(value:Row[]){emit('update:modelValue',value.map((row,index)=>({...row,row_number:index+1})));}
function edit(row:number,key:string,value:string){if(props.busy)return;const copy=rows.value.map(r=>({...r}));copy[row][key]=value;commit(copy);}
async function focus(row:number,col:number){
  await nextTick();
  row=Math.max(0,Math.min(rows.value.length-1,row));col=Math.max(0,Math.min(props.fields.length-1,col));
  active.value={row,col};page.value=Math.floor(row/size.value)+1;await nextTick();
  const cell=root.value?.querySelector<HTMLTextAreaElement>(`[data-row="${row}"][data-col="${col}"]`);cell?.focus();cell?.select();
}
function addRow(){if(props.busy || rows.value.length>=500)return;const copy=rows.value.map(r=>({...r}));copy.push({});commit(copy);void focus(copy.length-1,0);}
function removeRow(){if(props.busy)return;const copy=rows.value.map(r=>({...r}));copy.splice(active.value.row,1);commit(copy);void focus(active.value.row,active.value.col);}
function keydown(event:KeyboardEvent,row:number,col:number){
  if(props.busy || event.isComposing || event.ctrlKey || event.metaKey || event.altKey)return;
  const target=event.target as HTMLTextAreaElement;let r=row,c=col;
  if(event.key==='Tab'){c+=event.shiftKey?-1:1;if(c===props.fields.length){c=0;r++;}if(c<0){c=props.fields.length-1;r--;}if(r<0 || r>=rows.value.length)return;}
  else if(event.key==='Enter' || event.key==='ArrowDown')r+=event.shiftKey && event.key==='Enter'?-1:1;
  else if(event.key==='ArrowUp')r--;
  else if(event.key==='ArrowLeft' && target.selectionStart===0)c--;
  else if(event.key==='ArrowRight' && target.selectionEnd===target.value.length)c++;
  else return;
  event.preventDefault();void focus(r,c);
}
function paste(event:ClipboardEvent,row:number,col:number){
  if(props.busy)return;event.preventDefault();message.value='';
  try{
    let matrix=parseClipboardMatrix(event.clipboardData?.getData('text/plain') || '');
    if(col===0)matrix=stripProductHeader(matrix);
    if(!matrix.length)throw new Error('请复制表头下方的商品数据');
    if(row+matrix.length>500)throw new Error('粘贴后超过 500 行，请分批录入');
    if(matrix.some(r=>col+r.length>props.fields.length))throw new Error('粘贴内容超出右侧列边界，请从更靠左的单元格粘贴');
    const copy=rows.value.map(r=>({...r}));
    while(copy.length<row+matrix.length)copy.push({});
    matrix.forEach((cells,i)=>cells.forEach((value,j)=>copy[row+i][props.fields[col+j][0]]=value));
    commit(copy);emit('pasted');
  }catch(e){message.value=(e as Error).message;}
}
function locateError(index:number){const keys=Object.keys(report(index)?.field_errors || {});void focus(index,Math.max(0,props.fields.findIndex(([key])=>keys.includes(key))));}
</script>
<template>
<section ref="root" class="product-sheet" :aria-label="t('商品编辑表格')" :aria-busy="busy">
  <div class="sheet-tools"><strong class="sheet-coordinate">{{coordinate}}</strong><span>{{ t("选中格子直接粘贴，Tab 横移，Enter 下移") }}</span><div><button type="button" :disabled="busy || rows.length>=500" @click="addRow"><PosIcon name="plus" />{{ t("新增行") }}</button><button type="button" :disabled="busy" @click="removeRow">{{ t("删除第 {0} 行", [active.row+1]) }}</button></div></div>
  <p v-if="message" class="error sheet-error" role="alert">{{ t(message) }}</p>
  <div class="sheet-scroll"><table :aria-label="t('商品可编辑网格')"><colgroup><col style="width:56px" /><col v-for="[key] in fields" :key="key" :style="{width:key==='eshop_categ_name'?'250px':key==='description_sale'?'230px':key==='sale_price'?'120px':'175px'}" /><col style="width:240px" /></colgroup>
    <thead><tr><th scope="col">{{ t("行号") }}</th><th v-for="([key,label],col) in fields" :key="key" scope="col"><span class="sheet-letter">{{String.fromCharCode(65+col)}}</span>{{ t(label) }}<span v-if="col<3" class="sheet-required"> *</span></th><th scope="col">{{ t("校验结果") }}</th></tr></thead>
    <tbody><tr v-for="(row,offset) in visible" :key="(page-1)*size+offset"><th scope="row" :class="{'sheet-active-row':active.row===(page-1)*size+offset}">{{(page-1)*size+offset+1}}</th>
      <td v-for="([key,label],col) in fields" :key="key" :class="{'sheet-invalid':cellError((page-1)*size+offset,key)}"><textarea rows="1" :value="row[key]??''" :disabled="busy" :data-row="(page-1)*size+offset" :data-col="col" :aria-label="t('{0} 第 {1} 行', [t(label), (page-1)*size+offset+1])" :aria-invalid="!!cellError((page-1)*size+offset,key)" :title="cellError((page-1)*size+offset,key) || String(row[key]??'')" spellcheck="false" @focus="active={row:(page-1)*size+offset,col}" @input="edit((page-1)*size+offset,key,($event.target as HTMLTextAreaElement).value)" @keydown="keydown($event,(page-1)*size+offset,col)" @paste="paste($event,(page-1)*size+offset,col)" /></td>
      <td class="sheet-validation"><button v-if="report((page-1)*size+offset)?.errors?.length" type="button" :disabled="busy" @click="locateError((page-1)*size+offset)">{{ t(status((page-1)*size+offset)) }}</button><span v-else :class="{'preview-success':report((page-1)*size+offset)}">{{ t(status((page-1)*size+offset)) }}</span></td>
    </tr></tbody>
  </table></div>
  <ListPagination :page="page" :page-size="size" :total="rows.length" :busy="busy" @change="(p,s)=>{page=p;size=s}" />
  <p class="sheet-help">{{ t("空白行不提交；分类填写完整路径；条码保留前导零。每批最多 500 行。") }}</p>
</section>
</template>
<style scoped>
#app .product-sheet{min-width:0;width:100%;font-size:13px}
#app .sheet-tools{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:10px 12px;border:1px solid var(--theme-line, #cfd7e3);border-bottom:0;background:var(--theme-surface, #f5f7fa);color:var(--theme-muted, #526074)}
#app .sheet-coordinate{min-width:44px;background:var(--theme-surface, white);border:1px solid var(--theme-line, #d6dce5);text-align:center;padding:5px;color:var(--theme-text-accent, #285bd4);font-variant-numeric:tabular-nums}
#app .sheet-tools>div{margin-left:auto;display:flex;gap:8px}
#app .sheet-tools button{display:inline-flex;align-items:center;gap:5px;padding:5px 10px;min-height:30px;font-size:13px}
#app .sheet-scroll{overflow:auto;max-height:clamp(150px,calc(100dvh - 580px),380px);border:1px solid var(--theme-line, #cfd7e3);background:var(--theme-surface, white)}
#app .product-sheet table{table-layout:fixed;width:100%;min-width:1620px;border-spacing:0;border-collapse:separate}
#app .product-sheet :is(th,td){border:0;border-right:1px solid var(--theme-line, #d6dce5);border-bottom:1px solid var(--theme-line, #d6dce5);padding:0;text-align:left;height:38px;background:var(--theme-surface, white);box-sizing:border-box}
#app .product-sheet thead th{position:sticky;top:0;z-index:2;padding:8px 10px;background:var(--theme-surface, #f2f5f9);color:var(--theme-ink, #41536b);font-size:13px;font-weight:500;white-space:nowrap}
#app .product-sheet tr> :first-child{position:sticky;left:0;background:var(--theme-surface, #f2f5f9);text-align:center;color:var(--theme-muted, #607086);font-weight:400;z-index:1}
#app .product-sheet thead tr> :first-child{z-index:3}
#app .product-sheet tr> :last-child{border-right:0}
#app .product-sheet .sheet-letter{display:inline-block;margin-right:10px;color:var(--theme-muted, #65758b);font-size:11px}
#app .sheet-required{color:#b42318}
#app .product-sheet textarea{display:block;box-sizing:border-box;resize:none;margin:0;border:0;border-radius:0;min-width:0;width:100%;min-height:38px;height:38px;padding:9px 10px;line-height:20px;background:transparent;box-shadow:none;font:inherit;color:var(--theme-ink, #303b4d);overflow:hidden}
#app .product-sheet textarea:focus{outline:2px solid var(--theme-accent, #285bd4);outline-offset:-2px;background:var(--theme-surface, #f5f9ff)}
#app .product-sheet .sheet-invalid{background:var(--theme-surface, #fff3f1);box-shadow:inset 0 -2px #c63c30}
#app .product-sheet .sheet-invalid textarea{color:#a52c22}
#app .product-sheet .sheet-active-row{background:var(--theme-subtle, #e8f0ff);color:var(--theme-text-accent, #2454b1)}
#app .product-sheet .sheet-validation{padding:8px 10px;color:var(--theme-muted, #65758b);font-size:12px}
#app .sheet-validation button{border:0;background:none;padding:0;min-height:22px;font-size:12px;text-align:left;color:#a52c22;white-space:normal}
#app .sheet-help{font-size:12px;color:var(--theme-muted, #526074);margin:10px 0 0}
#app .sheet-error{margin:0;padding:10px 12px;border:1px solid var(--theme-line, #d6dce5)}
#app .product-sheet .list-pagination{border-color:var(--theme-line, #cfd7e3)}
</style>
