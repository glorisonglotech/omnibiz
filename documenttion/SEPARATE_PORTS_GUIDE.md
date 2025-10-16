# Separate Ports Configuration - Dashboard vs Storefront

**Version:** 2.0
**Date:** October 16, 2025
**Purpose:** Run Dashboard and Storefront on different ports for proper testing

---

## Overview

### Port Configuration

| Application | Port | URL | Purpose |
|-------------|------|-----|---------|
| **Backend Server** | 5000 | http://localhost:5000 | API & Database |
| **Dashboard** | 5173 | http://localhost:5173 | Admin/Owner Interface |
| **Storefront** | 5174 | http://localhost:5174/store/:code | Client Shopping Portal |

---

## Why Separate Ports?

### Benefits

1. **Independent Testing**
   - Test admin and client views simultaneously
   - No conflicts between sessions
   - Different user roles on different ports

2. **Real-World Simulation**
   - Mimics production environment
   - Admin manages while clients shop
   - Concurrent user testing

3. **Development Efficiency**
   - Hot reload on both apps
   - No need to switch between views
   - Faster testing workflow

4. **Network Testing**
   - Share storefront link with mobile devices
   - Keep dashboard secure on localhost
   - Test from different devices

---

## Quick Start

### Option 1: Start Both Applications

```powershell
cd client
.\start-both.ps1
```

**This will:**
- ✅ Check backend server
- ✅ Start dashboard on port 5173
- ✅ Start storefront on port 5174
- ✅ Open both in browser

---

### Option 2: Start Individually

**Dashboard Only:**
```bash
cd client
npm run dev:dashboard
```
**Access:** http://localhost:5173

**Storefront Only:**
```bash
cd client
npm run dev:storefront
```
**Access:** http://localhost:5174/store/CODE

**Or use the script:**
```powershell
cd client
.\start-storefront.ps1
```

---

### Option 3: Manual Start

**Dashboard:**
```bash
cd client
vite --port 5173
```

**Storefront:**
```bash
cd client
vite --config vite.config.storefront.js --port 5174
```

---

## Configuration Files

### 1. vite.config.js (Dashboard - Port 5173)

**Default configuration for admin dashboard**

```javascript
server: {
  port: 5173,
  host: 'localhost',
  hmr: {
    port: 5174,
    host: 'localhost'
  }
}
```

**Features:**
- Admin interface
- Dashboard
- Inventory management
- Order management
- Analytics
- Settings

---

### 2. vite.config.storefront.js (Storefront - Port 5174)

**Separate configuration for client storefront**

```javascript
server: {
  port: 5174,
  host: true, // Allow network access
  strictPort: true,
  hmr: {
    port: 5175,
    host: 'localhost'
  }
}
```

**Features:**
- Product browsing
- Shopping cart
- Checkout
- Appointments
- Order history
- Live chat

---

### 3. .env.storefront

**Environment variables for storefront**

```env
VITE_API_URL=http://localhost:5000
VITE_MODE=storefront
VITE_PORT=5174
VITE_ENABLE_GUEST_CHECKOUT=true
VITE_ENABLE_APPOINTMENTS=true
```

---

## NPM Scripts

### Added to package.json

```json
{
  "scripts": {
    "dev": "vite",
    "dev:dashboard": "vite --port 5173",
    "dev:storefront": "vite --config vite.config.storefront.js --port 5174",
    "dev:both": "concurrently \"npm run dev:dashboard\" \"npm run dev:storefront\"",
    "build:storefront": "vite build --config vite.config.storefront.js",
    "preview:storefront": "vite preview --config vite.config.storefront.js"
  }
}
```

---

## Usage Scenarios

### Scenario 1: Admin Managing Store

**Port:** 5173
**URL:** http://localhost:5173

**Actions:**
1. Login as admin
2. Add/edit products
3. Manage inventory
4. View orders
5. Configure settings

---

### Scenario 2: Client Shopping

**Port:** 5174
**URL:** http://localhost:5174/store/TEST2025

**Actions:**
1. Browse products
2. Add to cart
3. Checkout (guest or user)
4. Book appointment
5. View order history

---

### Scenario 3: Simultaneous Testing

**Admin (Port 5173):**
- Add new product
- Update stock
- Process order

**Client (Port 5174):**
- See new product appear
- Place order
- Get confirmation

**Real-time sync testing!**

---

### Scenario 4: Multi-Device Testing

**Desktop (Dashboard):**
```
http://localhost:5173
```

**Mobile (Storefront):**
```
http://YOUR_IP:5174/store/TEST2025
```

**Test:**
- Admin adds product on desktop
- Client sees it on mobile
- Client orders on mobile
- Admin sees order on desktop

---

## Network Access

### Enable Network Access

**Storefront is configured with `host: true`**

This allows access from:
- Other computers on network
- Mobile devices
- Tablets

### Find Your IP Address

**Windows:**
```powershell
ipconfig
# Look for IPv4 Address
```

**Example:** 192.168.1.100

### Access from Mobile

```
http://192.168.1.100:5174/store/TEST2025
```

**Note:** Dashboard remains on localhost for security

---

## Testing Workflow

### Complete Test Flow

**Step 1: Start Everything**
```powershell
cd client
.\start-both.ps1
```

**Step 2: Admin Setup (Port 5173)**
1. Login to dashboard
2. Add test products
3. Generate invite code
4. Configure store settings

**Step 3: Client Testing (Port 5174)**
1. Open storefront with invite code
2. Browse products
3. Add to cart
4. Complete checkout

**Step 4: Verify (Port 5173)**
1. Check order in dashboard
2. Verify stock updated
3. Process order

---

## Build & Deploy

### Development Build

**Dashboard:**
```bash
npm run build
```
**Output:** `dist/`

**Storefront:**
```bash
npm run build:storefront
```
**Output:** `dist-storefront/`

---

### Preview Production Build

**Dashboard:**
```bash
npm run preview
```
**Access:** http://localhost:4173

**Storefront:**
```bash
npm run preview:storefront
```
**Access:** http://localhost:5174

---

## Port Conflict Resolution

### If Port is Already in Use

**Error:**
```
Port 5174 is already in use
```

**Solution 1: Kill Process**
```powershell
# Find process using port
netstat -ano | findstr :5174

# Kill process (replace PID)
taskkill /PID <PID> /F
```

**Solution 2: Use Different Port**
```bash
vite --config vite.config.storefront.js --port 5175
```

**Solution 3: Restart Computer**
```powershell
Restart-Computer
```

---

## Firewall Configuration

### Allow Network Access

**Windows Firewall:**
1. Open Windows Defender Firewall
2. Advanced Settings
3. Inbound Rules → New Rule
4. Port → TCP → 5174
5. Allow the connection
6. Apply to all profiles

**Or run as administrator:**
```powershell
New-NetFirewallRule -DisplayName "Vite Storefront" -Direction Inbound -LocalPort 5174 -Protocol TCP -Action Allow
```

---

## Environment Variables

### Dashboard (.env)

```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_id
VITE_GITHUB_CLIENT_ID=your_github_id
VITE_ENABLE_PWA=true
```

### Storefront (.env.storefront)

```env
VITE_API_URL=http://localhost:5000
VITE_MODE=storefront
VITE_PORT=5174
VITE_ENABLE_GUEST_CHECKOUT=true
VITE_ENABLE_APPOINTMENTS=true
VITE_ENABLE_LIVE_CHAT=true
```

---

## Proxy Configuration

### API Proxy (Both Configs)

```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
      secure: false
    }
  }
}
```

**Benefits:**
- No CORS issues
- Seamless API calls
- Same origin policy

---

## Hot Module Replacement (HMR)

### HMR Ports

| Application | Main Port | HMR Port |
|-------------|-----------|----------|
| Dashboard | 5173 | 5174 |
| Storefront | 5174 | 5175 |

**Different HMR ports prevent conflicts**

---

## Testing Checklist

### Dashboard (Port 5173)

```
[ ] Login works
[ ] Products CRUD works
[ ] Orders display
[ ] Inventory updates
[ ] Analytics load
[ ] Settings save
[ ] Team management works
[ ] Wallet functions
```

### Storefront (Port 5174)

```
[ ] Products display
[ ] Search works
[ ] Cart functions
[ ] Guest checkout works
[ ] User checkout works
[ ] Appointments book
[ ] Order history shows
[ ] Live chat works
```

### Integration

```
[ ] Product added in dashboard appears in storefront
[ ] Order from storefront appears in dashboard
[ ] Stock updates sync
[ ] Real-time updates work
[ ] Both can run simultaneously
[ ] No port conflicts
```

---

## Troubleshooting

### Issue 1: Port Already in Use

**Problem:** Can't start on port 5174

**Solution:**
```powershell
# Check what's using the port
netstat -ano | findstr :5174

# Kill the process
taskkill /PID <PID> /F

# Or use different port
npm run dev:storefront -- --port 5175
```

---

### Issue 2: Can't Access from Mobile

**Problem:** Mobile can't reach storefront

**Solution:**
1. Check firewall allows port 5174
2. Verify both devices on same network
3. Use correct IP address
4. Restart router if needed

---

### Issue 3: HMR Not Working

**Problem:** Changes don't hot reload

**Solution:**
1. Check HMR ports not blocked
2. Restart dev server
3. Clear browser cache
4. Check vite config

---

### Issue 4: API Calls Failing

**Problem:** 404 on API requests

**Solution:**
1. Verify backend running on port 5000
2. Check proxy configuration
3. Verify API_URL in .env
4. Check CORS settings

---

## Production Deployment

### Separate Deployments

**Dashboard:**
```
Domain: admin.omnibiz.com
Build: npm run build
Deploy: dist/
```

**Storefront:**
```
Domain: store.omnibiz.com
Build: npm run build:storefront
Deploy: dist-storefront/
```

### Environment Variables

**Production Dashboard:**
```env
VITE_API_URL=https://api.omnibiz.com
```

**Production Storefront:**
```env
VITE_API_URL=https://api.omnibiz.com
VITE_MODE=storefront
```

---

## Quick Reference

### Start Commands

```bash
# Both applications
npm run dev:both

# Dashboard only
npm run dev:dashboard

# Storefront only
npm run dev:storefront

# Using scripts
.\start-both.ps1
.\start-storefront.ps1
```

### URLs

```
Backend:    http://localhost:5000
Dashboard:  http://localhost:5173
Storefront: http://localhost:5174/store/CODE
```

### Build Commands

```bash
# Dashboard
npm run build

# Storefront
npm run build:storefront

# Both
npm run build && npm run build:storefront
```

---

## Result

**Separate Port Configuration:**

✅ **Dashboard (Port 5173)**
- Admin interface
- Full management features
- Localhost only (secure)

✅ **Storefront (Port 5174)**
- Client shopping portal
- Network accessible
- Mobile-friendly

✅ **Benefits:**
- Independent testing
- Simultaneous operation
- No conflicts
- Real-world simulation
- Multi-device testing

✅ **Easy Start:**
- One command: `.\start-both.ps1`
- Auto-configuration
- Browser auto-open

**Both applications can now run independently on separate ports for comprehensive testing!**

---

END OF DOCUMENT
