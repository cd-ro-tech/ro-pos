import { computed, onBeforeUnmount, watch, type Ref } from 'vue';
import { confirmAction } from './confirmation';

export function confirmDiscard(changed: boolean) {
  return changed ? confirmAction({ title:'放弃未保存的修改？', message:'当前修改尚未保存。放弃后需要重新填写。', confirmLabel:'放弃修改', cancelLabel:'继续编辑', icon:'note' }) : Promise.resolve(true);
}

export function useUnsavedForm(form: Ref<any>) {
  let baseline = JSON.stringify(form.value);
  watch(form, value => { baseline = JSON.stringify(value); });
  const dirty = computed(() => !!form.value && JSON.stringify(form.value) !== baseline);
  const beforeUnload = (event: BeforeUnloadEvent) => { if (dirty.value) { event.preventDefault(); event.returnValue=''; } };
  window.addEventListener('beforeunload', beforeUnload);
  onBeforeUnmount(() => window.removeEventListener('beforeunload', beforeUnload));
  return { dirty, close: async () => { if (await confirmDiscard(dirty.value)) form.value=null; } };
}
