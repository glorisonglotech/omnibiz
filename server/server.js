const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const http = require('http');
const connectDB = require('./config/db');
const { initializeSocket } = require('./config/socket');
const { emailService } = require('./config/email');
const authRoutes = require('./routes/authRoutes');
const teamRouter = require('./routes/teamRoutes');
const productRouter = require('./routes/productRoutes');
const orderRouter = require('./routes/orderRoutes');
const invoiceRouter = require('./routes/invoiceRoutes');
const expenseRouter = require('./routes/expenseRoutes');
const appointmentRouter = require('./routes/appointmentRoutes');
const financialRouter = require('./routes/financialRoutes');
const userRouter = require('./routes/userRoutes');
const paymentRouter = require('./routes/paymentRoutes');
const locationRouter = require('./routes/locationRoutes');

dotenv.config();

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ UNCAUGHT EXCEPTION - Server may crash!');
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  console.error('Time:', new Date().toISOString());
  // Log memory usage
  const memUsage = process.memoryUsage();
  console.error('Memory usage:', {
    rss: Math.round(memUsage.rss / 1024 / 1024) + 'MB',
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB',
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB'
  });
  // Don't exit immediately, log the error and continue
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ UNHANDLED PROMISE REJECTION - Server may crash!');
  console.error('Reason:', reason);
  console.error('Promise:', promise);
  console.error('Time:', new Date().toISOString());
  // Don't exit immediately, log the error and continue
});

// Handle process warnings
process.on('warning', (warning) => {
  console.warn('⚠️  Process Warning:', warning.name, warning.message);
});

// Monitor process exit
process.on('exit', (code) => {
  console.log('🔴 Process exiting with code:', code);
});

// Monitor SIGTERM
process.on('SIGTERM', () => {
  console.log('🔴 SIGTERM received, shutting down gracefully');
});

// Monitor SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  console.log('🔴 SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Connect to database
connectDB();

// Initialize email service
emailService.init();

const app = express();
const server = http.createServer(app);

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Add JSON parsing middleware
app.use(express.json({ limit: '10mb' }));

app.use(cors());

app.get('/', (req, res) => {
  res.json({ message: 'OmniBiz Pro API Server is running!' });
});

app.use('/api/auth', authRoutes);
app.use('/api/team', teamRouter);
app.use('/api/products', productRouter);
app.use('/api/orders', orderRouter);
app.use('/api/invoices', invoiceRouter);
app.use('/api/expenses', expenseRouter);
app.use('/api/appointments', appointmentRouter);
app.use('/api', financialRouter);
app.use('/api/user', userRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/locations', locationRouter);

// Role-based routes
const adminRoutes = require('./routes/adminRoutes');
const clientRoutes = require('./routes/clientRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const activityRoutes = require('./routes/activityRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
app.use('/api/admin', adminRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Handle 404 routes (must be after all other routes)
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Global error handler middleware (must be last)
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  console.error('Stack:', err.stack);

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(isDevelopment && { stack: err.stack })
  });
});

const port = process.env.PORT || 5000;

// Memory monitoring
setInterval(() => {
  const memUsage = process.memoryUsage();
  const memInfo = {
    rss: Math.round(memUsage.rss / 1024 / 1024) + 'MB',
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB',
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
    external: Math.round(memUsage.external / 1024 / 1024) + 'MB'
  };

  // Log memory usage every 5 minutes
  console.log(`📊 Memory usage: RSS: ${memInfo.rss}, Heap: ${memInfo.heapUsed}/${memInfo.heapTotal}, External: ${memInfo.external}`);

  // Warn if memory usage is high
  if (memUsage.heapUsed > 500 * 1024 * 1024) { // 500MB
    console.warn('⚠️  High memory usage detected:', memInfo);
  }
}, 5 * 60 * 1000); // Every 5 minutes

// Initialize Socket.IO
const io = initializeSocket(server);

server.listen(port, () => {
    console.log(`🚀 OmniBiz Pro Server running on port ${port}`);
    console.log(`📱 API available at http://localhost:${port}`);
    console.log(`🔌 Socket.IO enabled for real-time notifications`);

    // Log initial memory usage
    const memUsage = process.memoryUsage();
    console.log(`📊 Initial memory usage: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`);
});