import { createApp } from "vue";
import App from "./App.vue";
import "./style.css";
import "./workbench.css";
import "./login.css";
import "./lists.css";
import "./theme.css";
import "./i18n";
createApp(App).mount("#app");

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register(import.meta.env.BASE_URL + 'sw.js').catch(() => {
    console.warn('离线页面缓存注册失败：需要 HTTPS 或 localhost');
  });
}
