# RO POS

[简体中文](README.zh-CN.md) | English

A standalone point-of-sale application built with Vue 3, TypeScript and Element Plus. Products, cash orders and returns are stored in the local browser; no cloud account is required.

[Source](https://github.com/cd-ro-tech/ro-pos.git) · [Documentation](docs/index.html)

> Application version: `1.0.0`. Source code is public.

## Features

- Products and categories, batch activation/deactivation, Excel import/export.
- Product search, barcode scanning, held carts, quantity and price adjustments.
- Cash payments, change, receipt printing and reprinting.
- Order creation/import, queries, returns and sales reporting.
- JSON backup/restore and local receipt, currency, theme, language and shortcut settings.

Inventory, online payments, member assets, cloud sync and multi-store management are excluded. Their entries display Upgrade information only.

## Getting started

Requires **Node.js 22.19+, npm and Git**. The default development branch is main.

```sh
# Clone the project
git clone --branch main https://github.com/cd-ro-tech/ro-pos.git ro-pos

# Enter the frontend directory
cd ro-pos/ro_eshop_pos_vue

# Install locked dependencies
npm ci

# Start the development server
npm run dev -- --port 5182
```

Open http://127.0.0.1:5182/, choose standalone use without login, then select a currency and prepare products in the setup wizard. If you already have the source, start with `npm ci` in the frontend directory.

## Build

Run from `ro_eshop_pos_vue`:

```sh
# Type-check and build for production
npm run build

# Preview the production build locally
npm run preview -- --port 5182
```

Deploy `dist/` at the root of an HTTPS static server or use localhost. Release archives contain a web application, not a desktop installer. See [deployment](docs/index.html#deployment) for subdirectory hosting and offline caching.

## Development

```sh
# Check types
npm run typecheck

# Run automated tests
npm test
```

The stack uses **Vue 3 / TypeScript / Vite / Element Plus**. IndexedDB stores the ledger, localStorage stores preferences, and a Service Worker caches application assets. SheetJS handles Excel; JsBarcode and qrcode-generator render barcodes and QR codes.

- [Stack and versions](docs/index.html#technology)
- [Directories and data flow](docs/index.html#architecture)
- [Local API and transactions](docs/index.html#local-api)
- [Data model and backup format](docs/index.html#data-schema)
- [Coding conventions](docs/index.html#coding)

Use PascalCase.vue for components and camelCase.ts for business modules. Separate presentation, validation and storage. Update the ledger transactionally and retain request identifiers on retries. Reuse shared UI components, theme variables and localization. ESLint, Prettier and commitlint are not currently configured.

## Backup

Export JSON regularly and verify restoration in an isolated environment. Application caching is not a ledger backup. Clearing site data or changing the protocol, domain, port or browser profile affects access to local data. See [backup and restore](docs/index.html#backup).

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md), then run type checking, tests and a production build. Describe the problem, changes and validation in your PR. Do not commit real orders, backups, accounts or pairing codes. See [SECURITY.md](SECURITY.md) for security reports.

## License

[LGPL-3.0-only](LICENSE), with the incorporated [GPL-3.0 terms](LICENSE.GPL-3.0). Copyright © 2026 睿鸥科技.

Dependencies retain their respective licenses; see [third-party notices](THIRD_PARTY_NOTICES.md). The code license does not automatically grant rights to the brand, logo or artwork.
