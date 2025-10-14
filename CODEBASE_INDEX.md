# OmniBiz - Comprehensive Codebase Index

**Generated:** October 14, 2025  
**Repository:** https://github.com/glorisonglotech/omnibiz  
**Latest Commit:** 8c5e8d7

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Frontend Architecture](#frontend-architecture)
5. [Backend Architecture](#backend-architecture)
6. [API Endpoints](#api-endpoints)
7. [Database Models](#database-models)
8. [Key Features](#key-features)
9. [Development Setup](#development-setup)

---

## Project Overview

**OmniBiz** is a full-stack business management platform designed to streamline operations including:
- Inventory management
- E-commerce operations
- Appointment scheduling
- Financial management & reporting
- Real-time analytics with AI insights
- Role-based access control
- PWA support for offline capabilities

---

## Tech Stack

### Frontend
- **Framework:** React 19.1.1
- **Build Tool:** Vite 7.1.6
- **Styling:** TailwindCSS 4.1.13
- **UI Components:** Radix UI (@radix-ui/*)
- **State Management:** React Context API
- **Routing:** React Router DOM 7.9.1
- **Charts:** Recharts 3.2.1
- **Icons:** Lucide React, React Icons, Heroicons
- **Animations:** Framer Motion 12.23.22
- **PWA:** vite-plugin-pwa 1.0.3, Workbox 7.3.0
- **Real-time:** Socket.IO Client 4.8.1
- **HTTP Client:** Axios 1.12.2

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js 5.1.0
- **Database:** MongoDB with Mongoose 8.18.2
- **Authentication:** JWT (jsonwebtoken 9.0.2)
- **Password Hashing:** bcryptjs 3.0.2
- **File Upload:** Multer 2.0.2, Cloudinary 1.41.3
- **Real-time:** Socket.IO 4.8.1
- **Email:** Nodemailer 7.0.6
- **SMS:** Twilio 5.9.0
- **Payment:** M-Pesa integration
- **Geolocation:** geoip-lite 1.4.10
- **User Agent Parsing:** ua-parser-js 2.0.5

### Development Tools
- **Package Manager:** pnpm 10.12.1
- **Linting:** ESLint 9.35.0
- **Process Manager:** Nodemon 3.1.10
- **Tunneling:** Ngrok (for M-Pesa callbacks)

---

## Project Structure

```
omnibiz/
├── client/                          # Frontend React application
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── assets/                  # Images, icons
│   │   ├── components/              # Reusable React components
│   │   │   ├── ui/                  # Base UI components (Radix-based)
│   │   │   └── payments/            # Payment integration components
│   │   ├── context/                 # React Context providers
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── lib/                     # Utility functions and API client
│   │   ├── pages/                   # Page components
│   │   │   ├── dashboard/           # Dashboard-specific pages
│   │   │   └── client/              # Client-specific pages
│   │   ├── services/                # Service layer
│   │   ├── App.jsx                  # Root component
│   │   └── main.jsx                 # Entry point
│   ├── dev-dist/                    # Development service worker files
│   ├── package.json
│   └── vite.config.js
│
├── server/                          # Backend Node.js application
│   ├── config/                      # Configuration files
│   ├── controllers/                 # Route controllers
│   ├── middlewares/                 # Express middlewares
│   ├── models/                      # MongoDB/Mongoose models
│   ├── routes/                      # Express route definitions
│   ├── scripts/                     # Utility scripts
│   ├── services/                    # Business logic services
│   ├── uploads/                     # File upload directory
│   ├── server.js                    # Main server file
│   └── package.json
│
├── README.md                        # Project documentation
├── package.json                     # Root package.json
└── .gitignore
```

---

## Frontend Architecture

### Components (client/src/components/)

#### Core Components
- **ActivityHistory.jsx** - User activity tracking and display
- **ComprehensiveGraphs.jsx** - Advanced charting and data visualization
- **DashboardLayout.jsx** - Main dashboard layout wrapper
- **DashboardSidebar.jsx** - Navigation sidebar
- **DashboardTopbar.jsx** - Top navigation bar with search and user menu
- **EnhancedFilters.jsx** - Advanced filtering system
- **ErrorBoundary.jsx** - Error catching and display
- **Features.jsx** - Feature showcase component
- **FileUpload.jsx** - File upload with drag-and-drop
- **Footer.jsx** - Site footer
- **HeroSection.jsx** - Landing page hero
- **InteractiveMap.jsx** - Location mapping with Google Maps integration
- **LocationPicker.jsx** - Location selection interface
- **Login.jsx** - Login form component
- **Navbar.jsx** - Main navigation bar
- **NotificationCenter.jsx** - Real-time notification display
- **OrderHistory.jsx** - Order tracking and history
- **ProfilePicture.jsx** - User profile picture management
- **PWAInstallPrompt.jsx** - PWA installation prompt
- **PWAUpdateNotification.jsx** - PWA update notifications
- **RealTimeAIInsights.jsx** - AI-powered insights display
- **RoleBasedAccess.jsx** - Permission and role management
- **Signup.jsx** - User registration form
- **SplashScreen.jsx** - Application splash screen
- **TestimonialsSection.jsx** - Customer testimonials
- **ThemeCustomizer.jsx** - Theme customization interface
- **ThemeSwitcher.jsx** - Theme selection component
- **ThemeSync.jsx** - Theme synchronization

#### UI Components (client/src/components/ui/)
Base components using Radix UI primitives:
- avatar.jsx, badge.jsx, breadcrumb.jsx, button.jsx
- calendar.jsx, card.jsx, date-range-picker.jsx, dialog.jsx
- dropdown-menu.jsx, input.jsx

#### Payment Components (client/src/components/payments/)
- **MpesaPayment.jsx** - M-Pesa payment integration
- **PaymentOptions.jsx** - Payment method selection
- **PayPalPayment.jsx** - PayPal payment integration

### Context Providers (client/src/context/)
- **AuthContext.jsx** - Authentication state management
- **FinancialContext.jsx** - Financial data management
- **PWAContext.jsx** - PWA state and update management
- **SocketContext.jsx** - Socket.IO connection management
- **ThemeContext.jsx** - Theme state management

### Custom Hooks (client/src/hooks/)
- **useGraphData.js** - Graph data fetching and processing
- **useRealTimeAI.js** - Real-time AI insights hook
- **useThemeSync.js** - Theme synchronization across devices

### Pages (client/src/pages/)

#### Main Pages
- **Home.jsx** - Landing page
- **About.jsx** - About page
- **Contact.jsx** - Contact page
- **Features.jsx** - Features showcase
- **Pricing.jsx** - Pricing plans
- **Help.jsx** - Help documentation
- **LoginPage.jsx** - Login page
- **SignupPage.jsx** - Registration page
- **Dashboard.jsx** - Main dashboard (role-based routing)
- **Settings.jsx** - User settings
- **NotFound.jsx** - 404 page

#### Dashboard Pages (client/src/pages/dashboard/)
- **AdminDashboard.jsx** - Admin-specific dashboard
- **ClientDashboard.jsx** - Client-specific dashboard
- **ManagerDashboard.jsx** - Manager-specific dashboard
- **StaffDashboard.jsx** - Staff-specific dashboard
- **AIInsights.jsx** - AI insights page
- **Analytics.jsx** - Analytics dashboard
- **Appointments.jsx** - Appointment management
- **Checkout.jsx** - Checkout process
- **ECommerce.jsx** - E-commerce management
- **Finances.jsx** - Financial management
- **GraphsShowcase.jsx** - Graph demonstrations
- **HelpSupport.jsx** - Help and support
- **History.jsx** - Activity history
- **Inventory.jsx** - Inventory management
- **Locations.jsx** - Location management
- **Maps.jsx** - Map views
- **Products.jsx** - Product management
- **Profile.jsx** - User profile
- **Purchasing.jsx** - Purchasing interface
- **Reports.jsx** - Report generation
- **Search.jsx** - Search functionality
- **Settings.jsx** - Dashboard settings
- **Team.jsx** - Team management

### Libraries (client/src/lib/)
- **api.js** - Axios-based API client with interceptors
- **utils.js** - Utility functions (class merging, etc.)

---

## Backend Architecture

### Configuration (server/config/)
- **db.js** - MongoDB connection setup
- **email.js** - Email service configuration (Nodemailer)
- **socket.js** - Socket.IO initialization and event handlers
- **upload.js** - Multer and Cloudinary configuration

### Controllers (server/controllers/)
API route handlers:
- **activityController.js** - Activity tracking and logging
  - getUserActivityHistory, getActivityStats, getActivityDetails
  - getSystemActivityOverview, exportActivityData
- **adminController.js** - Admin-specific operations
- **AppointmentController.js** - Appointment CRUD operations
- **authController.js** - Authentication (login, register, token generation)
- **clientController.js** - Client-specific operations
- **dashboardController.js** - Dashboard data aggregation
  - getDashboardData, getSpecificAnalytics, getRealtimeUpdates
  - getDashboardSummary, clearDashboardCache
- **expenseController.js** - Expense tracking
- **invoiceController.js** - Invoice management
- **locationController.js** - Location services
- **mpesaController.js** - M-Pesa payment integration
- **orderController.js** - Order processing and management
- **paymentController.js** - Payment gateway integration
- **productController.js** - Product management
- **teamController.js** - Team collaboration features
- **transactionController.js** - Transaction processing
- **userController.js** - User management

### Middlewares (server/middlewares/)
- **asyncHandler.js** - Async error handling wrapper
- **authMiddleware.js** - JWT authentication verification
- **roleMiddleware.js** - Role-based access control

### Models (server/models/)
MongoDB schemas:
- **user.js** - User account data
- **appointment.js** - Appointment bookings
- **expense.js** - Business expenses
- **invoice.js** - Invoice records
- **location.js** - Location data
- **mpesaModel.js** - M-Pesa transaction records
- **order.js** - Customer orders
- **product.js** - Product catalog
- **serviceRequest.js** - Service requests
- **team.js** - Team structure
- **transaction.js** - Financial transactions
- **userActivity.js** - User activity logs

### Routes (server/routes/)
Express route definitions:
- **authRoutes.js** - Authentication endpoints
- **activityRoutes.js** - Activity tracking endpoints
- **adminRoutes.js** - Admin-only endpoints
- **appointmentRoutes.js** - Appointment management
- **clientRoutes.js** - Client-specific endpoints
- **dashboardRoutes.js** - Dashboard data endpoints
- **expenseRoutes.js** - Expense management
- **financialRoutes.js** - Financial reporting
- **invoiceRoutes.js** - Invoice operations
- **locationRoutes.js** - Location services
- **mpesaRoutes.js** - M-Pesa integration
- **orderRoutes.js** - Order processing
- **paymentRoutes.js** - Payment processing
- **productRoutes.js** - Product management
- **reportRoutes.js** - Report generation
- **subscriptionRoutes.js** - Subscription management
- **teamRoutes.js** - Team collaboration
- **uploadRoutes.js** - File upload handling
- **userRoutes.js** - User management

### Services (server/services/)
Business logic layer:
- **activityLogger.js** - Activity logging service
- **dashboardAnalytics.js** - Analytics computation

### Scripts (server/scripts/)
Utility scripts:
- **createTestUser.js** - Test user generation
- **seedData.js** - Database seeding

---

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /logout` - User logout
- `GET /verify` - Token verification

### Users (`/api/user`)
- `GET /profile` - Get user profile
- `PUT /profile` - Update profile
- `POST /upload-avatar` - Upload profile picture

### Products (`/api/products`)
- `GET /` - List all products
- `GET /:id` - Get product details
- `POST /` - Create product (Admin)
- `PUT /:id` - Update product (Admin)
- `DELETE /:id` - Delete product (Admin)

### Orders (`/api/orders`)
- `GET /` - List orders
- `GET /:id` - Get order details
- `POST /` - Create order
- `PUT /:id/status` - Update order status

### Appointments (`/api/appointments`)
- `GET /` - List appointments
- `POST /` - Create appointment
- `PUT /:id` - Update appointment
- `DELETE /:id` - Cancel appointment

### Invoices (`/api/invoices`)
- `GET /` - List invoices
- `GET /:id` - Get invoice details
- `POST /` - Create invoice
- `PUT /:id` - Update invoice

### Expenses (`/api/expenses`)
- `GET /` - List expenses
- `POST /` - Create expense
- `PUT /:id` - Update expense
- `DELETE /:id` - Delete expense

### Payments (`/api/payments`)
- `POST /mpesa` - Initiate M-Pesa payment
- `POST /paypal` - Initiate PayPal payment
- `GET /status/:id` - Check payment status

### M-Pesa (`/api/mpesa`)
- `POST /stk-push` - Initiate STK push
- `POST /callback` - M-Pesa callback handler
- `GET /query/:id` - Query transaction status

### Dashboard (`/api/dashboard`)
- `GET /stats` - Dashboard statistics
- `GET /analytics` - Analytics data
- `GET /realtime` - Real-time updates

### Activities (`/api/activities`)
- `GET /user/:userId` - User activity history
- `GET /stats` - Activity statistics
- `GET /system` - System-wide activities

### Team (`/api/team`)
- `GET /` - List team members
- `POST /invite` - Invite team member
- `PUT /:id/role` - Update member role

### Locations (`/api/locations`)
- `GET /` - List locations
- `POST /` - Add location
- `PUT /:id` - Update location

### Reports (`/api/reports`)
- `GET /financial` - Financial reports
- `GET /inventory` - Inventory reports
- `GET /sales` - Sales reports

### File Upload (`/api/upload`)
- `POST /` - Upload file
- `POST /multiple` - Upload multiple files

### Admin (`/api/admin`)
- `GET /users` - List all users
- `PUT /users/:id/role` - Update user role
- `DELETE /users/:id` - Delete user
- `GET /system-stats` - System statistics

---

## Database Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum: super_admin, admin, manager, staff, client),
  permissions: [String],
  avatar: String,
  phone: String,
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```
### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
  status: String (enum: active, inactive, suspended),
  createdAt: Date,
  updatedAt: Date
}
```

### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: [String],
  sku: String (unique),
