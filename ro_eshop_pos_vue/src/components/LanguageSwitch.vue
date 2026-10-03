<script setup lang="ts">
import { t } from "../i18n";
import { languageOptions, locale, setLocale } from "../i18n";
import { computed, ref, useId } from "vue";
import { IconWorld, IconChevronDown, IconCheck } from "@tabler/icons-vue";
const id = useId();
const trigger = ref<HTMLButtonElement>();
const menu = ref<HTMLElement>();
const open = ref(false);
const current = computed(() => languageOptions.find(option => option.value === locale.value)?.label);
function show() {
  if (!trigger.value || !menu.value) return;
  const rect = trigger.value.getBoundingClientRect();
  menu.value.style.left = `${Math.max(8, Math.min(rect.right - 176, window.innerWidth - 184))}px`;
  menu.value.showPopover();
  menu.value.style.top = `${Math.max(8, Math.min(rect.bottom + 8, window.innerHeight - menu.value.offsetHeight - 8))}px`;
  menu.value.querySelector<HTMLButtonElement>('[aria-checked="true"]')?.focus();
}
function close(restoreFocus = false) {
  menu.value?.hidePopover();
  if (restoreFocus) trigger.value?.focus();
}
function choose(value: string) {
  setLocale(value);
  close(true);
}
function keydown(event: KeyboardEvent) {
  if (event.key === 'Escape') { event.preventDefault(); close(true); return; }
  if (event.key === 'Tab') { close(); return; }
  if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  const items = Array.from(menu.value?.querySelectorAll<HTMLButtonElement>('button') || []);
  const index = items.indexOf(document.activeElement as HTMLButtonElement);
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
  items[next]?.focus();
}
</script>

<template>
  <div class="language-switch">
    <button ref="trigger" type="button" class="language-trigger" :aria-label="t('界面语言')" aria-haspopup="menu" :aria-expanded="open" :aria-controls="id" @click="open ? close() : show()" @keydown.down.prevent="show" @keydown.up.prevent="show">
      <IconWorld :size="18" stroke="1.7" aria-hidden="true" />
      <span>{{ current }}</span>
      <IconChevronDown :size="13" aria-hidden="true" />
    </button>
    <Teleport to="body">
    <div :id="id" ref="menu" popover="auto" role="menu" :aria-label="t('界面语言')" class="language-menu" @toggle="open = ($event as ToggleEvent).newState === 'open'" @keydown="keydown">
      <button v-for="option in languageOptions" :key="option.value" type="button" role="menuitemradio" :aria-checked="locale === option.value" @click="choose(option.value)">
        <span>{{ option.value === 'zh-CN' ? '简体中文' : option.label }}</span>
        <IconCheck v-if="locale === option.value" :size="17" aria-hidden="true" />
      </button>
    </div>
    </Teleport>
  </div>
</template>
