# OmniBiz Server Configuration Guide

## Overview
This guide covers the complete server configuration for OmniBiz, including local development and production deployment on Render with support for Netlify-hosted frontend.

---

## 🌐 Supported Origins

The OmniBiz server is configured to accept requests from the following origins:

### **Development (Local)**
- `http://localhost:5173` - Vite dev server (dashboard)
- `http://localhost:5174` - Vite dev server (storefront)
- `http://localhost:5175` - Alternative dev port

### **Production (Hosted)**
- `https://ominbiz-business-solution.netlify.app` - Netlify-hosted client storefront
- `https://omnibiz.onrender.com` - Render-hosted backend API

### **Dynamic (Environment Variables)**
- `process.env.CLIENT_URL` - Custom client URL
- `process.env.FRONTEND_URL` - Alternative frontend URL

---

## 🔧 Server Configuration

### **1. CORS Configuration**

**Location**: `/server/server.js`

```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'https://ominbiz-business-solution.netlify.app',
  'https://omnibiz.onrender.com',
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || 
        process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400
};

app.use(cors(corsOptions));
```

**Features:**
- ✅ Dynamic origin validation
- ✅ Credentials support (cookies, auth headers)
- ✅ All standard HTTP methods
- ✅ Custom headers allowed
- ✅ 24-hour preflight cache

### **2. Socket.IO Configuration**

**Location**: `/server/config/socket.js`

```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'https://ominbiz-business-solution.netlify.app',
  'https://omnibiz.onrender.com',
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true
});
```

**Features:**
- ✅ Same origins as Express CORS
- ✅ WebSocket + polling fallback
- ✅ EIO3 compatibility
- ✅ Credentials support

---

## 📦 Environment Variables

### **Required Variables**

Create a `.env` file in `/server` directory:

```bash
# Server
NODE_ENV=production
PORT=5000

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/omnibiz

# Security
JWT_SECRET=your_super_secure_jwt_secret_key

# Frontend URLs
CLIENT_URL=https://ominbiz-business-solution.netlify.app
FRONTEND_URL=https://ominbiz-business-solution.netlify.app

# Backend URL
HOST=https://omnibiz.onrender.com
```

### **Optional Variables**

```bash
# M-Pesa
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
MPESA_SHORTCODE=
MPESA_PASSKEY=
MPESA_ENVIRONMENT=production

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASSWORD=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Google AI
GOOGLE_API_KEY=

# Twilio
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

---

## 🚀 Deployment

### **Render Deployment**

#### **1. Repository Setup**
```bash
# Ensure your repository is pushed to GitHub
git add .
git commit -m "Configure server for production"
git push origin main
```

#### **2. Render Configuration**

**Create New Web Service:**
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:

```yaml
Name: omnibiz-backend
Environment: Node
Region: Oregon (US West) or closest to users
Branch: main
Root Directory: server
Build Command: npm install
Start Command: node server.js
```

#### **3. Environment Variables**

Add in Render dashboard under "Environment":

```
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=...
CLIENT_URL=https://ominbiz-business-solution.netlify.app
FRONTEND_URL=https://ominbiz-business-solution.netlify.app
HOST=https://omnibiz.onrender.com
```

Add all other required variables from your `.env` file.

#### **4. Deploy**

Click "Create Web Service" - Render will:
1. Clone your repository
2. Install dependencies
3. Start the server
4. Assign a URL: `https://omnibiz.onrender.com`

---

### **Netlify Frontend Configuration**

#### **Environment Variables**

In Netlify dashboard, add:

```
VITE_API_URL=https://omnibiz.onrender.com
VITE_SOCKET_URL=https://omnibiz.onrender.com
```

#### **Build Settings**

```yaml
Build command: npm run build
Publish directory: dist
```

---

## 🔍 Testing CORS Configuration

### **1. Test Local Development**

```bash
# Start server
cd server
npm run dev

# Expected output:
🌐 Configured CORS Origins:
  ✓ http://localhost:5173
  ✓ http://localhost:5174
  ✓ http://localhost:5175
  ✓ https://ominbiz-business-solution.netlify.app
  ✓ https://omnibiz.onrender.com

🔌 Socket.IO initialized with allowed origins:
  ✓ http://localhost:5173
  ✓ http://localhost:5174
  ✓ http://localhost:5175
  ✓ https://ominbiz-business-solution.netlify.app
  ✓ https://omnibiz.onrender.com

Server running on port 5000
```

### **2. Test CORS with cURL**

```bash
# Test from allowed origin
curl -H "Origin: http://localhost:5173" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://localhost:5000/api/auth/profile \
     -v

# Expected: Status 204, CORS headers present

# Test from blocked origin
curl -H "Origin: http://malicious-site.com" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     http://localhost:5000/api/auth/profile \
     -v

# Expected: Status 500, CORS error
```

### **3. Test Socket.IO Connection**

```javascript
// In browser console
const socket = io('http://localhost:5000', {
  auth: { token: 'your_jwt_token' },
  transports: ['websocket', 'polling']
});

socket.on('connect', () => {
  console.log('✅ Connected:', socket.id);
});

socket.on('connect_error', (err) => {
  console.error('❌ Connection error:', err.message);
});
```

---

## 🛡️ Security Features

### **1. Origin Validation**

```javascript
// Strict origin checking
if (allowedOrigins.indexOf(origin) !== -1) {
  // Allow request
} else {
  // Block request
  console.warn(`CORS blocked origin: ${origin}`);
}
```

### **2. Credentials Support**

```javascript
credentials: true  // Allows cookies and authorization headers
```

### **3. Request Methods**

```javascript
methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
// Only allowed methods can be used
```

### **4. Headers Control**

```javascript
allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
// Only specified headers allowed
```

---

## 🐛 Troubleshooting

### **Issue 1: CORS Error in Production**

**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:**
1. Check Render environment variables include `CLIENT_URL`
2. Verify frontend URL exactly matches (no trailing slash)
3. Check Render logs for blocked origin warnings
4. Ensure credentials: true in frontend fetch/axios config

```javascript
// Frontend: axios config
const api = axios.create({
  baseURL: 'https://omnibiz.onrender.com',
  withCredentials: true
});
```

### **Issue 2: Socket.IO Connection Fails**

**Error:** `WebSocket connection failed`

**Solution:**
1. Check Socket.IO client version matches server
2. Verify origin in connection options
3. Enable polling fallback

```javascript
// Frontend: Socket.IO config
const socket = io('https://omnibiz.onrender.com', {
  transports: ['websocket', 'polling'],
  withCredentials: true
});
```

### **Issue 3: Environment Variable Not Loading**

**Error:** `Cannot read property 'CLIENT_URL' of undefined`

**Solution:**
1. Check `.env` file exists in correct location
2. Verify `dotenv.config()` called before using variables
3. Restart server after adding new variables
4. In Render: Verify variables set in dashboard

### **Issue 4: Localhost Works, Production Doesn't**

**Checklist:**
- [ ] Environment variables set in Render
- [ ] Frontend URL updated to production URL
- [ ] No trailing slashes in URLs
- [ ] HTTPS (not HTTP) for production URLs
- [ ] Database connection string updated
- [ ] JWT_SECRET is set

---

## 📊 Monitoring

### **Server Logs**

```bash
# Check configured origins on startup
🌐 Configured CORS Origins:
  ✓ http://localhost:5173
  ✓ https://ominbiz-business-solution.netlify.app
  ✓ https://omnibiz.onrender.com

🔌 Socket.IO initialized with allowed origins:
  ✓ http://localhost:5173
  ✓ https://ominbiz-business-solution.netlify.app
  ✓ https://omnibiz.onrender.com
```

### **Request Logging**

Every request is logged:
```
2025-10-22T16:30:15.123Z - GET /api/auth/profile
2025-10-22T16:30:16.456Z - POST /api/messages/send
```

### **CORS Block Warning**

```
CORS blocked origin: http://unauthorized-site.com
```

---

## 🔄 Updating Configuration

### **Adding New Origin**

1. **Update `server/server.js`:**
```javascript
const allowedOrigins = [
  // existing origins...
  'https://new-frontend-url.com'  // Add new origin
];
```

2. **Update `server/config/socket.js`:**
```javascript
const allowedOrigins = [
  // existing origins...
  'https://new-frontend-url.com'  // Add new origin
];
```

3. **Restart Server:**
```bash
npm run dev  # Development
# Or redeploy on Render for production
```

### **Environment-Based Origins**

```javascript
// Add to .env
NEW_FRONTEND_URL=https://new-frontend.com

// Add to allowedOrigins array
const allowedOrigins = [
  // ...
  process.env.NEW_FRONTEND_URL
].filter(Boolean);
```

---

## 📋 Deployment Checklist

### **Before Deployment**

- [ ] All environment variables documented in `.env.example`
- [ ] Production URLs added to allowed origins
- [ ] JWT_SECRET is strong and unique
- [ ] Database connection tested
- [ ] All dependencies listed in `package.json`

### **During Deployment**

- [ ] Environment variables set in Render
- [ ] Build completes successfully
- [ ] Server starts without errors
- [ ] Logs show configured origins

### **After Deployment**

- [ ] Test API endpoints from frontend
- [ ] Test Socket.IO connection
- [ ] Verify CORS working
- [ ] Check error logging
- [ ] Monitor performance

---

## 🎯 Best Practices

### **1. Environment Variables**
- Never commit `.env` to repository
- Use strong, unique secrets
- Document all variables in `.env.example`
- Use different secrets for dev/prod

### **2. CORS Configuration**
- List exact origins (avoid wildcards in production)
- Keep allowed origins synchronized (Express + Socket.IO)
- Log blocked origins for monitoring
- Use environment variables for flexibility

### **3. Security**
- Use HTTPS in production (always)
- Enable credentials only when needed
- Validate all incoming requests
- Implement rate limiting
- Keep dependencies updated

### **4. Monitoring**
- Log all requests
- Monitor CORS blocks
- Track Socket.IO connections
- Set up error alerting
- Regular security audits

---

## 📚 Related Documentation

- **CORS Middleware**: [Express CORS](https://expressjs.com/en/resources/middleware/cors.html)
- **Socket.IO**: [Socket.IO Documentation](https://socket.io/docs/v4/)
- **Render**: [Render Deploy Guide](https://render.com/docs)
- **Netlify**: [Netlify Deployment](https://docs.netlify.com/)

---

## 🆘 Support

If you encounter issues:

1. Check server logs in Render dashboard
2. Verify environment variables are set
3. Test CORS with browser DevTools Network tab
4. Review this documentation
5. Check Socket.IO connection status

---

## ✅ Summary

The OmniBiz server is now configured to:

✅ **Listen locally** on `http://localhost:5000`
✅ **Accept requests** from Vite dev servers (`localhost:5173`, `5174`, `5175`)
✅ **Support production** frontend at `https://ominbiz-business-solution.netlify.app`
✅ **Work with hosted** backend at `https://omnibiz.onrender.com`
✅ **Secure CORS** with origin validation
✅ **Socket.IO support** for real-time features
✅ **Environment-based** configuration for flexibility

The configuration is **production-ready** and supports both local development and cloud deployment! 🚀
