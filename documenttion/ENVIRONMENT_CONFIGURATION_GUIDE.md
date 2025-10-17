# Environment Configuration Guide

**Version**: 2.0.0  
**Last Updated**: October 17, 2025  
**Status**: ✅ Complete Environment-Based Configuration

---

## 🎯 Overview

Your OmniBiz application now uses **environment variables** to configure behavior in development vs production, including AI features, payment processing, stock management, and more.

---

## 📋 Environment Variables Summary

### Current .env Configuration

```env
# =============================================
# Core Configuration
# =============================================
MONGO_URI=mongodb://localhost:27017/omnibiz
JWT_SECRET=your_jwt_secret_key_here_change_this_in_production
PORT=5000
NODE_ENV=development   # ← Controls feature behavior

# =============================================
# Email Configuration
# =============================================
# SendGrid (Production recommended)
SENDGRID_API_KEY=your_sendgrid_api_key_here

# Nodemailer/SMTP (Alternative)
EMAIL_FROM=OmniBiz <noreply@omnibiz.com>
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false

# =============================================
# SMS Configuration (Twilio)
# =============================================
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=your_twilio_phone_number_here

# =============================================
# Payment Providers
# =============================================
# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here

# M-Pesa (Safaricom)
SAFARICOM_CONSUMER_KEY=
SAFARICOM_CONSUMER_SECRET=
SAFARICOM_PASSKEY=
BUSINESS_SHORT_CODE=
SAFARICOM_BASE_URL=

# PayPal
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_ENVIRONMENT=sandbox   # or 'production'

# =============================================
# Google Gemini AI Configuration
# =============================================
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-pro
GEMINI_MAX_TOKENS=2048
GEMINI_TEMPERATURE=0.7
GEMINI_VISION_MODEL=gemini-pro-vision

# =============================================
# Development Tools
# =============================================
NGROK_URL=https://omnibiz.loca.lt
NGROK_ENABLED=false
CALLBACK_PATH=
```

---

## 🔧 What NODE_ENV Controls

### Development Mode (`NODE_ENV=development`)

#### 1. **Console Logging**
- ✅ **Detailed logs** with emojis for better visibility
- ✅ **Stock update logs** showing before/after values
- ✅ **AI initialization details** (model, temperature, tokens)
- ✅ **Payment processing details**
- ✅ **Error stack traces** in API responses

```javascript
// Example development logs:
📦 Stock Updated: Premium Shampoo | 50 → 45 | Status: In Stock
✅ Gemini AI service initialized
   Model: gemini-pro
   Temperature: 0.7
   Max Tokens: 2048
📢 Stock Alert [low_stock]: Product A - Stock: 4
```

#### 2. **Email Service**
- Uses **Ethereal test accounts** for email testing
- **Preview URLs** logged to console
- No actual emails sent

#### 3. **Error Handling**
- Full **stack traces** returned in API errors
- Detailed **validation error messages**
- **Socket.IO errors** logged to console

#### 4. **Ngrok Integration**
- Can enable ngrok tunneling for M-Pesa callbacks
- Useful for testing webhooks locally

---

### Production Mode (`NODE_ENV=production`)

#### 1. **Console Logging**
- ✅ **Minimal logs** for performance
- ❌ No emoji logs
- ❌ No detailed debugging info
- Only **critical errors** logged

```javascript
// Example production logs:
✅ Gemini AI service initialized
Order saved successfully: 507f1f77bcf86cd799439011
```

#### 2. **Email Service**
- Uses **SMTP credentials** (Gmail, SendGrid, etc.)
- **Actual emails sent** to users
- Falls back to Ethereal if SMTP not configured (with warning)

#### 3. **Error Handling**
- **No stack traces** in API responses (security)
- Generic error messages
- Errors logged server-side only

#### 4. **Security**
- Enforces **HTTPS** for webhooks
- Stricter **CORS policies**
- **Rate limiting** enforced

---

## 🤖 AI Features (Gemini AI)

### Configuration

```env
GEMINI_API_KEY=AIzaSy...    # Required
GEMINI_MODEL=gemini-pro     # Default model
GEMINI_TEMPERATURE=0.7      # Creativity (0.0-1.0)
GEMINI_MAX_TOKENS=2048      # Max response length
```

### How It Works

```javascript
// Automatic configuration based on .env
class GeminiAIService {
  constructor() {
    this.model_name = process.env.GEMINI_MODEL || 'gemini-pro';
    this.temperature = parseFloat(process.env.GEMINI_TEMPERATURE) || 0.7;
    this.maxTokens = parseInt(process.env.GEMINI_MAX_TOKENS) || 2048;
    
    // Development: Shows config
    if (process.env.NODE_ENV === 'development') {
      console.log('Model:', this.model_name);
      console.log('Temperature:', this.temperature);
    }
  }
}
```

### Usage

**LiveChatWidget**: Automatically uses these settings  
**AI Insights**: Configured per environment  
**Auto-responses**: Temperature affects creativity  

---

## 💳 Payment Configuration

### Stripe

```env
STRIPE_SECRET_KEY=sk_test_...     # Test mode
STRIPE_PUBLISHABLE_KEY=pk_test_...

# For production:
# STRIPE_SECRET_KEY=sk_live_...
# STRIPE_PUBLISHABLE_KEY=pk_live_...
```

**Usage**: Credit card payments in checkout

### PayPal

```env
PAYPAL_ENVIRONMENT=sandbox   # Development
# PAYPAL_ENVIRONMENT=production   # Production

PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
```

**Usage**: PayPal checkout option

### M-Pesa (Kenya)

```env
SAFARICOM_CONSUMER_KEY=your_key
SAFARICOM_CONSUMER_SECRET=your_secret
SAFARICOM_PASSKEY=your_passkey
BUSINESS_SHORT_CODE=174379
SAFARICOM_BASE_URL=https://sandbox.safaricom.co.ke
# Production: https://api.safaricom.co.ke
```

**Usage**: Mobile money payments (Kenya)

---

## 📧 Email Configuration

### Priority Order

1. **Production**: Uses SMTP if `NODE_ENV=production` AND credentials exist
2. **Development with credentials**: Uses Gmail/SMTP
3. **Development without credentials**: Uses Ethereal (test)

### SMTP (Recommended for Production)

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password   # Gmail: Use App Password, not regular password
```

### SendGrid (Alternative)

```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
```

### Behavior by Environment

| Environment | Credentials | Behavior |
|-------------|-------------|----------|
| Development | None | Ethereal test (logs preview URL) |
| Development | SMTP | Sends via Gmail/SMTP |
| Production | SMTP | Sends via SMTP |
| Production | None | ⚠️ Falls back to Ethereal with warning |

---

## 📦 Stock Management

### Environment-Aware Logging

```javascript
// Development
if (process.env.NODE_ENV === 'development') {
  console.log('📦 Stock Updated: Product | 50 → 45 | Status: In Stock');
  console.log('✅ Inventory updated: 3 products affected');
  console.log('⚠️  Stock alerts: low_stock: Product A');
}

// Production
// No console logs (performance)
```

### Automatic Features (All Environments)

- ✅ Stock deducted when order is "Paid"
- ✅ Status auto-updated (In Stock/Low/Out)
- ✅ Socket.IO alerts sent
- ✅ Real-time sync to frontend

---

## 🚀 Quick Setup Guide

### For Development

1. **Copy environment file**:
```bash
cp server/.env.example server/.env
```

2. **Set required variables**:
```env
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/omnibiz
JWT_SECRET=dev_secret_change_in_production
GEMINI_API_KEY=your_gemini_key_here
```

3. **Optional: Configure email (for testing)**:
```env
EMAIL_USER=your_test_email@gmail.com
EMAIL_PASS=your_app_password
```

4. **Start server**:
```bash
cd server
npm start
```

**Expected Output**:
```
✅ Gemini AI service initialized
   Model: gemini-pro
   Temperature: 0.7
   Max Tokens: 2048
📧 Email: using Gmail (development)
🔗 MongoDB connected
🚀 Server running on port 5000
```

---

### For Production

1. **Update .env**:
```env
NODE_ENV=production
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/omnibiz
JWT_SECRET=very_long_random_secret_here_minimum_32_characters

# Use production API keys
GEMINI_API_KEY=your_production_key
STRIPE_SECRET_KEY=sk_live_...
PAYPAL_ENVIRONMENT=production

# Configure email
SMTP_HOST=smtp.gmail.com
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your_production_app_password
```

2. **Security checks**:
- ✅ Change JWT_SECRET to strong random string
- ✅ Use production database
- ✅ Use live payment API keys
- ✅ Configure production email
- ✅ Enable HTTPS
- ✅ Set up proper CORS

3. **Deploy**:
```bash
npm run build   # If applicable
npm start
```

**Expected Output** (minimal):
```
✅ Gemini AI service initialized
🔗 MongoDB connected
🚀 Server running on port 5000
```

---

## 🔍 Feature Checklist by Environment

### Development Features
- [x] Detailed console logging
- [x] Email preview URLs
- [x] Full error stack traces
- [x] Ngrok support
- [x] Test payment modes
- [x] Socket.IO debug logs
- [x] AI config display

### Production Features
- [x] Minimal logging (performance)
- [x] Actual email sending
- [x] Secure error messages
- [x] Live payment processing
- [x] Production database
- [x] Rate limiting
- [x] HTTPS enforcement

---

## 📊 Configuration Matrix

| Feature | Variable | Dev Default | Prod Behavior |
|---------|----------|-------------|---------------|
| **Logging** | NODE_ENV | Detailed | Minimal |
| **AI Model** | GEMINI_MODEL | gemini-pro | gemini-pro |
| **AI Temp** | GEMINI_TEMPERATURE | 0.7 | 0.7 |
| **Email** | SMTP_* | Ethereal | SMTP/SendGrid |
| **Payments** | *_ENVIRONMENT | sandbox/test | production/live |
| **Errors** | NODE_ENV | Stack trace | Message only |
| **Stock Logs** | NODE_ENV | Emoji logs | Silent |

---

## 🐛 Troubleshooting

### AI Not Working

**Check**:
```bash
# In server console, should see:
✅ Gemini AI service initialized
```

**Fix**:
1. Verify `GEMINI_API_KEY` is set in `.env`
2. Key is valid (test at https://makersuite.google.com)
3. Restart server after adding key

### Emails Not Sending

**Development**:
```bash
# Look for:
📧 Email: using Ethereal test account
📧 Preview URL: https://ethereal.email/message/xxx
```

**Production**:
```bash
# Should see:
📧 Email: using SMTP (production)
```

**Fix**:
1. Check `SMTP_*` variables are set
2. Gmail: Use App Password, not regular password
3. Test SMTP connection

### Stock Not Updating

**Check console** (development):
```bash
# Should see:
📦 Stock Updated: Product Name | 50 → 45
✅ Inventory updated: 1 products affected
```

**Fix**:
1. Order status must be "Paid"
2. Items must have valid `productId`
3. Check server logs for errors

### Payment Errors

**Check**:
1. API keys for correct environment (test/live)
2. `*_ENVIRONMENT` variables set correctly
3. Ngrok running (for M-Pesa in development)

---

## ✅ Verification Steps

### 1. Check Environment Loaded
```bash
# In server console at startup:
NODE_ENV: development
PORT: 5000
```

### 2. Test AI
```bash
# Visit chat widget
# Send message
# Should get AI response

# Check console:
✅ Gemini AI service initialized
```

### 3. Test Stock Update
```bash
# Create order with status "Paid"
# Check console:
📦 Stock Updated: Product | 10 → 5
```

### 4. Test Email (Development)
```bash
# Trigger email (e.g., order confirmation)
# Check console for preview URL:
📧 Preview URL: https://ethereal.email/message/xxx
```

---

## 🎯 Best Practices

### 1. **Never Commit .env Files**
```bash
# Ensure .env is in .gitignore
echo ".env" >> .gitignore
```

### 2. **Use Different Keys per Environment**
```env
# Development
STRIPE_SECRET_KEY=sk_test_...

# Production
STRIPE_SECRET_KEY=sk_live_...
```

### 3. **Rotate Secrets Regularly**
- JWT_SECRET
- API Keys
- Database passwords

### 4. **Monitor Logs**
```bash
# Development: Check console for errors
# Production: Use logging service (e.g., Loggly, Papertrail)
```

### 5. **Test Before Deploying**
```bash
# Test with NODE_ENV=production locally first
NODE_ENV=production npm start
```

---

## 📚 Summary

### What's Configured

✅ **NODE_ENV** controls logging, errors, email behavior  
✅ **Gemini AI** uses environment variables for model config  
✅ **Stock Management** auto-updates with environment-aware logs  
✅ **Payments** support test/production modes  
✅ **Email** switches between test/production automatically  
✅ **Security** enhanced in production mode  

### Files Modified

- `server/controllers/productController.js` - Auto-status updates
- `server/controllers/inventoryController.js` - Stock management
- `server/controllers/orderController.js` - Auto stock deduction
- `server/services/geminiAI.js` - Environment-based AI config
- `server/config/email.js` - Environment-aware email
- `server/server.js` - Global error handling

### Documentation Created

- `INVENTORY_STOCK_MANAGEMENT.md` - Complete stock system guide
- `ENVIRONMENT_CONFIGURATION_GUIDE.md` - This file
- `LIVECHAT_AI_ENHANCEMENT.md` - AI chat features
- `CLIENT_STOREFRONT_ENHANCEMENTS.md` - Storefront features

---

**Your application is now fully configured for both development and production!** 🚀

**Next Steps**:
1. Add your actual API keys to `.env`
2. Test in development mode
3. Configure production environment
4. Deploy!

