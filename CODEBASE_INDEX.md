## OmniBiz Codebase Index

Generated on: 2025-10-16

### Overview
- **Monorepo**: Client (Vite React + Electron + PWA) and Server (Node/Express + Mongo models)
- **Docs**: Extensive markdown under `documenttion/` and project-level guides

### Top-level
- `client/` — React app, Electron shell, PWA assets, Vite config
- `server/` — Express API, routes/controllers/models, scripts
- `documenttion/` — Markdown docs (86 files)
- `docs/` — Supplemental docs
- Various root test scripts and guides

### File counts (approx)
- JavaScript/JSX in client: ~219 files (mostly `.jsx`)
- Server JS: ~70+ files across routes/controllers/models/middleware
- Markdown docs: 90+ files

### Client highlights (`client/`)
- Build/config: `vite.config.js`, `vite.config.storefront.js`, `eslint.config.js`, `postcss.config.js`, `pnpm-workspace.yaml`
- Electron: `electron/main.js`, `electron/preload.js`, `electron.package.json`
- PWA: `public/manifest.json`, `public/sw.js`, `dev-dist/`, `dist/` outputs
- Entry: `src/main.jsx`, `src/App.jsx`, `index.html`
- State/Context: `src/context/*.jsx` (Auth, Theme, PWA, Socket, Financial)
- Hooks: `src/hooks/*` (`useRealTimeAI.js`, `useGraphData.js`, `usePermissions.js`, `useThemeSync.js`, `use-toast.js`)
- Components: `src/components/**` (UI elements, ecommerce suite, analytics, support, layout)
- Pages: `src/pages/**` (dashboard sections, client storefront, auth, info pages)
- Lib/Utils: `src/lib/apiHelpers.js`, `src/utils/subscriptionAccess.js`

Notable UI modules
- `components/ecommerce/EnhancedProductForm.jsx`
- `components/ecommerce/EnhancedOrderForm.jsx`
- `components/ecommerce/ProductCatalog.jsx`
- `components/ecommerce/OrderTimeline.jsx`
- `components/ecommerce/SalesAnalytics.jsx`
- `components/storefront/CheckoutFlow.jsx`
- `components/storefront/LiveChatWidget.jsx`

### Server highlights (`server/`)
- Entry: `server.js`, `monitor.js`
- Config: `config/db.js`, `config/email.js`, `config/socket.js`, `config/upload.js`
- Middleware: `middlewares/` (auth, role, async handler)
- Routes: `routes/*Routes.js` (auth, user, product, order, payment, dashboard, etc.)
- Controllers: `controllers/*Controller.js` (matching routes)
- Models: `models/*.js` (user, product, order, transaction, invoice, appointment, etc.)
- Services: `services/dashboardAnalytics.js`, `services/activityLogger.js`
- Scripts: `scripts/seedDatabase.js`, `scripts/createTestUser.js`, `scripts/seedData.js`

### Documentation
- `OMNIBIZ_DOCUMENTATION.md` — high-level overview
- `documenttion/` — detailed feature docs and guides
- Storefront references: `STOREFRONT_QUICK_REFERENCE.md`, `STOREFRONT_TESTING_GUIDE.md`
- Guides: `SEPARATE_PORTS_GUIDE.md`, `PAGES_BUTTONS_LINKS_CONNECTED.md`, `PWA_IMPLEMENTATION.md`

### Test/utility scripts (root)
- `test-registration.js`, `test-file-upload.js`, `test-role-system.js`, `test-notifications.js`

### Suggested entry points
- Client: `client/src/App.jsx`, `client/src/pages/Dashboard.jsx`
- Server: `server/server.js`, `server/routes/*`, `server/controllers/*`

### Notes
- Built artifacts exist under `client/dist/` and `client/dev-dist/`.
- `server/uploads/` contains sample uploads and test files.


