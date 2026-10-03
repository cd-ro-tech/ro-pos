import { shallowRef } from "vue";

type Confirmation = { title: string; message: string; confirmLabel: string; cancelLabel?: string; icon?: string };
export const confirmation = shallowRef<Confirmation | null>(null);
let resolveConfirmation: ((accepted: boolean) => void) | null = null;

export function confirmAction(options: Confirmation): Promise<boolean> {
  if (confirmation.value) return Promise.resolve(false);
  confirmation.value = options;
  return new Promise(resolve => { resolveConfirmation = resolve; });
}

export function finishConfirmation(accepted: boolean) {
  const resolve = resolveConfirmation;
  resolveConfirmation = null;
  confirmation.value = null;
  resolve?.(accepted);
}
