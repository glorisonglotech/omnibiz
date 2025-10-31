# 🤖 OmniBiz AI System - Quick Start Guide

## Overview
OmniBiz now features a **dual AI provider system** with automatic fallback for maximum reliability:
- **Primary**: Google Gemini AI
- **Fallback**: DeepSeek AI

## 🚀 Quick Setup (5 Minutes)

### Step 1: Get API Keys

#### Option A: Google Gemini (Recommended)
1. Visit: https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key

#### Option B: DeepSeek (Cost-Effective)
1. Visit: https://platform.deepseek.com/
2. Sign up and navigate to API Keys
3. Create and copy the key

#### Option C: Both (Maximum Uptime) ⭐ Recommended
Get both keys for automatic fallback!

### Step 2: Configure Environment

Edit `server/.env`:

```env
# Primary Provider (Gemini)
GEMINI_API_KEY=your_gemini_key_here

# Fallback Provider (DeepSeek)
DEEPSEEK_API_KEY=your_deepseek_key_here

# AI Settings
AI_MAX_TOKENS=2048
AI_TEMPERATURE=0.7
```

### Step 3: Test the Setup

```bash
cd server
node test-ai-service.js
```

You should see:
```
✅ AI Service is initialized
   Current Provider: gemini
   Gemini Available: ✅
   DeepSeek Available: ✅
```

### Step 4: Start the Server

```bash
npm run dev
```

### Step 5: Test the API

```bash
# Check AI status
curl http://localhost:5000/api/ai/status

# Test chat
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello AI!"}'
```

## ✅ Configuration Options

### Option 1: Both Providers (Recommended)
```env
GEMINI_API_KEY=your_gemini_key
DEEPSEEK_API_KEY=your_deepseek_key
```
**Result**: Gemini primary, DeepSeek fallback = 99.9% uptime

### Option 2: Gemini Only
```env
GEMINI_API_KEY=your_gemini_key
```
**Result**: Standard operation, no fallback

### Option 3: DeepSeek Only
```env
DEEPSEEK_API_KEY=your_deepseek_key
```
**Result**: Cost-effective, no fallback

## 📡 API Endpoints

### Check AI Status
```http
GET /api/ai/status
```

### Chat with AI
```http
POST /api/ai/chat
Content-Type: application/json

{
  "message": "How are my sales?",
  "dashboardType": "admin"
}
```

### Generate Business Insights
```http
GET /api/ai/insights
Authorization: Bearer <token>
```

### Analyze Sentiment
```http
POST /api/ai/sentiment
Content-Type: application/json

{
  "text": "This is amazing!"
}
```

### Generate Marketing Copy
```http
POST /api/ai/marketing
Content-Type: application/json

{
  "product": {
    "name": "Coffee",
    "price": 15.99
  }
}
```

## 🔄 How Fallback Works

```
User Request → Try Gemini
                  ↓
              Success? → Return Response
                  ↓
              Failed? → Try DeepSeek
                  ↓
              Success? → Return Response
                  ↓
              Failed? → Return Error
```

## 🧪 Testing

### Run Test Suite
```bash
node test-ai-service.js
```

### Manual Testing
```bash
# Test Gemini
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello from Gemini"}'

# Check which provider was used
# Response includes: "provider": "gemini" or "deepseek"
```

### Simulate Fallback
1. Remove `GEMINI_API_KEY` from `.env`
2. Restart server
3. Send chat request
4. Should use DeepSeek automatically

## 📊 Monitoring

### Check Current Provider
```javascript
const status = await fetch('/api/ai/status');
const data = await status.json();
console.log('Current Provider:', data.currentProvider);
```

### Response Includes Provider Info
```json
{
  "response": "AI response...",
  "model": "gemini-pro",
  "provider": "gemini",
  "timestamp": "2025-01-30T..."
}
```

## 🔍 Troubleshooting

### Issue: "No AI service configured"
**Solution**: Add at least one API key to `.env`

### Issue: "Both AI services failed"
**Causes**:
- Invalid API keys
- Rate limits exceeded
- Network issues

**Solution**: 
1. Verify API keys are correct
2. Check API service status
3. Wait if rate limited

### Issue: Slow responses
**Cause**: Using DeepSeek fallback (slightly slower)
**Solution**: Ensure Gemini API key is valid

## 💡 Best Practices

1. **Configure Both Providers** for maximum uptime
2. **Monitor Provider Usage** via `/api/ai/status`
3. **Handle Provider Info** in frontend
4. **Set Appropriate Timeouts** (DeepSeek may be slower)
5. **Keep API Keys Secure** (never commit to git)

## 📚 Documentation

- Full Documentation: `documenttion/AI_DEEPSEEK_FALLBACK_SETUP.md`
- Test Script: `test-ai-service.js`
- Service Code: `services/aiService.js`
- Controller: `controllers/aiController.js`

## 🎉 Benefits

✅ **99.9% Uptime** - Automatic fallback  
✅ **Cost Optimization** - Use cheaper provider when needed  
✅ **Flexibility** - Choose provider based on needs  
✅ **Transparency** - Know which provider handled request  
✅ **Zero Downtime** - Seamless provider switching  

## 🆘 Support

If you encounter issues:
1. Check `.env` configuration
2. Run `node test-ai-service.js`
3. Check server logs
4. Verify API keys are valid
5. Check API service status pages

## 📝 Quick Reference

```bash
# Install dependencies
npm install

# Configure .env
cp .env.example .env
# Edit .env and add API keys

# Test AI service
node test-ai-service.js

# Start server
npm run dev

# Check AI status
curl http://localhost:5000/api/ai/status
```

---

**Last Updated**: January 30, 2025  
**Version**: 2.0.0  
**Status**: Production Ready ✅

