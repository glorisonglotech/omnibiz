"# omnibiz" 
/omni-biz-manager
│
├── /frontend
│   ├── /public
│   │   ├── index.html
│   │   └── favicon.ico
│   │
│   ├── /src
│   │   ├── /api
│   │   │   ├── authApi.js
│   │   │   ├── userApi.js
│   │   │   ├── productApi.js
│   │   │   ├── inventoryApi.js
│   │   │   ├── appointmentApi.js
│   │   │   ├── invoiceApi.js
│   │   │   └── analyticsApi.js
│   │   │
│   │   ├── /components
│   │   │   ├── /Dashboard
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── DashboardStats.jsx
│   │   │   │   └── DashboardCharts.jsx
│   │   │   │
│   │   │   ├── /Inventory
│   │   │   │   ├── InventoryList.jsx
│   │   │   │   ├── InventoryItem.jsx
│   │   │   │   └── InventoryForm.jsx
│   │   │   │
│   │   │   ├── /ECommerce
│   │   │   │   ├── ProductList.jsx
│   │   │   │   ├── ProductCard.jsx
│   │   │   │   ├── ProductDetails.jsx
│   │   │   │   └── Cart.jsx
│   │   │   │
│   │   │   ├── /Appointments
│   │   │   │   ├── AppointmentList.jsx
│   │   │   │   ├── AppointmentForm.jsx
│   │   │   │   └── CalendarView.jsx
│   │   │   │
│   │   │   ├── /Finance
│   │   │   │   ├── InvoiceList.jsx
│   │   │   │   ├── InvoiceForm.jsx
│   │   │   │   ├── ExpenseList.jsx
│   │   │   │   └── FinanceDashboard.jsx
│   │   │   │
│   │   │   ├── /AI
│   │   │   │   ├── OCRScanner.jsx
│   │   │   │   └── AnalyticsInsights.jsx
│   │   │   │
│   │   │   ├── /UI
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   └── LoadingSpinner.jsx
│   │   │   │
│   │   │   └── /Common
│   │   │       ├── Button.jsx
│   │   │       ├── Modal.jsx
│   │   │       ├── FormInput.jsx
│   │   │       └── Notification.jsx
│   │   │
│   │   ├── /contexts
│   │   │   ├── AuthContext.jsx
│   │   │   ├── InventoryContext.jsx
│   │   │   ├── CartContext.jsx
│   │   │   └── AppointmentContext.jsx
│   │   │
│   │   ├── /hooks
│   │   │   ├── useAuth.js
│   │   │   ├── useFetch.js
│   │   │   └── useForm.js
│   │   │
│   │   ├── /pages
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── InventoryPage.jsx
│   │   │   ├── ECommercePage.jsx
│   │   │   ├── AppointmentPage.jsx
│   │   │   ├── FinancePage.jsx
│   │   │   └── NotFound.jsx
│   │   │
│   │   ├── /routes
│   │   │   └── AppRoutes.jsx
│   │   │
│   │   ├── /styles
│   │   │   ├── _variables.scss
│   │   │   ├── _mixins.scss
│   │   │   └── main.scss
│   │   │
│   │   ├── App.jsx
│   │   ├── index.js
│   │   └── setupTests.js
│   │
│   ├── .env
│   ├── package.json
│   ├── README.md
│   └── webpack.config.js (or other build config)
│
├── /backend
│   ├── /config
│   │   ├── db.js                  # MongoDB connection setup
│   │   └── env.js                 # Environment variables config
│   │
│   ├── /controllers
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── productController.js
│   │   ├── inventoryController.js
│   │   ├── appointmentController.js
│   │   ├── invoiceController.js
│   │   └── analyticsController.js
│   │
│   ├── /middlewares
│   │   ├── authMiddleware.js      # JWT authentication verification
│   │   ├── errorMiddleware.js     # Error handling middleware
│   │   ├── validateMiddleware.js  # Request validation middleware
│   │   └── loggerMiddleware.js    # Request logging middleware
│   │
│   ├── /models
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Inventory.js
│   │   ├── Appointment.js
│   │   ├── Invoice.js
│   │   ├── Order.js
│   │   └── Expense.js
│   │
│   ├── /routes
│   │   ├── authRoutes.js          # /api/auth
│   │   ├── userRoutes.js          # /api/users
│   │   ├── productRoutes.js       # /api/products
│   │   ├── inventoryRoutes.js     # /api/inventory
│   │   ├── appointmentRoutes.js   # /api/appointments
│   │   ├── invoiceRoutes.js       # /api/invoices
│   │   └── analyticsRoutes.js     # /api/analytics
│   │
│   ├── /services
│   │   ├── emailService.js        # Nodemailer integration
│   │   ├── smsService.js          # Twilio integration
│   │   ├── paymentService.js      # Stripe integration
│   │   └── calendarService.js     # Google Calendar API integration
│   │
│   ├── /utils
│   │   ├── generateToken.js       # JWT token generation
│   │   ├── logger.js              # Logger utility
│   │   └── helpers.js             # Misc helper functions
│   │
│   ├── app.js                     # Express app setup and middleware registration
│   ├── server.js                  # Server startup and DB connection
│   ├── .env                      # Environment variables
│   ├── package.json
│   └── README.md
│
├── .gitignore
└── README.md

Explanation
Frontend (/frontend)

    React app structured by feature modules.
    API calls organized in /api.
    Contexts for global state management.
    Pages correspond to routes.
    Styling with SCSS.
    Entry point: index.js and root component App.jsx.

Backend (/backend)

    /config: Configuration files for DB and environment.
    /controllers: Business logic for each resource.
    /middlewares: Express middleware for auth, error handling, validation, logging.
    /models: Mongoose schemas for MongoDB collections.
    /routes: Express route definitions mapped to controllers.
    /services: External service integrations (email, SMS, payments, calendar).
    /utils: Utility functions and helpers.
    app.js: Express app setup, middleware, and route mounting.
    server.js: Starts the server and connects to the database.

