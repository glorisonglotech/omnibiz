# 🤖 AI System Complete Setup & Documentation

## Overview
The OmniBiz AI system uses **Google Gemini AI** to provide intelligent assistance to both:
- **System Users** (Admin/Business Owners) - Business analytics, insights, inventory management
- **Clients/Customers** - Shopping assistance, product recommendations, order tracking
- **Guests** - Browsing assistance, general inquiries

---

## ✅ System Components

### Backend (Server)
1. **`/server/services/geminiAI.js`** - Gemini AI integration service
2. **`/server/controllers/aiController.js`** - AI request handlers
3. **`/server/routes/aiRoutes.js`** - AI API endpoints
4. **`/server/middlewares/authMiddleware.js`** - Authentication (supports admin, customer, guest)

### Frontend (Client)
1. **`/client/src/services/aiInsightsService.js`** - Client-side AI insights manager
2. **`/client/src/hooks/useRealTimeAI.js`** - React hook for AI insights
3. **`/client/src/components/storefront/LiveChatWidget.jsx`** - AI chat widget
4. **`/client/src/pages/dashboard/AIInsights.jsx`** - AI insights dashboard

---

## 🔧 Configuration

### Required Environment Variables

Add to `/server/.env`:

```env
# Google Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MAX_TOKENS=2048
GEMINI_TEMPERATURE=0.7

# JWT Secret (for authentication)
JWT_SECRET=your_jwt_secret_here

# Environment
NODE_ENV=development
```

### Getting Your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and add it to your `.env` file

---

## 🚀 API Endpoints

### 1. Chat with AI (Public - Supports All Users)
```
POST /api/ai/chat
```

**Headers:**
```json
{
  "Authorization": "Bearer <token>" // Optional - works for admin, customer, or no token
}
```

**Request Body:**
```json
{
  "message": "How can I increase my sales?",
  "context": {
    "currentPage": "dashboard",
    "dashboardType": "admin" // or "storefront"
  },
  "history": [
    { "role": "user", "content": "Previous message" },
    { "role": "assistant", "content": "Previous response" }
  ],
  "systemPrompt": "Optional custom prompt",
  "dashboardType": "admin" // or "storefront" or "client"
}
```

**Response:**
```json
{
  "response": "AI generated response...",
  "model": "gemini-pro",
  "dashboardType": "admin",
  "timestamp": "2025-01-21T..."
}
```

### 2. Generate Business Insights (Admin Only)
```
GET /api/ai/insights
```

**Headers:**
```json
{
  "Authorization": "Bearer <admin_token>"
}
```

**Response:**
```json
{
  "metrics": {
    "totalOrders": 150,
    "totalRevenue": "45000.00",
    "totalProducts": 75,
    "avgOrderValue": "300.00",
    "topProduct": "Premium Hair Shampoo",
    "salesTrend": "Increasing"
  },
  "insights": [
    {
      "type": "positive",
      "title": "Strong Sales Growth",
      "description": "Your revenue increased by 25% this month"
    }
  ],
  "recommendations": [
    {
      "priority": "high",
      "action": "Stock popular items",
      "impact": "Prevent stockouts and lost sales"
    }
  ]
}
```

### 3. Sentiment Analysis
```
POST /api/ai/sentiment
```

### 4. Marketing Copy Generation
```
POST /api/ai/marketing
```

### 5. Support Response Generation (Admin Only)
```
POST /api/ai/support-response
```

---

## 👥 User Types & Authentication

### 1. **Admin Users** (Business Owners/Managers)
- **Token**: Standard admin JWT token
- **Access**: Full AI capabilities including business insights
- **Dashboard**: Admin dashboard with analytics focus

### 2. **Customers** (Registered Customers)
- **Token**: Customer JWT token
- **Access**: Shopping assistant, order tracking, recommendations
- **Dashboard**: Storefront with personalized shopping experience

### 3. **Guests** (Unauthenticated Visitors)
- **Token**: None required
- **Access**: Basic shopping assistance, product browsing
- **Dashboard**: Storefront with general assistance

---

## 🎯 How It Works

### For Admin Users:
```javascript
// Client-side usage
import api from '@/lib/api';

const response = await api.post('/ai/chat', {
  message: "Show me today's sales summary",
  dashboardType: "admin"
}, {
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
});
```

### For Customers:
```javascript
const response = await api.post('/ai/chat', {
  message: "What products do you recommend for curly hair?",
  dashboardType: "storefront"
}, {
  headers: {
    Authorization: `Bearer ${localStorage.getItem('customerToken')}`
  }
});
```

### For Guests:
```javascript
const response = await api.post('/ai/chat', {
  message: "Do you offer delivery?",
  dashboardType: "storefront"
});
// No authorization header needed!
```

---

## 🔐 Authentication Flow

### optionalAuth Middleware:
```javascript
// Supports all three user types
exports.optionalAuth = async (req, res, next) => {
  // 1. Check for token
  // 2. Try Admin User model
  // 3. Try Customer model if not admin
  // 4. Continue as guest if no valid user
  // Sets: req.user, req.customer, req.isGuest
};
```

---

## 📊 Real-Time AI Insights (Admin Dashboard)

### Using the React Hook:
```javascript
import { useRealTimeAI } from '@/hooks/useRealTimeAI';

function Dashboard() {
  const {
    insights,
    isActive,
    loading,
    startAI,
    stopAI,
    toggleAI,
    generateInsights,
    totalInsights,
    criticalInsights
  } = useRealTimeAI({
    autoStart: true,
    updateInterval: 30000, // 30 seconds
    showNotifications: true
  });

  return (
    <div>
      <Button onClick={toggleAI}>
        {isActive ? 'Stop AI' : 'Start AI'}
      </Button>
      <div>
        {insights.map(insight => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </div>
    </div>
  );
}
```

---

## 🛠️ Troubleshooting

### AI Responses Return Fallback
**Problem**: "AI assistant is currently unavailable..."

**Solutions**:
1. Check `GEMINI_API_KEY` in `.env`
2. Verify API key is valid at [Google AI Studio](https://makersuite.google.com/)
3. Check server logs for initialization errors
4. Ensure Gemini API quota hasn't been exceeded

### Chat Not Working for Customers
**Problem**: 401 Unauthorized for customer chat

**Solutions**:
1. Ensure customer token is stored in `localStorage.getItem('customerToken')`
2. Verify `optionalAuth` middleware is used (not `protect`)
3. Check customer authentication endpoint is working

### Insights Not Generating
**Problem**: Empty insights array

**Solutions**:
1. Ensure business has orders, products, transactions
2. Check admin token is valid
3. Verify `/api/ai/insights` endpoint access
4. Check browser console and server logs

---

## ✨ Features

### Admin Dashboard AI:
- ✅ Business performance analysis
- ✅ Sales trend predictions
- ✅ Inventory optimization suggestions
- ✅ Revenue insights
- ✅ Customer analytics
- ✅ Team performance metrics
- ✅ Real-time alerts

### Customer/Guest AI:
- ✅ Product recommendations
- ✅ Shopping assistance
- ✅ Order tracking (customers only)
- ✅ Appointment booking help
- ✅ Product information
- ✅ Store policies
- ✅ Customer support

---

## 🔄 Recent Fixes Applied

1. ✅ **Created** `aiInsightsService.js` - Client-side AI service manager
2. ✅ **Updated** `optionalAuth` middleware - Now supports admin, customer, and guest users
3. ✅ **Enhanced** AI controller - Better context for all user types
4. ✅ **Improved** System prompts - Tailored for admin vs storefront
5. ✅ **Fixed** Customer authentication - Customers can now use AI chat
6. ✅ **Added** Guest support - No authentication required for basic AI help

---

## 📝 Testing Checklist

### Admin Users:
- [ ] Can chat with AI using admin token
- [ ] Receives business-focused responses
- [ ] Can generate insights from `/api/ai/insights`
- [ ] Real-time insights update automatically
- [ ] Context includes business metrics

### Customers:
- [ ] Can chat with AI using customer token
- [ ] Receives shopping-focused responses
- [ ] AI knows customer status
- [ ] Can ask about orders
- [ ] Gets personalized recommendations

### Guests:
- [ ] Can chat without any token
- [ ] Receives helpful responses
- [ ] AI encourages account creation
- [ ] Can browse products
- [ ] Gets general store information

---

## 🎨 UI Components

### LiveChatWidget (Storefront & Admin)
- Located in both dashboards
- Auto-detects dashboard type
- Provides context-aware suggestions
- Stores conversation history
- Supports voice input (future)

### AIInsights Page (Admin Only)
- Real-time insights display
- Comprehensive graphs
- Actionable recommendations
- Performance metrics

---

## 🔮 Future Enhancements

- [ ] Voice input/output
- [ ] Multi-language support
- [ ] Image analysis (Gemini Vision)
- [ ] Predictive analytics
- [ ] A/B testing recommendations
- [ ] Automated marketing campaigns
- [ ] Customer behavior prediction

---

## 📞 Support

If you encounter issues:
1. Check this documentation
2. Review server logs (`console.log` statements)
3. Verify `.env` configuration
4. Test with Postman/curl
5. Check browser console for client-side errors

---

**Last Updated**: January 2025
**Version**: 2.0
**Status**: ✅ Fully Operational
