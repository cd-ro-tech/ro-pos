<script setup lang="ts">
import { t } from "../i18n";
import { computed, ref } from 'vue';

type StoreOption = { id: number; name: string };
const props = withDefaults(defineProps<{ modelValue: number[]; options: StoreOption[]; disabled?: boolean }>(), { disabled: false });
const emit = defineEmits<{ 'update:modelValue': [value: number[]] }>();
const query=ref(''),details=ref<HTMLDetailsElement>();
const visibleOptions=computed(()=>props.options.filter(o=>o.name.toLocaleLowerCase().includes(query.value.toLocaleLowerCase())));
const selected = computed(() => new Set(props.modelValue));
const label = computed(() => {
  if (!props.modelValue.length) return t('请选择门店');
  if (props.modelValue.length === props.options.length) return t('全部门店（{0}）', [props.options.length]);
  if (props.modelValue.length === 1) return props.options.find(item => item.id === props.modelValue[0])?.name || t('已选 1 家');
  return t('已选 {0} 家门店', [props.modelValue.length]);
});
function toggle(id: number, checked: boolean) {
  const next = new Set(props.modelValue);
  if (checked) next.add(id); else next.delete(id);
  emit('update:modelValue', props.options.filter(item => next.has(item.id)).map(item => item.id));
}
function selectAll() { emit('update:modelValue', props.options.map(item => item.id)); }
function clear() { emit('update:modelValue', []); }
</script>

<template>
  <details ref="details" class="store-multi-select" :class="{ disabled }" @keydown.esc.stop.prevent="details?.removeAttribute('open')">
    <summary :aria-disabled="disabled" @click="disabled&&$event.preventDefault()" :aria-label="t('门店筛选：{0}', [label])">{{ label }}</summary>
    <div class="store-multi-panel">
      <header><strong>{{ t("选择门店") }}</strong><span><button type="button" :disabled="disabled" @click="selectAll">{{ t("全选") }}</button><button type="button" :disabled="disabled" @click="clear">{{ t("清空") }}</button></span></header>
      <input v-if="options.length>8" v-model="query" class="store-option-search" :aria-label="t('搜索')" :placeholder="t('搜索')" :disabled="disabled" />
      <label v-for="store in visibleOptions" :key="store.id"><input type="checkbox" :checked="selected.has(store.id)" :disabled="disabled" @change="toggle(store.id, ($event.target as HTMLInputElement).checked)" />{{ store.name }}</label>
      <p v-if="!options.length">{{ t("暂无可管理门店") }}</p>
    </div>
  </details>
</template>
