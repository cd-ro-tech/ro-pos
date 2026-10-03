<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { ElSelect, ElOption } from 'element-plus';
import 'element-plus/es/components/select/style/css';
import '../pure-admin.css';
import { t } from '../i18n';
defineOptions({inheritAttrs:false});
type Option={value:string|number;label:string;disabled?:boolean};
const props=withDefaults(defineProps<{modelValue?:string|number;options:Option[];disabled?:boolean;required?:boolean;placeholder?:string}>(),{placeholder:''});
const emit=defineEmits<{ 'update:modelValue':[value:string|number];change:[value:string|number] }>();
const host=ref<HTMLElement>(),select=ref<InstanceType<typeof ElSelect>>(),appendTo=ref<HTMLElement|string>('body');
// Dialogs occupy the browser top layer: keep dropdowns in that same layer.
onMounted(()=>{appendTo.value=host.value?.closest('dialog') || 'body';});
const selected=computed(()=>props.options.find(option=>option.value===props.modelValue));
function change(value:string|number){emit('update:modelValue',value);emit('change',value);}
</script>
<template><span ref="host" class="workbench-select" :class="$attrs.class" :style="$attrs.style as any"><ElSelect ref="select" v-bind="{...$attrs,class:undefined,style:undefined}" :model-value="modelValue" :disabled="disabled" :placeholder="placeholder||t('请选择')" :filterable="options.length>8" :empty-values="[null,undefined]" :append-to="appendTo" :no-match-text="t('暂无匹配记录，请调整搜索条件。')" :no-data-text="t('暂无记录。')" popper-class="pos-select-popper" @update:model-value="change"><ElOption v-for="option in options" :key="option.value" :value="option.value" :label="option.label" :disabled="option.disabled" /></ElSelect><input v-if="required" class="workbench-select-validation" tabindex="-1" aria-hidden="true" :value="selected&&modelValue!==''?String(modelValue):''" required :disabled="disabled" @invalid.prevent="select?.focus()" /></span></template>
<style scoped>.workbench-select{display:inline-block;position:relative;width:100%;min-width:0}.workbench-select-validation{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}</style>
