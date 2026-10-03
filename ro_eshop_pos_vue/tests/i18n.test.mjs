import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import ts from 'typescript';
import { nextTick } from 'vue';

const source = readFileSync(new URL('../src/i18n.ts', import.meta.url), 'utf8');
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
function load(saved = 'zh-CN') {
  const storage = new Map([['ro-pos-locale', saved]]);
  const document = { documentElement: { lang: '' }, title: '' };
  const module = { exports: {} };
  runInNewContext(code, {
    module, exports: module.exports, require: name => {if(name !== './portuguese')return createRequire(import.meta.url)(name);const m={exports:{}};runInNewContext(ts.transpileModule(readFileSync(new URL('../src/portuguese.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{module:m,exports:m.exports});return m.exports;}, document,
    localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
  }, { filename: fileURLToPath(new URL('../src/i18n.ts', import.meta.url)) });
  return { ...module.exports, storage, document };
}

test('settings and connection copy changes in all languages and returns to Chinese', async () => {
  const app = load();
  for (const [locale, save, connect] of [
    ['en-US', 'Save settings', 'Save and connect'],
    ['it-IT', 'Salva impostazioni', 'Salva e connetti'],
    ['es-ES', 'Guardar ajustes', 'Guardar y conectar'],
    ['zh-CN', '保存设置', '保存并进入睿鸥后台'],
  ]) {
    app.setLocale(locale);
    await nextTick();
    assert.equal(app.t('保存设置'), save);
    assert.equal(app.t('保存并进入睿鸥后台'), connect);
    assert.equal(app.document.documentElement.lang, locale);
    assert.equal(app.storage.get('ro-pos-locale'), locale);
  }
  assert.equal(load('it-IT').t('禁用'), 'Disattiva');
  assert.equal(load('invalid').locale.value, 'zh-CN');
});

test('dynamic values update and Chinese business names remain verbatim', () => {
  const app = load('en-US');
  assert.equal(app.t('共 {0} 条', [1]), '1 records');
  assert.equal(app.t('共 {0} 条', [23]), '23 records');
  assert.equal(app.t('确认删除分类“{0}”？', ['商品管理']), 'Delete category “商品管理”?');
  assert.equal(app.t('确认删除分类“商品管理”？'), 'Delete category “商品管理”?');
  assert.equal(app.t('已创建 5 件商品'), 'Created 5 products');
  assert.equal(app.t('请输入完整的睿鸥后台地址，例如 https://pos.example.com').includes('https://pos.example.com'), true);
  assert.equal(app.t('unrecognized server error'), 'unrecognized server error');
  assert.equal(app.t(null), '');
});

test('every dictionary entry has supported translations with matching placeholders', () => {
  const ast = ts.createSourceFile('i18n.ts', source, ts.ScriptTarget.Latest, true);
  let count = 0;
  const placeholders = text => [...text.matchAll(/\{\d+\}/g)].map(m => m[0]).sort();
  function visit(node) {
    if (ts.isVariableDeclaration(node) && node.name.getText(ast) === 'phrases') {
      for (const entry of node.initializer.properties) {
        const key = entry.name.text;
        assert.ok([3,4].includes(entry.initializer.elements.length), key);
        for (const value of entry.initializer.elements) {
          assert.ok(value.text?.trim(), key);
          assert.deepEqual(placeholders(value.text), placeholders(key), key);
        }
        count++;
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
  assert.ok(count > 900);
  assert.equal(source.includes('MutationObserver'), false);
});
