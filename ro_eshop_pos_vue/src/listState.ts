import { onBeforeUnmount, type Ref } from 'vue';
import { session, storeId } from './api';
import { backendUser } from './localIdentity';

// Only navigation preferences live in memory; never cache records, forms or credentials.
const states = new Map<string, Record<string, unknown>>();
export function useListState(name: string, fields: Record<string, Ref<any>>) {
  const key = `${backendUser(session.value?.user.id || 0)}:${storeId.value}:${name}`;
  const saved = states.get(key);
  if (saved) for (const [field, value] of Object.entries(fields)) if (field in saved) value.value=structuredClone(saved[field]);
  onBeforeUnmount(() => {
    states.set(key, Object.fromEntries(Object.entries(fields).map(([field,value])=>[field,JSON.parse(JSON.stringify(value.value))])));
    if (states.size>100) states.delete(states.keys().next().value!);
  });
  return !!saved;
}
