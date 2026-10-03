import { computed, ref } from 'vue';
export const offline = computed(()=>true);
export const preparedAt=ref('');
export const pending=ref<any[]>([]);
let dbPromise: Promise<IDBDatabase> | undefined;
function db() {
  return (dbPromise ||= new Promise((resolve, reject) => {
    const req = indexedDB.open("ro-pos-opensource-v1", 1);
    req.onupgradeneeded = () => req.result.createObjectStore("records");
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => {
      dbPromise = undefined;
      reject(new Error("本机存储不可用，请勿离线收款"));
    };
  }));
}
export async function read(key: string): Promise<any> {
  const database = await db();
  return new Promise((resolve, reject) => {
    const req = database.transaction("records").objectStore("records").get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
export async function write(key: string, value: any) {
  const database = await db();
  const data = JSON.parse(JSON.stringify(value));
  return new Promise<void>((resolve, reject) => {
    const tx = database.transaction("records", "readwrite");
    tx.objectStore("records").put(data, key);
    tx.oncomplete = () => resolve();
    tx.onabort = tx.onerror = () =>
      reject(new Error("保存失败，请勿关闭页面或重复收款"));
  });
}
// IndexedDB serializes these transactions across tabs; never split a ledger update into read/write calls.
export async function mutate(key: string, update: (value: any) => any) {
  const database = await db();
  return new Promise<any>((resolve, reject) => {
    const tx = database.transaction('records', 'readwrite'), store = tx.objectStore('records');
    const req = store.get(key);
    let result: any, failure: any;
    req.onsuccess = () => {
      try { result = update(req.result); store.put(JSON.parse(JSON.stringify(result)), key); }
      catch (e) { failure = e; tx.abort(); }
    };
    tx.oncomplete = () => resolve(result);
    tx.onerror = tx.onabort = () => reject(failure || new Error('本机保存失败，请勿重复收款'));
  });
}

export const scope=()=>'-1:-1';
export async function enqueue(data:any){return (await import('./standalone')).saveLocalOrder(data);}
export async function resetStandaloneRecords(ledger: any) {
  const database = await db();
  await new Promise<void>((resolve, reject) => {
    const tx = database.transaction('records', 'readwrite'), store = tx.objectStore('records');
    const cursor = store.openCursor();
    cursor.onsuccess = () => {
      const current = cursor.result;
      if (!current) { store.put(ledger, 'standalone-ledger-v1'); return; }
      if (/:-1:-1(?::|$)/.test(String(current.key))) current.delete();
      current.continue();
    };
    tx.oncomplete = () => resolve();
    tx.onerror = tx.onabort = () => reject(new Error('本机数据清理失败'));
  });
  for (const key of Object.keys(localStorage)) if (key.startsWith('ro-pos-') && /:-1:-1(?::|$)/.test(key)) localStorage.removeItem(key);
  localStorage.setItem('ro-pos-local-reset', crypto.randomUUID());
}
