<script setup lang="ts">
import '../../pure-admin.css';
import { needsUpgrade } from "../../edition";
import { t } from "../../i18n";
import { ref, computed } from "vue";
import {
  shortcutActions,
  bindings,
  defaults,
  conflicts,
  eventKey,
  saveShortcuts,
  type ShortcutId,
} from "../../shortcuts";
import { notice } from "../../api";
const dialog = ref<HTMLDialogElement | null>(null);
const draft = ref(defaults()),
  error = ref("");
const invalid = computed(() => conflicts(draft.value));
function open() {
  draft.value = { ...bindings.value };
  error.value = "";
  dialog.value?.showModal();
}
defineExpose({ open });
function capture(e: KeyboardEvent, id: ShortcutId) {
  if (needsUpgrade(id)) return;
  if (e.key === "Tab" || e.key === "Escape") return;
  e.preventDefault();
  e.stopPropagation();
  if (e.repeat || e.isComposing) return;
  if (["Control", "Alt", "Shift", "Meta"].includes(e.key)) return;
  const key = eventKey(e);
  if (!key) {
    error.value = "支持 F2–F4、F6–F9、Enter 或 Ctrl+Alt+字母。";
    return;
  }
  draft.value[id] = key;
  error.value = "";
}
function save() {
  try {
    saveShortcuts(draft.value);
    dialog.value?.close();
    notice.value = "快捷键设置已保存";
  } catch (e) {
    error.value = (e as Error).message;
  }
}
</script>
<template>
  <dialog
    ref="dialog"
    class="pure-admin-page pos-drawer shortcut-settings"
    aria-labelledby="shortcut-title"
  >
    <form class="drawer-shell" @submit.prevent="save">
      <header class="drawer-header">
        <h2 id="shortcut-title">{{ t("系统设置") }}</h2>
      </header>
      <div class="drawer-body">
        <h3>{{ t("快捷键设置") }}</h3>
        <p class="muted">{{ t("点击按键框后按下快捷键。设置仅用于当前员工在此浏览器的收银操作。") }}</p>
        <p class="hint">{{ t("支持 F2–F4、F6–F9、Enter、Ctrl+Alt+字母。部分键盘需同时按 Fn。输入框和弹窗内暂停快捷操作，扫码收款仍需确认。") }}</p>
        <div class="shortcut-settings-grid">
        <div
          class="shortcut-setting-row"
          v-for="action in shortcutActions"
          :key="action.id"
        >
          <label :for="'shortcut-' + action.id">{{ t(action.label) }} <span v-if="needsUpgrade(action.id)" class="upgrade-flag">Upgrade</span></label>
          <input
            :id="'shortcut-' + action.id"
            :value="draft[action.id] || t('未启用')"
            :disabled="needsUpgrade(action.id)"
            readonly
            @keydown="capture($event, action.id)"
          />
          <button
            type="button"
            class="plain"
            :disabled="needsUpgrade(action.id)"
            :aria-label="t('禁用 {0}', [t(action.label)])"
            @click="draft[action.id] = ''"
          >{{ t("禁用") }}</button>
        </div>
        </div>
        <p v-if="invalid" class="error" role="alert">{{ t("快捷键重复，请更换按键或禁用其中一项。") }}</p>
        <p v-if="error" class="error" role="alert">{{ t(error) }}</p>
      </div>
      <footer class="drawer-footer actions">
        <button
          type="button"
          @click="
            draft = defaults();
            error = '';
          "
        >{{ t("恢复默认") }}</button
        ><button type="submit" class="primary" :disabled="invalid">{{ t("保存设置") }}</button>
      <button
          type="button"
          class="plain"
          :aria-label="t('关闭系统设置')"
          @click="dialog?.close()"
        >{{ t("关闭") }}</button></footer>
    </form>
  </dialog>
</template>
<style scoped>
.pos-drawer.shortcut-settings {
  width: min(960px, calc(100vw - 32px));
  max-height: calc(100dvh - 48px);
}
.shortcut-settings .drawer-shell {
  max-height: calc(100dvh - 48px);
  overflow: hidden;
}
.shortcut-settings .drawer-body {
  min-height: 0;
  overflow-y: auto;
}
.shortcut-settings-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 32px;
}
.shortcut-settings .shortcut-setting-row {
  grid-template-columns: minmax(0, 1fr) 116px 42px;
  min-width: 0;
}
.shortcut-settings .shortcut-setting-row > label { display:flex; flex-direction:row; align-items:center; gap:8px; white-space:nowrap; min-width:0; }
.shortcut-settings .shortcut-setting-row .upgrade-flag { flex:0 0 auto; width:auto; font-size:11px; padding:2px 5px; }
.shortcut-settings .shortcut-setting-row > button { padding-inline: 0; white-space: nowrap; }
.shortcut-settings .drawer-footer {
  display: flex;
  justify-content: space-between;
  flex-shrink: 0;
}
@media (max-width: 760px) {
  .shortcut-settings-grid { grid-template-columns: minmax(0, 1fr); }
  .shortcut-settings .shortcut-setting-row { grid-template-columns: minmax(0, 1fr) 100px 40px; }
  .shortcut-settings .drawer-body { padding: 16px; }
  .shortcut-settings .drawer-header { padding-inline: 16px; }
  .shortcut-settings .drawer-footer { padding: 16px; }
}
</style>
