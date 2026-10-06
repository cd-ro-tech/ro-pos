<script setup lang="ts">
import { computed, nextTick, ref, useId } from 'vue';
import { currencies } from '../currencies';
import { locale, t } from '../i18n';
import PosIcon from './PosIcon.vue';
type CurrencyOption={currency_code:string;currency_name?:string;symbol?:string};
const props=defineProps<{modelValue:string;disabled?:boolean;options?:CurrencyOption[]}>();
const emit=defineEmits<{'update:modelValue':[value:string];change:[value:string]}>();
const id=useId(),dialog=ref<HTMLDialogElement>(),trigger=ref<HTMLButtonElement>(),search=ref<HTMLInputElement>(),query=ref(''),draft=ref('');
const options=computed(()=>props.options??currencies.map(c=>({currency_code:c.code,currency_name:c.name,symbol:c.symbol})));
function name(code:string,language:string=locale.value){try{return new Intl.DisplayNames([language],{type:'currency'}).of(code)||code;}catch{return code;}}
const searchable=computed(()=>options.value.map(row=>({...row,label:name(row.currency_code),searchText:[row.currency_code,row.currency_name,row.symbol,...['zh-CN','en-US','it-IT','es-ES','pt-PT'].map(lang=>name(row.currency_code,lang))].join(' ').toLocaleLowerCase()})));
const filtered=computed(()=>searchable.value.filter(row=>row.searchText.includes(query.value.trim().toLocaleLowerCase())));
const selected=computed(()=>options.value.find(row=>row.currency_code===props.modelValue));
async function open(){if(props.disabled)return;query.value='';draft.value=props.modelValue;dialog.value?.showModal();await nextTick();search.value?.focus();}
function close(){dialog.value?.close();trigger.value?.focus();}
function confirm(){if(props.disabled||!options.value.some(row=>row.currency_code===draft.value))return;emit('update:modelValue',draft.value);emit('change',draft.value);close();}
</script>
<template>
<button ref="trigger" type="button" class="currency-picker-trigger" :disabled="disabled" aria-haspopup="dialog" :aria-label="t('选择币种')+'：'+modelValue" @click="open"><span>{{modelValue}} · {{name(modelValue)}} <small v-if="selected?.symbol">{{selected.symbol}}</small></span><PosIcon name="search" /></button>
<Teleport to="body">
<dialog ref="dialog" class="currency-picker-dialog" :aria-labelledby="id+'-title'" @cancel.prevent.stop="close" @keydown.esc.stop>
<header><h2 :id="id+'-title'">{{t('选择币种')}}</h2></header>
<div class="currency-picker-search"><PosIcon name="search" /><input ref="search" v-model="query" :aria-label="t('搜索币种')" :placeholder="t('输入币种代码或名称')" @keydown.enter.prevent /></div>
<div class="currency-picker-list" role="radiogroup" :aria-label="t('币种')">
<label v-for="row in filtered" :key="row.currency_code" :class="{selected:draft===row.currency_code}"><input v-model="draft" type="radio" :name="id" :value="row.currency_code" :disabled="disabled" /><strong>{{row.currency_code}}</strong><span>{{row.label}}<small>{{row.currency_name}}</small></span><span class="currency-symbol">{{row.symbol}}</span></label>
<p v-if="!filtered.length" class="currency-picker-empty">{{t('暂无匹配记录，请调整搜索条件。')}}</p>
</div>
<footer><span>{{t('已选择')}}：<strong>{{draft}}</strong></span><div><button type="button" @click="close">{{t('取消')}}</button><button type="button" class="primary" :disabled="disabled||!options.some(row=>row.currency_code===draft)" @click="confirm">{{t('确认')}}</button></div></footer>
</dialog>
</Teleport>
</template>
<style>
.currency-picker-trigger{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;min-height:42px;padding:10px 12px;border:1px solid var(--theme-line, #c5d2e2);background:var(--theme-surface, #fff);border-radius:4px;color:var(--theme-ink, #253858);text-align:left}.currency-picker-trigger>span{display:inline-flex;align-items:center;gap:6px;text-align:left}.currency-picker-trigger small{margin-left:8px;color:var(--theme-muted, #60718a)}.currency-picker-trigger .icon{flex-shrink:0}.currency-picker-trigger:hover:not(:disabled){border-color:var(--theme-accent, #2856d9)}.currency-picker-trigger:disabled{opacity:.6;cursor:not-allowed}
.currency-picker-dialog{width:min(620px,calc(100vw - 32px));max-height:calc(100dvh - 40px);padding:0;border:0;border-radius:8px;background:var(--theme-surface, #fff);color:var(--theme-ink, #253858);overflow:hidden}.currency-picker-dialog[open]{display:flex;flex-direction:column}.currency-picker-dialog::backdrop{background:rgb(20 39 66 / .4)}.currency-picker-dialog header,.currency-picker-dialog footer{display:flex;align-items:center;justify-content:space-between;gap:16px;margin:0;padding:16px 20px;flex-shrink:0}.currency-picker-dialog header{border-bottom:1px solid var(--theme-line, #e1e7ef)}.currency-picker-dialog h2{margin:0;font-size:18px}.currency-picker-dialog header button{display:flex;border:0;background:transparent;padding:6px}.currency-picker-search{display:flex;align-items:center;gap:10px;margin:16px 20px;padding:0 12px;border:1px solid var(--theme-line, #c5d2e2);border-radius:4px;flex-shrink:0}.currency-picker-search:focus-within{outline:2px solid var(--theme-accent, #2856d9);outline-offset:1px}.currency-picker-dialog .currency-picker-search input:focus-visible{outline:none;box-shadow:none}
.currency-picker-search input{width:100%;min-width:0;height:42px;margin:0;border:0;background:transparent;outline:none;box-shadow:none;padding:8px 0}.currency-picker-list{overflow:auto;min-height:100px;height:min(380px,45dvh);padding:0 20px}.currency-picker-list label{display:flex;flex-direction:row;text-align:left;align-items:center;gap:12px;margin:0;padding:12px 10px;border-bottom:1px solid var(--theme-line, #edf0f5);cursor:pointer;font-size:14px}.currency-picker-list label:hover{background:var(--theme-surface, #f4f7fb)}.currency-picker-list label.selected{background:var(--theme-surface, #edf3ff);color:var(--theme-text-accent, #2455d9)}.currency-picker-list input[type=radio]{width:16px;height:16px;min-height:0;margin:0;flex-shrink:0;accent-color:#2856d9}.currency-picker-list strong{width:42px;flex-shrink:0}.currency-picker-list small{display:block;color:var(--theme-muted, #60718a);margin-top:3px}.currency-symbol{margin-left:auto;color:var(--theme-muted, #60718a)}.currency-picker-empty{text-align:center;padding:32px 12px;color:var(--theme-muted, #60718a)}.currency-picker-dialog footer{border-top:1px solid var(--theme-line, #e1e7ef);font-size:14px}.currency-picker-dialog footer>div{display:flex;gap:10px}.currency-picker-dialog footer button{padding:8px 18px}.currency-picker-dialog button:focus-visible,.currency-picker-list input:focus-visible{outline:2px solid var(--theme-accent, #2856d9);outline-offset:2px}
</style>
