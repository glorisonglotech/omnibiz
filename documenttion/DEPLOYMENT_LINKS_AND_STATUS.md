# OmniBiz Deployment Links & Auto-Deploy Status

**Last Updated**: 2025-10-31  
**Repository**: https://github.com/glorisonglotech/omnibiz

---

## 🌐 Live Deployment URLs

### **Frontend (Netlify)**
- **URL**: https://ominbiz-business-solution.netlify.app
- **Platform**: Netlify
- **Status**: ✅ Auto-deploy enabled (when connected)
- **Build Command**: `pnpm install && pnpm run build`
- **Publish Directory**: `client/dist`

### **Backend (Render)**
- **URL**: https://omnibiz.onrender.com
- **Platform**: Render
- **Status**: ✅ Auto-deploy enabled (when connected)
- **Build Command**: `npm install && cd server && npm install`
- **Start Command**: `cd server && node server.js`

---

## 🔄 Auto-Deployment Status

### **Netlify (Frontend)**

**Configuration File**: `client/netlify.toml` ✅ Created

**Auto-Deploy Setup**:
1. ✅ Configuration file exists
2. ⏳ **Needs**: Connect GitHub repository to Netlify
3. ⏳ **Needs**: Set environment variables in Netlify dashboard

**How to Enable Auto-Deploy**:
1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub: `glorisonglotech/omnibiz`
4. Configure build settings:
   - **Base directory**: `client`
   - **Build command**: `pnpm install && pnpm run build`
   - **Publish directory**: `client/dist`
5. Add environment variables:
   ```
   VITE_API_URL=https://omnibiz.onrender.com
   VITE_SOCKET_URL=https://omnibiz.onrender.com
   ```
6. Deploy!

**Once Connected**:
- ✅ Every push to `main` branch triggers automatic deployment
- ✅ Build logs available in Netlify dashboard
- ✅ Preview deployments for pull requests
- ✅ Automatic HTTPS with SSL certificate

---

### **Render (Backend)**

**Configuration File**: `render.yaml` ✅ Exists

**Auto-Deploy Setup**:
1. ✅ Configuration file exists
2. ⏳ **Needs**: Connect GitHub repository to Render
3. ⏳ **Needs**: Set environment variables in Render dashboard

**How to Enable Auto-Deploy**:
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect to GitHub: `glorisonglotech/omnibiz`
4. Configure:
   - **Name**: omnibiz-backend
   - **Environment**: Node
   - **Region**: Oregon (US West) or closest to users
   - **Branch**: main
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Add environment variables (see below)
6. Create Web Service

**Once Connected**:
- ✅ Every push to `main` branch triggers automatic deployment
- ✅ Build logs available in Render dashboard
- ✅ Automatic HTTPS with SSL certificate
- ✅ Health checks and auto-restart

---

## 🔐 Required Environment Variables

### **Netlify Environment Variables**
```bash
VITE_API_URL=https://omnibiz.onrender.com
VITE_SOCKET_URL=https://omnibiz.onrender.com
```

### **Render Environment Variables**
```bash
# Node Environment
NODE_ENV=production
PORT=5000
NODE_VERSION=22.16.0

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/omnibiz?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_super_secret_jwt_key_here

# Frontend URLs
CLIENT_URL=https://ominbiz-business-solution.netlify.app
FRONTEND_URL=https://ominbiz-business-solution.netlify.app
HOST=https://omnibiz.onrender.com

# AI Services
GEMINI_API_KEY=AIzaSyDPY3IpJr2zcCayi8GAaQcIsUlu18m77Fk
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Twilio (optional - for SMS)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_phone_number
```

---

## 📋 Deployment Checklist

### **Pre-Deployment**
- [x] Build passes locally (`pnpm run build` in client)
- [x] Server syntax check passes
- [x] All changes committed to git
- [x] All changes pushed to main branch
- [x] `netlify.toml` configuration created
- [x] `render.yaml` configuration exists

### **Netlify Setup**
- [ ] Connect GitHub repository to Netlify
- [ ] Configure build settings
- [ ] Add environment variables
- [ ] Trigger first deployment
- [ ] Verify site is live
- [ ] Test auto-deployment (push a change)

### **Render Setup**
- [ ] Connect GitHub repository to Render
- [ ] Configure web service settings
- [ ] Add all environment variables
- [ ] Trigger first deployment
- [ ] Verify API is live
- [ ] Test auto-deployment (push a change)

### **Post-Deployment**
- [ ] Test frontend can connect to backend
- [ ] Test database connection
- [ ] Test authentication flow
- [ ] Test real-time features (Socket.IO)
- [ ] Test file uploads
- [ ] Test AI chat functionality
- [ ] Monitor logs for errors

---

## 🚀 Quick Deploy Commands

### **Manual Deployment (if needed)**

**Netlify CLI**:
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy from client directory
cd client
netlify deploy --prod
```

**Render**:
- Render doesn't have CLI deployment
- Use dashboard or auto-deploy from GitHub

---

## 🔍 Verify Deployment

### **Check Frontend**:
```bash
curl -I https://ominbiz-business-solution.netlify.app
# Should return 200 OK
```

### **Check Backend**:
```bash
curl https://omnibiz.onrender.com/api/health
# Should return health status
```

### **Check CORS**:
```bash
curl -H "Origin: https://ominbiz-business-solution.netlify.app" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://omnibiz.onrender.com/api/products
# Should return CORS headers
```

---

## 📊 Deployment Status Summary

| Service | Platform | URL | Auto-Deploy | Status |
|---------|----------|-----|-------------|--------|
| Frontend | Netlify | https://ominbiz-business-solution.netlify.app | ⏳ Needs Setup | Config Ready |
| Backend | Render | https://omnibiz.onrender.com | ⏳ Needs Setup | Config Ready |

**Next Steps**:
1. Connect GitHub repository to Netlify
2. Connect GitHub repository to Render
3. Add environment variables to both platforms
4. Trigger initial deployments
5. Test and verify

**Once Connected**:
- ✅ Every `git push origin main` will automatically deploy to both platforms
- ✅ Build logs available in respective dashboards
- ✅ Rollback capability if deployment fails
- ✅ Preview deployments for testing

---

## 🆘 Troubleshooting

### **Netlify Build Fails**
- Check build logs in Netlify dashboard
- Verify `pnpm` is available (Netlify supports it)
- Check environment variables are set
- Verify `client/dist` directory is created

### **Render Build Fails**
- Check build logs in Render dashboard
- Verify MongoDB connection string is correct
- Check all required environment variables are set
- Verify Node version matches (22.16.0)

### **CORS Errors**
- Verify `CLIENT_URL` and `FRONTEND_URL` are set in Render
- Check `server/server.js` CORS configuration
- Ensure Netlify URL matches exactly (no trailing slash)

### **Socket.IO Not Connecting**
- Verify `VITE_SOCKET_URL` is set in Netlify
- Check WebSocket support is enabled in Render
- Test with Socket.IO client debugger

---

## 📞 Support

**Documentation**: See `documenttion/SERVER_CONFIGURATION.md` for detailed setup  
**Repository**: https://github.com/glorisonglotech/omnibiz  
**Issues**: Create an issue in the GitHub repository

---

**Status**: Configuration files ready, awaiting platform connection for auto-deployment ✅

