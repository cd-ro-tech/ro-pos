import { ref } from 'vue';

const key = 'ro-pos-receipt-settings';
type ReceiptSettings = { header: string; footer: string };
function load(): ReceiptSettings | null {
  try {
    const value = JSON.parse(localStorage.getItem(key) || 'null');
    return value && typeof value.header === 'string' && typeof value.footer === 'string'
      ? { header: value.header.slice(0, 500), footer: value.footer.slice(0, 500) } : null;
  } catch { return null; }
}
export const receiptSettings = ref(load());
export function saveReceiptSettings(value: ReceiptSettings | null) {
  if (value) localStorage.setItem(key, JSON.stringify(value));
  else localStorage.removeItem(key);
  receiptSettings.value = value;
}
window.addEventListener('storage', event => {
  if (event.key === key || event.key === null) receiptSettings.value = load();
});
