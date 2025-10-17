## OmniBiz Codebase Index

Generated on: 2025-10-17
Last Updated: October 17, 2025

### Overview
- **Project Type**: Full-stack business management platform (OmniBiz Pro)
- **Architecture**: Monorepo structure with separate client and server
- **Client**: React 19 + Vite + PWA + Electron support
- **Server**: Node.js + Express 5 + MongoDB
- **Real-time**: Socket.IO for live updates
- **Documentation**: 90+ markdown files with comprehensive guides

### Technology Stack

#### Frontend
- **Framework**: React 19.1.1 with React Router DOM 7.9.1
- **Build Tool**: Vite 7.1.6
- **Styling**: TailwindCSS 4.1.13 + Radix UI components
- **UI Components**: Custom shadcn/ui based components
- **Icons**: Lucide React, React Icons, Heroicons
- **State Management**: React Context (Auth, Theme, PWA, Socket, Financial, Cart)
- **Real-time**: Socket.IO Client 4.8.1
- **PWA**: Vite Plugin PWA, Workbox, Service Workers
- **Animations**: Framer Motion 12.23.22
- **Charts**: Recharts 3.2.1
- **Excel/Spreadsheet**: XLSX 0.18.5
- **Theme**: Next-themes 0.4.6 for theme management

#### Backend
- **Runtime**: Node.js
- **Framework**: Express 5.1.0
- **Database**: MongoDB with Mongoose 8.18.2
- **Authentication**: JWT (jsonwebtoken 9.0.2) + bcryptjs 3.0.2
- **File Upload**: Multer 2.0.2 + Cloudinary 1.41.3
- **Email**: Nodemailer 7.0.6
- **SMS**: Twilio 5.9.0
- **Payment**: M-Pesa integration
- **AI**: Google Generative AI 0.24.1
- **Real-time**: Socket.IO 4.8.1
- **GeoIP**: geoip-lite 1.4.10
- **User Agent Parsing**: ua-parser-js 2.0.5

### Top-level
- `client/` — React app, Electron shell, PWA assets, Vite config
- `server/` — Express API, routes/controllers/models, scripts
- `documenttion/` — Markdown docs (86 files)
- `docs/` — Supplemental docs
- Various root test scripts and guides

### File Counts
- **Client JSX/JS**: ~230+ files (React components, pages, hooks, contexts)
- **Server JS**: ~70+ files (routes, controllers, models, middleware, config)
- **UI Components**: 27 reusable shadcn/ui components
- **Dashboard Pages**: 21 feature-rich pages
- **API Routes**: 22 route files
- **Models**: 12 MongoDB models
- **Controllers**: 16 controller files
- **Markdown Docs**: 90+ comprehensive guides

### Client Structure (`client/`)

#### Configuration Files
- **Build Config**: `vite.config.js`, `vite.config.storefront.js` (dual-port setup)
- **Code Quality**: `eslint.config.js`, `jsconfig.json`
- **Styling**: `postcss.config.js`, TailwindCSS 4 integration
- **Package Management**: `pnpm-workspace.yaml`, `package.json`
- **Environment**: `.env.example`, `.env.storefront`
- **Electron**: `electron.package.json`, `electron/main.js`, `electron/preload.js`
- **shadcn/ui**: `components.json`

#### PWA Implementation
- **Manifest**: `public/manifest.json`
- **Service Worker**: `public/sw.js`
- **Build Outputs**: `dev-dist/`, `dist/`
- **Documentation**: `PWA_IMPLEMENTATION.md`

#### Application Entry Points
- **HTML**: `index.html`
- **Main**: `src/main.jsx` (React 19 root)
- **App**: `src/App.jsx` (Router + Providers)

#### Context Providers (`src/context/`)
- `AuthContext.jsx` - User authentication state (2.9KB)
- `CartContext.jsx` - Shopping cart management (1.6KB)
- `FinancialContext.jsx` - Financial data state (3.0KB)
- `PWAContext.jsx` - PWA install/update state (2.9KB)
- `SocketContext.jsx` - Real-time Socket.IO connection (6.9KB)
- `ThemeContext.jsx` - Theme management with persistence (23.5KB)

#### Custom Hooks (`src/hooks/`)
- `use-toast.js` - Toast notification system (3.1KB)
- `useGraphData.js` - Chart data transformation (1.3KB)
- `usePermissions.js` - Role-based access control (3.3KB)
- `useRealTimeAI.js` - AI insights integration (6.7KB)
- `useThemeSync.js` - Theme synchronization (4.1KB)

#### Library & Utilities (`src/lib/`)
- `api.js` - Axios API client configuration (5.0KB)
- `apiHelpers.js` - API request helpers (19.6KB)
- `utils.js` - Utility functions (137B)

#### UI Components (`src/components/ui/`)
27 Reusable shadcn/ui components:
- Forms: `button`, `input`, `textarea`, `select`, `label`, `switch`, `slider`, `radio-group`
- Layout: `card`, `separator`, `sheet`, `dialog`, `popover`, `dropdown-menu`, `scroll-area`
- Navigation: `tabs`, `breadcrumb`
- Feedback: `alert`, `badge`, `progress`, `sonner` (toast), `tooltip`
- Data Display: `table`, `avatar`, `calendar`, `date-range-picker`
- Custom: `logo`

#### Feature Components

**E-commerce (`src/components/ecommerce/`)**
- `EnhancedProductForm.jsx` - Product creation/editing (18.7KB)
- `EnhancedOrderForm.jsx` - Order management (18.4KB)
- `ModernOrderCard.jsx` - Order display card (9.1KB)
- `OrderTimeline.jsx` - Order status tracking (5.0KB)
- `ProductCatalog.jsx` - Product grid view (10.8KB)
- `QuickActions.jsx` - Quick action buttons (4.1KB)
- `RealTimeSync.jsx` - Real-time data sync (6.7KB)
- `SalesAnalytics.jsx` - Sales charts/metrics (12.1KB)

**Storefront (`src/components/storefront/`)**
- `CheckoutFlow.jsx` - Multi-step checkout (16.5KB)
- `LiveChatWidget.jsx` - Customer support chat (33.0KB)
- `OrderHistory.jsx` - Customer order list (6.6KB)
- `ProductDetailDialog.jsx` - Product details modal (8.1KB)

**Payments (`src/components/payments/`)**
- Payment gateway integrations

**Support (`src/components/support/`)**
- Help and support components

#### Pages

**Main Pages (`src/pages/`)**
- `Index.jsx` - Landing page
- `Home.jsx` - Home page
- `Dashboard.jsx` - Main dashboard
- `LoginPage.jsx` - User login
- `SignupPage.jsx` - User registration
- `SplashScreen.jsx` - App loading screen
- `Features.jsx` - Feature showcase
- `Pricing.jsx` - Pricing plans
- `Contact.jsx` - Contact form
- `About.jsx` - About page
- `Privacy.jsx` - Privacy policy
- `Terms.jsx` - Terms of service
- `Help.jsx` - Help center
- `Settings.jsx` - User settings
- `Store.jsx` - Store page
- `NotFound.jsx` - 404 page

**Dashboard Pages (`src/pages/dashboard/`)**
- `AdminDashboard.jsx` - Admin overview (13.6KB)
- `AIInsights.jsx` - AI-powered insights (32.1KB)
- `Analytics.jsx` - Business analytics (31.9KB)
- `Appointments.jsx` - Appointment scheduling (25.8KB)
- `Checkout.jsx` - Checkout process (23.0KB)
- `ECommerce.jsx` - E-commerce management (43.6KB)
- `Finances.jsx` - Financial management (35.6KB)
- `GraphsShowcase.jsx` - Chart examples (12.1KB)
- `HelpSupport.jsx` - Support tickets (44.0KB)
- `History.jsx` - Activity history (19.2KB)
- `Inventory.jsx` - Inventory management (24.7KB)
- `Locations.jsx` - Location management (38.9KB)
- `Maps.jsx` - Map visualization (16.2KB)
- `Products.jsx` - Product catalog (27.2KB)
- `Profile.jsx` - User profile (77.4KB)
- `Purchasing.jsx` - Purchase orders (19.7KB)
- `Reports.jsx` - Business reports (26.7KB)
- `Search.jsx` - Global search (15.9KB)
- `Settings.jsx` - App settings (47.8KB)
- `Team.jsx` - Team management (34.9KB)
- `Wallet.jsx` - Digital wallet (85.3KB)

**Client Portal (`src/pages/client/`)**
- `ClientStorefront.jsx` - Public storefront (21.0KB)
- `ClientLogin.jsx` - Client login (5.1KB)
- `ClientSignup.jsx` - Client registration (7.4KB)
- `BookAppointment.jsx` - Appointment booking (12.7KB)
- `MyBookings.jsx` - Booking history (7.4KB)
- `ProductCatalog.jsx` - Product browsing (8.0KB)

#### Scripts
- `start-both.ps1` - Start dashboard + storefront (5.0KB)
- `start-storefront.ps1` - Start storefront only (2.7KB)
- `test-storefront.ps1` - Storefront testing (5.9KB)
- `test-pwa.js` - PWA testing (5.8KB)
- `clear-cache.ps1` - Cache clearing (1.3KB)


### Server Structure (`server/`)

#### Entry Points
- `server.js` - Main Express server (6.2KB)
- `monitor.js` - System monitoring (1.8KB)

#### Configuration (`config/`)
- `db.js` - MongoDB connection setup (792B)
- `email.js` - Nodemailer email service (11.3KB)
- `socket.js` - Socket.IO configuration (6.8KB)
- `upload.js` - Multer + Cloudinary setup (6.3KB)

#### Middleware (`middlewares/`)
- `asyncHandler.js` - Async error handling (354B)
- `authMiddleware.js` - JWT authentication (1.7KB)
- `roleMiddleware.js` - Role-based access control (8.5KB)

#### Routes (`routes/`)
22 API route files:
- `authRoutes.js` - Authentication endpoints
- `userRoutes.js` - User management
- `productRoutes.js` - Product CRUD
- `orderRoutes.js` - Order management
- `invoiceRoutes.js` - Invoice generation
- `expenseRoutes.js` - Expense tracking
- `appointmentRoutes.js` - Appointment scheduling
- `financialRoutes.js` - Financial operations
- `paymentRoutes.js` - Payment processing
- `mpesaRoutes.js` - M-Pesa integration
- `walletRoutes.js` - Digital wallet
- `locationRoutes.js` - Location management
- `teamRoutes.js` - Team collaboration
- `clientRoutes.js` - Client portal
- `adminRoutes.js` - Admin functions
- `dashboardRoutes.js` - Dashboard analytics
- `reportRoutes.js` - Report generation
- `searchRoutes.js` - Search functionality
- `uploadRoutes.js` - File uploads
- `activityRoutes.js` - Activity logging
- `publicRoutes.js` - Public endpoints
- `subscriptionRoutes.js` - Subscription management

#### Controllers (`controllers/`)
16 controller files handling business logic:
- `authController.js` - Auth logic
- `userController.js` - User operations
- `productController.js` - Product management
- `orderController.js` - Order processing
- `invoiceController.js` - Invoice creation
- `expenseController.js` - Expense management
- `AppointmentController.js` - Appointment logic
- `paymentController.js` - Payment processing
- `mpesaController.js` - M-Pesa operations
- `transactionController.js` - Transaction handling
- `locationController.js` - Location operations
- `teamController.js` - Team management
- `clientController.js` - Client operations
- `adminController.js` - Admin functions
- `dashboardController.js` - Dashboard data
- `activityController.js` - Activity logging

#### Models (`models/`)
12 MongoDB schemas:
- `user.js` - User schema with roles/permissions
- `product.js` - Product catalog
- `order.js` - Order records
- `invoice.js` - Invoice documents
- `expense.js` - Expense records
- `appointment.js` - Appointment bookings
- `transaction.js` - Financial transactions
- `mpesaModel.js` - M-Pesa payments
- `location.js` - Business locations
- `team.js` - Team members
- `serviceRequest.js` - Service tickets
- `userActivity.js` - Activity logs

#### Services (`services/`)
- `dashboardAnalytics.js` - Analytics calculations (17.2KB)
- `activityLogger.js` - Activity tracking (8.3KB)

#### Scripts (`scripts/`)
- `seedDatabase.js` - Database seeding
- `createTestUser.js` - Test user creation
- `seedData.js` - Sample data generation

#### Uploads & Assets
- `uploads/` - User uploaded files (10 items)
- `ngrok-stable-linux-amd64.zip` - Ngrok binary (13.9MB)

### Documentation (`documenttion/`)

#### Main Documentation
- `OMNIBIZ_DOCUMENTATION.md` - Complete technical docs (25.4KB)
- `CODEBASE_INDEX.md` - Detailed codebase map (118KB)
- `CODEBASE_OVERVIEW.md` - High-level overview (25.8KB)
- `README.md` - Getting started guide (4.9KB)
- `QUICK_START.md` - Quick setup guide (4.5KB)

#### Implementation Guides (90+ files)
**Setup & Configuration**
- `DATABASE_SEEDING_GUIDE.md`
- `SEPARATE_PORTS_GUIDE.md`
- `CLEAR_CACHE_AND_RESTART.md`
- `PWA_IMPLEMENTATION.md`
- `OAUTH_IMPLEMENTATION.md`

**Feature Documentation**
- `ECOMMERCE_*` - E-commerce system (10+ files)
- `STOREFRONT_*` - Storefront implementation (3 files)
- `WALLET_*` - Digital wallet system (5 files)
- `ANALYTICS_*` - Analytics features (3 files)
- `AI_*` - AI integration (5 files)
- `PROFILE_*` - Profile pages (6 files)
- `FINANCES_*` - Financial features (2 files)
- `THEME_*` - Theme system (3 files)

**Testing & Status**
- `STOREFRONT_TESTING_GUIDE.md`
- `IMPLEMENTATION_STATUS.md`
- `ACTION_ITEMS.md`
- `TODAYS_UPDATES_COMPLETE.md`

**Component Documentation**
- `COMPONENT_ENHANCEMENTS_GUIDE.md`
- `GUI_*` - GUI implementation (5 files)
- `HELP_SUPPORT_COMPONENTS.md`

**Technical Details**
- `WEBSOCKET_WEBRTC_THEMES_IMPLEMENTATION.md`
- `PAYMENT_FIX_GUIDE.md`
- `OAUTH_IMPLEMENTATION.md`
- `DAS_SYSTEM_DOCUMENTATION.md`

### Root Test Scripts
- `test-registration.js` - Registration flow testing (766B)
- `test-file-upload.js` - File upload testing (8.0KB)
- `test-role-system.js` - RBAC testing (10.0KB)
- `test-notifications.js` - Notification testing (8.3KB)

### Other Root Files
- `package.json` - Root dependencies (Axios)
- `package-lock.json` - Dependency lock file
- `.gitignore` - Git ignore rules (536B)
- `ngrok.yml` - Ngrok configuration (189B)
- `OmniBiz Manage1.docx` - Business documentation (33.7KB)

### Development Entry Points

#### Client Development
1. **Start Point**: `client/src/main.jsx` → `client/src/App.jsx`
2. **Routing**: Check `App.jsx` for all routes
3. **State**: Review contexts in `src/context/`
4. **Main Dashboard**: `src/pages/Dashboard.jsx`
5. **Feature Pages**: `src/pages/dashboard/`
6. **API Calls**: `src/lib/api.js` and `src/lib/apiHelpers.js`

#### Server Development
1. **Start Point**: `server/server.js`
2. **Database**: `config/db.js`
3. **Routes**: `routes/*Routes.js` (22 files)
4. **Business Logic**: `controllers/*Controller.js` (16 files)
5. **Data Models**: `models/*.js` (12 schemas)
6. **Real-time**: `config/socket.js`

#### Key Features to Explore
- **E-commerce**: `pages/dashboard/ECommerce.jsx` + `components/ecommerce/`
- **Wallet**: `pages/dashboard/Wallet.jsx`
- **AI Insights**: `pages/dashboard/AIInsights.jsx` + `hooks/useRealTimeAI.js`
- **Analytics**: `pages/dashboard/Analytics.jsx`
- **Storefront**: `pages/client/ClientStorefront.jsx`
- **Real-time Chat**: `components/storefront/LiveChatWidget.jsx`

### Build & Deployment

#### Client Build
- **Dev Dashboard**: `npm run dev:dashboard` (port 5173)
- **Dev Storefront**: `npm run dev:storefront` (port 5174)
- **Dev Both**: `npm run dev:both` (concurrent)
- **Build**: `npm run build` or `npm run build:storefront`
- **Preview**: `npm run preview`
- **Output**: `dist/` (production), `dev-dist/` (development)

#### Server
- **Start**: `npm start` or `node server.js`
- **Dev**: `npm run dev` (nodemon)
- **Seed**: `npm run seed`
- **Port**: 5000 (default) or `process.env.PORT`

### Environment Variables

#### Client
- Storefront configuration in `.env.storefront`
- See `.env.example` for required variables

#### Server
- MongoDB connection string
- JWT secret
- Email credentials (Nodemailer)
- Cloudinary credentials
- Twilio credentials
- Google AI API key
- M-Pesa API credentials
- See `server/.env` for full list

### Package Management
- **Client**: pnpm (workspace setup)
- **Server**: pnpm
- **Lock files**: `pnpm-lock.yaml` in both client and server

### Key Features Implemented

#### Business Management
- ✅ Inventory Management
- ✅ Order Processing
- ✅ Invoice Generation
- ✅ Expense Tracking
- ✅ Financial Dashboard
- ✅ Digital Wallet
- ✅ Team Management
- ✅ Location Management
- ✅ Appointment Scheduling

#### E-commerce
- ✅ Product Catalog
- ✅ Shopping Cart
- ✅ Checkout Flow
- ✅ Order Management
- ✅ Payment Integration (M-Pesa)
- ✅ Customer Portal
- ✅ Real-time Updates

#### Analytics & Insights
- ✅ Sales Analytics
- ✅ Financial Reports
- ✅ AI-Powered Insights
- ✅ Performance Metrics
- ✅ Activity Tracking

#### User Experience
- ✅ PWA Support
- ✅ Electron Desktop App
- ✅ Dark/Light Theme
- ✅ Real-time Notifications
- ✅ Responsive Design
- ✅ Live Chat Support

#### Security & Access
- ✅ JWT Authentication
- ✅ Role-Based Access Control (RBAC)
- ✅ Activity Logging
- ✅ Secure File Uploads

### Architecture Patterns

#### Frontend
- **Component Architecture**: Atomic design with shadcn/ui
- **State Management**: React Context API
- **Data Fetching**: Axios with custom hooks
- **Real-time**: Socket.IO client
- **Routing**: React Router v7
- **Styling**: TailwindCSS utility-first
- **Type Safety**: JSX with PropTypes

#### Backend
- **API Pattern**: RESTful with Express
- **Data Layer**: Mongoose ODM for MongoDB
- **Authentication**: JWT with role middleware
- **File Storage**: Cloudinary integration
- **Real-time**: Socket.IO server
- **Email**: Nodemailer service
- **Payment**: M-Pesa API integration
- **AI**: Google Generative AI

### Notes
- Built artifacts in `client/dist/` and `client/dev-dist/`
- Upload files stored in `server/uploads/`
- Extensive documentation in `documenttion/` (90+ files)
- Dual-port setup: Dashboard (5173) + Storefront (5174)
- Real-time sync across all features
- PWA installable on mobile and desktop
- Electron wrapper for native desktop experience
- Comprehensive test scripts for all major features


