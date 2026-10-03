import { computed, ref } from 'vue';
import { currencies } from './currencies';
export function validCurrency(code: unknown): string {
  if (typeof code !== 'string' || !currencies.some(row => row.code === code)) throw new Error('请选择有效币种');
  return code;
}
const saved = localStorage.getItem('ro-pos-currency');
export const localCurrency = ref(currencies.some(row => row.code === saved) ? saved! : 'CNY');
export const activeCurrency = computed(() => localCurrency.value);
export function rememberCurrency(code: string) {
  localStorage.setItem('ro-pos-currency', validCurrency(code));
  localCurrency.value = code;
}

if(typeof window !== 'undefined')window.addEventListener('storage',event=>{if(event.key==='ro-pos-currency'&&currencies.some(row=>row.code===event.newValue))localCurrency.value=event.newValue!;});
