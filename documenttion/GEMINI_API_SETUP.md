# Google Gemini AI API Setup - Quick Guide

## 🚀 5-Minute Setup

### Step 1: Get Your Free API Key

1. **Visit Google AI Studio**:
   - Go to: https://makersuite.google.com/app/apikey
   - Or: https://aistudio.google.com/app/apikey

2. **Sign In**:
   - Use your Google account
   - Accept terms if prompted

3. **Create API Key**:
   - Click **"Create API Key"** button
   - Select **"Create API key in new project"**
   - Copy the generated key (looks like: `AIzaSyD...`)

### Step 2: Add to Your Project

1. **Open Server Environment File**:
   ```
   omnibiz/server/.env
   ```

2. **Add This Line**:
   ```env
   GEMINI_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
   
   Replace with your actual key!

3. **Save the File**

### Step 3: Restart Server

```bash
cd server
npm start
```

You should see:
```
✅ Gemini AI service initialized
Server running on port 5000
```

### Step 4: Test It!

1. Open the application
2. Click the chat widget (bottom right)
3. Type: "Hello!"
4. AI should respond with a personalized greeting

---

## ✅ Verification Checklist

- [ ] API key obtained from Google AI Studio
- [ ] Key added to `server/.env` file
- [ ] Server restarted
- [ ] See "Gemini AI service initialized" in console
- [ ] Chat widget opens and responds

---

## 🆓 Free Tier Limits

**Google Gemini Free API**:
- ✅ 60 requests per minute
- ✅ 1,500 requests per day
- ✅ No credit card required
- ✅ Perfect for testing and small apps

**Upgrade for More**:
- Paid tier available for higher limits
- Visit: https://ai.google.dev/pricing

---

## 🔒 Security Best Practices

### ✅ DO:
- Store key in `.env` file
- Add `.env` to `.gitignore`
- Keep key secret
- Use environment variables

### ❌ DON'T:
- Commit key to GitHub
- Share key publicly
- Hardcode in frontend
- Expose in client-side code

---

## 🐛 Troubleshooting

### "AI service not configured"

**Cause**: API key not set or invalid

**Fix**:
1. Check `server/.env` has `GEMINI_API_KEY=...`
2. Verify key is correct (copy-paste from Google)
3. Restart server
4. Check for typos in key

### "API quota exceeded"

**Cause**: Free tier limit reached

**Fix**:
1. Wait for quota reset (resets daily)
2. Reduce request frequency
3. Consider paid tier
4. Use fallback responses (automatic)

### "Failed to initialize Gemini AI"

**Cause**: Network issue or invalid key

**Fix**:
1. Check internet connection
2. Verify API key is active
3. Check Google AI Studio for key status
4. Try creating a new API key

---

## 📝 Example `.env` File

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/omnibiz

# JWT
JWT_SECRET=your-secret-key-here

# Google Gemini AI
GEMINI_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Email (Optional)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Cloudinary (Optional)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Other Services
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
```

---

## 🔗 Useful Links

- **Get API Key**: https://makersuite.google.com/app/apikey
- **Gemini Docs**: https://ai.google.dev/docs
- **Pricing**: https://ai.google.dev/pricing
- **API Reference**: https://ai.google.dev/api/rest

---

## 📊 What the AI Can Do

With Gemini API configured, your chat assistant can:

### Admin Dashboard:
- Analyze sales trends and patterns
- Provide inventory recommendations
- Generate business insights
- Answer data-driven questions
- Predict revenue trends
- Suggest optimizations

### Customer Storefront:
- Recommend products
- Answer product questions
- Help track orders
- Assist with booking
- Provide shopping guidance
- Handle customer queries

---

## 🎯 Next Steps

After setup:

1. **Test Different Queries**:
   - "Show me today's sales"
   - "What products need restocking?"
   - "Analyze my business performance"

2. **Customize AI Personality**:
   - Click Settings in chat
   - Choose: Professional, Friendly, or Technical

3. **Enable Training**:
   - AI learns from conversations
   - Improves responses over time
   - Toggle in Settings panel

4. **Try Voice Input**:
   - Click microphone button
   - Speak your question
   - AI transcribes and responds

---

## ⚡ Quick Command Reference

```bash
# Install dependencies
cd server && npm install

# Add API key to .env
echo "GEMINI_API_KEY=your-key-here" >> .env

# Start server
npm start

# Check if AI is initialized
# Look for: "✅ Gemini AI service initialized"
```

---

## 🎉 You're All Set!

Your OmniBiz AI Assistant is now powered by Google Gemini!

Try asking:
- "Hello!"
- "What can you help me with?"
- "Show me business insights"
- "Help me find products"

**Enjoy your intelligent AI assistant!** 🤖✨

---

**Last Updated**: October 17, 2025  
**API Version**: Gemini Pro (gemini-pro model)
