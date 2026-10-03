<script setup lang="ts">
import { computed } from 'vue';
import { t } from '../i18n';
import PosIcon from './PosIcon.vue';

const props = defineProps<{feature:string}>();
defineEmits(['upgrade']);
const descriptions: Record<string, {title:string; description:string}> = {
  'member-manage': {title:'管理会员资料与资产', description:'维护会员资料，查看会员等级、积分、余额与消费记录。'},
  'member-settings': {title:'设置会员等级与积分规则', description:'配置会员等级、消费积分和积分抵扣规则。'},
  'payment-settings': {title:'开通微信与支付宝扫码收款', description:'配置商户支付参数，使用微信、支付宝扫码收款。扫码收款需要联网。'},
  'store-manage': {title:'集中管理多家门店', description:'连接云端后，统一维护门店资料，并按权限切换和管理不同门店。'},
  'user-manage': {title:'按门店分配员工与角色', description:'连接云端后，为用户分配多个门店及对应角色，管理各门店的操作权限。'},
  'plus': {title:'连接云端管理业务', description:'配置云端地址，在 POS 登录云端账号，按门店权限使用业务功能。'},
};
const info = computed(() => descriptions[props.feature]);
const cloud = computed(() => ['store-manage','user-manage','plus'].includes(props.feature));
</script>

<template>
  <section class="locked-feature-page">
    <div class="edition-preview-region">
      <div class="edition-preview-mask">
        <div class="edition-preview-prompt">
          <PosIcon name="lock" />
          <span class="edition-label">{{t(cloud ? '连锁商户版' : '单机尊享版')}}</span>
          <strong>{{t(info?.title)}}</strong>
          <p>{{t(info?.description)}}</p>
          <small>{{t('当前版本尚未开通，升级后可使用。')}}</small>
          <button class="primary" @click="$emit('upgrade')">{{t('联系升级购买')}}</button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.locked-feature-page{min-height:0;overflow:auto;padding:0 0 24px}
.edition-label{padding:4px 10px;border-radius:4px;background:var(--theme-surface, #edf3ff);color:var(--theme-text-accent, #285bd4);font-size:13px}
.edition-preview-region{min-height:400px;display:grid;place-items:center}
.edition-preview-mask{position:relative;display:grid;place-items:center;padding:20px;border-radius:6px;background:rgb(239 244 250 / 48%)}
.edition-preview-prompt{display:flex;flex-direction:column;align-items:center;gap:16px;padding:24px 32px;border:1px solid var(--theme-line, #d6e1ef);border-radius:8px;background:rgb(255 255 255 / 96%);box-shadow:0 8px 24px rgb(38 60 93 / 10%);color:var(--theme-ink, #263c5d);text-align:center;width:420px;max-width:100%;box-sizing:border-box}
.edition-preview-prompt>.icon{width:28px;height:28px;color:var(--theme-text-accent, #285bd4)}
.edition-preview-prompt strong{font-size:18px}
.edition-preview-prompt p{margin:0;color:var(--theme-muted, #526780);font-size:14px;line-height:1.7}
.edition-preview-prompt small{color:var(--theme-muted, #687587);font-size:13px}
.edition-preview-prompt button{min-height:42px}
.edition-preview{min-width:0;margin:0;padding:20px;border:1px solid var(--theme-line, #dce1e8);border-radius:6px;background:var(--theme-surface, #fff)}
#app .edition-preview :deep(:is(button,input,select,textarea):disabled){opacity:1}
#app .edition-preview :deep(:is(input,select,textarea):disabled){color:var(--theme-ink, #344960);background:var(--theme-surface, #fff);-webkit-text-fill-color:#344960}
.edition-preview :deep(.management-page){width:100%;box-sizing:border-box}
.edition-preview :deep(.backend-dialog){width:100%;box-sizing:border-box;background:var(--theme-surface, #fff)}
.edition-preview :deep(.list-table){min-height:220px}
.edition-preview :deep(.management-page>header>button){display:none}
@media(max-width:760px){.edition-preview{padding:12px}.edition-preview-prompt{padding:20px;gap:12px}}
</style>