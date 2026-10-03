<script setup lang="ts">
import { t } from "../i18n";
import { computed, ref, watch } from "vue";
import { productPlaceholder } from "../theme";
import companyLogo from "../assets/ruiou-logo-white.png";

const props = defineProps<{ src?: string; compact?: boolean }>();
const failed = ref(false);
const source = computed(() => {
  if (!props.src) return "";
  try {
    const url = new URL(props.src, window.location.href);
    // Local Odoo images follow the POS proxy, independent of web.base.url.
    if (/^\/ro\/eshop\/public\/image\/\d+$/.test(url.pathname))
      return url.pathname + url.search;
  } catch {
    return "";
  }
  return props.src;
});
watch(source, () => (failed.value = false));
</script>

<template>
  <img
    v-if="source && !failed"
    :src="source"
    alt=""
    loading="lazy"
    @error="failed = true"
  />
  <span
    v-else
    class="product-placeholder"
    :title="source ? t('图片暂不可用') : t('暂无图片')"
  >
    <img :src="productPlaceholder || companyLogo" :alt="t('睿鸥科技')" :class="productPlaceholder ? 'custom-placeholder' : 'placeholder-logo'" />
  </span>
</template>
