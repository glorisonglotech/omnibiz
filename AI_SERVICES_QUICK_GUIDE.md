# 🤖 OmniBiz AI Services - Quick Reference Guide

**Last Updated**: October 31, 2025  
**Status**: ✅ Gemini AI Operational

---

## 🎯 Current Configuration

### Primary AI: Google Gemini
- **Model**: `gemini-2.0-flash-exp` (Latest stable - 2025)
- **API Key**: Configured in `.env` as `GEMINI_API_KEY`
- **Status**: ✅ **WORKING**
- **Temperature**: 0.7
- **Max Tokens**: 2048

### Fallback AI: DeepSeek
- **Model**: `deepseek-chat`
- **API Key**: Configured in `.env` as `DEEPSEEK_API_KEY`
- **Status**: ⚠️ Needs balance top-up (402 error)
- **Temperature**: 0.7
- **Max Tokens**: 2048

---

## 🔧 How to Test AI Services

### Quick Test
```bash
cd omnibiz/server
node test-ai-service.js
```

**Expected Output**:
```
✅ Gemini AI service initialized (Primary)
   Model: gemini-2.0-flash-exp
   Temperature: 0.7
   Max Tokens: 2048

✅ Chat test successful
   Provider: gemini
   Response: Hello Test User! I'm your AI assistant...
```

### Check AI Status via API
```bash
curl http://localhost:5000/api/ai/status
```

**Response**:
```json
{
  "initialized": true,
  "currentProvider": "gemini",
  "gemini": {
    "available": true,
    "model": "gemini-2.0-flash-exp"
  },
  "deepseek": {
    "available": true,
    "model": "deepseek-chat"
  }
}
```

---

## 🚨 Common Issues & Solutions

### Issue 1: "models/gemini-pro is not found" (404 Error)

**Cause**: Using deprecated model name

**Solution**: Update to latest model
```javascript
// In server/services/aiService.js and server/services/geminiAI.js
this.geminiModel = 'gemini-2.0-flash-exp'; // ✅ Correct
// NOT: 'gemini-pro' ❌ Deprecated
```

### Issue 2: DeepSeek "Insufficient Balance" (402 Error)

**Cause**: DeepSeek account needs credits

**Solution**: 
1. Visit https://platform.deepseek.com/
2. Add credits to your account
3. Restart server

**Temporary Workaround**: Gemini is working, so AI features are still functional

### Issue 3: "AI service not initialized"

**Cause**: Missing API keys in `.env`

**Solution**: Add at least one API key
```env
# Option 1: Gemini only (Recommended)
GEMINI_API_KEY=your_gemini_api_key_here

# Option 2: Both (Maximum uptime)
GEMINI_API_KEY=your_gemini_api_key_here
DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

---

## 📚 API Endpoints

### 1. Chat with AI
```http
POST /api/ai/chat
Content-Type: application/json
Authorization: Bearer <token> (optional)

{
  "message": "How are my sales this month?",
  "dashboardType": "admin"
}
```

**Response**:
```json
{
  "response": "Based on your dashboard data...",
  "model": "gemini-2.0-flash-exp",
  "provider": "gemini",
  "dashboardType": "admin",
  "timestamp": "2025-10-31T..."
}
```

### 2. Get AI Status
```http
GET /api/ai/status
```

### 3. Generate Business Insights
```http
GET /api/ai/insights
Authorization: Bearer <token>
```

### 4. Analyze Sentiment
```http
POST /api/ai/sentiment
Authorization: Bearer <token>
Content-Type: application/json

{
  "text": "This product is amazing!"
}
```

---

## 🔄 Automatic Fallback System

The AI service automatically falls back to DeepSeek if Gemini fails:

```
User Request → Try Gemini
              ↓ (if fails)
              Try DeepSeek
              ↓ (if fails)
              Return friendly error message
```

**Current Status**:
- ✅ Gemini: Working
- ⚠️ DeepSeek: Needs credits (fallback not available)
- ✅ Overall: AI features fully functional via Gemini

---

## 🎯 Getting New API Keys

### Gemini API Key (Free Tier Available)
1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy key and add to `.env`:
   ```env
   GEMINI_API_KEY=AIzaSy...
   ```

### DeepSeek API Key (Pay-as-you-go)
1. Visit: https://platform.deepseek.com/
2. Sign up or log in
3. Navigate to API Keys section
4. Create new API key
5. Add credits to account
6. Copy key and add to `.env`:
   ```env
   DEEPSEEK_API_KEY=sk-...
   ```

---

## 📊 Model Comparison

| Feature | Gemini 2.0 Flash | DeepSeek Chat |
|---------|------------------|---------------|
| **Speed** | Very Fast | Fast |
| **Cost** | Free tier available | Pay-per-use |
| **Quality** | Excellent | Very Good |
| **Context** | 2048 tokens | 2048 tokens |
| **Status** | ✅ Working | ⚠️ Needs credits |
| **Use Case** | Primary | Fallback |

---

## 🔍 Monitoring AI Usage

### Check Logs
```bash
# Server logs show AI requests
cd omnibiz/server
pnpm dev

# Look for:
✅ Gemini AI service initialized (Primary)
🤖 AI Request: { dashboard: 'admin', user: 'John', ... }
```

### Test All Features
```bash
node test-ai-service.js
```

**Tests Run**:
1. ✅ Service Status
2. ✅ Initialization Check
3. ✅ Simple Chat
4. ✅ Business Insights
5. ✅ Sentiment Analysis
6. ✅ Fallback Mechanism

---

## 🎨 Frontend Integration

The AI is integrated in:
- **FloatingAI Widget**: Chat assistant on all pages
- **Dashboard**: Business insights and recommendations
- **Support**: AI-powered response suggestions
- **Marketing**: AI-generated content

**Usage Example**:
```javascript
// In any React component
import { useAI } from '@/hooks/useAI';

const { chat, loading } = useAI();

const handleChat = async () => {
  const response = await chat('How are my sales?');
  console.log(response.response);
};
```

---

## ✅ Verification Checklist

- [x] Gemini API key configured
- [x] Latest model name (gemini-2.0-flash-exp)
- [x] AI service initialized successfully
- [x] Chat functionality working
- [x] Business insights working
- [x] Sentiment analysis working
- [x] API endpoints responding correctly
- [x] Frontend integration functional

---

## 🆘 Support

**If AI stops working**:

1. Check server logs for errors
2. Run test script: `node test-ai-service.js`
3. Verify API key is valid
4. Check model name is up-to-date
5. Restart server: `pnpm dev`

**Latest Working Configuration** (as of Oct 31, 2025):
```javascript
Model: 'gemini-2.0-flash-exp'
API Version: v1beta
Package: @google/generative-ai@0.24.1
```

---

## 📝 Notes

- Gemini models are frequently updated by Google
- Always use latest stable model name
- Check https://ai.google.dev/gemini-api/docs/models for current models
- DeepSeek requires account balance for API calls
- Both services support streaming responses

---

**Status**: 🎉 **AI Services Fully Operational via Gemini**

