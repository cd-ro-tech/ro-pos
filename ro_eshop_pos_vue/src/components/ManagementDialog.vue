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
    <header><h2>{{ t(title) }}</h2></header>
    <div class="editor-dialog-body"><slot v-if="open" /></div>
    <footer class="editor-dialog-actions editor-header-actions"><button type="button" :disabled="busy" @click="close">{{ t('关闭') }}</button><slot name="actions" /></footer>
  </dialog>
</template>

<style scoped>
#app .management-editor[open]{display:flex;flex-direction:column;max-height:90dvh;overflow:hidden}
.management-editor>header{flex-shrink:0}
.editor-dialog-body{min-height:0;overflow:auto;flex:1}
#app .management-editor>.editor-dialog-actions{display:flex;flex-shrink:0;justify-content:flex-end;align-items:center;gap:12px;flex-wrap:wrap;margin:0;padding:16px;border-top:1px solid var(--theme-line,#dce5f2);background:var(--theme-surface,#fff)}
</style>
