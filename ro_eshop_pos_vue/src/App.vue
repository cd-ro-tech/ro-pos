<script setup lang="ts">
import { computed, ref, nextTick, onMounted, onBeforeUnmount } from 'vue';
import { IconEye, IconWifiOff, IconMaximize, IconMinimize } from '@tabler/icons-vue';
import { t, locale } from './i18n';
import { session, storeId, notice, errorText } from './api';
import { initStandalone, needsFirstRunGuide, dismissFirstRunGuide } from './standalone';
import { needsUpgrade, upgradeMessage } from './edition';
import { confirmAction } from './confirmation';
import { version as appVersion } from '../package.json';
import { homeArtwork as loginArtwork } from './theme';
import companyLogo from './assets/ruiou-logo-white.png';
import Register from './operate/Register.vue';
import Orders from './backend/order/Orders.vue';
import ReturnRecords from './backend/order/ReturnRecords.vue';
import Summary from './backend/kanban/Summary.vue';
import BusinessManage from './backend/product/BusinessManage.vue';
import StandaloneCategories from './backend/product/StandaloneCategories.vue';
import ReceiptSettings from './backend/setting/ReceiptSettings.vue';
import ThemeSettings from './backend/setting/ThemeSettings.vue';
import LockedFeaturePage from './components/LockedFeaturePage.vue';
import FirstRunGuide from './operate/FirstRunGuide.vue';
import OfflineData from './backend/setting/OfflineData.vue';
import CurrencySettings from './backend/setting/CurrencySettings.vue';
import ShortcutSettings from './backend/setting/ShortcutSettings.vue';
import ConfirmDialog from './components/ConfirmDialog.vue';
import LanguageSwitch from './components/LanguageSwitch.vue';
import PosIcon from './components/PosIcon.vue';
const loginPages = [
  { id: "home", label: "首页", title: "", text: "", items: [] },
  {
    id: "products",
    label: "产品介绍",
    title: "选择适合门店的版本",
    text: "本机独立使用，或连接云端统一管理。",
    items: [],
  },
  {
    id: "about",
    label: "关于我们",
    title: "关于 RO POS",
    text: "面向零售门店的收银工作台，由睿鸥科技提供。",
    items: [
      "商品与订单保存在本机",
      "支持本机现金收银与数据备份",
      "支持浏览器打印小票",
    ],
  },
];
const productEditions = [
  { name: '单机版', description: '商品与订单保存在本机，支持现金收款和本地数据备份。', note: '无需登录，即可独立使用。' },
  { name: '单机尊享版', description: '保留本机数据管理，可开通微信、支付宝扫码收款。', note: '联系升级购买；开通商户支付并配置参数后使用，扫码收款需联网。' },
  { name: '云端版本', description: '连接云端 Odoo，统一管理店铺、店员、商品、会员与订单。', note: '在 POS 登录云端账号，按门店权限使用。' },
];
const loginPage = ref(0);
const loginUpgradeDialog = ref<HTMLDialogElement | null>(null);
function openLoginUpgrade() { loginUpgradeDialog.value?.showModal(); }
function useStandalone() { loginUpgradeDialog.value?.close(); void start(); }


const fullscreen=ref(false);
function fullscreenChanged(){fullscreen.value=!!document.fullscreenElement;}
onMounted(()=>document.addEventListener('fullscreenchange',fullscreenChanged));
onBeforeUnmount(()=>document.removeEventListener('fullscreenchange',fullscreenChanged));
const loading=ref(true), setupError=ref(''), firstRunOpen=ref(false),working=ref(false), switchingUser=ref(false);
const starting = ref(false), loadingTransition = ref(false);
const loadingMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const managementMode=ref(false),managementBusy=ref(false),activeManagement=ref('summary'),visitedManagement=ref(['summary']);
const managementDirection=ref('forward'),collapsedGroups=ref<string[]>([]),sidebarCollapsed=ref(false);
const manageKind=computed(()=>activeManagement.value==='product-manage'?'product':null),manageCreate=ref(false);
const dataMode=ref<'import'|'export'|'demo'|'clear'|null>(null), currencySettingsOpen=ref(false);
const registerRef=ref<InstanceType<typeof Register>|null>(null),businessRef=ref<InstanceType<typeof BusinessManage>|null>(null),shortcutSettings=ref<InstanceType<typeof ShortcutSettings>|null>(null);
const now=ref(new Date());const clockText=computed(()=>now.value.toLocaleTimeString(locale.value,{hour12:false}));
let timer:ReturnType<typeof setInterval>;
async function start(){
  if (loading.value || starting.value || loadingTransition.value) return;
  loading.value=true; starting.value=true; loadingTransition.value=true; setupError.value='';
  const startedAt = performance.now();
  await nextTick();
  try {
    const localSession = await initStandalone();
    firstRunOpen.value = await needsFirstRunGuide();
    storeId.value=-1; session.value=localSession;
  } catch(e) { setupError.value=errorText(e); }
  finally {
    // Keep fast local reads from skipping the original opening sequence.
    const remaining = loadingMotion.matches ? 0 : Math.max(0, 600 - (performance.now() - startedAt));
    if (remaining) await new Promise(resolve => setTimeout(resolve, remaining));
    loading.value=false; starting.value=false;
  }
}
async function finishFirstRun(){try{await dismissFirstRunGuide();firstRunOpen.value=false;}catch(e){setupError.value=errorText(e);}}
async function returnToLogin(){if(working.value){notice.value='购物车还有商品，请先挂单';return;}if(!await confirmAction({title:'退出登录',message:'返回首页，本机数据会保留。',confirmLabel:'返回首页'}))return;session.value=null;managementMode.value=false;}
async function toggleFullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{notice.value='当前浏览器无法切换全屏';}}
function functionDisabled(_id:string){return false;}
function managementName(id:string){return functionGroups.flatMap(g=>g.items).find(i=>i.id===id)?.name||id;}
function toggleGroup(title:string){collapsedGroups.value=collapsedGroups.value.includes(title)?collapsedGroups.value.filter(t=>t!==title):[...collapsedGroups.value,title];}
function openFunction(id:string){if(managementBusy.value)return;if(id==='currency'){currencySettingsOpen.value=true;return;}if(id==='settings'){shortcutSettings.value?.open();return;}managementDirection.value=visitedManagement.value.indexOf(id)<visitedManagement.value.indexOf(activeManagement.value)?'backward':'forward';activeManagement.value=id;if(!visitedManagement.value.includes(id))visitedManagement.value.push(id);}
function openManagement(){if(!managementBusy.value){managementMode.value=true;openFunction('summary');}}
function returnToRegister(){if(!managementBusy.value)managementMode.value=false;}
function closeManagementTab(id:string){if(managementBusy.value||id==='summary')return;visitedManagement.value=visitedManagement.value.filter(i=>i!==id);if(activeManagement.value===id)openFunction(visitedManagement.value.at(-1)||'summary');}
async function productsCreated(){await registerRef.value?.refreshProducts();}
async function managementSaved(){await productsCreated();}
onMounted(()=>{timer=setInterval(()=>now.value=new Date(),1000);loading.value=false;});
onBeforeUnmount(()=>clearInterval(timer));
window.addEventListener('storage',event=>{if(event.key==='ro-pos-local-reset')window.location.reload();});
const functionGroups = [
  { title: '经营概览', items: [{ id: 'summary', name: '业绩看板', icon: 'summary' }, { id: 'orders', name: '订单管理', icon: 'documents' }, { id: 'returns', name: '退货记录', icon: 'restore' }] },
  { title: '本机资料', items: [{ id: 'product-manage', name: '商品管理', icon: 'product' }, { id: 'category-manage', name: '商品分类', icon: 'product' }] },
  { title: '本机设置', items: [{ id: 'receipt-settings', name: '小票设置', icon: 'print' }, { id: 'theme-settings', name: '主题设置', icon: 'theme' }, { id: 'data', name: '数据管理', icon: 'documents' }, { id: 'currency', name: '币种设置', icon: 'recharge' }, { id: 'settings', name: '快捷键设置', icon: 'keyboard' }] },
  { title: '单机尊享版', items: [{ id: 'member-manage', name: '会员管理', icon: 'user' }, { id: 'payment-settings', name: '支付设置', icon: 'cash' }, { id: 'member-settings', name: '会员设置', icon: 'user' }] },
  { title: '连锁商户版', items: [{ id: 'plus', name: '连接云端', icon: 'store' }, { id: 'store-manage', name: '门店管理', icon: 'store' }, { id: 'user-manage', name: '员工管理', icon: 'user' }] },
];
</script>
<template>
  <div v-if="!session" class="login-shell" :inert="starting || loadingTransition">
    <div class="login-stage">
      <header class="login-header">
        <div class="login-art-brand">
          <img class="company-logo" :src="companyLogo" :alt="t('睿鸥科技')" />
          <b class="login-brand-name">{{ t("睿鸥门店收银系统") }}</b>
        </div>
        <nav class="login-nav" :aria-label="t('登录页导航')">
          <button
            v-for="(page, index) in loginPages"
            :key="page.id"
            type="button"
            :class="{ active: loginPage === index }"
            :aria-current="loginPage === index ? 'page' : undefined"
            @click="loginPage = index"
          >
            {{ t(page.label) }}
          </button>
        </nav>
      </header>
      <div class="login-window">
        <aside
          class="login-art"
          :class="{ 'showing-content': loginPage !== 0 }"
          :aria-label="t('RO POS 门店收银系统')"
        >
          <img :src="loginArtwork" alt="" fetchpriority="high" />
          <section
            v-if="loginPage !== 0"
            class="login-page-content"
            aria-live="polite"
            :aria-label="t(loginPages[loginPage].label)"
            :class="{'login-product-intro': loginPages[loginPage].id === 'products'}"
          >
            <h2>{{ t(loginPages[loginPage].title) }}</h2>
            <p>{{ t(loginPages[loginPage].text) }}</p>
            <div v-if="loginPages[loginPage].id === 'products'" class="login-editions">
              <section v-for="edition in productEditions" :key="edition.name">
                <h3>{{ t(edition.name) }}</h3>
                <p>{{ t(edition.description) }}</p>
                <p class="edition-note">{{ t(edition.note) }}</p>
              </section>
            </div>
            <ul v-else>
              <li v-for="item in loginPages[loginPage].items" :key="item">
                {{ t(item) }}
              </li>
            </ul>
          </section>
        </aside>
        <form class="login-card" @submit.prevent="openLoginUpgrade">
          <div class="login-form-heading">
            <h1>{{ t("登录账号") }}</h1>
            <p>{{ t("账户登录") }}</p>
          </div>
          <label
            ><span class="login-sr-only">{{ t("员工账号") }}</span
            ><input
              disabled
              required
              :placeholder="t('请输入员工账号')"
              autocomplete="username"

          /></label>
          <div class="login-password-field">
            <label class="login-sr-only" for="login-password">{{ t("密码") }}</label>
            <div class="login-password-input">
              <input
                id="login-password"
                disabled
                type="password"
                required
                autocomplete="current-password"
                :placeholder="t('请输入密码')"
              />
              <button
                type="button"
                class="password-toggle"
                :aria-label="t('密码')"
                disabled

              >
                <component
                  :is="IconEye"
                  :size="20"
                  stroke="1.6"
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
          <p v-if="setupError" class="error" role="alert">{{ t(setupError) }}</p>
          <button class="primary" :disabled="loading">
            {{
              t("登录工作台") + " · Upgrade"
            }}</button
          >
          <div class="login-secondary-actions">
            <button type="button" :disabled="loading" @click="start"><PosIcon name="desktop" /><span>{{ t("单机版 · 无需登录") }}</span></button>
            <button type="button" :disabled="loading" @click="notice=upgradeMessage"><PosIcon name="cloud" /><span>{{ t("云端设置") }} · Upgrade</span></button>
          </div>
          <LanguageSwitch />
        </form>
      </div>
      <p class="login-footer">
        Copyright © {{ new Date().getFullYear() }} {{ t("睿鸥科技") }} · {{ t("版权所有") }}</p>
    </div>
  </div>
<div v-else class="pos-shell" :inert="starting || loadingTransition">
<header class="pos-toolbar" :aria-label="t('系统工具条')">
      <div class="toolbar-identity">
        <img class="toolbar-logo" :src="companyLogo" :alt="t('睿鸥科技')" />
        <span class="toolbar-brand">RO POS <span>v{{ appVersion }}</span></span>
        <button class="toolbar-button connection-state" :aria-label="t('单机版')" :title="t('本机单机模式')"><IconWifiOff :size="18" aria-hidden="true" /><span class="toolbar-offline-label">{{t('单机版')}}</span></button>
        <button class="toolbar-button" @click="toggleFullscreen" :aria-label="fullscreen?t('退出全屏'):t('全屏')" :title="fullscreen?t('退出全屏'):t('全屏')" :aria-pressed="fullscreen"><component :is="fullscreen?IconMinimize:IconMaximize" :size="20" aria-hidden="true" /></button>
      </div>
      <div class="toolbar-operator" style="margin-left:auto">
        <LanguageSwitch />
        <button v-if="managementMode" :disabled="managementBusy" @click="returnToRegister"><PosIcon name="return" />{{t('返回收银')}}</button>
        <time class="toolbar-clock" :datetime="now.toISOString()" :title="t('本机时间')"><PosIcon name="clock" class="toolbar-context-icon" />{{clockText}}</time>
        <button class="action-with-icon more-functions-trigger" :disabled="managementBusy" @click="openManagement"><PosIcon name="functions" />{{t('工作台')}}</button>
        <button class="action-with-icon" :disabled="managementBusy || switchingUser" @click="returnToLogin"><PosIcon name="logout" />{{t('退出登录')}}</button>
      </div>
    </header>
    <main class="workspace" :class="{ 'admin-workspace': managementMode }">
      <aside v-if="managementMode" class="management-sidebar" :class="{'sidebar-collapsed':sidebarCollapsed}" :aria-label="t('管理功能导航')">
        <div class="sidebar-body" :inert="sidebarCollapsed" :aria-hidden="sidebarCollapsed">

        <nav id="management-menu"><section v-for="group in functionGroups" :key="group.title"><h3><button class="sidebar-group-toggle" :title="t(group.title)" :aria-label="t(group.title)" :aria-expanded="!collapsedGroups.includes(group.title)" @click="toggleGroup(group.title)">{{ t(group.title) }}<PosIcon name="down" :class="{'group-collapsed': collapsedGroups.includes(group.title)}" /></button></h3><div class="sidebar-group-items" :class="{'is-collapsed':collapsedGroups.includes(group.title)}" :inert="collapsedGroups.includes(group.title)" :aria-hidden="collapsedGroups.includes(group.title)"><div><button v-for="item in group.items" :key="item.id" :title="t(item.name)" :aria-label="t(item.name)" :class="{selected: activeManagement === item.id}" :aria-current="activeManagement === item.id ? 'page' : undefined" :disabled="managementBusy || functionDisabled(item.id)" @click="openFunction(item.id)"><PosIcon :name="item.icon" /><span>{{ t(item.name) }}</span><span v-if="needsUpgrade(item.id)" class="upgrade-flag">Upgrade</span></button></div></div></section></nav>
        <button class="sidebar-return" :aria-label="t('返回收银')" :title="t('返回收银')" :disabled="managementBusy" @click="returnToRegister"><PosIcon name="return" /><span>{{ t("返回收银") }}</span></button>
        </div>

      </aside>
      <template v-if="session">
        <div class="register-host" :class="{'register-hidden': managementMode}">
          <Register v-if="storeId && !firstRunOpen" ref="registerRef"  :active="!managementMode && !starting && !loadingTransition" :key="storeId" @working="working = $event"  />
        </div>
        <section v-if="managementMode" class="management-content pure-admin-page" :aria-label="t('管理工作区')">
          <nav class="management-tabs" :aria-label="t('已打开的页面')">        <button class="sidebar-collapse-toggle" :aria-label="t(sidebarCollapsed?'展开菜单':'收起菜单')" :title="t(sidebarCollapsed?'展开菜单':'收起菜单')" :aria-expanded="!sidebarCollapsed" aria-controls="management-menu" @click="sidebarCollapsed=!sidebarCollapsed">
          <svg class="sidebar-pull-chevron" :class="{'is-collapsed':sidebarCollapsed}" viewBox="0 0 16 16" aria-hidden="true"><path d="m 10 4 -4 4 4 4" /></svg>
          <span class="sidebar-toggle-label">{{t(sidebarCollapsed?"展开菜单":"收起菜单")}}</span>
        </button><div v-for="id in visitedManagement" :key="id" :class="{active:activeManagement === id}"><button :disabled="managementBusy || functionDisabled(id)" :aria-current="activeManagement === id ? 'page' : undefined" @click="openFunction(id)">{{ t(managementName(id)) }}</button><button v-if="id !== 'summary'" :disabled="managementBusy" :aria-label="t('关闭') + ' ' + t(managementName(id))" @click="closeManagementTab(id)">×</button></div></nav>
          <div class="content-switch-stage" :class="{ 'switch-backward': managementDirection === 'backward' }">
          <Transition name="content-switch" appear @before-leave="el => (el as HTMLElement).inert = true" @before-enter="el => (el as HTMLElement).inert = false">
          <div :key="activeManagement" class="management-view">
          <LockedFeaturePage v-if="needsUpgrade(activeManagement)" :key="activeManagement" :feature="activeManagement" @upgrade="notice = upgradeMessage" />
          <BusinessManage ref="businessRef" v-else-if="manageKind && session" :key="`${storeId}:${manageKind}:${manageCreate}`" :kind="manageKind" :initial-create="manageCreate" @busy="managementBusy = $event" @close="returnToRegister" @saved="managementSaved"  />
          <ReceiptSettings v-else-if="activeManagement === 'receipt-settings'" />
          <ThemeSettings v-else-if="activeManagement === 'theme-settings'" />
          <StandaloneCategories @saved="productsCreated" :key="locale" v-else-if="activeManagement === 'category-manage'" @busy="managementBusy = $event" />
          <ReturnRecords v-else-if="activeManagement === 'returns'" />
          <Orders v-else-if="activeManagement === 'orders'"  :key="`${storeId}:${activeManagement}:${locale}`" />
          <section v-else-if="activeManagement === 'data'" class="management-page utility-page" :aria-label="t('数据管理')">
            <section class="data-ledger-actions" :aria-label="t('本机单机账本')">
              <h3>{{ t("本机单机账本") }}</h3>
              <div class="data-action-row">
                <div class="list-actions">
                  <button  @click="dataMode = 'import'"><PosIcon name="upload" />{{ t("导入数据") }}</button>
                  <button  @click="dataMode = 'export'"><PosIcon name="download" />{{ t("导出数据") }}</button>
                  <button  @click="dataMode='demo'">{{t("加载演示数据")}}</button>
                </div>
                <button class="data-clear"  @click="dataMode='clear'">{{t("清理所有数据")}}</button>
              </div>
            </section>
            <p class="data-scope-note">{{ t("开源版备份仅包含本机分类、商品、现金订单及退货记录。") }}</p>
            <div class="table-wrap"><table><thead><tr><th>{{ t("数据范围") }}</th><th>{{ t("内容") }}</th><th>{{ t("格式") }}</th></tr></thead><tbody><tr><td>{{ t("单机账本") }}</td><td>{{ t("商品分类、商品、现金订单与退货记录") }}</td><td>JSON</td></tr></tbody></table></div>
          </section>
          <Summary v-else :key="`${storeId}:${locale}`" />
          </div>
          </Transition>
          </div>
        </section>
      </template>
    </main>
  </div>
<dialog ref="loginUpgradeDialog" class="login-upgrade-dialog" aria-labelledby="login-upgrade-title" aria-describedby="login-upgrade-description">
  <button type="button" class="login-upgrade-close" :aria-label="t('关闭')" @click="loginUpgradeDialog?.close()"><PosIcon name="close" /></button>
  <PosIcon name="lock" />
  <span class="login-upgrade-edition">{{ t('连锁商户版') }}</span>
  <h2 id="login-upgrade-title">{{ t('登录云端工作台') }}</h2>
  <p id="login-upgrade-description">{{ t('开源版仅支持单机使用，账号登录需升级。') }}</p>
  <p>{{ t('无需账号，即可使用本机收银与数据管理。') }}</p>
  <div class="login-upgrade-actions">
    <button type="button" @click="loginUpgradeDialog?.close(); notice=upgradeMessage">{{ t('联系升级购买') }}</button>
    <button type="button" class="primary" autofocus @click="useStandalone">{{ t('单机使用') }}</button>
  </div>
</dialog>
<ConfirmDialog />
<OfflineData v-if="dataMode" :mode="dataMode" @close="dataMode=null" @imported="productsCreated" />
<CurrencySettings v-if="currencySettingsOpen" @close="currencySettingsOpen=false" />
<ShortcutSettings ref="shortcutSettings" />
<FirstRunGuide v-if="firstRunOpen && !starting && !loadingTransition" :completion-error="setupError" @complete="finishFirstRun" />
<Transition name="workbench-doors" :duration="loadingMotion.matches ? 0 : { enter: 250, leave: 600 }" @after-leave="loadingTransition = false">
  <div v-if="starting" class="pos-loading" role="status" aria-live="polite">
    <div class="loading-door loading-door-left" aria-hidden="true"></div>
    <div class="loading-door loading-door-right" aria-hidden="true"></div>
    <div class="loading-content">
      <img :src="companyLogo" alt="" />
      <h2>{{ t('正在准备工作台') }}</h2>
      <p>{{ t('门店资料与本机订单加载中') }}</p>
      <div class="loading-dots" aria-hidden="true"><span></span><span></span><span></span></div>
    </div>
  </div>
</Transition>
<div v-if="notice" class="toast" role="status">{{t(notice)}}<button :aria-label="t('关闭')" @click="notice=''">×</button></div>
</template>

<style scoped>
.data-ledger-actions{margin:20px 0 0;padding:24px;background:var(--theme-surface, #fff);border:1px solid var(--theme-line, #e0e7ef)}
.data-ledger-actions h3{margin:0 0 18px;font-size:15px;font-weight:600;color:var(--theme-ink, #294265)}
.data-action-row{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:20px 32px}
.data-action-row .list-actions{gap:12px;flex-wrap:wrap}
.data-action-row .data-clear{min-height:36px;padding:8px 14px;white-space:nowrap;color:#b42318;border-color:#dfc6c4;background:var(--theme-surface, #fff)}
.data-action-row .data-clear:hover:not(:disabled){background:var(--theme-surface, #fff4f3);border-color:#b42318}
.utility-page .data-scope-note{margin:24px 0 16px;line-height:1.8;font-size:13px;color:var(--theme-muted, #526586)}
@media(max-width:600px){.data-ledger-actions{padding:20px}.data-action-row{align-items:flex-start}.data-action-row .data-clear{margin-left:0}}

#app .management-sidebar{--sidebar-width:202px;margin-right:0;position:relative;z-index:2;width:var(--sidebar-width);flex:0 0 var(--sidebar-width);min-width:0;border:0;transition:width 240ms cubic-bezier(.22,1,.36,1),flex-basis 240ms cubic-bezier(.22,1,.36,1)}
.sidebar-body{box-sizing:border-box;width:var(--sidebar-width);height:100%;min-height:0;display:flex;flex-direction:column;overflow:hidden;border-right:1px solid var(--theme-line, #dfe6ef);transition:transform 240ms cubic-bezier(.22,1,.36,1),opacity 180ms ease}
#app .management-tabs .sidebar-collapse-toggle{position:sticky;left:0;flex-shrink:0;min-height:44px;display:inline-flex;align-items:center;gap:6px;padding:0 12px;margin-right:8px;background:var(--theme-surface,#fff);color:var(--theme-muted,#637896);z-index:2;border:0;border-right:1px solid var(--theme-line,#dfe6ef)}
#app .management-tabs .sidebar-collapse-toggle:hover{color:var(--theme-text-accent,#245bd0);background:var(--theme-selected,#edf3ff)}
.sidebar-pull-chevron{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;transition:transform 240ms ease}
.sidebar-toggle-label{font-size:12px;white-space:nowrap}
.sidebar-pull-chevron.is-collapsed{transform:rotate(180deg)}
#app .management-tabs .sidebar-collapse-toggle:focus-visible{outline:2px solid var(--theme-accent,#245bd0);outline-offset:-2px}
#app .management-sidebar.sidebar-collapsed{width:0;flex-basis:0;background:transparent}
#app .sidebar-collapsed .sidebar-body{transform:translateX(-100%);opacity:0;pointer-events:none}
@media(max-width:900px){#app .management-sidebar{--sidebar-width:150px}}
@media(prefers-reduced-motion:reduce){#app .management-sidebar,.sidebar-body,.sidebar-pull-chevron{transition:none}}
</style>

<style scoped>
#app .login-card input:disabled{background:#f2f3f5;border-color:#dcdfe6;color:#7b818a;-webkit-text-fill-color:#7b818a;opacity:1;cursor:not-allowed}
#app .login-card input:disabled::placeholder{color:#7b818a;opacity:1}
#app .login-card .password-toggle:disabled{color:#90959e;opacity:1;cursor:not-allowed}
#app dialog.login-upgrade-dialog{box-sizing:border-box;width:480px;max-width:calc(100vw - 32px);max-height:calc(100dvh - 32px);overflow:auto;padding:32px 24px;border:1px solid var(--theme-line,#dce1e8);border-radius:8px;background:var(--theme-surface,#fff);color:var(--theme-ink,#263c5d);text-align:center}
.login-upgrade-dialog::backdrop{background:rgb(20 30 45 / 40%)}
#app .login-upgrade-dialog>.icon{display:block;width:32px;height:32px;margin:4px auto 16px;color:var(--theme-text-accent,#285bd4)}
.login-upgrade-edition{color:var(--theme-text-accent,#285bd4);font-size:14px}
#app .login-upgrade-dialog h2{margin:20px 0;font-size:22px}
#app .login-upgrade-dialog p{margin:12px 0;color:var(--theme-muted,#526780);font-size:14px;line-height:1.7}
#app .login-upgrade-dialog .login-upgrade-close{position:absolute;right:8px;top:8px;display:flex;align-items:center;justify-content:center;width:32px;min-height:32px;padding:4px;border:0;background:transparent;color:var(--theme-muted,#526780)}
.login-upgrade-actions{display:flex;justify-content:center;flex-wrap:wrap;gap:12px;margin-top:24px}
.login-upgrade-actions button{min-height:42px;padding:8px 16px}
</style>
