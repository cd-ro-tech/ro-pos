import { computed, ref } from 'vue';
import home from './assets/login-checkout-photo.png';

export type Theme = 'blue' | 'orange' | 'black-gold';
export interface Appearance { theme: Theme; productImage: string; homeImage: string }
const key = 'ro-pos-appearance';
export const themeOptions = [
  { id: 'blue' as Theme, name: '经典蓝', color: '#285bd4' },
  { id: 'orange' as Theme, name: '活力橙', color: '#f78406' },
  { id: 'black-gold' as Theme, name: '黑金', color: '#c5a664' },
];
function validImage(value: unknown): value is string {
  return typeof value === 'string' && (value === '' || /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(value));
}
function read(): Appearance {
  try {
    const value = JSON.parse(localStorage.getItem(key) || 'null');
    if (value && themeOptions.some(t => t.id === value.theme) && validImage(value.productImage) && validImage(value.homeImage)) return value;
  } catch { /* Use the original appearance if local preferences cannot be read. */ }
  return { theme:'blue', productImage:'', homeImage:'' };
}
export const appearance = ref<Appearance>(read());
export const productPlaceholder = computed(() => appearance.value.productImage);
export const homeArtwork = computed(() => appearance.value.homeImage || home);
export const defaultHomeArtwork = home;
function apply() {
  document.documentElement.dataset.theme = appearance.value.theme;
  document.documentElement.style.setProperty('--home-artwork', `url("${homeArtwork.value}")`);
}
apply();
export function saveAppearance(value: Appearance) {
  if (!themeOptions.some(t => t.id === value.theme) || !validImage(value.productImage) || !validImage(value.homeImage)) throw new Error('主题设置格式不正确');
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch { throw new Error('本机存储空间不足，图片未保存，请换用较小图片'); }
  appearance.value = { ...value };
  apply();
}
window.addEventListener('storage', event => {
  if (event.key === key || event.key === null) { appearance.value = read(); apply(); }
});

export async function readAppearanceImage(file: File, kind: 'productImage' | 'homeImage'): Promise<string> {
  if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024)
    throw new Error('请选择不超过 5MB 的 JPG、PNG 或 WebP 图片');
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    if (!image.width || !image.height || image.width * image.height > 40000000) throw new Error('图片无法读取，请换一张图片');
    const ratio = Math.min(1, (kind === 'homeImage' ? 1600 : 600) / Math.max(image.width, image.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.width * ratio));
    canvas.height = Math.max(1, Math.round(image.height * ratio));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('图片无法读取，请换一张图片');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const result = canvas.toDataURL('image/webp', .85);
    if (result.length > 1400000) throw new Error('图片压缩后仍过大，请换用较小图片');
    return result;
  } catch (error) {
    if (error instanceof Error && error.message.includes('图片')) throw error;
    throw new Error('图片无法读取，请换一张图片');
  } finally { URL.revokeObjectURL(url); }
}
