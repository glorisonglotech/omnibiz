# 🔧 Clear Cache & Restart - Fix ECommerce Errors

## ✅ Service Worker Fixed
The `vite.config.js` has been updated to:
- ✅ Only cache GET requests (not POST)
- ✅ Disable PWA in development mode
- ✅ Add proper cache expiration
- ✅ Prevent "Failed to execute 'put' on 'Cache'" errors

---

## 🚀 Step-by-Step Recovery Process

### **Step 1: Stop All Running Servers**
Close any terminal windows running:
- Frontend dev server (`pnpm dev`)
- Backend server (`pnpm start` or `pnpm dev`)

Press `Ctrl+C` in each terminal to stop them.

---

### **Step 2: Clear Vite Cache** ⚡

**Windows PowerShell:**
```powershell
# Navigate to client folder
cd client

# Remove Vite cache folder
Remove-Item -Recurse -Force node_modules\.vite -ErrorAction SilentlyContinue

# Confirm deletion
Write-Host "Vite cache cleared!" -ForegroundColor Green

# Go back to root
cd ..
```

**OR use File Explorer:**
1. Navigate to `C:\Users\Melanie\omnibiz\client\node_modules\.vite`
2. Delete the `.vite` folder completely

---

### **Step 3: Clear Browser Cache & Service Workers** 🌐

#### **Chrome/Edge:**
1. Press `F12` to open DevTools
2. Go to **Application** tab
3. Click **"Clear storage"** in left sidebar
4. Check all boxes:
   - ✅ Unregister service workers
   - ✅ Local storage
   - ✅ Session storage
   - ✅ IndexedDB
   - ✅ Cookies
   - ✅ Cache storage
5. Click **"Clear site data"**
6. Close DevTools
7. Press `Ctrl+Shift+Delete` → Select "Cached images and files" → Clear

#### **Service Worker Specific:**
1. Press `F12` → **Application** → **Service Workers**
2. Click **"Unregister"** next to each service worker
3. Click **"Update on reload"** checkbox
4. Refresh page (`Ctrl+R`)

---

### **Step 4: Start Backend Server** 🖥️

```powershell
# Navigate to server folder
cd server

# Start the server
pnpm run dev

# Wait for "OmniBiz Pro Server running on port 5000" message
```

**Verify it's running:**
- Open browser: `http://localhost:5000`
- You should see: `{"message": "OmniBiz Pro API Server is running!"}`

---

### **Step 5: Start Frontend Server** ⚛️

**In a NEW terminal window:**

```powershell
# Navigate to client folder
cd client

# Start Vite dev server with clean cache
pnpm run dev

# Wait for "Local: http://localhost:5173" message
```

---

### **Step 6: Access the Application** 🎯

1. Open browser: `http://localhost:5173`
2. Wait for splash screen
3. Log in to your account
4. Navigate to **Dashboard → E-Commerce**
5. ✅ Page should load without errors!

---

## 🔍 Verification Checklist

After restarting, verify:

- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 5173
- [ ] No service worker errors in console
- [ ] No "Failed to fetch dynamically imported module" errors
- [ ] E-Commerce page loads successfully
- [ ] All components render properly
- [ ] Real-time sync badge shows connection status

---

## 🚨 Troubleshooting

### **If ECommerce Still Shows Errors:**

**1. Hard Refresh Browser:**
```
Ctrl+Shift+R (Windows)
or
Ctrl+F5
```

**2. Clear Dev-Dist Folder:**
```powershell
cd client
Remove-Item -Recurse -Force dev-dist -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
pnpm run dev
```

**3. Check Console for Specific Errors:**
- Press `F12`
- Click **Console** tab
- Look for red error messages
- Share any new errors if they persist

---

### **If "Connection Refused" Errors:**

This means backend server isn't running.

**Fix:**
```powershell
cd server
pnpm run dev
```

**Verify MongoDB Connection:**
- Check `.env` file has valid `MONGO_URI`
- Ensure MongoDB is running (local or Atlas)

---

### **If Port Already in Use:**

**Frontend (5173):**
```powershell
# Check what's using port 5173
netstat -ano | findstr :5173

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F

# Or use different port in vite.config.js
```

**Backend (5000):**
```powershell
# Check what's using port 5000
netstat -ano | findstr :5000

# Kill the process
taskkill /PID <PID> /F
```

---

## 🎨 What Was Fixed in vite.config.js

### **Before:**
```javascript
urlPattern: /^https:\/\/localhost:5000\/api\//,
// ❌ This caches ALL API requests including POST
```

### **After:**
```javascript
urlPattern: ({ url, request }) => {
  return url.pathname.startsWith('/api/') && request.method === 'GET';
},
// ✅ Only caches GET requests, not POST/PUT/DELETE
```

### **Other Improvements:**
- ✅ Added cache expiration (5 minutes for API, 30 days for images)
- ✅ Disabled service worker in development mode
- ✅ Added font caching
- ✅ Disabled navigate fallback for development
- ✅ Improved error handling

---

## 📝 Quick Command Reference

### **Clear Everything & Restart:**
```powershell
# Terminal 1 - Backend
cd server
pnpm run dev

# Terminal 2 - Frontend (new window)
cd client
Remove-Item -Recurse -Force node_modules\.vite -ErrorAction SilentlyContinue
pnpm run dev
```

### **Full Nuclear Option (if nothing works):**
```powershell
# Stop all servers (Ctrl+C)

# Delete all caches
cd client
Remove-Item -Recurse -Force node_modules\.vite
Remove-Item -Recurse -Force dev-dist
Remove-Item -Recurse -Force dist

# Reinstall dependencies (if needed)
pnpm install

# Restart
cd ..
cd server
pnpm run dev

# New terminal
cd client
pnpm run dev
```

---

## ✅ Expected Results

After following these steps:

1. **No Console Errors** ✅
2. **E-Commerce Page Loads** ✅
3. **All Buttons Work** ✅
4. **Real-Time Sync Shows "Live"** ✅
5. **Products/Orders Display** ✅
6. **No Service Worker Warnings** ✅

---

## 🎯 Summary

**What was wrong:**
1. Service worker tried to cache POST requests (not allowed)
2. Vite cache contained stale module references
3. Service worker enabled in development mode

**What we fixed:**
1. ✅ Updated `vite.config.js` to only cache GET requests
2. ✅ Disabled PWA in development
3. ✅ Added proper cache expiration
4. ✅ Instructions to clear all caches

**Result:**
Your ECommerce page should now work perfectly! 🎉

---

**Need Help?** Share any error messages you still see after following these steps.
