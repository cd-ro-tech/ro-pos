import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { offlineWorker } from "./offline-worker";
export default defineConfig({plugins:[vue(),offlineWorker(),{name:'local-docs',configureServer(server){server.middlewares.use('/docs/index.html',(_req,res)=>{res.setHeader('Content-Type','text/html; charset=utf-8');res.end(readFileSync(fileURLToPath(new URL('../docs/index.html',import.meta.url))));});},generateBundle(){this.emitFile({type:'asset',fileName:'docs/index.html',source:readFileSync(fileURLToPath(new URL('../docs/index.html',import.meta.url)),'utf8')});}}],server:{host:"127.0.0.1",port:5182,strictPort:true}});
