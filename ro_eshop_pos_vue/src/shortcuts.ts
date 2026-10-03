import { needsUpgrade } from './edition';
import { computed, onMounted, onBeforeUnmount, ref, watch } from "vue";
import { session } from "./api";
export const shortcutActions = [
  { id: "search", label: "搜索商品", key: "F2" },
  { id: "member", label: "选择会员", key: "F3" },
  { id: "hold", label: "挂单", key: "F4" },
  { id: "held", label: "取单", key: "F6" },
  { id: "checkout", label: "进入收款", key: "Enter" },
  { id: "cash", label: "现金收款", key: "F8" },
  { id: "scan", label: "扫码收款", key: "F9" },
  { id: "print", label: "打印小票", key: "Ctrl+Alt+P" },
] as const;
export type ShortcutId = (typeof shortcutActions)[number]["id"];
export type Bindings = Record<ShortcutId, string>;
export const defaults = () =>
  Object.fromEntries(shortcutActions.map((a) => [a.id, a.key])) as Bindings;
export const bindings = ref<Bindings>(defaults());
const storageKey = computed(
  () => `ro-pos-shortcuts:v1:${session.value?.user.id}`,
);
export function allowedKey(key: string) {
  return key === "" || /^(F[2-4]|F[6-9]|Enter|Ctrl\+Alt\+[A-Z])$/.test(key);
}
export function eventKey(e: KeyboardEvent) {
  if (e.metaKey || e.shiftKey || e.getModifierState("AltGraph")) return "";
  if (e.ctrlKey && e.altKey && /^[a-z]$/i.test(e.key))
    return `Ctrl+Alt+${e.key.toUpperCase()}`;
  if (e.ctrlKey || e.altKey) return "";
  return allowedKey(e.key) ? e.key : "";
}
export function conflicts(value: Bindings) {
  const used = new Set<string>();
  return shortcutActions.some((a) => {
    const key = value[a.id];
    if (!allowedKey(key) || (key && used.has(key))) return true;
    if (key) used.add(key);
    return false;
  });
}
watch(
  () => session.value?.user.id,
  (id) => {
    bindings.value = defaults();
    if (!id) return;
    try {
      const saved = JSON.parse(
        localStorage.getItem(storageKey.value) || "null",
      );
      if (!saved || typeof saved !== "object") return;
      const value = Object.fromEntries(
        shortcutActions.map((a) => [
          a.id,
          typeof saved[a.id] === "string" ? saved[a.id] : a.key,
        ]),
      ) as Bindings;
      if (!conflicts(value)) bindings.value = value;
    } catch {
      /* Storage may be unavailable; default bindings remain usable. */
    }
  },
  { immediate: true },
);
export function saveShortcuts(value: Bindings) {
  if (!session.value?.user.id || conflicts(value))
    throw new Error("请为每项操作设置不同的有效按键");
  try {
    localStorage.setItem(storageKey.value, JSON.stringify(value));
  } catch {
    throw new Error("浏览器无法保存设置，请检查是否允许本地存储");
  }
  bindings.value = { ...value };
}
export function useShortcuts(
  actions: Partial<Record<ShortcutId, () => void>>,
  enabled: () => boolean = () => true,
  allowSettlementDialog = false,
) {
  function handle(e: KeyboardEvent) {
    if (
      e.defaultPrevented ||
      e.repeat ||
      e.isComposing ||
      !enabled() ||
      (document.querySelector("dialog[open]") &&
        !(
          allowSettlementDialog &&
          Array.from(document.querySelectorAll("dialog[open]"))
            .at(-1)
            ?.matches(".settlement-dialog")
        ))
    )
      return;
    if (
      e.target instanceof Element &&
      e.target.closest("input,textarea,select,[contenteditable]")
    )
      return;
    if (
      e.key === "Enter" &&
      e.target instanceof Element &&
      e.target.closest("button,a")
    )
      return;
    const key = eventKey(e);
    if (!key) return;
    const action = shortcutActions.find((a) => bindings.value[a.id] === key);
    if (action && needsUpgrade(action.id)) { e.preventDefault(); return; }
    const run = action && actions[action.id];
    if (run) {
      e.preventDefault();
      run();
    }
  }
  onMounted(() => window.addEventListener("keydown", handle));
  onBeforeUnmount(() => window.removeEventListener("keydown", handle));
}
