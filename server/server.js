const express = require('express');
const { spawn } = require('child_process'); // ✅ safer than exec for streaming Ngrok output
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
const mpesaRoutes = require('./routes/mpesaRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const discountRoutes = require('./routes/discountRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');

dotenv.config();
connectDB();
emailService.init();

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 5000;
const CALLBACK_PATH = process.env.CALLBACK_PATH || '/api/mpesa/callback';

// Default CALLBACK_URL setup
if (!process.env.CALLBACK_URL) {
  const host = process.env.HOST || `http://localhost:${port}`;
  process.env.CALLBACK_URL = `${host}${CALLBACK_PATH}`;
}

// Middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});
app.use(express.json({ limit: '10mb' }));
app.use(cors());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'OmniBiz Pro API Server is running!' });
});
app.use('/api/auth', authRoutes);
app.use('/api/mpesa', mpesaRoutes);
app.use('/api/team', teamRouter);
app.use('/api/products', productRouter);
app.use('/api/inventory', productRouter); // Alias for products
app.use('/api/orders', orderRouter);
app.use('/api/invoices', invoiceRouter);
app.use('/api/expenses', expenseRouter);
app.use('/api/appointments', appointmentRouter);
app.use('/api', financialRouter);
app.use('/api/user', userRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/locations', locationRouter);
app.use('/api/services', serviceRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/client', require('./routes/clientRoutes'));
app.use('/api/customer', require('./routes/customerRoutes')); // Customer storefront routes
app.use('/api/support', require('./routes/supportRoutes'));
app.use('/api/sessions', require('./routes/liveSessionRoutes')); // Live sessions/webinars
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/security', require('./routes/securityRoutes')); // AI Security Monitoring
app.use('/api/public', require('./routes/publicRoutes'));
app.use('/api/wallet', require('./routes/walletRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/activities', require('./routes/activityRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/subscriptions', require('./routes/subscriptionRoutes'));
app.use('/api/search', require('./routes/searchRoutes'));
app.use('/api/customers/auth', require('./routes/customerAuthRoutes'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 404 and error handling
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  const isDevelopment = process.env.NODE_ENV === 'development';
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(isDevelopment && { stack: err.stack })
  });
});

// Memory monitoring
setInterval(() => {
  const mem = process.memoryUsage();
  const usage = {
    rss: Math.round(mem.rss / 1024 / 1024) + 'MB',
    heapTotal: Math.round(mem.heapTotal / 1024 / 1024) + 'MB',
    heapUsed: Math.round(mem.heapUsed / 1024 / 1024) + 'MB',
    external: Math.round(mem.external / 1024 / 1024) + 'MB'
  };
  console.log(`Memory usage: RSS: ${usage.rss}, Heap: ${usage.heapUsed}/${usage.heapTotal}, External: ${usage.external}`);
  if (mem.heapUsed > 500 * 1024 * 1024) {
    console.warn('High memory usage detected:', usage);
  }
}, 5 * 60 * 1000);

// Socket.IO
initializeSocket(server);

// Ngrok + Server Startup
const startServer = async () => {
  if (process.env.NODE_ENV !== 'production' && process.env.NGROK_ENABLED === 'true') {
    try {
      console.log('Attempting to initialize Ngrok tunnel...');

      const ngrokProcess = spawn('ngrok', ['http', port]);

      ngrokProcess.stdout.on('data', (data) => {
        const output = data.toString();
        const match = output.match(/https:\/\/[a-z0-9\-]+\.ngrok\.io/);
        if (match) {
          const ngrokUrl = match[0];
          const publicCallbackUrl = `${ngrokUrl}${CALLBACK_PATH}`;
          process.env.CALLBACK_URL = publicCallbackUrl;

          console.log('----------------------------------------------------');
          console.log(`Ngrok tunnel established at: ${ngrokUrl}`);
          console.log(`M-PESA CALLBACK URL: ${publicCallbackUrl}`);
          console.log('----------------------------------------------------');
        }
      });

      ngrokProcess.stderr.on('data', (err) => {
        console.warn('Ngrok stderr:', err.toString());
      });

      ngrokProcess.on('exit', (code) => {
        if (!process.env.CALLBACK_URL.startsWith('https://')) {
          console.warn(`Ngrok exited with code ${code}. No valid tunnel detected.`);
          if (process.env.NGROK_URL) {
            const fallbackUrl = `${process.env.NGROK_URL}${CALLBACK_PATH}`;
            process.env.CALLBACK_URL = fallbackUrl;
            console.log('----------------------------------------------------');
            console.log(`Using fallback Ngrok URL from .env: ${fallbackUrl}`);
            console.log('----------------------------------------------------');
          } else {
            console.warn('No fallback NGROK_URL set. CALLBACK_URL may be invalid for M-Pesa.');
          }
        }
      });

    } catch (error) {
      console.error('Ngrok startup error:', error.message);
    }
  }

  server.listen(port, () => {
    console.log(`OmniBiz Pro Server running on port ${port}`);
    console.log(`API available at http://localhost:${port}`);
    console.log(`Socket.IO enabled for real-time notifications`);
    const mem = process.memoryUsage();
    console.log(`Initial memory usage: ${Math.round(mem.heapUsed / 1024 / 1024)}MB`);
  });
};

startServer();
