<script setup lang="ts">
import ReturnDialog from "./ReturnDialog.vue";
const showReturn = ref(false);
import { needsUpgrade, upgradeMessage } from "../edition";
import { backendUser } from '../localIdentity';
import { activeCurrency } from "../currency";
import { t } from "../i18n";
import { useScanQueue } from "../scanQueue";
import type { Product, CartLine, Category } from "../types";
import { confirmAction } from "../confirmation";
import { standalone } from "../mode";
import { formatDateTime } from "../i18n";
import { useShortcuts } from "../shortcuts";
import ShortcutHint from "../components/ShortcutHint.vue";
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";
import { api, session, storeId, notice, money, errorText } from "../api";
import {
  offline,
  enqueue,
  read,
  scope,
} from "../offline";
const cashReceived = ref("");
const localPayment=ref('cash');
const onlinePaymentEnabled = false;
const paymentUnavailableLabel = "Upgrade";
const checkoutOpen = ref(false),
  creatingMember = ref(false);
const settlementDialog = ref<HTMLDialogElement | null>(null),
  settlementLocked = ref(false);
watch(checkoutOpen, async (open) => {
  await nextTick();
  if (open) {
    settlementDialog.value?.showModal();
    if (checkoutStep.value === "member") checkoutMemberInput.value?.focus();
  }
  else settlementDialog.value?.close();
});
function dismissCheckout() {
  if (submitting.value || settlementLocked.value) return;
  if (order.value) returnToRegister();
  else backToProducts();
}
import PosIcon from "../components/PosIcon.vue";
import ProductImage from "../components/ProductImage.vue";

import OrderDetail from "./OrderDetail.vue";
const memberActionLocked = ref(false);
const props = defineProps<{
  active?: boolean;
  memberService?: { mode: string; key: number; member?: any } | null;
}>();
const emit = defineEmits(["working", "service-updated"]);
const serviceMember = ref<any>(null),
  serviceMode = ref("");
const selectedMember = computed(() =>
  panel.value === "member-service" ? serviceMember.value : member.value,
);
const products = ref<Product[]>([]),
  keyword = ref(""),
  loading = ref(false),
  pageTransition = ref(false),
  productError = ref("");
const cart = ref<CartLine[]>([]),
  member = ref<any>(null),
  memberKeyword = ref(""),
  members = ref<any[]>([]),
  memberBusy = ref(false),
  memberError = ref("");
const coupon = ref(0),
  points = ref(false),
  note = ref("");
const activeSale = ref<any>(null),
  saleAttempt = ref<any>(null),
  restoring = ref(true);
const saleLocked = computed(() => !!activeSale.value || !!saleAttempt.value);
const quote = ref<any>(null),
  quoting = ref(false),
  quoteError = ref(""),
  submitting = ref(false),
  order = ref<any>(null),
  requestKey = ref(crypto.randomUUID()),
  held = ref<any[]>([]);
const holdKey = `ro-pos-held:${backendUser(session.value.user.id)}:${storeId.value}`;
const draftKey = holdKey + ":draft";
function saveDraft() {
  if (!cart.value.length && !saleLocked.value) {
    localStorage.removeItem(draftKey);
    return;
  }
  localStorage.setItem(
    draftKey,
    JSON.stringify({
      cart: cart.value,
      member: member.value,
      note: note.value,
      request_key: requestKey.value,
      coupon: coupon.value,
      points: points.value,
      activeSale: activeSale.value,
      saleAttempt: saleAttempt.value,
    }),
  );
}
watch(
  [cart, member, note, requestKey, coupon, points, activeSale, saleAttempt],
  () => {
    if (restoring.value) return;
    try {
      saveDraft();
    } catch {
      notice.value = "购物车自动保存失败，请勿关闭页面";
    }
  },
  { deep: true },
);
let productVersion = 0,
  memberVersion = 0,
  quoteVersion = 0,
  quoteTimer: ReturnType<typeof setTimeout> | undefined,
  searchTimer: ReturnType<typeof setTimeout> | undefined;
const payload = computed(() =>
  cart.value.map((p) => ({
    id: p.id,
    qty: p.qty,
    ...(p.sale_price != null ? { sale_price: p.sale_price, ro_pos_price_reason: p.ro_pos_price_reason } : {}),
    checked_service_data: (p.selectedServices || []).map((id: number) => ({
      id,
    })),
  })),
);
const count = computed(() => cart.value.reduce((n, p) => n + p.qty, 0)),
  subtotal = computed(() => cart.value.reduce((n, p) => n + lineTotal(p), 0));
const signature = computed(() =>
  JSON.stringify([payload.value, member.value?.id, coupon.value, points.value, activeCurrency.value]),
);
watch(
  () => cart.value.length,
  (value) => emit("working", value > 0),
);
function params() {
  return {
    member_id: member.value?.id || 0,
    order_line: payload.value,
    fulfillment_type: "pos",
    coupon_id: coupon.value,
    use_points: String(points.value),
  };
}
watch(activeCurrency, () => { coupon.value = 0; points.value = false; });
watch(signature, () => {
  quoteVersion++;
  quote.value = null;
  if (!restoring.value && !saleLocked.value)
    requestKey.value = crypto.randomUUID();
  clearTimeout(quoteTimer);
  quoteTimer = setTimeout(calculate, 250);
});
async function calculate() {
 const version=++quoteVersion;quote.value=null;quoteError.value='';
 if(!checkoutOpen.value||order.value||!cart.value.length||restoring.value)return;
 quoting.value=true;try{const data=await api('quote',params());if(version===quoteVersion)quote.value=data;}
 catch(e){if(version===quoteVersion)quoteError.value=errorText(e);}finally{if(version===quoteVersion)quoting.value=false;}
}
function openMemberIdentity(){notice.value=upgradeMessage;}
let searchAbort: AbortController | undefined, memberAbort: AbortController | undefined;
const scans = useScanQueue(async code => {
  if (saleLocked.value || checkoutOpen.value) throw new Error('订单正在结算，请完成后重新扫描');
  const data = await api('products', {keyword:code, scan:'true', page:1});
  if (!scans.active()) return;
  const matches = data.items.filter((p: Product) => p.barcode === code || p.sku === code);
  if (matches.length !== 1) {
    if (!matches.length && data.items.length) {
      products.value = data.items; total.value = data.total; page.value = data.page; pageSize.value = data.page_size;
      throw new Error('找到相关商品，请核对并手动选择');
    }
    throw new Error(matches.length ? '条码对应多个商品，请手动选择' : '未找到商品');
  }
  if (saleLocked.value || checkoutOpen.value) throw new Error('订单正在结算，请完成后重新扫描');
  const before = cart.value.reduce((n, p) => n + p.qty, 0);
  add(matches[0]);
  if (cart.value.reduce((n, p) => n + p.qty, 0) <= before) throw new Error('数量已达到单笔上限，未加购');
}, (code, error) => {
  const text = `${code}：${errorText(error)}`;
  notice.value = text;
});
const scanCount = scans.count;
watch(scanCount, value => emit("working", value > 0 || cart.value.length > 0));
async function loadCategories() { categories.value = (await api('categories')).category_data; if(category.value && !categories.value.some(row=>row.id===category.value))category.value=0; if(rootCategory.value && !categories.value.some(row=>row.id===rootCategory.value))rootCategory.value=0; }
async function searchProducts(scan = false, pagination = false) {
  clearTimeout(searchTimer);
  if (scan) { const code = keyword.value.trim(); keyword.value = ''; scans.enqueue(code); return; }
  searchAbort?.abort();
  const controller = new AbortController(); searchAbort = controller;
  const version = ++productVersion;
  const startedAt = performance.now();
  pageTransition.value = pagination;
  loading.value = true;
  productError.value = "";
  try {
    const data = await api("products", {
      keyword: keyword.value,
      category_id: keyword.value.trim() ? 0 : category.value,
      page: scan ? 1 : page.value,
      scan: String(scan),
    }, {signal: controller.signal});
    if (version !== productVersion) return;
    products.value = data.items;
    if (!categories.value.length) await loadCategories();
    if (version !== productVersion) return;
    total.value = data.total;
    page.value = data.page;
    pageSize.value = data.page_size;

  } catch (e) {
    if (version === productVersion) productError.value = errorText(e);
  } finally {
    const remaining = pagination ? 300 - (performance.now() - startedAt) : 0;
    if (version === productVersion && remaining > 0) {
      await new Promise<void>((resolve) => setTimeout(resolve, remaining));
    }
    if (version === productVersion) loading.value = false;
  }
}
function add(product: any) {
  selectedId.value = product.id;
  quantityBuffer.value = "";
  const line = cart.value.find((p) => p.id === product.id);
  if (line) {
    line.qty = Math.min(1000000, line.qty + 1);
  } else cart.value.push({ ...product, qty: 1, selectedServices: [] });
}
function quantity(line: any, value: number) {
  const rounded = Math.round(value * 1000) / 1000;
  if (Number.isFinite(rounded) && rounded > 0)
    line.qty = Math.min(1000000, rounded);
}
async function searchMembers(_scan=true){notice.value=upgradeMessage;}
async function chooseFoundMember(_value:any){notice.value=upgradeMessage;}
async function chooseMember(_value:any){notice.value=upgradeMessage;}
function clearMember(){member.value=null;}
function reset() {
  cart.value = [];
  selectedId.value = 0;
  quantityBuffer.value = "";
  clearMember();
  coupon.value = 0;
  points.value = false;
  note.value = "";
  quote.value = null;
  quoteError.value = "";
  cashReceived.value = "";
  localPayment.value = "cash";
}
function saveHeld(items: any[]) {
  try {
    localStorage.setItem(holdKey, JSON.stringify(items));
    held.value = items;
    return true;
  } catch {
    notice.value = "浏览器存储不可用，挂单未保存，请勿关闭当前购物车";
    return false;
  }
}
function suspend() {
  if (scanCount.value) { notice.value = "请等待扫码完成后挂单"; return; }
  if (!cart.value.length) return;
  if (held.value.length >= 20) {
    notice.value = "最多保留 20 笔挂单，请先处理已有挂单";
    return;
  }
  const item = {
    id: crypto.randomUUID(),
    at: formatDateTime(new Date()),
    cart: JSON.parse(JSON.stringify(cart.value)),
    member: member.value,
    note: note.value,
  };
  if (saveHeld([item, ...held.value])) {
    reset();
    backToProducts();
    notice.value = "已挂单，保存在当前设备及员工门店下";
  }
}
async function resume(item: any) {
  if (
    cart.value.length &&
    !(await confirmAction({ title: "取回挂单", message: "取回这笔挂单将替换当前购物车。如需保留商品，请取消并先挂单。", confirmLabel: "确认取回", icon: "restore" }))
  )
    return;
  if (!saveHeld(held.value.filter((x) => x.id !== item.id))) return;
  reset();
  cart.value = item.cart;
  selectedId.value = item.cart[0]?.id || 0;
  note.value = item.note || "";
  if (item.member) await chooseMember(item.member);
  closePanel();
  notice.value = "已取回挂单，商品价格将在结算时重新核算";
}
async function removeHold(id: string) {
  if (await confirmAction({ title: "删除挂单", message: "删除后无法取回这笔挂单，确认删除？", confirmLabel: "删除挂单" }))
    saveHeld(held.value.filter((x) => x.id !== id));
}
async function submit(){
 if(scanCount.value||submitting.value||!quote.value)return;
 submitting.value=true;quoteError.value='';
 try{
  if(!cashReceived.value.trim())throw new Error('请输入有效现金实收');
  saveDraft();const receipt=await enqueue({...params(),note:note.value,request_key:requestKey.value,currency_code:activeCurrency.value,amount:quote.value.total,received:Number(cashReceived.value),payment_method:'cash'});
  closePanel();reset();order.value=receipt;checkoutOpen.value=true;notice.value='现金订单已保存在本机';await searchProducts();
 }catch(e){quoteError.value=errorText(e);}finally{submitting.value=false;}
}
function beforeUnload(event: BeforeUnloadEvent) {
  if (cart.value.length) {
    event.preventDefault();
    event.returnValue = "";
  }
}
onMounted(async () => {
  searchProducts();
  let draft: any = null;
  let savedOrders: any[] = [];
  try {
    draft = JSON.parse(localStorage.getItem(draftKey) || "null");
  } catch {
    notice.value = "无法恢复上次购物车";
  }
  try {
    if (standalone.value) savedOrders=(await (await import('../standalone')).exportLocalData()).orders.map((o:any)=>({request_key:o.uid}));
    else
      savedOrders = (await read("queue:" + scope())) || [];
  } catch {
    notice.value = "无法读取离线订单记录";
  }
  try {
    if (
      !savedOrders.some((r: any) => r.request_key === draft?.request_key) &&
      Array.isArray(draft?.cart) &&
      draft.cart.every(
        (p: any) =>
          p &&
          Number.isFinite(p.qty) &&
          p.qty > 0 &&
          Array.isArray(p.services) &&
          Array.isArray(p.selectedServices),
      )
    ) {
      cart.value = draft.cart;
      note.value = draft.note || "";
      activeSale.value = null;
      saleAttempt.value = null;
      if (draft.member) await chooseMember(draft.member);
      coupon.value = offline.value ? 0 : draft.coupon || 0;
      points.value = !offline.value && !!draft.points;
      await nextTick();
      if (draft.request_key) requestKey.value = draft.request_key;
    }
  } catch {
    notice.value = "无法恢复上次购物车";
  }
  try {
    const data = JSON.parse(localStorage.getItem(holdKey) || "[]");
    held.value = Array.isArray(data)
      ? data
          .filter(
            (x) =>
              x &&
              x.id &&
              Array.isArray(x.cart) &&
              x.cart.every(
                (p: any) =>
                  p &&
                  Number.isInteger(p.id) &&
                  Number.isFinite(p.qty) &&
                  p.qty > 0 &&
                  Array.isArray(p.services) &&
                  Array.isArray(p.selectedServices),
              ),
          )
          .slice(0, 20)
      : [];
  } catch {
    notice.value = "无法读取挂单记录";
  }
  restoring.value = false;
  if (activeSale.value && !offline.value) await continueSale();
  else calculate();
  window.addEventListener("beforeunload", beforeUnload);
  window.addEventListener("keydown", quantityKeydown);
});
onBeforeUnmount(() => {
  searchAbort?.abort(); memberAbort?.abort();
  clearTimeout(quoteTimer);
  clearTimeout(searchTimer);
  window.removeEventListener("keydown", quantityKeydown);
  quoteVersion++;
  productVersion++;
  memberVersion++;
  window.removeEventListener("beforeunload", beforeUnload);
});

const paymentChoice = ref("cash");
const checkoutStep = ref("member");
const checkoutMemberInput = ref<HTMLInputElement | null>(null);
watch(checkoutStep, async step => {
  if (step === "member") {
    await nextTick();
    checkoutMemberInput.value?.focus();
  }
});
async function enterPayment(guest = false) {
  if (scanCount.value) { notice.value = "扫码处理中，请稍候再结算"; return; }
  if (submitting.value || memberBusy.value) return;
  if (guest) clearMember();
  checkoutStep.value = "payment";
  await nextTick();
  clearTimeout(quoteTimer);
  await calculate();
  if (!quote.value) { notice.value = quoteError.value || '结算核算失败，请稍后重试'; return; }
  if (offline.value) cashReceived.value = Number(quote.value.total).toFixed(2);
  else await submit();
}
function formatCashReceived() {
  const value = cashReceived.value.trim();
  if (/^\d+(\.\d{0,2})?$/.test(value) && Number.isFinite(Number(value))) {
    cashReceived.value = Number(value).toFixed(2);
  }
}
const showAllCategories = ref(false),
  categoryTabs = ref<HTMLElement | null>(null),
  categoryMore = ref<HTMLButtonElement | null>(null);
const categories = ref<Category[]>([]),
  category = ref(0),
  page = ref(1),
  total = ref(0),
  pageSize = ref(30);
const categoriesOverflow = ref(false);
let categoryObserver: ResizeObserver | undefined;
function measureCategories() {
  const tabs = categoryTabs.value;
  if (!tabs?.parentElement) return;
  const buttons = Array.from(tabs.children) as HTMLElement[];
  const gap = parseFloat(getComputedStyle(tabs).columnGap) || 0;
  const needed = buttons.reduce((sum, button) => sum + button.getBoundingClientRect().width, 0)
    + Math.max(0, buttons.length - 1) * gap;
  categoriesOverflow.value = needed > tabs.parentElement.clientWidth + 1;
}
onMounted(() => {
  categoryObserver = new ResizeObserver(measureCategories);
  if (categoryTabs.value?.parentElement) categoryObserver.observe(categoryTabs.value.parentElement);
});
watch(categories, async () => { await nextTick(); measureCategories(); });
onBeforeUnmount(() => categoryObserver?.disconnect());
const canChangePrice = computed(() => standalone.value || (!offline.value && !!session.value?.stores.find((s: any) => s.id === storeId.value)?.can_change_price));
const selectedId = ref(0),
  quantityBuffer = ref(""),
  mobilePane = ref("products");
const cartScroll = ref<HTMLElement | null>(null);
watch(selectedId, () => { quantityBuffer.value = ""; });
watch([selectedId, () => cart.value.length], async () => {
  await nextTick();
  cartScroll.value
    ?.querySelector(".cart-row.selected")
    ?.scrollIntoView({ block: "nearest" });
});
const selectedLine = computed(() =>
  cart.value.find((p) => p.id === selectedId.value),
);

const pages = computed(() =>
  Math.max(1, Math.ceil(total.value / pageSize.value)),
);
const drawer = ref<HTMLDialogElement | null>(null),
  panel = ref("");
const panelTitle = computed(
  () =>
    ({
      "member-service":
        (
          {
            create: "会员新建",
            recharge: "会员充值",
            coupons: "优惠券发放",
          } as Record<string, string>
        )[serviceMode.value] || "会员服务",
      note: "订单备注",
      held: "取回挂单",
    })[panel.value as "member-service" | "note" | "held"] || "",
);
async function openPanel(value: string) {
  if (scanCount.value) { notice.value = "请等待扫码完成"; return; }
  panel.value = value;
  await nextTick();
  drawer.value?.showModal();
}
function closePanel() {
  drawer.value?.close();
  panel.value = "";
}
function dismissPanel() {
  closePanel();
}
function checkout(withMember = false) {
  if(needsUpgrade("member") && (withMember || member.value)){notice.value=upgradeMessage;return;}
  if (scanCount.value) { notice.value = "请等待扫码完成后结算"; return; }
  if (memberBusy.value) return;
  const memberCheckout = withMember || !!member.value;
  checkoutStep.value = memberCheckout ? "member" : "payment";
  memberKeyword.value = "";
  members.value = [];
  memberError.value = "";
  checkoutOpen.value = true;
  mobilePane.value = "products";
  if (saleLocked.value) {
    continueSale();
    return;
  }
  if (!cart.value.length) { checkoutOpen.value = false; return; }
  if (memberCheckout) calculate();
  else void enterPayment();
}
function backToProducts() {
  checkoutOpen.value = false;
  creatingMember.value = false;
  mobilePane.value = "products";
  quoteVersion++;
  quote.value = null;
  quoting.value = false;
}

const rootCategory = ref(0),
  showingSubcategories = ref(false);
const topCategories = computed(() =>
  categories.value.filter((c) => !c.parent_id),
);
const subcategories = computed(() =>
  categories.value.filter((c) => c.parent_id === rootCategory.value),
);
const categoryLabel = computed(
  () =>
    categories.value.find((c) => c.id === category.value)?.name || "全部商品",
);
watch(
  keyword,
  () => {
    ++productVersion;
    clearTimeout(searchTimer);
    page.value = 1;
    loading.value = true;
    searchTimer = setTimeout(() => searchProducts(), 250);
  },
  { flush: "sync" },
);
async function selectCategory(id: number) {
  keyword.value = "";
  rootCategory.value = id;
  category.value = id;
  page.value = 1;
  showingSubcategories.value =
    !!id && categories.value.some((c) => c.parent_id === id);
  await searchProducts();
}
function chooseSubcategory(id: number) {
  category.value = id;
  showingSubcategories.value = false;
  page.value = 1;
  searchProducts();
}
function quantityKeydown(event: KeyboardEvent) {
  if (props.active === false) return;
  const target = event.target as HTMLElement;
  if (
    event.defaultPrevented ||
    event.isComposing ||
    (event.key === "Backspace" && event.repeat) ||
    event.ctrlKey ||
    event.metaKey ||
    event.altKey ||
    target?.closest('input,textarea,select,[contenteditable="true"]') ||
    document.querySelector("dialog[open]") ||
    checkoutOpen.value ||
    restoring.value ||
    saleLocked.value ||
    submitting.value ||
    !selectedLine.value
  )
    return;
  const key =
    event.key === "Backspace"
      ? "back"
      : event.key === "Delete"
        ? "delete"
        : event.key;
  if (/^[0-9.+-]$/.test(key) || ["back", "delete"].includes(key)) {
    event.preventDefault();
    keypress(key);
  }
}
function changePage(delta: number) {
  if (loading.value || page.value + delta < 1 || page.value + delta > pages.value) return;
  page.value += delta;
  searchProducts(false, true);
}
function selectLine(id: number) {
  selectedId.value = id;
  quantityBuffer.value = "";
}
function unitPrice(line: any) { return Number(line.sale_price ?? line.price); }
function servicePrice(line: any) {
  return line.services.filter((s: any) => line.selectedServices.includes(s.id)).reduce((sum: number, s: any) => sum + Number(s.price), 0);
}
function lineTotal(line: any) {
  const total = line.qty * (unitPrice(line) + servicePrice(line));
  return line.sale_price == null ? total : Math.round((total + Number.EPSILON) * 100) / 100;
}
const removeDialog = ref<HTMLDialogElement | null>(null);
const removeConfirmButton = ref<HTMLButtonElement | null>(null);
const removingLine = ref<any>(null);
async function requestRemove(line: any) {
  if (removingLine.value || submitting.value || saleLocked.value || restoring.value || order.value) return;
  removingLine.value = line;
  await nextTick();
  removeDialog.value?.showModal();
  await nextTick();
  removeConfirmButton.value?.focus();
}
function cancelRemove() {
  removeDialog.value?.close();
  removingLine.value = null;
}
function confirmRemove() {
  const id = removingLine.value?.id;
  if (!id || submitting.value || saleLocked.value || restoring.value || order.value) return;
  cart.value = cart.value.filter(line => line.id !== id);
  selectedId.value = cart.value.at(-1)?.id || 0;
  quantityBuffer.value = "";
  cancelRemove();
}
const priceDialog = ref<HTMLDialogElement | null>(null);
const priceInput = ref<HTMLInputElement | null>(null);
const pricingLine = ref<any>(null);
const priceDraft = ref("");
const priceReason = ref("");
const priceError = ref("");
async function requestPriceChange() {
  const line = selectedLine.value;
  if (!line || submitting.value || saleLocked.value || restoring.value || order.value) return;
  if (!canChangePrice.value) { notice.value = '当前门店仅允许获准的店长或管理员改价'; return; }
  pricingLine.value = line;
  priceDraft.value = unitPrice(line).toFixed(2);
  priceReason.value = line.ro_pos_price_reason || '';
  priceError.value = '';
  await nextTick();
  priceDialog.value?.showModal();
  await nextTick();
  priceInput.value?.focus();
  priceInput.value?.select();
}
function cancelPriceChange() {
  priceDialog.value?.close();
  pricingLine.value = null;
  priceError.value = '';
}
function confirmPriceChange() {
  const line = pricingLine.value;
  if (!line) return;
  const price = Number(priceDraft.value);
  const reason = priceReason.value.trim();
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(priceDraft.value.trim()) || !Number.isFinite(price) || price < 0 || price > 1000000) {
    priceError.value = '请输入 0 至 1000000 元、最多两位小数的成交单价';
    priceInput.value?.focus();
    return;
  }
  if (Math.abs(price - Number(line.price)) > 0.000001 && !reason) {
    priceError.value = '请填写改价原因';
    return;
  }
  if (Math.abs(price - Number(line.price)) <= 0.000001) {
    delete line.sale_price;
    delete line.ro_pos_price_reason;
  } else {
    line.sale_price = price;
    line.ro_pos_price_reason = reason;
  }
  quantityBuffer.value = '';
  cancelPriceChange();
}
function keypress(key: string) {
  const line = selectedLine.value;
  if (!line || !(/^[0-9.+-]$/.test(key) || ["back", "delete"].includes(key)))
    return;
  if (key === "delete") {
    requestRemove(line);
    return;
  }
  if (key === "+" || key === "-") {
    quantity(line, line.qty + (key === "+" ? 1 : -1));
    quantityBuffer.value = "";
    return;
  }
  if (key === "back") {
    if (line.qty === 1) {
      requestRemove(line);
      return;
    }
    const trimmed = (quantityBuffer.value || String(line.qty)).slice(0, -1);
    quantityBuffer.value = String(Math.max(1, Number(trimmed) || 1));
  }
  else if (
    quantityBuffer.value.length < 7 &&
    !(key === "." && quantityBuffer.value.includes("."))
  )
    quantityBuffer.value += key;
  const value = Number(quantityBuffer.value);
  if (value > 0 && Number.isFinite(value)) {
    quantity(line, value);

  }
}
async function clearCart() {
  if (scanCount.value) { notice.value = "请等待扫码完成后清空"; return; }
  if (cart.value.length && await confirmAction({ title: "清空当前订单", message: "将移除当前购物车中的全部商品，确认清空？", confirmLabel: "清空订单" })) {
    reset();
    backToProducts();
  }
}
const searchInput = ref<HTMLInputElement | null>(null);
useShortcuts(
  {
    search: async () => {
      mobilePane.value = "products";
      await nextTick();
      searchInput.value?.focus();
    },
    member: () => checkout(true),
    hold: () => {
      if (cart.value.length) suspend();
    },
    held: () => openPanel("held"),
    checkout,
  },
  () => props.active !== false && !panel.value && !order.value && !submitting.value && !saleLocked.value,
);
function updateOrder(data:any){order.value=data;}
function cancelledOrder(){order.value=null;backToProducts();}
function continueSale(){notice.value=upgradeMessage;}
async function returnToRegister(){if(submitting.value)return;order.value=null;backToProducts();}
defineExpose({ refreshProducts: async () => { await loadCategories(); await searchProducts(); } });
</script>
<template>
  <div class="mobile-switch">
    <button
      :class="{ active: mobilePane === 'products' }"
      @click="mobilePane = 'products'"
    >{{ t("选择商品") }}</button
    ><button
      :class="{ active: mobilePane === 'order' }"
      @click="mobilePane = 'order'"
    >{{ t("当前订单 · {0} 件", [count]) }}</button>
  </div>
  <div v-if="saleLocked" class="sale-resume" role="status">
    <span
      >{{ t("购物车已保留 ·") }} {{
        activeSale?.number || t("订单结果待确认")
      }} {{ t("，请继续原订单或取消未付款订单。") }}</span
    >
    <button
      class="action-with-icon primary"
      :disabled="submitting || offline"
      @click="continueSale"
    ><PosIcon name="restore" />{{ t("继续原订单") }}</button>
  </div>
  <div class="register-layout" :data-pane="mobilePane">
    <section
      class="basket"
      :aria-label="t('当前订单')"
      :inert="submitting || saleLocked || restoring || !!order"
    >
      <div class="order-columns">
        <span>{{ t("商品") }}</span><span>{{ t("单价") }}</span><span>{{ t("数量") }}</span><span>{{ t("小计") }}</span>
      </div>
      <div ref="cartScroll" class="cart-scroll">
        <div v-if="!cart.length" class="basket-empty">
          <PosIcon name="bag" />
          <h3>{{ t("开始一笔新订单") }}</h3>
          <p>{{ t("选择商品，或直接扫描商品条码") }}</p>
        </div>
        <article
          v-for="line in cart"
          :key="line.id"
          class="cart-row"
          :class="{ selected: selectedId === line.id }"
        >
          <button
            class="line-select"
            :aria-label="t('选择') + line.name"
            :aria-pressed="selectedId === line.id"
            @click="selectLine(line.id)"
          >
            <span class="line-image"
              ><ProductImage :src="line.image" compact /></span
            ><span class="line-copy"
              ><b>{{ line.name }}</b
              ><small>{{ line.spec }}</small></span
            ><span class="line-price">{{ money(unitPrice(line)) }}</span
            ><span class="line-qty">{{ line.qty }}</span
            ><strong>{{ money(lineTotal(line)) }}</strong>
          </button>
          <div v-if="line.services.length" class="line-services">
            <label v-for="s in line.services" :key="s.id" class="check"
              ><input
                v-model="line.selectedServices"
                type="checkbox"
                :value="s.id"
              />{{ s.name }} {{ money(s.price)
              }}<span v-if="s.integral"> + {{ s.integral }} {{ t("积分") }}</span></label
            >
          </div>
        </article>
      </div>
      <div class="basket-controls">
      <div class="basket-summary" :aria-label="t('订单汇总')">
        <span>{{ t("数量：{0} 件", [count]) }}</span>
        <span>{{ t("小计") }}<strong>{{ money(subtotal) }}</strong></span>
      </div>
      <div class="basket-head">
        <div>
          <button :disabled="!cart.length" @click="suspend" class="action-with-icon"><PosIcon name="hold" />{{ t("挂单") }}<ShortcutHint action="hold" /></button
          ><button @click="openPanel('held')" class="action-with-icon"><PosIcon name="restore" />{{ t("取单") }}<ShortcutHint action="held" />
          </button>
          <button class="action-with-icon" :disabled="!standalone && offline" @click="showReturn=true">{{ t("退货") }}</button>
          <div class="keypad-mode-pair" :aria-label="t('输入模式')">
              <button :aria-label="t('数量')" aria-pressed="true" :disabled="!selectedLine">{{ t("数量") }}</button>
              <button :aria-label="t('改价')" :disabled="!selectedLine || !canChangePrice" @click="requestPriceChange">{{ t("改价") }}</button>
            </div>
        </div>
      </div>
      <div class="basket-bottom">
        <div class="keypad" :aria-label="t('商品数量键盘')">
          <template
            v-for="key in [
              '1',
              '2',
              '3',
              'clear',
              '4',
              '5',
              '6',
              '+',
              '7',
              '8',
              '9',
              '-',
              '.',
              '0',
              'back',
              'delete',
            ]"
            :key="key"
            > <button v-if="key === 'clear'" class="keypad-clear action-with-icon" :disabled="!cart.length" @click="clearCart"><PosIcon name="trash" />{{ t("清空") }}</button
            ><button
              v-else
              :disabled="!selectedLine"
              :class="{
                'keypad-action': ['+', '-', 'back', 'delete'].includes(key),
              }"
              :aria-label="
                key === 'back'
                  ? t('退格')
                  : key === 'delete'
                    ? t('移除所选商品')
                    : key === '+'
                      ? t('增加数量')
                      : key === '-'
                        ? t('减少数量')
                        : t('数量 {0}', [key])
              "
              @click="keypress(key)"
            >
              <PosIcon
                v-if="key === 'back' || key === 'delete'"
                :name="key === 'delete' ? 'close' : 'back'"
              /><template v-else>{{ key === "-" ? "−" : key }}</template>
            </button></template
          >
        </div>
      <div v-if="member" class="basket-member" :aria-label="t('当前订单会员')">
        <PosIcon name="user" /><div class="basket-member-info"><b>{{ member.name }}</b><span>{{ t(member.level || "普通会员") }} · {{ member.phone || member.number }}</span></div>
        <button :disabled="needsUpgrade('member') || saleLocked || submitting || !!order" @click="openMemberIdentity">{{ t("更换") }}</button>
        <button :disabled="saleLocked || submitting || !!order" @click="clearMember" :aria-label="t('取消关联会员')">{{ t("取消") }}</button>
      </div>
        <button v-else-if="!needsUpgrade('member')" class="member-checkout-trigger action-with-icon" :disabled="needsUpgrade('member') || !cart.length || submitting || !!scanCount" @click="checkout(true)"><PosIcon name="user" />{{ t("会员结算") }}<span v-if="needsUpgrade('member')" class="upgrade-flag">Upgrade</span></button>
      </div>
      <footer class="basket-checkout-footer">
        <button
          class="primary pay-button"
          :disabled="!cart.length || submitting"
          @click="checkout()"
        >
          <span>{{ t("结算") }}</span
          ><strong>{{ money(subtotal) }}</strong
          ><PosIcon name="arrow" />
        </button>
      </footer>
      </div>
    </section>
    <section
      class="catalog"
      :aria-label="t('选择商品')"
      :inert="submitting || saleLocked || restoring"
    >
      <form class="catalog-search" @submit.prevent="searchProducts(true)">
        <PosIcon name="search" /><input
          ref="searchInput"
          v-model="keyword"
          :aria-label="t('扫描商品条码或搜索')"
          :placeholder="t('搜索商品名称 / 条码，或直接扫码')"
        /><button
          class="plain"
          type="submit"
          :aria-label="t('搜索商品')"
        >
          <PosIcon name="scan" /><span>{{ t("搜索") }}</span
          ><ShortcutHint action="search" />
        </button>
      </form>
      <div class="category-bar">
        <div ref="categoryTabs" class="category-tabs" :aria-label="t('商品分类')">
          <button
            :class="{ active: !category }"
            :aria-pressed="!category"
            @click="selectCategory(0)"
          >{{ t("全部商品") }}</button
          ><button
            v-for="c in topCategories"
            :key="c.id"
            :class="{ active: rootCategory === c.id }"
            :aria-pressed="rootCategory === c.id"
            @click="selectCategory(c.id)"
          >
            {{ c.name }}
          </button>
        </div>
        <button
          v-if="categoriesOverflow || showAllCategories"
          ref="categoryMore"
          class="category-more"
          :aria-expanded="showAllCategories"
          aria-controls="all-product-categories"
          @click="showAllCategories = !showAllCategories"
        >
          {{ showAllCategories ? t("收起分类") : t("查看更多") }}
          <PosIcon name="down" :class="{'category-more-up': showAllCategories}" />
        </button>
      </div>
      <div
        v-if="showAllCategories"
        id="all-product-categories"
        class="category-expanded"
        role="region"
        :aria-label="t('全部商品分类')"
      >
        <button
          :aria-label="t('全部商品')"
          :class="{ active: !category }"
          :aria-pressed="!category"
          @click="selectCategory(0)"
        >{{ t("全部商品") }}</button>
        <button
          v-for="c in topCategories"
          :key="c.id"
          :aria-label="c.name"
          :class="{ active: rootCategory === c.id }"
          :aria-pressed="rootCategory === c.id"
          @click="selectCategory(c.id)"
        >
          {{ c.name }}
        </button>
      </div>
      <div v-if="rootCategory && !keyword.trim()" class="category-breadcrumb">
        <button @click="selectCategory(0)">{{ t("全部商品") }}</button><span>/</span
        ><button @click="selectCategory(rootCategory)">
          {{ categories.find((c) => c.id === rootCategory)?.name }}</button
        ><template v-if="category !== rootCategory"
          ><span>/</span><b>{{ categoryLabel }}</b></template
        >
      </div>
      <p v-if="scanCount" class="hint" role="status">{{ t("正在处理") }} {{ scanCount }} {{ t("次扫码…") }}</p>
      <div class="catalog-content" :aria-busy="loading">
      <div class="catalog-scroll">
        <div v-if="productError" class="empty">
          <p class="error" role="alert">{{ t(productError) }}</p>
          <button @click="searchProducts()" class="action-with-icon"><PosIcon name="refresh" />{{ t("重新加载") }}</button>
        </div>
        <div v-else-if="loading && !pageTransition" class="empty">{{ t("正在加载商品…") }}</div>
        <div
          v-else-if="showingSubcategories && !keyword.trim()"
          class="subcategory-grid"
          role="region"
          :aria-label="t('二级分类')"
        >
          <button
            v-for="c in subcategories"
            :key="c.id"
            class="subcategory-card"
            @click="chooseSubcategory(c.id)"
          >
            <span class="product-image"><ProductImage :src="c.image" /></span
            ><b>{{ c.name }}</b
            ><small>{{ c.product_count == null ? t("查看商品") : t("{0} 件商品", [c.product_count]) }}</small>
          </button>
        </div>
        <div v-else-if="!products.length" class="empty">
          <h3>{{ t("没有找到商品") }}</h3>
          <p>{{ t("试试其他名称、条码或分类") }}</p>
        </div>
        <div v-else class="product-grid" :class="{ 'products-page-enter': pageTransition && !loading }">
          <button
            v-for="p in products"
            :key="p.id"
            class="product-card"
            :disabled="loading"
            :aria-label="t('添加') + p.name + ' ' + p.spec"
            @click="add(p)"
          >
            <span class="product-image"><ProductImage :src="p.image" /></span
            ><span
              v-if="cart.find((x) => x.id === p.id)"
              class="product-count"
              >{{ cart.find((x) => x.id === p.id)?.qty }}</span
            ><span class="product-copy"
              ><b>{{ p.name }}</b
              ><small>{{ p.spec }}</small
              ><span class="product-price"
                ><strong>{{ money(p.price) }}</strong
                ></span
              ></span
            >
          </button>
        </div>
      </div>
      <div v-if="loading && pageTransition" class="catalog-loading" role="status">
        <span class="catalog-loading-spinner" aria-hidden="true"></span>
        <span>{{ t("加载中…") }}</span>
      </div>
      </div>
      <footer
        v-if="!showingSubcategories || keyword.trim()"
        class="catalog-footer"
      >
        <span>{{ t("共 {0} 件商品", [total]) }}</span>
        <div>
          <button
            :disabled="loading || page <= 1"
            :aria-label="t('上一页')"
            @click="changePage(-1)"
          >
            ‹ {{ t('上一页') }}</button
          ><span>{{ page }} / {{ pages }}</span
          ><button
            :disabled="loading || page >= pages"
            :aria-label="t('下一页')"
            @click="changePage(1)"
          >
            {{ t('下一页') }} ›
          </button>
        </div>
      </footer>
    </section>
  </div>
  <dialog
    ref="settlementDialog"
    class="settlement-dialog"
    :aria-label="t('结算与打印')"
    @cancel.prevent="dismissCheckout"
  >
    <header class="settlement-dialog-head">
      <h2><PosIcon :name="order && order.state !== 'draft' && order.state !== 'closed' ? 'print' : 'recharge'" />{{ order ? (order.state !== 'draft' && order.state !== 'closed' ? t("小票") : t("收款")) : checkoutStep === 'member' ? t("会员结算") : checkoutStep === 'payment' ? t("收款") : t("结算") }}</h2>
      <button
        :disabled="submitting || settlementLocked"
        @click="dismissCheckout"
        :aria-label="t('关闭结算')"
       class="dialog-close"><PosIcon name="close" /></button>
    </header>
    <section
      v-if="checkoutOpen"
      class="checkout-workspace"
      :aria-label="t('收款界面')"
    >
      <OrderDetail
        v-if="order"
        :order="order"
        :initial-method="paymentChoice"
        @updated="updateOrder"
        @locked="settlementLocked = $event"
        @cancelled="cancelledOrder"
        @close="returnToRegister"
      />
      <template v-else>
        <div v-if="submitting" class="payment-warning" role="status">{{ t("正在准备收款，请稍候…") }}</div>
        <div v-else-if="saleLocked" class="payment-warning">
          <p>{{ t("原订单结果待确认，请继续原订单，避免重复开单。") }}</p>
          <button :disabled="offline" @click="continueSale" class="action-with-icon"><PosIcon name="search" />{{ t("核实原订单") }}</button>
        </div>
        <div v-else-if="offline" class="offline-payment simple-payment">
          <div class="simple-payment-methods" :class="{'local-member-methods':standalone && member}"><button type="button" :aria-pressed="!standalone || localPayment==='cash'" :disabled="submitting" @click="localPayment='cash'"><span class="payment-icon cash"><PosIcon name="cash" /></span>{{ t("现金") }}</button><button v-for="method in [{id:'alipay', name:'支付宝'}, {id:'online', name:'微信'}]" :key="method.id" type="button" class="payment-unavailable" :disabled="!onlinePaymentEnabled" :title="t(paymentUnavailableLabel)"><span class="payment-label"><span class="payment-icon" :class="method.id"><PosIcon :name="method.id" /></span>{{ t(method.name) }}</span><span class="payment-upgrade-flag">{{ t(paymentUnavailableLabel) }}</span></button></div>
          <div class="simple-payment-due"><span>{{ t("待支付金额") }}</span><strong>{{ quote ? money(quote.total) : quoting ? t("核算中…") : t("暂无法核算") }}</strong></div>
          <div v-if="quoteError" class="error" role="alert">{{ t(quoteError) }} <button type="button" :disabled="submitting || quoting" @click="calculate">{{ t("重新核算") }}</button></div>
          <label>{{ t("收款金额") }}<input v-model="cashReceived" type="text" inputmode="decimal" @blur="formatCashReceived" /></label>
          <div v-if="!standalone || localPayment==='cash'" class="simple-change"><span>{{ t("找零") }}</span><strong>{{ money(Math.max(0, Number(cashReceived || 0) - (quote?.total || 0))) }}</strong></div>
          <footer><button @click="backToProducts" class="action-with-icon"><PosIcon name="close" />{{ t("取消") }}</button><button class="action-with-icon primary" :disabled="!quote || quoting || submitting || (!cashReceived.trim() || !Number.isFinite(Number(cashReceived)) || Number(cashReceived) < quote.total)" @click="submit"><PosIcon name="check" />{{ t("确认") }}</button></footer>
        </div>
      </template>
    </section>
  </dialog>
  <dialog ref="removeDialog" class="product-action-dialog remove-product-dialog" aria-labelledby="remove-product-title" @cancel.prevent="cancelRemove">
    <header><h2 id="remove-product-title"><PosIcon name="trash" />{{ t("移除商品") }}</h2><button class="dialog-close" :aria-label="t('关闭移除确认')" @click="cancelRemove"><PosIcon name="close" /></button></header>
    <template v-if="removingLine">
      <p>{{ t("是否移除此商品？") }}</p>
      <div class="remove-product-info">
        <div class="remove-product-image"><ProductImage :src="removingLine.image" /></div>
        <div><b>{{ removingLine.name }}</b><small>{{ removingLine.spec }}</small><dl><div><dt>{{ t("单价") }}</dt><dd>{{ money(unitPrice(removingLine)) }}</dd></div><div><dt>{{ t("数量") }}</dt><dd>{{ removingLine.qty }}</dd></div><div><dt>{{ t("小计") }}</dt><dd><strong>{{ money(lineTotal(removingLine)) }}</strong></dd></div></dl></div>
      </div>
      <footer><button class="action-with-icon" @click="cancelRemove"><PosIcon name="close" />{{ t("取消") }}</button><button ref="removeConfirmButton" class="primary action-with-icon" @click="confirmRemove"><PosIcon name="trash" />{{ t("确认移除") }}</button></footer>
    </template>
  </dialog>
  <dialog ref="priceDialog" class="product-action-dialog price-change-dialog" aria-labelledby="price-change-title" @cancel.prevent="cancelPriceChange">
    <form v-if="pricingLine" @submit.prevent="confirmPriceChange">
      <header><h2 id="price-change-title"><PosIcon name="note" />{{ t("商品改价") }}</h2><button type="button" class="dialog-close" :aria-label="t('关闭改价')" @click="cancelPriceChange"><PosIcon name="close" /></button></header>
      <div class="product-action-summary">
        <div class="product-action-image"><ProductImage :src="pricingLine.image" /></div>
        <div><b>{{ pricingLine.name }}</b><small>{{ pricingLine.spec }}</small><dl><div><dt>{{ t("原单价") }}</dt><dd>{{ money(pricingLine.price) }}</dd></div><div><dt>{{ t("数量") }}</dt><dd>{{ pricingLine.qty }}</dd></div><div><dt>{{ t("当前小计") }}</dt><dd><strong>{{ money(lineTotal(pricingLine)) }}</strong></dd></div></dl></div>
      </div>
      <div class="price-change-fields">
        <label>{{ t("成交单价（{0}）", [activeCurrency]) }}<input ref="priceInput" v-model="priceDraft" type="number" min="0" max="1000000" step="0.01" required inputmode="decimal" /></label>
        <label>{{ t("改价原因") }}<textarea v-model="priceReason" maxlength="200" rows="3" required :placeholder="t('请输入改价原因，最多 200 字')" /></label>
        <p v-if="priceError" class="field-error" role="alert">{{ t(priceError) }}</p>
      </div>
      <footer><button type="button" class="action-with-icon" @click="cancelPriceChange"><PosIcon name="close" />{{ t("取消") }}</button><button class="primary action-with-icon"><PosIcon name="check" />{{ t("确认改价") }}</button></footer>
    </form>
  </dialog>
  <dialog
    ref="drawer"
    class="pos-drawer"
    :class="{ 'coupon-service-dialog': panel === 'member-service' && ['coupons', 'recharge'].includes(serviceMode) }"
    aria-labelledby="drawer-title"
    @cancel.prevent="!submitting && dismissPanel()"
    @click="$event.target === drawer && !submitting && dismissPanel()"
  >
    <div class="drawer-shell" :inert="submitting">
      <header class="drawer-header">
        <h2 id="drawer-title"><PosIcon :name="panel === 'member-service' ? 'user' : 'documents'" />{{ t(panelTitle) }}</h2>
        <button class="dialog-close" :aria-label="t('关闭面板')" @click="dismissPanel">
          <PosIcon name="close" />
        </button>
      </header>
      <div class="drawer-body">
        <template v-if="panel === 'note'"
          ><label
            >{{ t("订单备注") }}<textarea
              v-model="note"
              autofocus
              maxlength="500"
              rows="6"
              :placeholder="t('填写本次交易备注')"
            />
          </label>
          <p class="hint">{{ note.length }} / 500</p></template
        >
        <template v-if="panel === 'held'"
          ><p class="hint">{{ t("挂单仅保存在当前设备，取回后重新核算价格。") }}</p>
          <div v-if="!held.length" class="empty">{{ t("暂无挂单") }}</div>
          <article v-for="h in held" :key="h.id" class="held-item">
            <div>
              <b>{{ h.member?.name || t("未选择会员") }}</b
              ><small>{{ h.at }} · {{ h.cart.length }} {{ t("种商品") }}</small>
            </div>
            <button @click="resume(h)" class="action-with-icon"><PosIcon name="restore" />{{ t("取回") }}</button
            ><button
              class="plain"
              :aria-label="t('删除挂单')"
              @click="removeHold(h.id)"
            >
              <PosIcon name="trash" />
            </button></article
        ></template>
      </div>
      <footer v-if="panel === 'note'" class="drawer-footer">
        <button class="primary checkout-button" @click="closePanel">{{ t("保存备注") }}</button>
      </footer>
    </div>
  </dialog>
<ReturnDialog :open="showReturn" @close="showReturn=false" />
</template>
<style scoped>
.simple-payment-methods.local-member-methods{grid-template-columns:repeat(2,minmax(0,1fr))}

.checkout-choice-buttons .checkout-solid-icon,
.checkout-solid-icon svg {
  width: 36px;
  height: 36px;
}
.catalog-content {
  display: grid;
  flex: 1;
  min-height: 0;
  min-width: 0;
  isolation: isolate;
}
.catalog-content { grid-template-rows:minmax(0,1fr); overflow:hidden; }
.catalog-content > .catalog-scroll,
.catalog-loading {
  grid-area: 1 / 1;
}
.catalog-loading {
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: rgb(255 255 255 / 75%);
  color: var(--theme-text-accent, #245eb5);
  cursor: wait;
}
.catalog-loading-spinner {
  width: 22px;
  height: 22px;
  border: 2px solid rgb(36 94 181 / 20%);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: catalog-spin 700ms linear infinite;
}
.products-page-enter {
  animation: catalog-page-enter 180ms ease-out;
}
@keyframes catalog-spin {
  to { transform: rotate(360deg); }
}
@keyframes catalog-page-enter {
  from { opacity: 0.4; }
  to { opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .catalog-loading-spinner,
  .products-page-enter { animation: none; }
}
/* Keep the upgrade flag legible even when payment is unavailable. */
.simple-payment-methods button.payment-unavailable:disabled { opacity:1; flex-direction:column; gap:6px; color:var(--theme-muted, #64748b); }
.payment-label { display:flex; align-items:center; justify-content:center; gap:10px; }
.payment-upgrade-flag { font-size:12px; line-height:1.5; padding:2px 8px; border-radius:4px; background:var(--theme-subtle, #fff3db); color:#805719; font-weight:500; }
.basket-head { height:auto; min-height:56px; padding-block:10px; box-sizing:border-box; }
.basket-head > div { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); align-items:stretch; gap:8px; min-width:0; }
.basket-head > div > button, .basket-head .keypad-mode-pair button { height:auto; min-height:40px; min-width:0; padding:6px 8px; white-space:normal; overflow-wrap:anywhere; line-height:1.35; }
.basket-head .keypad-mode-pair { grid-column:1 / -1; grid-template-columns:repeat(2,minmax(0,1fr)); margin-left:0; gap:8px; }
.basket-head :deep(.shortcut-hint) { margin-left:2px; }
</style>
