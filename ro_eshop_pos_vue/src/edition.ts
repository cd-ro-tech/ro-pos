import { standalone } from './mode';

export const upgradeMessage = '此功能需升级开通，请联系升级购买';
const premiumFeatures = new Set(['member-manage', 'member-settings', 'payment-settings', 'store-manage', 'user-manage', 'plus', 'online-orders', 'coupon-manage', 'member', 'scan', 'recharge', 'coupons', 'create']);
export function needsUpgrade(feature: string) { return standalone.value && premiumFeatures.has(feature); }

// Enforce the basic local edition before accessing or mutating the local ledger.
export function assertLocalEdition(operation: string, args: any = {}) {
  if (/^(local_member_|member_|members$|manage_members$|manage_coupons$|coupon_|grant|scan_|admin_|user_|store_)/.test(operation) ||
      ['quote', 'sale'].includes(operation) && (Number(args.member_id) || args.use_points === true || args.use_points === 'true' || Number(args.coupon_id) || (args.payment_method && args.payment_method !== 'cash'))) {
    throw Object.assign(new Error(upgradeMessage), { code: 403 });
  }
}
