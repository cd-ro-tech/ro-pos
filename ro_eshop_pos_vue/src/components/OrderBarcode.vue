<script setup lang="ts">
import JsBarcode from 'jsbarcode';
import { ref, watch } from 'vue';
import { t } from '../i18n';

const props = defineProps<{ value: string; label?: string; invalidText?: string }>();
const svg = ref<SVGSVGElement | null>(null), valid = ref(true);
watch([svg, () => props.value], () => {
  if (!svg.value) return;
  svg.value.replaceChildren();
  valid.value = true;
  try {
    JsBarcode(svg.value, props.value, {
      format: 'CODE128', displayValue: false, width: 2, height: 64,
      margin: 0, marginLeft: 20, marginRight: 20,
      valid: value => { valid.value = value; },
    });
    if (valid.value) {
      svg.value.setAttribute('viewBox', `0 0 ${parseFloat(svg.value.getAttribute('width') || '0')} ${parseFloat(svg.value.getAttribute('height') || '0')}`);
      svg.value.removeAttribute('width');
      svg.value.removeAttribute('height');
    }
  } catch { valid.value = false; }
}, { flush: 'post', immediate: true });
</script>

<template>
  <svg ref="svg" v-show="valid" class="order-barcode" role="img" :aria-label="label || t('订单条形码：{0}', [value])" preserveAspectRatio="none" />
  <small v-if="!valid">{{t(invalidText || '此订单号无法生成条形码')}}</small>
</template>

<style scoped>
.order-barcode{display:block;width:100%;height:16mm;max-width:100%;background:#fff;shape-rendering:crispEdges}
</style>
