<script setup lang="ts">
import {
  IconPalette, IconDeviceDesktop, IconCloud, IconKeyboard, IconClock, IconChevronLeft, IconArrowLeft, IconRefresh, IconCheck, IconPrinter, IconDownload, IconUpload, IconDeviceFloppy, IconPlus, IconLogout, IconLock, IconLayoutGrid, IconPlayerPause, IconRestore, IconFileText,
  IconBuildingStore, IconChartBar, IconPackage, IconUserPlus, IconDatabase, IconWallet,
  IconSearch,
  IconBarcode,
  IconShoppingBag,
  IconUser,
  IconTrash,
  IconBackspace,
  IconPencil,
  IconLanguage,
  IconTicket,
  IconChevronRight,
  IconChevronDown,
  IconX,
} from "@tabler/icons-vue";
defineProps<{ name: string }>();
const icons: Record<string, any> = {
  theme: IconPalette, desktop: IconDeviceDesktop, cloud: IconCloud, keyboard: IconKeyboard, clock: IconClock, prev: IconChevronLeft, return: IconArrowLeft, refresh: IconRefresh, check: IconCheck, print: IconPrinter, download: IconDownload, upload: IconUpload, save: IconDeviceFloppy, plus: IconPlus, logout: IconLogout, lock: IconLock, functions: IconLayoutGrid, hold: IconPlayerPause, restore: IconRestore, documents: IconFileText,
  store: IconBuildingStore, summary: IconChartBar,
  product: IconPackage, create: IconUserPlus, data: IconDatabase, recharge: IconWallet,
  "online-orders": IconShoppingBag, coupons: IconTicket,
  search: IconSearch,
  scan: IconBarcode,
  bag: IconShoppingBag,
  user: IconUser,
  trash: IconTrash,
  back: IconBackspace,
  note: IconPencil,
  language: IconLanguage,
  ticket: IconTicket,
  arrow: IconChevronRight,
  down: IconChevronDown,
  close: IconX,
};
</script>
<template>
  <svg v-if="name === 'cash'" class="icon" width="20" height="20" viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false">
    <rect x="2" y="6" width="28" height="20" rx="4" fill="var(--theme-text-accent, #24549A)" />
    <path d="M8 9h16a3 3 0 0 0 3 3v8a3 3 0 0 0-3 3H8a3 3 0 0 0-3-3v-8a3 3 0 0 0 3-3Z" fill="var(--theme-selected, #E7F0FD)" />
    <path d="m12.5 11 3.5 4 3.5-4M12 16h8M12 19h8M16 15v7" stroke="var(--theme-text-accent, #24549A)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
  <svg v-else-if="name === 'alipay'" class="icon" width="20" height="20" viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false">
    <rect x="2" y="2" width="28" height="28" rx="7" fill="#1677FF" />
    <path d="M9 10h14M16 6v9M10 15h12c-2 7-7 11-12 10-4-1-3-6 1-6 5 0 10 5 19 7" stroke="white" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
  <svg v-else-if="name === 'online'" class="icon" width="20" height="20" viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false">
    <rect x="2" y="2" width="28" height="28" rx="7" fill="#079B58" />
    <path d="M23 13c0 4-4 7-8.5 7-1.3 0-2.5-.2-3.5-.6L7 21l1-3c-1.6-1.3-2.5-3-2.5-5 0-4 4-7 9-7S23 9 23 13Z" fill="white" />
    <path d="M28 20c0 1.6-.8 3.1-2.2 4.2l.7 2.3-3-1.2c-.9.3-1.9.5-3 .5-4 0-7.3-2.6-7.3-5.8s3.3-5.8 7.3-5.8S28 16.8 28 20Z" fill="#D6F4E4" stroke="#079B58" stroke-width="1.3" stroke-linejoin="round" />
    <path d="M11 12h.01M17 12h.01M18 19h.01M23 19h.01" stroke="#087E49" stroke-width="2.2" stroke-linecap="round" />
  </svg>
  <component
    v-else
    :is="icons[name] || icons.bag"
    class="icon"
    :size="20"
    :stroke="1.7"
    aria-hidden="true"
  />
</template>
