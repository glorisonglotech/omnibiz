# OmniBiz Codebase Index

**Generated:** October 22, 2025  
**Version:** 2.0.0  
**Repository:** https://github.com/glorisonglotech/omnibiz  
**Last Updated:** October 22, 2025

---

## 📋 Project Summary

**OmniBiz** is a comprehensive full-stack business management platform providing end-to-end solutions for:

- **Inventory Management** - Complete product catalog with stock tracking
- **E-commerce Operations** - Online store, shopping cart, order processing
- **Appointment Scheduling** - Calendar system with booking management
- **Financial Management** - Invoices, expenses, transactions, wallet system
- **Team Collaboration** - Role-based access control and team management
- **Real-time Analytics** - AI-powered insights and reporting
- **Customer Portal** - Self-service client interface
- **Multi-location Support** - Location management with maps integration
- **PWA & Mobile** - Progressive Web App with offline capabilities
- **Desktop App** - Electron-based desktop application

---

## 🏗️ Architecture Overview

### **Technology Stack**

#### **Frontend**
- **Framework:** React 19.1.1 with Vite 7.1.6
- **UI Library:** Radix UI components (shadcn/ui)
- **Styling:** TailwindCSS 4.1.13
- **Icons:** Lucide React, React Icons, Heroicons
- **Animations:** Framer Motion 12.23.22
- **State Management:** React Context API
- **Routing:** React Router DOM 7.9.1
- **Charts:** Recharts 3.2.1
- **Real-time:** Socket.IO Client 4.8.1
- **PWA:** Vite Plugin PWA + Workbox 7.3.0
- **HTTP Client:** Axios 1.12.2
- **Excel Processing:** XLSX 0.18.5
- **Theme Management:** next-themes 0.4.6

#### **Backend**
- **Runtime:** Node.js with Express 5.1.0
- **Database:** MongoDB with Mongoose 8.18.2
- **Authentication:** JWT (jsonwebtoken 9.0.2) + bcryptjs 3.0.2
- **File Upload:** Multer 2.0.2 + Cloudinary 1.41.3
- **Real-time:** Socket.IO 4.8.1
- **Email:** Nodemailer 7.0.6
- **SMS:** Twilio 5.9.0
- **Payment:** M-Pesa integration
- **AI:** Google Generative AI 0.24.1
- **Geolocation:** geoip-lite 1.4.10
- **User Agent:** ua-parser-js 2.0.5

#### **Development Tools**
- **Package Manager:** pnpm 10.12.1
- **Build Tools:** Vite, Electron Builder
- **Code Quality:** ESLint 9.35.0
- **Process Management:** Nodemon 3.1.10
- **Deployment:** GitHub Pages, Electron apps

---

## 📁 Project Structure

```
omnibiz/
├── client/                          # Frontend React application
│   ├── public/                      # Static assets, PWA manifest
│   ├── src/
│   │   ├── assets/                  # Images, icons, fonts
│   │   ├── components/              # React components (98 files)
│   │   │   ├── ui/                  # Base UI components (27 files)
│   │   │   ├── auth/                # Authentication components
│   │   │   ├── ecommerce/           # E-commerce components (8 files)
│   │   │   ├── payments/            # Payment components (4 files)
│   │   │   ├── products/            # Product management
│   │   │   ├── storefront/          # Storefront components (7 files)
│   │   │   ├── support/             # Support system (10 files)
│   │   │   └── wallet/              # Wallet components
│   │   ├── context/                 # React Context providers (7 files)
│   │   ├── hooks/                   # Custom React hooks (6 files)
│   │   ├── lib/                     # Utilities and API client
│   │   ├── pages/                   # Page components (54 files)
│   │   │   ├── auth/                # Authentication pages
│   │   │   ├── client/              # Client portal pages (6 files)
│   │   │   └── dashboard/           # Dashboard pages (28 files)
│   │   ├── services/                # API service layer
│   │   ├── App.jsx                  # Main app component (10,690 bytes)
│   │   ├── main.jsx                 # Application entry point
│   │   └── index.css                # Global styles (19,345 bytes)
│   ├── electron/                    # Desktop app configuration
│   ├── package.json                 # Frontend dependencies
│   └── vite.config.js               # Build configuration
│
├── server/                          # Backend Node.js application
│   ├── config/                      # Configuration files (4 files)
│   ├── controllers/                 # Request handlers (25 files)
│   ├── middlewares/                 # Express middlewares (5 files)
│   ├── models/                      # MongoDB schemas (21 files)
│   ├── routes/                      # API endpoints (31 files)
│   ├── scripts/                     # Utility scripts (5 files)
│   ├── services/                    # Business logic (8 files)
│   ├── uploads/                     # File uploads directory
│   ├── server.js                    # Main server file (7,229 bytes)
│   └── package.json                 # Backend dependencies
│
├── documenttion/                    # Comprehensive documentation (200 files)
├── docs/                            # Additional documentation
├── .env.example                     # Environment template
├── .gitignore                       # Git ignore rules
└── package.json                     # Root package configuration
```

---

## 🎨 Frontend Architecture

### **Component Structure**

#### **Core Layout Components**
- **DashboardLayout.jsx** (728 bytes) - Main dashboard wrapper
- **DashboardSidebar.jsx** (11,464 bytes) - Navigation sidebar
- **DashboardTopbar.jsx** (7,622 bytes) - Top navigation bar
- **Navbar.jsx** (4,961 bytes) - Public site navigation
- **Footer.jsx** (3,014 bytes) - Site footer

#### **Feature Components**
- **GUIImplementation.jsx** (76,800 bytes) - Main GUI system
- **ThemeCustomizer.jsx** (10,100 bytes) - Advanced theme customization
- **ThemeSwitcher.jsx** (5,430 bytes) - Theme selection component
- **NotificationCenter.jsx** (7,064 bytes) - Real-time notifications
- **ActivityHistory.jsx** (14,130 bytes) - User activity tracking
- **RealTimeAIInsights.jsx** (6,723 bytes) - AI-powered insights
- **ComprehensiveGraphs.jsx** (13,409 bytes) - Data visualization
- **InteractiveMap.jsx** (16,643 bytes) - Location mapping
- **FileUpload.jsx** (9,481 bytes) - Multi-file upload
- **ErrorBoundary.jsx** (3,152 bytes) - Error handling
- **ProtectedRoute.jsx** (2,640 bytes) - Route protection

#### **UI Components (Radix-based)**
27 reusable base components including:
- Form controls (button, input, select, checkbox, radio)
- Layout components (card, tabs, dialog, popover)
- Data display (table, badge, avatar, calendar)
- Feedback (toast, tooltip, progress, alert)

### **Page Structure**

#### **Public Pages**
- **Home** (`Index.jsx`) - Landing page
- **About** (`About.jsx`) - About page (12,496 bytes)
- **Contact** (`Contact.jsx`) - Contact form (12,432 bytes)
- **Features** (`Features.jsx`) - Feature showcase (12,010 bytes)
- **Pricing** (`Pricing.jsx`) - Pricing plans (23,916 bytes)
- **Services** (`Services.jsx`) - Services overview (15,930 bytes)
- **Help** (`Help.jsx`) - Help documentation (15,618 bytes)
- **Login/Signup** - Authentication pages

#### **Dashboard Pages (28 pages)**
- **Main Dashboard** (`Dashboard.jsx`) - Overview (14,345 bytes)
- **AI Insights** (`AIInsights.jsx`) - AI analytics (31,180 bytes)
- **Analytics** (`Analytics.jsx`) - Advanced analytics (32,121 bytes)
- **Appointments** (`Appointments.jsx`) - Scheduling (39,845 bytes)
- **E-commerce** (`ECommerce.jsx`) - Online store (43,803 bytes)
- **Finances** (`Finances.jsx`) - Financial management (34,096 bytes)
- **Inventory** (`Inventory.jsx`) - Stock management (28,556 bytes)
- **Products** (`Products.jsx`) - Product catalog (30,203 bytes)
- **Purchasing** (`Purchasing.jsx`) - Purchase orders (35,577 bytes)
- **Reports** (`Reports.jsx`) - Business reports (27,431 bytes)
- **Team** (`Team.jsx`) - Team management (35,666 bytes)
- **Locations** (`Locations.jsx`) - Location management (43,467 bytes)
- **Profile** (`Profile.jsx`) - User profile (78,884 bytes)
- **Settings** (`Settings.jsx`) - Configuration (49,014 bytes)
- **Wallet** (`Wallet.jsx`) - Digital wallet (85,419 bytes)
- **Admin Dashboard** (`AdminDashboard.jsx`) - Admin interface (13,573 bytes)
- **Checkout** (`Checkout.jsx`) - Payment processing (24,633 bytes)
- **Discounts** (`Discounts.jsx`) - Promotional management (22,827 bytes)
- **Graphs Showcase** (`GraphsShowcase.jsx`) - Chart demonstrations (15,174 bytes)
- **Help Support** (`HelpSupport.jsx`) - Support interface (48,155 bytes)
- **History** (`History.jsx`) - Activity tracking (19,656 bytes)
- **Live Sessions** (`LiveSessions.jsx`) - Real-time sessions (18,472 bytes)
- **Maps** (`Maps.jsx`) - Geographic interface (26,746 bytes)
- **Messages** (`Messages.jsx`) - Communication (18,287 bytes)
- **Resource Center** (`ResourceCenter.jsx`) - Help resources (7,703 bytes)
- **Search** (`Search.jsx`) - Global search (16,351 bytes)
- **Security Dashboard** (`SecurityDashboard.jsx`) - Security management (18,383 bytes)
- **Services** (`Services.jsx`) - Service management (16,685 bytes)
- **Subscriptions** (`Subscriptions.jsx`) - Subscription management (12,516 bytes)
- **Support Hub** (`SupportHub.jsx`) - Support center (5,880 bytes)

#### **Client Portal Pages (6 pages)**
- Client registration, login, storefront, catalog, booking, and order management

### **Context Providers**

#### **AuthContext** - Authentication state management
#### **ThemeContext** - Theme system with 15+ themes and persistence
#### **SocketContext** - Real-time WebSocket connections
#### **FinancialContext** - Financial data and transactions
#### **PWAContext** - PWA installation and updates
#### **CartContext** - Shopping cart functionality

### **Custom Hooks**
- `use-toast.js` - Notification system
- `useGraphData.js` - Chart data processing
- `usePermissions.js` - Role-based access control
- `useRealTimeAI.js` - AI insights integration
- `useThemeSync.js` - Cross-device theme sync

---

## 🔧 Backend Architecture

### **Server Configuration**
- **Port:** 5000 (configurable)
- **CORS:** Enabled for cross-origin requests
- **Body Parser:** JSON with 10MB limit
- **Socket.IO:** Real-time communication
- **Memory Monitoring:** Automatic logging

### **Database Models (21 models)**

#### **Core Models**
- **User** (`user.js`) - Complete user management with roles and permissions
- **Product** (`product.js`) - Product catalog with inventory
- **Order** (`order.js`) - Order management and tracking
- **Invoice** (`invoice.js`) - Invoice generation and management
- **Transaction** (`transaction.js`) - Financial transaction records

#### **Business Models**
- **Appointment** (`appointment.js`) - Scheduling and booking
- **Customer** (`customer.js`) - Customer relationship management
- **Location** (`location.js`) - Multi-location support
- **Team** (`team.js`) - Team collaboration
- **ServiceRequest** (`serviceRequest.js`) - Service management
- **Expense** (`expense.js`) - Business expense tracking

#### **Feature Models**
- **UserActivity** (`userActivity.js`) - Activity logging
- **LiveSession** (`liveSession.js`) - Real-time sessions
- **SupportTicket** (`supportTicket.js`) - Support system
- **Wallet** (`wallet.js`) - Digital wallet functionality
- **MpesaModel** (`mpesaModel.js`) - Mobile payment integration

#### **System Models**
- **Discount** (`discount.js`) - Promotional discounts
- **SecurityLog** (`securityLog.js`) - Security audit logs
- **FAQ** (`faq.js`) - Frequently asked questions

### **API Controllers (25 controllers)**

#### **Authentication & Users**
- `authController.js` - Registration, login, token management
- `userController.js` - User profile and settings
- `teamController.js` - Team management
- `adminController.js` - Administrative functions

#### **Business Operations**
- `productController.js` - Product CRUD operations
- `orderController.js` - Order processing
- `inventoryController.js` - Stock management
- `appointmentController.js` - Appointment scheduling
- `locationController.js` - Location services
- `serviceController.js` - Service management

#### **Financial Management**
- `paymentController.js` - Payment processing
- `mpesaController.js` - M-Pesa integration
- `walletController.js` - Digital wallet
- `invoiceController.js` - Invoice management
- `expenseController.js` - Expense tracking
- `transactionController.js` - Transaction processing

#### **Analytics & Support**
- `dashboardController.js` - Dashboard data aggregation
- `activityController.js` - Activity tracking
- `supportController.js` - Support ticket system
- `aiController.js` - AI insights and analytics

### **API Routes (31 route files)**

#### **Authentication** (`/api/auth`)
- User registration, login, logout, token verification

#### **Products** (`/api/products`)
- Full CRUD operations, search, filtering, categorization

#### **Orders** (`/api/orders`)
- Order lifecycle management, status updates, history

#### **Appointments** (`/api/appointments`)
- Scheduling, booking, calendar integration

#### **Financial** (`/api/payments`, `/api/wallet`, `/api/invoices`)
- Payment processing, wallet management, invoicing

#### **M-Pesa** (`/api/mpesa`)
- STK push, callback handling, transaction status

#### **Team** (`/api/team`)
- Team management, invitations, role assignments

#### **Admin** (`/api/admin`)
- User management, system statistics, approvals

#### **Support** (`/api/support`)
- Ticket management, FAQ, feedback system

#### **Real-time** (`/api/activities`, `/api/dashboard`)
- Activity tracking, dashboard data, live updates

### **Middleware System**
- **Authentication** - JWT token verification
- **Authorization** - Role-based access control
- **Async Handler** - Error handling wrapper
- **File Upload** - Multer configuration
- **Security** - Rate limiting and validation

---

## 🔄 Real-Time Features

### **Socket.IO Integration**
Real-time communication with authenticated connections and room-based messaging:

#### **Server Events**
- Order status updates
- Service request notifications
- User typing indicators
- Real-time dashboard updates
- Live session management

#### **Client Integration**
- Auto-reconnecting connections
- Room management (user-specific, role-based)
- Event-driven state updates
- Real-time notifications

---

## 🎨 Theme System

### **Available Themes (15+)**
1. **Default:** Light, Dark
2. **Color Themes:** Ocean Blue, Forest Green, Royal Purple, Sunset Orange, Rose Pink
3. **Specialty:** Dracula, Nord, Matrix, Cyberpunk, Tokyo Night, Monokai, Solarized, Gruvbox, One Dark, Synthwave

### **Theme Persistence**
- **Local Storage** - Immediate persistence
- **Server Sync** - Cross-device synchronization
- **Advanced Features** - Custom colors, animations, accessibility options

---

## 📱 PWA & Desktop Features

### **Progressive Web App**
- Installable on mobile and desktop
- Offline functionality with service workers
- Push notifications
- Background sync
- App update management

### **Electron Desktop App**
- Cross-platform desktop application
- Windows, macOS, Linux support
- Native system integration
- Auto-updating capability

---

## 💳 Payment Integration

### **M-Pesa Integration**
- STK Push for payments
- Callback handling with security
- Transaction status checking
- Webhook verification

### **Planned Integrations**
- Stripe payment processing
- PayPal integration
- Credit card processing

---

## 📊 AI & Analytics

### **AI Features**
- Google Generative AI integration
- Real-time insights and predictions
- Trend analysis and anomaly detection
- Automated recommendations

### **Analytics Dashboard**
- Comprehensive business metrics
- Financial reporting
- Inventory analytics
- Customer insights
- Activity logs and audit trails

---

## 🔐 Security Features

### **Authentication**
- JWT-based authentication with refresh tokens
- Password hashing with bcryptjs
- Two-factor authentication (planned)

### **Authorization**
- Role-based access control (RBAC)
- Fine-grained permissions system
- Route-level protection
- Component-level access control

### **Data Protection**
- CORS configuration
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- Security audit logging

---

## 📚 Documentation

### **Comprehensive Documentation (200+ files)**
- **Setup Guides:** Environment configuration, database setup
- **Feature Documentation:** Detailed implementation guides
- **API Documentation:** Complete endpoint references
- **Deployment Guides:** Production deployment procedures
- **Troubleshooting:** Common issues and solutions

### **Key Documentation Files**
- `CODEBASE_OVERVIEW.md` - Complete system overview
- `PWA_IMPLEMENTATION.md` - PWA setup and features
- `THEME_SYSTEM_RECONFIGURED.md` - Theme system details
- `ECOMMERCE_ENHANCEMENTS.md` - E-commerce features
- `AI_CHAT_ENHANCED_VISIBILITY.md` - AI integration
- `WEBSOCKET_WEBRTC_THEMES_IMPLEMENTATION.md` - Real-time features

---

## 🚀 Development & Deployment

### **Development Commands**
```bash
# Frontend
npm run dev              # Start development server
npm run dev:dashboard    # Dashboard only (port 5173)
npm run dev:storefront   # Storefront only (port 5174)
npm run build            # Build for production

# Backend
npm run dev              # Start with nodemon
npm run start            # Production start

# Full Stack
npm run dev              # Both frontend and backend
npm run electron         # Desktop app development
```

### **Environment Configuration**

#### **Frontend (.env)**
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

#### **Backend (.env)**
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/omnibiz
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 📈 Project Metrics

### **Code Statistics**
- **Frontend:** ~151 React components, 54 pages, 98 total component files
- **Backend:** 90+ files (31 routes, 25 controllers, 21 models, 8 services)
- **Documentation:** 200+ markdown files with comprehensive guides
- **Total Lines of Code:** 500,000+ lines across all files

### **Feature Completeness**
- ✅ Inventory Management - Full CRUD with stock tracking
- ✅ E-commerce - Complete shopping cart and checkout
- ✅ Appointments - Calendar and booking system
- ✅ Financial Management - Invoices, expenses, wallet
- ✅ Team Management - Role-based collaboration
- ✅ Real-time Updates - Socket.IO integration
- ✅ Theme System - 15+ customizable themes
- ✅ PWA Support - Offline-capable application
- ✅ AI Insights - Predictive analytics
- ✅ Multi-location Support - Location management
- ✅ Payment Integration - M-Pesa mobile payments
- ✅ Client Portal - Self-service customer interface

---

## 🔄 Current Status

**Last Updated:** October 22, 2025  
**Version:** 2.0.0  
**Status:** Active development with comprehensive feature set  
**Documentation:** Extensively documented with 200+ guides

This codebase represents a production-ready, enterprise-level business management platform with extensive documentation and comprehensive feature coverage.
