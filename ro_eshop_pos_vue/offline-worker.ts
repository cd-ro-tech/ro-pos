import type { Plugin } from 'vite';
import { createHash } from 'node:crypto';
// Precache only the build's app shell. Never cache authenticated HTML or API responses.
export function offlineWorker(): Plugin {
  return {
    name: 'ro-pos-offline-worker',
    generateBundle(_options, bundle) {
      const assets = Object.keys(bundle).filter(name => !name.endsWith('.map'));
      const revision = createHash('sha256').update(JSON.stringify(assets)).digest('hex').slice(0,12);
      this.emitFile({type:'asset',fileName:'sw.js',source: `
const CACHE='ro-pos-shell-${revision}';
const ROOT=new URL('./',self.location.href);
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(c=>c.addAll(${JSON.stringify(['./', ...assets])}.map(p=>new URL(p,ROOT).href)))));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('ro-pos-shell-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch', event => {
 const req=event.request,url=new URL(req.url);
 if(req.method!=='GET'||url.origin!==ROOT.origin)return;
 if(req.mode==='navigate'&&(url.pathname===ROOT.pathname||url.pathname===ROOT.pathname+'index.html')) {
   event.respondWith(fetch(req).catch(()=>caches.open(CACHE).then(c=>c.match(ROOT.href))));return;
 }
 event.respondWith(caches.open(CACHE).then(async c=>await c.match(req)||fetch(req)));
});
`});
    },
  };
}
