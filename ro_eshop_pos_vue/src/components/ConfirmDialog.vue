<script setup lang="ts">
import { t } from "../i18n";
import { nextTick, onBeforeUnmount, ref, watch } from "vue";
import { confirmation, finishConfirmation } from "../confirmation";
import PosIcon from "./PosIcon.vue";

const dialog = ref<HTMLDialogElement | null>(null);
watch(confirmation, async value => {
  if (!value) return;
  await nextTick();
  if (confirmation.value === value) dialog.value?.showModal();
});
function finish(accepted: boolean) {
  dialog.value?.close();
  finishConfirmation(accepted);
}
onBeforeUnmount(() => finishConfirmation(false));
</script>
<template>
  <dialog ref="dialog" class="action-confirm-dialog" aria-labelledby="action-confirm-title" aria-describedby="action-confirm-message" @cancel.prevent="finish(false)">
    <header>
      <h2 id="action-confirm-title"><PosIcon :name="confirmation?.icon || 'trash'" />{{ t(confirmation?.title) }}</h2>
      <button type="button" class="dialog-close" :aria-label="t('关闭确认')" @click="finish(false)"><PosIcon name="close" /></button>
    </header>
    <p id="action-confirm-message">{{ t(confirmation?.message) }}</p>
    <footer>
      <button type="button" autofocus @click="finish(false)">{{ t(confirmation?.cancelLabel || "取消") }}</button>
      <button type="button" class="primary action-with-icon" @click="finish(true)"><PosIcon name="check" />{{ t(confirmation?.confirmLabel) }}</button>
    </footer>
  </dialog>
</template>
