# 第三方许可与素材清单

以下为当前 lockfile 声明，不替代完整许可证审查。LGPL-3.0 仅用于本项目有权授权的原创代码，不能覆盖第三方许可。

| 直接依赖 | 锁定版本 | 声明许可证 |
| --- | --- | --- |
| @tabler/icons-vue | 3.47.0 | MIT |
| element-plus | 2.14.7 | MIT |
| jsbarcode | 3.12.3 | MIT |
| qrcode-generator | 2.0.4 | MIT |
| vue | 3.5.42 | MIT |
| xlsx | 0.18.5 | Apache-2.0 |
| @types/jsbarcode | 3.11.4 | MIT |
| @vitejs/plugin-vue | 6.0.9 | MIT |
| typescript | 5.9.3 | Apache-2.0 |
| vite | 7.3.6 | MIT |
| vue-tsc | 3.3.11 | MIT |

## 完整依赖清单

[依赖许可 JSON](docs/dependency-licenses.json) 包含 lockfile 中的传递依赖。缺失声明需人工核实；分发时保留适用的版权、LICENSE 和 NOTICE。版本漏洞审查尚未完成，尤其 Excel 文件解析须以不可信输入处理。

## 品牌与素材

- `src/assets/ruiou-logo-white.png` 等品牌素材：品牌使用权单独保留，正式发布前确认权属。
- `src/assets/login-*.png`、主题预览和其他现有图片：来源授权未逐项确认；当前只在私有开发分支保留，公开发布前必须逐项确认或替换。
- `@tabler/icons-vue`：按其 MIT 许可保留声明。
- Element Plus：按其 MIT 许可保留声明。Pure Admin 为设计参考，不宣称本项目已集成完整 Pure Admin 模板。

本清单是公开发布阻断项记录，不表示所有素材已获再分发许可。

## 币种资料来源

`src/currencies.ts` 的币种预设来源于 [Odoo 18 res_currency_data.xml](https://github.com/odoo/odoo/blob/18.0/odoo/addons/base/data/res_currency_data.xml)，原许可为 LGPL-3.0；保留文件中的来源声明。
