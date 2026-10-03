<script setup lang="ts">
import { bindings, type ShortcutId } from "../shortcuts";
defineProps<{ action: ShortcutId }>();
</script>
<template>
  <kbd v-if="bindings[action]" class="shortcut-hint" aria-hidden="true">{{
    bindings[action]
  }}</kbd>
</template>
