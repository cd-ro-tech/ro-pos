# RO POS

简体中文 | [English](README.md)

基于 Vue 3、TypeScript 和 Element Plus 的单机收银系统。无需云端账号，商品、现金订单与退货记录保存在本机浏览器。

[源码仓库](https://github.com/cd-ro-tech/ro-pos.git) · [使用文档](docs/index.html)

> 当前应用版本：`1.0.0`。源码已公开。

## 功能

- 商品与分类管理、批量启停、Excel 导入与导出。
- 商品检索、扫码加购、挂单取单、数量与改价。
- 现金收款、找零、小票打印与补打。
- 订单创建、导入、查询、退货与经营看板。
- JSON 备份恢复、小票、币种、主题、语言和快捷键设置。

库存、在线支付、会员资产、云同步与多门店管理不在本版本范围，相关入口仅保留 Upgrade 说明。

## 快速开始

需要 **Node.js 22.19+、npm 和 Git**。默认开发分支为 `main`。

```sh
# 克隆项目
git clone --branch main https://github.com/cd-ro-tech/ro-pos.git ro-pos

# 进入项目目录
cd ro-pos/ro_eshop_pos_vue

# 按锁文件安装依赖
npm ci

# 启动开发服务
npm run dev -- --port 5182
```

访问 http://127.0.0.1:5182/，点击“单机版 · 无需登录”，按向导选择币种并准备商品。已有源码的开发者从前端目录执行 `npm ci` 即可。

## 构建

在 `ro_eshop_pos_vue` 目录执行：

```sh
# 类型检查并构建生产版本
npm run build

# 本地预览生产版本
npm run preview -- --port 5182
```

构建输出为 `dist/`，部署到 HTTPS 静态服务器根目录或在 localhost 使用。发行包为网页部署包，不是桌面安装程序。子目录部署和离线缓存见 [部署文档](docs/index.html#deployment)。

## 开发与验证

```sh
# 类型检查
npm run typecheck

# 自动测试
npm test
```

技术栈：**Vue 3 / TypeScript / Vite / Element Plus**。IndexedDB 保存账本，localStorage 保存偏好，Service Worker 缓存应用资源；SheetJS 处理 Excel，JsBarcode 与 qrcode-generator 绘制条码和二维码。

- [技术栈与版本](docs/index.html#technology)
- [目录与数据流](docs/index.html#architecture)
- [本地 API 与事务](docs/index.html#local-api)
- [数据模型与备份格式](docs/index.html#data-schema)
- [编码规范](docs/index.html#coding)

组件使用 PascalCase.vue，业务模块使用 camelCase.ts；页面、业务校验与存储分层。账本更新使用事务，重试保持请求标识。界面沿用共享组件、主题变量和国际化机制。完整约定见编码规范；当前未配置 ESLint / Prettier / commitlint。

## 数据备份

定期导出 JSON，并在隔离环境验证恢复。浏览器缓存不是账本备份；清除网站数据、更换协议、域名、端口或浏览器配置文件，会影响本机数据的可用性。详见 [备份与恢复](docs/index.html#backup)。

## 贡献

提交前阅读 [贡献指南](CONTRIBUTING.md)，运行类型检查、测试和构建。PR 说明问题、改动和验证结果；不要提交真实订单、备份、账号或配对码。安全问题见 [SECURITY.md](SECURITY.md)。

## 许可证

[LGPL-3.0-only](LICENSE)，包含其引用的 [GPL-3.0 条款](LICENSE.GPL-3.0)。Copyright © 2026 睿鸥科技。

第三方依赖遵循各自许可证，见 [第三方声明](THIRD_PARTY_NOTICES.md)。代码许可不自动授予品牌、Logo 和图片使用权。
