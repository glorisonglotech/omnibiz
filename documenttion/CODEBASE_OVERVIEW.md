# OmniBiz - Complete Codebase Overview

**Generated:** October 15, 2025

---

## 📋 Project Summary

**OmniBiz** is a full-stack business management platform providing comprehensive solutions for inventory management, e-commerce, appointments, finance tracking, and AI-powered analytics. It's designed as an all-in-one business operations hub with real-time collaboration features.

---

## 🏗️ Architecture

### **Tech Stack**

#### **Frontend**
- **Framework:** React 19.1.1 with Vite 7.1.6
- **UI Library:** Radix UI + shadcn/ui components
- **Styling:** TailwindCSS 4.1.13
- **Icons:** Lucide React, React Icons, Heroicons
- **Animations:** Framer Motion
- **State Management:** React Context API
- **Routing:** React Router DOM 7.9.1
- **Charts:** Recharts 3.2.1
- **PWA:** Vite Plugin PWA + Workbox
- **Real-time:** Socket.IO Client 4.8.1
- **HTTP Client:** Axios 1.12.2
- **Notifications:** Sonner 2.0.7

#### **Backend**
- **Runtime:** Node.js with Express 5.1.0
- **Database:** MongoDB with Mongoose 8.18.2
- **Authentication:** JWT (jsonwebtoken 9.0.2)
- **Password Hashing:** bcryptjs 3.0.2
- **File Upload:** Multer 2.0.2 + Cloudinary 1.41.3
- **Real-time:** Socket.IO 4.8.1
- **Email:** Nodemailer 7.0.6
- **SMS:** Twilio 5.9.0
- **Payments:** M-Pesa Integration
- **Geo-location:** geoip-lite 1.4.10

---

## 📁 Project Structure

```
omnibiz/
├── client/                    # Frontend React application
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── assets/          # Images, fonts, etc.
│   │   ├── components/      # Reusable React components
│   │   │   ├── ui/         # shadcn/ui base components
│   │   │   ├── ecommerce/  # E-commerce specific components
│   │   │   ├── payments/   # Payment-related components
│   │   │   └── storefront/ # Storefront components
│   │   ├── context/         # React Context providers
│   │   │   ├── AuthContext.jsx        # Authentication state
│   │   │   ├── ThemeContext.jsx       # Theme management
│   │   │   ├── SocketContext.jsx      # WebSocket connection
│   │   │   ├── FinancialContext.jsx   # Financial data
│   │   │   └── PWAContext.jsx         # PWA functionality
│   │   ├── hooks/           # Custom React hooks
│   │   │   ├── use-toast.js
│   │   │   ├── useGraphData.js
│   │   │   ├── usePermissions.js
│   │   │   ├── useRealTimeAI.js
│   │   │   └── useThemeSync.js
│   │   ├── lib/             # Utility functions
│   │   │   ├── api.js       # Axios configuration + API functions
│   │   │   └── utils.js     # Helper functions
│   │   ├── pages/           # Page components
│   │   │   ├── dashboard/   # Dashboard pages
│   │   │   └── client/      # Client-facing pages
│   │   ├── services/        # Service layer
│   │   ├── App.jsx          # Root component
│   │   ├── main.jsx         # Entry point
│   │   └── index.css        # Global styles
│   ├── index.html           # HTML template
│   ├── vite.config.js       # Vite configuration
│   ├── package.json         # Frontend dependencies
│   └── .env                 # Environment variables
│
├── server/                   # Backend Node.js application
│   ├── config/              # Configuration files
│   │   ├── db.js           # MongoDB connection
│   │   ├── socket.js       # Socket.IO setup
│   │   └── email.js        # Email configuration
│   ├── controllers/         # Request handlers
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   ├── invoiceController.js
│   │   ├── expenseController.js
│   │   ├── appointmentController.js
│   │   ├── locationController.js
│   │   ├── mpesaController.js
│   │   ├── userController.js
│   │   ├── teamController.js
│   │   ├── adminController.js
│   │   ├── clientController.js
│   │   └── dashboardController.js
│   ├── models/              # MongoDB schemas
│   │   ├── user.js
│   │   ├── product.js
│   │   ├── order.js
│   │   ├── invoice.js
│   │   ├── expense.js
│   │   ├── appointment.js
│   │   ├── transaction.js
│   │   ├── location.js
│   │   ├── team.js
│   │   ├── serviceRequest.js
│   │   └── userActivity.js
│   ├── routes/              # API route definitions
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── invoiceRoutes.js
│   │   ├── expenseRoutes.js
│   │   ├── appointmentRoutes.js
│   │   ├── financialRoutes.js
│   │   ├── locationRoutes.js
│   │   ├── mpesaRoutes.js
│   │   ├── userRoutes.js
│   │   ├── teamRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── clientRoutes.js
│   │   ├── uploadRoutes.js
│   │   ├── activityRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── reportRoutes.js
│   │   └── subscriptionRoutes.js
│   ├── middlewares/         # Express middlewares
│   ├── services/            # Business logic
│   ├── scripts/             # Utility scripts
│   │   └── seedDatabase.js # Database seeding
│   ├── uploads/             # Uploaded files
│   ├── server.js            # Entry point
│   ├── package.json         # Backend dependencies
│   └── .env                 # Environment variables
│
├── docs/                    # Documentation
├── package.json             # Root dependencies
└── README.md               # Project documentation
```

---

## 🎨 Frontend Architecture

### **Key Components**

#### **Layout Components**
- `DashboardLayout.jsx` - Main dashboard wrapper with sidebar/topbar
- `DashboardSidebar.jsx` - Navigation sidebar with collapsible menu
- `DashboardTopbar.jsx` - Top navigation bar with notifications
- `Navbar.jsx` - Public site navigation
- `Footer.jsx` - Site footer

#### **Feature Components**
- `ThemeCustomizer.jsx` - Advanced theme customization panel
- `ThemeSwitcher.jsx` - Quick theme toggle component
- `ThemeSync.jsx` - Cross-tab theme synchronization
- `NotificationCenter.jsx` - Real-time notification hub
- `NotificationsPanel.jsx` - Notification dropdown
- `ActivityHistory.jsx` - User activity tracking
- `RealTimeAIInsights.jsx` - AI-powered analytics
- `ComprehensiveGraphs.jsx` - Data visualization components
- `InteractiveMap.jsx` - Location-based features
- `LocationPicker.jsx` - Address selection
- `FileUpload.jsx` - Multi-file upload with preview
- `ProfilePicture.jsx` - Avatar management
- `ErrorBoundary.jsx` - Error handling wrapper
- `ProtectedRoute.jsx` - Route authentication guard
- `RoleBasedAccess.jsx` - Permission-based rendering

#### **UI Components (shadcn/ui)**
- `button.jsx`, `card.jsx`, `input.jsx`, `label.jsx`
- `dialog.jsx`, `dropdown-menu.jsx`, `popover.jsx`
- `tabs.jsx`, `table.jsx`, `badge.jsx`, `avatar.jsx`
- `calendar.jsx`, `date-range-picker.jsx`
- `scroll-area.jsx`, `separator.jsx`, `switch.jsx`
- `slider.jsx`, `progress.jsx`, `tooltip.jsx`

### **Pages Structure**

#### **Public Pages**
- `/` - Landing page (`Index.jsx`)
- `/features` - Feature showcase (`Features.jsx`)
- `/pricing` - Pricing information (`Pricing.jsx`)
- `/about` - About page (`About.jsx`)
- `/contact` - Contact form (`Contact.jsx`)
- `/loginpage` - User login (`LoginPage.jsx`)
- `/signup` - User registration (`SignupPage.jsx`)

#### **Client Pages**
- `/client/signup/:inviteCode` - Client registration
- `/client/login/:inviteCode` - Client login
- `/client/store/:inviteCode` - Client storefront
- `/client/catalog` - Product catalog
- `/client/book` - Appointment booking
- `/client/my-bookings` - Booking management

#### **Dashboard Pages**
- `/dashboard` - Main dashboard (`Dashboard.jsx`)
- `/dashboard/inventory` - Inventory management (`Inventory.jsx`)
- `/dashboard/ecommerce` - E-commerce hub (`ECommerce.jsx`)
- `/dashboard/products` - Product management (`Products.jsx`)
- `/dashboard/appointments` - Appointment scheduler (`Appointments.jsx`)
- `/dashboard/finances` - Financial tracking (`Finances.jsx`)
- `/dashboard/team` - Team management (`Team.jsx`)
- `/dashboard/locations` - Location management (`Locations.jsx`)
- `/dashboard/ai-insights` - AI analytics (`AIInsights.jsx`)
- `/dashboard/analytics` - Advanced analytics (`Analytics.jsx`)
- `/dashboard/maps` - Map view (`Maps.jsx`)
- `/dashboard/purchasing` - Purchase orders (`Purchasing.jsx`)
- `/dashboard/history` - Activity history (`History.jsx`)
- `/dashboard/search` - Global search (`Search.jsx`)
- `/dashboard/graphs` - Graph showcase (`GraphsShowcase.jsx`)
- `/dashboard/reports` - Report generation (`Reports.jsx`)
- `/dashboard/settings` - User settings (`Settings.jsx`)
- `/dashboard/profile` - User profile (`Profile.jsx`)
- `/dashboard/checkout` - Checkout process (`Checkout.jsx`)
- `/dashboard/support` - Help & support (`HelpSupport.jsx`)

### **Context Providers**

#### **AuthContext** (`AuthContext.jsx`)
```javascript
{
  user: Object,              // Current user data
  isAuthenticated: Boolean,  // Auth status
  loading: Boolean,          // Loading state
  login: Function,           // Login handler
  logout: Function           // Logout handler
}
```

#### **ThemeContext** (`ThemeContext.jsx`)
```javascript
{
  theme: String,                    // Current theme name
  themes: Object,                   // Available themes
  setTheme: Function,               // Theme setter
  sidebarCollapsed: Boolean,        // Sidebar state
  setSidebarCollapsed: Function,    // Sidebar toggle
  compactMode: Boolean,             // Compact UI mode
  highContrast: Boolean,            // Accessibility
  animations: Boolean,              // Animation toggle
  customAccentColor: String,        // Custom colors
  // ... additional theme settings
}
```

#### **SocketContext** (`SocketContext.jsx`)
```javascript
{
  socket: Object,            // Socket.IO instance
  connected: Boolean,        // Connection status
  emit: Function,            // Send events
  on: Function,              // Listen to events
  off: Function              // Remove listeners
}
```

#### **FinancialContext** (`FinancialContext.jsx`)
```javascript
{
  invoices: Array,           // Invoice data
  expenses: Array,           // Expense data
  transactions: Array,       // Transaction history
  summary: Object,           // Financial summary
  // ... financial operations
}
```

#### **PWAContext** (`PWAContext.jsx`)
```javascript
{
  isInstallable: Boolean,    // Can be installed
  promptInstall: Function,   // Install prompt
  updateAvailable: Boolean,  // Update ready
  updateApp: Function        // Apply update
}
```

### **Custom Hooks**

- `use-toast.js` - Toast notification management
- `useGraphData.js` - Chart data processing
- `usePermissions.js` - Role-based permission checks
- `useRealTimeAI.js` - Real-time AI insights
- `useThemeSync.js` - Cross-tab theme synchronization

### **API Layer** (`lib/api.js`)

#### **Axios Configuration**
- Base URL: `http://localhost:5000/api`
- Auto token injection
- Error interceptors with toast notifications
- 10-second timeout

#### **API Modules**
```javascript
// Authentication
authAPI.register(userData)
authAPI.login(credentials)
authAPI.getProfile()

// Admin
adminAPI.getAllOrders(params)
adminAPI.approveOrder(orderId, data)
adminAPI.getDashboardStats()

// Client
clientAPI.createOrder(orderData)
clientAPI.getMyOrders(params)
clientAPI.getDashboardStats()

// Upload
uploadAPI.profilePicture(formData)
uploadAPI.businessDocuments(formData)
uploadAPI.deleteFile(fileUrl)
```

---

## 🔧 Backend Architecture

### **Server Configuration** (`server.js`)

- **Port:** 5000 (default)
- **CORS:** Enabled for all origins
- **Body Parser:** JSON with 10MB limit
- **Socket.IO:** Enabled for real-time communication
- **Ngrok:** Optional tunneling for M-Pesa callbacks
- **Memory Monitoring:** Automatic logging every 5 minutes

### **Database Models**

#### **User Model** (`user.js`)
```javascript
{
  // Basic Info
  name, email, phone, password
  
  // Business Info
  businessName, businessEmail, businessPhone, businessAddress
  inviteCode
  
  // Profile
  firstName, lastName, dateOfBirth, gender
  address, city, state, country, zipCode
  jobTitle, department, bio, avatar
  
  // Preferences
  timezone, currency, language
  emailNotifications, smsNotifications, pushNotifications
  twoFactorAuth, sessionTimeout
  
  // Theme Settings
  themePreferences: {
    theme, sidebarCollapsed, compactMode,
    highContrast, reducedMotion, customAccentColor,
    animations, fontSize, borderRadius,
    soundEnabled, autoSave
  }
  
  // Role & Permissions
  role: ['super_admin', 'admin', 'manager', 'staff', 'client']
  permissions: {
    canCreateOrders, canViewAllOrders, canApproveOrders,
    canManageInventory, canManageUsers, canViewReports,
    canManageSettings, canManageServices, canVerifyOrders,
    canDeleteOrders, canManageRoles, canViewAllClients,
    canAssignAdmins
  }
  
  // Client-specific
  clientType: ['individual', 'business', 'wholesale', 'retail']
  creditLimit, paymentTerms, assignedAdmin
  
  // Admin-specific
  adminCapabilities: {
    maxClientsManaged, serviceAreas, specializations,
    workingHours: { start, end, timezone }
  }
  managedClients
  
  // Status
  accountStatus: ['active', 'inactive', 'suspended', 'pending_verification']
  verificationStatus: { email, phone, business }
  isActive, lastLogin
}
```

#### **Product Model** (`product.js`)
```javascript
{
  userId, name, sku, category,
  stockQuantity, reorderLevel, price,
  supplierName, status, description,
  image, featured, timestamps
}
```

#### **Other Models**
- `order.js` - Order management
- `invoice.js` - Invoice tracking
- `expense.js` - Expense records
- `appointment.js` - Appointment scheduling
- `transaction.js` - Financial transactions
- `location.js` - Business locations
- `team.js` - Team management
- `serviceRequest.js` - Service requests
- `userActivity.js` - Activity logging

### **API Routes**

#### **Authentication** (`/api/auth`)
```
POST   /register        - User registration
POST   /login           - User login
GET    /profile         - Get user profile
PUT    /users/:id/role  - Update user role
```

#### **Products** (`/api/products`)
```
GET    /                - List all products
POST   /                - Create product
GET    /:id             - Get product details
PUT    /:id             - Update product
DELETE /:id             - Delete product
```

#### **Orders** (`/api/orders`)
```
GET    /                - List orders
POST   /                - Create order
GET    /:id             - Get order details
PUT    /:id             - Update order
DELETE /:id             - Delete order
```

#### **Invoices** (`/api/invoices`)
```
GET    /                - List invoices
POST   /                - Create invoice
GET    /:id             - Get invoice
PUT    /:id             - Update invoice
DELETE /:id             - Delete invoice
```

#### **Expenses** (`/api/expenses`)
```
GET    /                - List expenses
POST   /                - Create expense
GET    /:id             - Get expense
PUT    /:id             - Update expense
DELETE /:id             - Delete expense
```

#### **Appointments** (`/api/appointments`)
```
GET    /                - List appointments
POST   /                - Create appointment
GET    /:id             - Get appointment
PUT    /:id             - Update appointment
DELETE /:id             - Delete appointment
```

#### **Locations** (`/api/locations`)
```
GET    /                - List locations
POST   /                - Create location
GET    /:id             - Get location
PUT    /:id             - Update location
DELETE /:id             - Delete location
```

#### **M-Pesa** (`/api/mpesa`)
```
POST   /stkpush         - Initiate STK push
POST   /callback        - M-Pesa callback
GET    /status/:id      - Check transaction status
```

#### **Admin** (`/api/admin`)
```
GET    /orders          - Get all orders
PUT    /orders/:id/approve - Approve order
PUT    /orders/:id/verify  - Verify order
GET    /service-requests   - Get service requests
GET    /dashboard-stats    - Get admin stats
```

#### **Client** (`/api/client`)
```
POST   /orders          - Create order
GET    /orders          - Get my orders
GET    /orders/:id      - Get order details
PUT    /orders/:id/submit - Submit order
PUT    /orders/:id/cancel - Cancel order
GET    /dashboard-stats - Get client stats
```

#### **Upload** (`/api/upload`)
```
POST   /profile-picture      - Upload avatar
POST   /business-documents   - Upload documents
POST   /order-attachments    - Upload order files
POST   /multiple             - Multiple file upload
DELETE /file                 - Delete file
GET    /info                 - Get upload info
```

### **Socket.IO Events**

#### **Server Events**
```javascript
// Connection
'connection'              - Client connected
'disconnect'              - Client disconnected

// Orders
'order_update'            - Order status changed
'order_updated'           - Broadcast order update
'new_order'               - New order created

// Service Requests
'service_request_update'  - Request status changed
'service_request_updated' - Broadcast request update
'new_service_request'     - New request created

// Real-time
'typing_start'            - User typing
'typing_stop'             - User stopped typing
'user_typing'             - Broadcast typing indicator
'user_stopped_typing'     - Broadcast stop typing

// Rooms
'join_room'               - Join a room
'leave_room'              - Leave a room

// Notifications
'notification'            - General notification
```

#### **Client Events**
```javascript
// Listen for updates
socket.on('order_updated', callback)
socket.on('service_request_updated', callback)
socket.on('notification', callback)

// Emit events
socket.emit('order_update', data)
socket.emit('typing_start', { room })
socket.emit('join_room', roomName)
```

### **Authentication Middleware**

- JWT token verification
- Token in Authorization header: `Bearer <token>`
- User data attached to `req.user`
- Role-based access control

### **Socket.IO Rooms**

- `user_${userId}` - Personal user room
- `role_${role}` - Role-based room
- `admins` - All admins
- `clients` - All clients
- `admin_${adminId}` - Admin's clients

---

## 🎨 Theme System

### **Available Themes**

1. **Default Themes**
   - Light
   - Dark

2. **Color Themes**
   - Ocean Blue
   - Forest Green
   - Royal Purple
   - Sunset Orange
   - Rose Pink

3. **Specialty Themes**
   - Dracula
   - Nord
   - Matrix
   - Cyberpunk
   - Tokyo Night
   - Monokai
   - Solarized
   - Gruvbox
   - One Dark
   - Synthwave

### **Theme Persistence** ✅

**Dual-Layer System:**

1. **localStorage** (Immediate)
   - Keys: `app-theme`, `app-theme-settings`
   - Instant load on page refresh
   - Works offline

2. **Server Sync** (Background)
   - API: `/api/user/settings`
   - 100ms delay on load
   - 1000ms debounce on save
   - Cross-device synchronization

### **Theme Configuration**

```javascript
{
  theme: 'dracula',
  sidebarCollapsed: false,
  compactMode: false,
  highContrast: false,
  reducedMotion: false,
  customAccentColor: '#bd93f9',
  animations: true,
  fontSize: 'medium',
  borderRadius: 'medium',
  soundEnabled: true,
  autoSave: true
}
```

---

## 🔐 Security Features

### **Authentication**
- JWT-based authentication
- Password hashing with bcryptjs
- Token expiration
- Refresh token support
- Role-based access control (RBAC)

### **Authorization**
- Fine-grained permissions system
- Role hierarchy: `super_admin` > `admin` > `manager` > `staff` > `client`
- Route-level protection
- Component-level access control

### **Data Protection**
- CORS configuration
- Request rate limiting (planned)
- SQL injection prevention (Mongoose)
- XSS protection
- CSRF tokens (planned)

---

## 📱 PWA Features

### **Capabilities**
- Installable on desktop/mobile
- Offline functionality
- Service worker caching
- Push notifications
- Background sync
- App updates notification

### **Cache Strategy**
- **API calls:** NetworkFirst (3s timeout)
- **Images:** CacheFirst (30-day expiration)
- **Assets:** Precaching

---

## 🔄 Real-Time Features

### **Socket.IO Integration**
- Authenticated connections
- Room-based messaging
- Order status updates
- Service request notifications
- Typing indicators
- Real-time dashboard updates

### **WebRTC** (Planned)
- Video calls
- Screen sharing
- File transfer

---

## 💳 Payment Integration

### **M-Pesa**
- STK Push
- Callback handling
- Transaction status check
- Webhook verification

### **Other Payments** (Planned)
- Stripe
- PayPal
- Credit card processing

---

## 📊 Analytics & Reporting

### **Dashboard Metrics**
- Total revenue
- Product sales
- Appointment bookings
- Low stock alerts
- Recent activities
- Upcoming appointments

### **Reports**
- Financial reports
- Inventory reports
- Sales analytics
- Customer insights
- Activity logs

### **AI Insights**
- Real-time predictions
- Trend analysis
- Anomaly detection
- Recommendations

---

## 🧪 Testing

### **Test Files**
- `test-file-upload.js` - File upload testing
- `test-notifications.js` - Notification system testing
- `test-registration.js` - User registration testing
- `test-role-system.js` - RBAC testing
- `test-pwa.js` - PWA functionality testing

---

## 🚀 Deployment

### **Frontend**
- Build: `pnpm run build`
- Preview: `pnpm run preview`
- Dev: `pnpm run dev`

### **Backend**
- Production: `pnpm start`
- Development: `pnpm run dev`
- Seed DB: `pnpm run seed`

### **Environment Variables**

#### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:5000
```

#### Backend (`.env`)
```env
PORT=5000
MONGO_URI=mongodb://...
JWT_SECRET=your_secret
CLIENT_URL=http://localhost:5173
NGROK_ENABLED=false
NGROK_URL=
CALLBACK_PATH=/api/mpesa/callback
```

---

## 📚 Documentation Files

- `README.md` - Main documentation
- `THEME_PERSISTENCE_FIX.md` - Theme system details
- `THEME_SYSTEM_RECONFIGURED.md` - Theme reconfiguration
- `PWA_IMPLEMENTATION.md` - PWA setup guide
- `DATABASE_SEEDING_GUIDE.md` - Database seeding
- `ECOMMERCE_ENHANCEMENTS.md` - E-commerce features
- `AI_CHAT_ENHANCED_VISIBILITY.md` - AI chat features
- `WEBSOCKET_WEBRTC_THEMES_IMPLEMENTATION.md` - Real-time features
- Multiple feature documentation files

---

## 🔧 Development Tools

### **Frontend**
- ESLint for code linting
- Prettier (recommended)
- Vite HMR for instant updates
- React DevTools

### **Backend**
- Nodemon for auto-restart
- MongoDB Compass for DB management
- Postman for API testing

---

## 📦 Dependencies Summary

### **Key Frontend Dependencies**
- React 19.1.1
- Vite 7.1.6
- TailwindCSS 4.1.13
- Radix UI components
- Framer Motion 12.23.22
- Socket.IO Client 4.8.1
- Axios 1.12.2
- Recharts 3.2.1

### **Key Backend Dependencies**
- Express 5.1.0
- Mongoose 8.18.2
- Socket.IO 4.8.1
- JWT 9.0.2
- Bcryptjs 3.0.2
- Multer 2.0.2
- Cloudinary 1.41.3
- Nodemailer 7.0.6
- Twilio 5.9.0

---

## 🎯 Key Features Summary

✅ **Inventory Management** - Full CRUD for products, stock tracking, low stock alerts  
✅ **E-Commerce** - Product catalog, shopping cart, order management  
✅ **Appointments** - Calendar view, booking system, reminders  
✅ **Finance Tracking** - Invoices, expenses, financial reports  
✅ **Team Management** - User roles, permissions, collaboration  
✅ **Location Management** - Multi-location support, maps  
✅ **Real-Time Updates** - Socket.IO for live data  
✅ **Theme System** - 15+ themes with full customization  
✅ **PWA Support** - Installable, offline-capable  
✅ **AI Insights** - Predictive analytics, recommendations  
✅ **Reports** - Comprehensive business analytics  
✅ **File Upload** - Multi-file with Cloudinary  
✅ **Notifications** - Real-time, email, SMS  
✅ **M-Pesa Integration** - Mobile money payments  
✅ **Client Portal** - Self-service customer interface  
✅ **Admin Dashboard** - Comprehensive management tools  

---

## 🔜 Planned Features

- [ ] WebRTC video calls
- [ ] Advanced reporting with exports
- [ ] Multi-language support
- [ ] Stripe/PayPal integration
- [ ] Email templates
- [ ] SMS campaigns
- [ ] Advanced AI features
- [ ] Mobile app (React Native)
- [ ] API rate limiting
- [ ] Two-factor authentication
- [ ] Audit logs
- [ ] Advanced search filters
- [ ] Bulk operations
- [ ] Import/Export data

---

## 📝 Code Quality

### **Best Practices**
- Component modularity
- Context-based state management
- Custom hooks for reusability
- Error boundaries for error handling
- Type safety (planned: TypeScript migration)
- API layer abstraction
- Environment-based configuration

### **Performance**
- Code splitting with React.lazy
- Image optimization
- API caching
- Service worker caching
- Debounced API calls
- Memory monitoring

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

---

## 📄 License

MIT License

---

**Last Updated:** October 15, 2025  
**Version:** 1.0.0  
**Maintained by:** OmniBiz Development Team
