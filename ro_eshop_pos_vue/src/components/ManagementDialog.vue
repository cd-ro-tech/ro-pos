<script setup lang="ts">
import { t } from "../i18n";
import { nextTick, onMounted, ref, watch } from 'vue';
import PosIcon from './PosIcon.vue';
const props = defineProps<{ open: boolean; title: string; busy?: boolean; error?: string }>();
const emit = defineEmits(['close']);
const dialog = ref<HTMLDialogElement | null>(null);
async function update() { await nextTick(); if (props.open) { if (!dialog.value?.open) dialog.value?.showModal(); } else dialog.value?.close(); }
onMounted(update);
watch(() => props.open, update);
watch(() => props.error, async value => { if(!value)return;await nextTick();const message=dialog.value?.querySelector<HTMLElement>('.error');message?.scrollIntoView({block:'nearest'});message?.focus(); });
function close() { if (!props.busy) emit('close'); }
</script>
<template>
  <dialog ref="dialog" class="management-editor pure-admin-page" :aria-label="t(title)" @cancel.prevent="close">
    <header><button v-if="$slots.actions" class="editor-back" :disabled="busy" @click="close"><PosIcon name="prev" />{{t("返回")}}</button><h2>{{ t(title) }}</h2><div v-if="$slots.actions" class="editor-header-actions"><slot name="actions" /></div><button v-else class="dialog-close" :disabled="busy" :aria-label="t('关闭编辑')" @click="close"><PosIcon name="close" /></button></header>
    <slot v-if="open" />
  </dialog>
</template>
