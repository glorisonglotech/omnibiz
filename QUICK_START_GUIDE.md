# OmniBiz Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- MongoDB running locally or connection string
- Gmail account for email service
- Twilio account for SMS (optional)
- Google Gemini API key

---

## 📦 Installation

### 1. Clone and Install
```bash
cd /home/glorison/projects/omnibiz

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Environment Setup

**Copy the example environment file:**
```bash
cp .env.example server/.env
```

**Edit `server/.env` with your credentials:**
```bash
# Required
MONGO_URI=mongodb://localhost:27017/omnibiz
JWT_SECRET=your_secret_key_change_this
GEMINI_API_KEY=your_gemini_api_key

# Email (Required for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# SMS (Optional)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
```

### 3. Seed Database (Optional)
```bash
cd server
node seeders/seedFAQs.js
```

---

## 🏃 Running the Application

### Start Backend Server
```bash
cd server
npm run dev
```
Server runs on: http://localhost:5000

### Start Frontend (in new terminal)
```bash
cd client
npm run dev
```
Client runs on: http://localhost:5173

---

## 🔑 Getting API Keys

### Google Gemini API Key
1. Go to: https://makersuite.google.com/app/apikey
2. Create new API key
3. Copy and paste into `GEMINI_API_KEY`

### Gmail App Password
1. Enable 2FA on your Gmail account
2. Go to: https://myaccount.google.com/apppasswords
3. Generate app password for "Mail"
4. Use this as `SMTP_PASS`

### Twilio (Optional - for SMS)
1. Sign up: https://www.twilio.com/try-twilio
2. Get Account SID and Auth Token
3. Get a Twilio phone number
4. Add credentials to `.env`

---

## ✅ New Features Added

### 1. Help & Support System
- **Navigate to**: Dashboard → Help & Support
- **Features**:
  - Create support tickets
  - Live chat with admins
  - Browse 15+ FAQs
  - View support agents

### 2. AI Assistant (FloatingAI)
- **Location**: Bottom-right floating button
- **Features**:
  - Chat with AI about your business
  - Get sales insights
  - Product recommendations
  - Quick actions

### 3. AI Insights Dashboard
- **Navigate to**: Dashboard → AI Insights
- **Features**:
  - Real-time business insights
  - Sales trend analysis
  - Automatic recommendations
  - Live updates via Socket.IO

### 4. Inventory Tracking
- **Navigate to**: Dashboard → Products → Inventory
- **Features**:
  - Real-time stock levels
  - Order synchronization
  - Low stock alerts
  - Top selling products
  - Revenue per product

### 5. Client Storefront Appointments
- **Navigate to**: Client Storefront → Book Appointment
- **Features**:
  - 4-step booking process
  - Service selection
  - Date/time picker
  - Email + SMS confirmations

---

## 🧪 Testing the Features

### Test Support System
1. Go to Help & Support
2. Click "Create New Ticket"
3. Fill in subject and description
4. Submit ticket
5. Add messages to ticket
6. Check FAQs section

### Test AI Assistant
1. Click floating AI button (bottom-right)
2. Try quick actions or type a question
3. Ask: "What are my top products?"
4. Check for AI response

### Test Inventory Tracking
1. Go to Products
2. Create a new product with stock quantity
3. Go to Orders
4. Create an order with that product
5. Go back to Products
6. Notice stock has decreased
7. Check for low stock alert if applicable

### Test Client Appointment Booking
1. Get your invite code from Settings
2. Open: `http://localhost:5173/storefront/{inviteCode}`
3. Click "Book Appointment"
4. Complete 4-step booking process
5. Check email for confirmation
6. Check Dashboard → Appointments for new booking

---

## 🔍 API Endpoints Quick Reference

### Support
```
GET    /api/support/tickets
POST   /api/support/tickets
POST   /api/support/tickets/:id/messages
GET    /api/support/faqs
GET    /api/support/agents
```

### AI
```
POST   /api/ai/chat
GET    /api/ai/insights
POST   /api/ai/sentiment
POST   /api/ai/marketing
```

### Inventory
```
GET    /api/products/inventory/summary
GET    /api/products/inventory/movements
POST   /api/products/inventory/restock
```

---

## 🐛 Troubleshooting

### AI Not Working?
- Check if `GEMINI_API_KEY` is set
- Verify API key is valid
- Check server console for errors

### Notifications Not Sending?
- Verify email credentials
- For Gmail, use App Password (not regular password)
- Check Twilio balance for SMS

### Database Connection Issues?
- Ensure MongoDB is running
- Check connection string in `.env`
- Try: `mongosh` to test connection

### Port Already in Use?
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or change port in .env
PORT=5001
```

---

## 📚 Documentation

- **Full Implementation Guide**: `documenttion/SUPPORT_AI_INVENTORY_SYSTEM.md`
- **Previous Updates**: `documenttion/COMPREHENSIVE_FIXES_OCT17.md`
- **Appointments Real-Time**: `documenttion/APPOINTMENTS_REALTIME_SYNC.md`
- **Codebase Index**: `CODEBASE_INDEX.md`

---

## 🎯 Key Features Summary

| Feature | Status | Location |
|---------|--------|----------|
| Support Tickets | ✅ | Help & Support |
| FAQs | ✅ | Help & Support |
| AI Chat Assistant | ✅ | Floating button |
| AI Business Insights | ✅ | AI Insights page |
| Inventory Tracking | ✅ | Products section |
| Order-Stock Sync | ✅ | Automatic |
| Client Appointments | ✅ | Storefront |
| Email Notifications | ✅ | All features |
| SMS Notifications | ✅ | Optional |
| Real-Time Updates | ✅ | Socket.IO |
| WebRTC Video Calls | ✅ | VideoCall component |
| Payment Gateways | ✅ | M-Pesa, PayPal |
| PWA Support | ✅ | Auto-install |

---

## 🔒 Security Notes

- Change `JWT_SECRET` in production
- Use strong passwords for email
- Keep API keys secret (never commit `.env`)
- Enable 2FA on all accounts
- Use HTTPS in production

---

## 🚀 Production Deployment

### Environment Variables to Set
- `MONGO_URI` → Production MongoDB URL
- `CLIENT_URL` → https://yourdomain.com
- `JWT_SECRET` → Strong random string
- `GEMINI_API_KEY` → Production key
- Email and SMS credentials

### Build Commands
```bash
# Build client
cd client
npm run build

# Start server in production
cd server
NODE_ENV=production npm start
```

---

## 💡 Tips

1. **Test in order**: Support → AI → Inventory → Appointments
2. **Check console logs** for real-time Socket.IO events
3. **Use browser DevTools** to see network requests
4. **Review documentation** for detailed API specs
5. **Seed FAQs** before testing support system

---

## 📞 Need Help?

- Check server console for errors
- Check browser console for frontend errors
- Review documentation in `documenttion/` folder
- Check `.env.example` for required variables

---

**Happy coding! 🎉**
