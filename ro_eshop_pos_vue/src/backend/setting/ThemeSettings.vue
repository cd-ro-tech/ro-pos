<script setup lang="ts">
import '../../pure-admin.css';
import { useId } from "vue";
const settingsFormId=useId();
import { computed, ref } from 'vue';
import { t } from '../../i18n';
import { appearance, themeOptions, defaultHomeArtwork, readAppearanceImage, saveAppearance } from '../../theme';
import companyLogo from '../../assets/ruiou-logo-white.png';
import PosIcon from '../../components/PosIcon.vue';
const draft = ref({ ...appearance.value });
const uploading = ref(false), error = ref(''), saved = ref(false);
const previewProduct = computed(() => draft.value.productImage);
const dirty = computed(() => JSON.stringify(draft.value) !== JSON.stringify(appearance.value));
async function upload(event: Event, kind: 'productImage' | 'homeImage') {
  const input = event.target as HTMLInputElement, file = input.files?.[0];
  if (!file) return;
  uploading.value = true; error.value = ''; saved.value = false;
  try { draft.value[kind] = await readAppearanceImage(file, kind); }
  catch (e) { error.value = e instanceof Error ? e.message : '图片无法读取，请换一张图片'; }
  finally { uploading.value = false; input.value = ''; }
}
function save() {
  error.value = ''; saved.value = false;
  try { saveAppearance(draft.value); saved.value = true; }
  catch (e) { error.value = e instanceof Error ? e.message : '主题设置格式不正确'; }
}
</script>
<template>
<section class="pure-admin-page management-page theme-settings" :aria-label="t('主题设置')">
  <header class="settings-action-bar"><span class="settings-header-actions"><button type="submit" :form="settingsFormId" class="primary" :disabled="uploading||!dirty">{{t('保存设置')}}</button></span></header>
  <form :id="settingsFormId" @submit.prevent="save">
    <p class="theme-intro">{{t('设置仅保存在本机，应用于登录页、收银台和工作台。')}}</p>
    <fieldset :disabled="uploading"><legend>{{t('主题颜色')}}</legend>
      <div class="theme-choices">
        <label v-for="option in themeOptions" :key="option.id" class="theme-choice" :class="{chosen:draft.theme===option.id}">
          <span class="theme-sample" :class="option.id" :style="{'--sample-accent':option.color}"><span class="sample-top"></span><span class="sample-body"><i></i><span><b></b><b></b><em></em></span></span></span>
          <span class="theme-choice-title"><input type="radio" name="theme" :value="option.id" v-model="draft.theme" @change="saved=false" /><span>{{t(option.name)}}</span><PosIcon v-if="draft.theme===option.id" name="check" /></span>
        </label>
      </div>
    </fieldset>
    <div class="theme-images">
      <fieldset :disabled="uploading"><legend>{{t('商品占位图')}}</legend>
        <p>{{t('仅用于没有图片的商品；默认统一使用灰色底图。')}}</p>
        <div class="theme-image-preview product-preview"><img :src="previewProduct||companyLogo" :class="{logo:!previewProduct}" :alt="t('商品占位图')" /></div>
        <label class="theme-upload">{{t('上传图片')}}<input type="file" accept="image/png,image/jpeg,image/webp" @change="upload($event,'productImage')" /></label>
        <button type="button" :disabled="!draft.productImage" @click="draft.productImage='';saved=false">{{t('恢复默认')}}</button>
      </fieldset>
      <fieldset :disabled="uploading"><legend>{{t('主页图片')}}</legend>
        <p>{{t('用于登录首页的主视觉和背景。')}}</p>
        <div class="theme-image-preview home-preview"><img :src="draft.homeImage||defaultHomeArtwork" :alt="t('主页图片')" /></div>
        <label class="theme-upload">{{t('上传图片')}}<input type="file" accept="image/png,image/jpeg,image/webp" @change="upload($event,'homeImage')" /></label>
        <button type="button" :disabled="!draft.homeImage" @click="draft.homeImage='';saved=false">{{t('恢复默认')}}</button>
      </fieldset>
    </div>
    <p class="theme-hint">{{t('支持 JPG、PNG、WebP，最大 5MB；图片会自动缩小后保存在本机。')}}</p>
    <p v-if="error" class="error" role="alert">{{t(error)}}</p>
    <footer><span role="status">{{uploading?t('正在处理图片…'):saved&&!dirty?t('主题设置已保存'):t('保存后生效')}}</span></footer>
  </form>
</section>
</template>
<style scoped>
.theme-settings{padding:0 12px 12px}.theme-settings form{flex:1;min-height:0;overflow:auto;display:block;margin:0;padding:12px;background:var(--theme-surface,#fff);border:1px solid var(--theme-line,#dce5f2);border-radius:4px;max-width:none;width:100%;box-sizing:border-box}
.theme-intro,.theme-hint,.theme-settings fieldset p{color:var(--theme-muted,#52647d);font-size:13px;line-height:1.7;margin:0 0 16px}.theme-settings fieldset{display:block;min-width:0;border:0;margin:0;padding:0 0 16px}.theme-settings legend{font-weight:600;margin-bottom:16px;font-size:16px;color:var(--theme-ink,#253858)}
.theme-choices{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.theme-choice{position:relative;display:flex;flex-direction:column;gap:0;border:2px solid var(--theme-line,#dce5f2);border-radius:6px;overflow:hidden;cursor:pointer}.theme-choice.chosen{border-color:var(--brand)}.theme-choice input[type=radio]{position:static;flex:0 0 16px;width:16px;height:16px;min-height:16px;margin:0;padding:0;accent-color:var(--theme-text-accent,#285bd4)}.theme-choice:focus-within{outline:2px solid var(--brand);outline-offset:3px}.theme-choice-title{display:flex;align-items:center;gap:8px;padding:10px 12px;font-size:14px}.theme-choice-title .icon{margin-left:auto;color:var(--theme-text-accent, #285bd4)}
.theme-sample{height:112px;display:block;background:#f3f5f9}.theme-sample.orange{background:#f7f4f0}.theme-sample.black-gold{background:#f5f4f1}.sample-top{height:20px;display:block;background:var(--sample-accent)}.theme-sample.black-gold .sample-top{background:#292a2d;border-bottom:2px solid #d8bc80}.sample-body{display:flex;height:92px;padding:12px;gap:14px}.sample-body>i{width:23%;border-right:1px solid #b7b9ba}.sample-body>span{flex:1}.sample-body b{display:block;width:85%;height:8px;margin:0 0 10px;background:#c9cdd5}.black-gold .sample-body b{background:#c9cdd5}.sample-body em{display:block;background:var(--sample-accent);width:45%;height:16px;margin-top:14px;border-radius:2px}
.theme-images{display:grid;grid-template-columns:1fr 1fr;gap:16px;border-top:1px solid var(--theme-line,#dce5f2);padding-top:12px}.theme-image-preview{height:160px;border:1px solid var(--theme-line,#dce5f2);border-radius:4px;overflow:hidden;margin-bottom:14px}.product-preview{width:160px;background:#f0f1f2}.theme-image-preview img{width:100%;height:100%;object-fit:contain}.product-preview img.logo{padding:36px;filter:brightness(0) invert(.65)}.home-preview img{object-fit:cover}.theme-upload{display:grid;gap:8px;font-size:13px;margin-bottom:12px}.theme-upload input{box-sizing:border-box;width:100%;font-size:12px;padding:6px;min-height:36px}.theme-upload input::file-selector-button{font:inherit;color:var(--theme-ink,#253858);background:var(--theme-surface,#fff);border:1px solid var(--theme-line,#dce5f2);border-radius:4px;padding:6px 10px;margin-right:8px;cursor:pointer}.theme-settings footer{display:flex;justify-content:space-between;align-items:center;gap:16px;border-top:1px solid var(--theme-line,#dce5f2);padding-top:18px}.theme-settings footer span{color:var(--theme-muted,#52647d);font-size:13px}
@media(max-width:700px){.theme-settings{padding:0 12px 12px}.theme-settings form{padding:12px}.theme-choices{gap:10px}.theme-sample{height:80px}.sample-body{height:60px}.theme-choice-title{font-size:12px;padding:8px;gap:6px}.theme-images{grid-template-columns:1fr}}
</style>

<style scoped>
.theme-sample.orange .sample-top,.theme-sample.orange .sample-body em{background:linear-gradient(100deg,#fe960e 0%,#f78406 55%,#ec7603 75%,#cc5600 100%)}
.theme-sample.black-gold .sample-top{background:linear-gradient(110deg,#242421,#0a0a09)}
.theme-sample.black-gold .sample-body em{background:linear-gradient(110deg,#c5a664 0%,#eed38e 35%,#feeeba 55%,#cdb27c 100%);border:1px solid #c5a664}
</style>
