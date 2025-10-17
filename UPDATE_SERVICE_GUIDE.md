# Update Service Configuration Guide

**Version**: 2.0.0  
**Last Updated**: October 17, 2025  
**Status**: ✅ Fully Reconfigured

---

## 🎯 Overview

The Update Service has been completely reconfigured with:
- ✅ **Toast notification integration** (Sonner)
- ✅ **Environment variable configuration**
- ✅ **Automatic version detection** from package.json
- ✅ **Service Worker integration** for PWA updates
- ✅ **Customizable update checking**
- ✅ **Auto-update support**
- ✅ **Network status checking**

---

## ⚙️ Configuration

### Environment Variables

Add these to your `client/.env` file:

```env
# Update Service Configuration

# Custom update check URL (optional)
# If not set, uses Service Worker for PWA updates
VITE_UPDATE_CHECK_URL=https://your-api.com/api/version

# Update check interval in milliseconds (default: 30 minutes)
VITE_UPDATE_CHECK_INTERVAL=1800000

# Enable automatic updates without user confirmation
VITE_AUTO_UPDATE=false

# Enable/disable update notifications (default: true)
VITE_ENABLE_UPDATE_NOTIFICATIONS=true
```

### Configuration Options Explained

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `VITE_UPDATE_CHECK_URL` | String | `null` | URL endpoint that returns `{ latestVersion: "2.1.0" }` |
| `VITE_UPDATE_CHECK_INTERVAL` | Number | `1800000` | Check interval in ms (30 min = 1800000) |
| `VITE_AUTO_UPDATE` | Boolean | `false` | Auto-reload when update is available |
| `VITE_ENABLE_UPDATE_NOTIFICATIONS` | Boolean | `true` | Show update notifications to users |

---

## 🚀 Features

### 1. **Automatic Version Detection**

The service reads the version from `package.json`:

```json
{
  "version": "2.0.0"
}
```

No manual version configuration needed!

### 2. **Toast Notifications (Sonner Integration)**

All notifications use the Sonner toast system:

```javascript
// Welcome message for new users
toast.success('Welcome to OmniBiz!', {
  description: 'Your all-in-one business management platform is ready!',
  duration: 5000
});

// Update available notification
toast.success('Update Available!', {
  description: 'v2.1.0 is ready. Refresh to update.',
  duration: 0, // Persistent
  action: {
    label: 'Update Now',
    onClick: () => window.location.reload()
  }
});
```

### 3. **Service Worker Integration (PWA)**

Automatically detects PWA updates:

```javascript
// Listens for service worker changes
navigator.serviceWorker.addEventListener('controllerchange', () => {
  // Notifies user of new version
});
```

### 4. **Smart Version Comparison**

Semantic versioning support:

```javascript
isNewerVersion('2.1.0', '2.0.0')  // true
isNewerVersion('2.0.1', '2.0.0')  // true
isNewerVersion('2.0.0', '2.0.0')  // false
```

### 5. **Changelog Display**

Shows what's new when version changes:

```javascript
// Changelog automatically shown to returning users
getChangelog() {
  return [
    '✨ Enhanced AI chat with dashboard-specific responses',
    '🎤 Added voice input support',
    '⚙️ New settings panel with AI personality options',
    '📊 Real-time data integration',
    '💾 Conversation history with search & export',
    '🎨 Improved UI with maximizable interface'
  ];
}
```

---

## 📝 Usage Examples

### Basic Setup (Default Configuration)

No `.env` configuration needed! The service works out of the box with:
- Service Worker updates (PWA)
- 30-minute check interval
- Manual update confirmation
- Notifications enabled

### Custom Update Server

If you have a backend API that provides version info:

**1. Create version endpoint** (`server/routes/versionRoutes.js`):

```javascript
router.get('/version', (req, res) => {
  res.json({
    latestVersion: '2.1.0',
    message: 'New features and bug fixes available!',
    releaseDate: '2025-10-17',
    changelog: [
      'Feature 1',
      'Feature 2',
      'Bug fix 1'
    ]
  });
});
```

**2. Configure client** (`client/.env`):

```env
VITE_UPDATE_CHECK_URL=http://localhost:5000/api/version
```

### Auto-Update Mode

Enable automatic updates:

```env
VITE_AUTO_UPDATE=true
```

When an update is detected:
- Shows notification: "Auto-updating... The app will refresh in 3 seconds"
- Automatically reloads after 3 seconds

### Custom Check Interval

Check for updates every 10 minutes:

```env
VITE_UPDATE_CHECK_INTERVAL=600000
```

Or every hour:

```env
VITE_UPDATE_CHECK_INTERVAL=3600000
```

### Disable Notifications

Silent updates (no user notifications):

```env
VITE_ENABLE_UPDATE_NOTIFICATIONS=false
```

---

## 🔧 API Reference

### Methods

#### `start()`
Initializes the service.

```javascript
import updateService from '@/services/updateServices';
updateService.start();
```

#### `initialize()`
Starts automatic update checking.

```javascript
updateService.initialize();
```

#### `checkForUpdates()`
Manually trigger update check.

```javascript
await updateService.checkForUpdates();
```

#### `forceUpdateCheck()`
Force update check with user notification.

```javascript
updateService.forceUpdateCheck();
// Shows: "Checking for updates..."
```

#### `triggerUpdate()`
Manually trigger app reload.

```javascript
updateService.triggerUpdate();
// Shows: "Updating app..." then reloads
```

#### `getVersion()`
Get current app version.

```javascript
const version = updateService.getVersion();
console.log(version); // "2.0.0"
```

#### `getStatus()`
Get service status.

```javascript
const status = updateService.getStatus();
console.log(status);
// {
//   isInitialized: true,
//   hasActiveInterval: true,
//   currentVersion: "2.0.0",
//   checkInterval: 1800000,
//   autoUpdate: false,
//   notificationsEnabled: true,
//   hasUpdateUrl: false
// }
```

#### `setNotificationsEnabled(enabled)`
Enable/disable notifications.

```javascript
updateService.setNotificationsEnabled(false); // Disable
updateService.setNotificationsEnabled(true);  // Enable
```

#### `showWelcomeMessage()`
Show welcome message (called automatically in App.jsx).

```javascript
updateService.showWelcomeMessage();
```

#### `stop()`
Stop the update service.

```javascript
updateService.stop();
```

#### `destroy()`
Cleanup and destroy the service.

```javascript
updateService.destroy();
```

---

## 🎨 User Experience

### First-Time User

When a user visits for the first time:

```
┌─────────────────────────────────────┐
│ ✅ Welcome to OmniBiz!              │
│ Your all-in-one business management │
│ platform is ready!                  │
│                                     │
│                    [Get Started] ▶  │
└─────────────────────────────────────┘
```

### Returning User (New Version)

When user returns after update:

```
┌─────────────────────────────────────┐
│ ℹ️ Updated to v2.0.0                │
│ Check out the new features and      │
│ improvements!                        │
│                                     │
│              [See What's New] ▶     │
└─────────────────────────────────────┘
```

### Update Available

When an update is detected:

```
┌─────────────────────────────────────┐
│ ✅ Update Available!                │
│ v2.1.0 is ready. Refresh to update. │
│                                     │
│  [Later] ◀        [Update Now] ▶   │
└─────────────────────────────────────┘
```

If user clicks "Later", reminder appears in 1 hour.

### Auto-Update Mode

When auto-update is enabled:

```
┌─────────────────────────────────────┐
│ ℹ️ Auto-updating...                 │
│ The app will refresh in 3 seconds   │
└─────────────────────────────────────┘
```

---

## 🔍 Debugging

### Check Service Status

Open browser console:

```javascript
// Get update service from window (for debugging)
import updateService from '@/services/updateServices';
console.log(updateService.getStatus());
```

### Development Mode Logging

In development, see configuration on load:

```
⚙️ Update Service Configuration: {
  version: "2.0.0",
  checkInterval: "30 minutes",
  autoUpdate: false,
  notificationsEnabled: true,
  updateCheckUrl: "Service Worker (PWA)"
}
```

### Common Console Messages

```
🔄 Initializing automatic updates...
📦 Current version: 2.0.0
⏱️ Check interval: 30 minutes
🔍 Checking for updates...
✅ App is up to date
🔔 Update available: 2.1.0
📢 Checking for welcome message...
🛑 Destroying update service...
```

---

## 🧪 Testing

### Test Update Detection

**1. Change version in package.json:**
```json
{
  "version": "2.1.0"
}
```

**2. Clear localStorage:**
```javascript
localStorage.removeItem('app_version');
```

**3. Reload app:**
- Should show welcome message for "new" version

### Test Service Worker Updates

**1. Build app:**
```bash
npm run build
npm run preview
```

**2. Modify service worker:**
```javascript
// public/sw.js - change version
const CACHE_VERSION = 'v2';
```

**3. Reload:**
- Should detect service worker update

### Test Custom Update Server

**1. Create mock server:**
```javascript
// test-update-server.js
const express = require('express');
const app = express();

app.get('/api/version', (req, res) => {
  res.json({
    latestVersion: '2.1.0',
    message: 'Test update available!'
  });
});

app.listen(3001, () => {
  console.log('Update server on http://localhost:3001');
});
```

**2. Configure client:**
```env
VITE_UPDATE_CHECK_URL=http://localhost:3001/api/version
```

**3. Run and test:**
```bash
node test-update-server.js
npm run dev
```

---

## 📊 Configuration Examples

### Development Setup
```env
# Check every 5 minutes for faster testing
VITE_UPDATE_CHECK_INTERVAL=300000
VITE_AUTO_UPDATE=false
VITE_ENABLE_UPDATE_NOTIFICATIONS=true
```

### Production Setup
```env
# Check every hour
VITE_UPDATE_CHECK_INTERVAL=3600000
VITE_AUTO_UPDATE=false
VITE_ENABLE_UPDATE_NOTIFICATIONS=true
VITE_UPDATE_CHECK_URL=https://api.omnibiz.com/version
```

### Minimal Setup (Silent Mode)
```env
# Disable all update notifications
VITE_ENABLE_UPDATE_NOTIFICATIONS=false
```

### Aggressive Auto-Update
```env
# Check every 10 minutes and auto-update
VITE_UPDATE_CHECK_INTERVAL=600000
VITE_AUTO_UPDATE=true
VITE_ENABLE_UPDATE_NOTIFICATIONS=true
```

---

## 🚨 Troubleshooting

### Updates Not Working

**Check:**
1. ✅ Service is initialized in `App.jsx`
2. ✅ Environment variables are set correctly
3. ✅ Network connection is active
4. ✅ Service Worker is registered (PWA)

**Console checks:**
```javascript
updateService.getStatus(); // Check configuration
updateService.forceUpdateCheck(); // Manual check
```

### Notifications Not Showing

**Possible causes:**
- `VITE_ENABLE_UPDATE_NOTIFICATIONS=false` in .env
- Sonner toast component not rendered in App.jsx
- Browser notifications blocked

**Fix:**
```env
VITE_ENABLE_UPDATE_NOTIFICATIONS=true
```

### Version Not Updating

**Check package.json:**
```json
{
  "version": "2.0.0" // Should match expected version
}
```

**Clear localStorage:**
```javascript
localStorage.clear();
window.location.reload();
```

---

## 🎯 Best Practices

### ✅ DO:
- Use semantic versioning (major.minor.patch)
- Test updates in development before deployment
- Provide clear changelog information
- Give users option to postpone updates
- Check network status before updating

### ❌ DON'T:
- Enable auto-update in production without testing
- Set check interval too low (< 5 minutes)
- Force updates without user consent
- Ignore network errors silently

---

## 📦 File Structure

```
client/
├── src/
│   └── services/
│       └── updateServices.jsx      # Main update service
├── package.json                     # Version source
└── .env.example                     # Configuration template
```

---

## 🔗 Integration Points

### App.jsx
```javascript
import updateService from "@/services/updateServices";

useEffect(() => {
  // Start on app load
  updateService.start();
}, []);

useEffect(() => {
  if (appReady) {
    // Initialize after splash screen
    updateService.initialize();
    updateService.showWelcomeMessage();
  }
}, [appReady]);
```

### Service Worker (PWA)
```javascript
// Automatically integrated
// Listens for 'controllerchange' event
```

### Toast System (Sonner)
```javascript
import { toast } from 'sonner';
// All notifications use toast
```

---

## 📈 Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0.0 | Oct 17, 2025 | Major reconfiguration with env vars, toast integration, PWA support |
| 1.0.0 | Previous | Basic update service with console logging |

---

## 🎉 Summary

The Update Service is now:
- ✅ **Fully configurable** via environment variables
- ✅ **User-friendly** with toast notifications
- ✅ **Smart** with automatic version detection
- ✅ **PWA-ready** with service worker integration
- ✅ **Production-ready** with error handling

**No further configuration required for basic usage!**

---

**Need help?** Check the troubleshooting section or review console logs in development mode.
