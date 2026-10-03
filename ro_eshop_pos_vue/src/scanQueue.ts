import { ref, onBeforeUnmount } from 'vue';

/** Each scan is captured and processed once, independently of text search. */
export function useScanQueue(process: (code: string) => Promise<void>, failed: (code: string, error: unknown) => void) {
  const count = ref(0);
  let tail = Promise.resolve(), stopped = false;
  onBeforeUnmount(() => { stopped = true; });
  function enqueue(code: string) {
    if (!code || stopped) return;
    count.value++;
    tail = tail.then(async () => {
      if (stopped) return;
      try { await process(code); }
      catch (error) { if (!stopped) failed(code, error); }
    }).finally(() => { count.value--; });
  }
  return {count, enqueue, active: () => !stopped};
}
