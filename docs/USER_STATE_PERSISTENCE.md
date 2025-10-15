# User State Persistence System

## Overview
The OmniBiz application now maintains user state across sessions and devices. Each user's preferences, including theme settings, profile information, and application settings, are automatically saved to the database and restored on login.

## Features

### 1. Theme Consistency
- **Automatic Sync**: Theme preferences are automatically saved to the server whenever changed
- **Cross-Device Sync**: Your theme settings are consistent across all devices
- **Debounced Saving**: Changes are debounced (1 second) to prevent excessive API calls
- **Settings Include**:
  - Theme mode (light, dark, blue, green, purple, etc.)
  - Sidebar collapse state
  - Compact mode
  - High contrast mode
  - Reduced motion
  - Custom accent color
  - Animations enabled/disabled
  - Font size
  - Border radius
  - Sound notifications
  - Auto-save preference

### 2. Profile Persistence
- All profile updates are saved to the database
- Profile data includes:
  - Personal information (name, email, phone, address)
  - Business information
  - Job title and department
  - Bio and avatar
  - Timezone, currency, and language preferences

### 3. Settings Persistence
- General settings (business info, timezone, currency, language)
- Notification preferences (email, SMS, push, marketing)
- Security settings (2FA, session timeout, password expiry)
- Privacy settings (data sharing, analytics)
- Appearance settings (all theme preferences)
- Performance settings (auto-save, cache, background sync)

## Technical Implementation

### Backend (Server-Side)

#### 1. User Model Updates
The User schema now includes a `themePreferences` object:
```javascript
themePreferences: {
  theme: { type: String, default: 'light' },
  sidebarCollapsed: { type: Boolean, default: false },
  compactMode: { type: Boolean, default: false },
  highContrast: { type: Boolean, default: false },
  reducedMotion: { type: Boolean, default: false },
  customAccentColor: { type: String, default: '#3b82f6' },
  animations: { type: Boolean, default: true },
  fontSize: { type: String, default: 'medium' },
  borderRadius: { type: String, default: 'medium' },
  soundEnabled: { type: Boolean, default: true },
  autoSave: { type: Boolean, default: true }
}
```

#### 2. API Endpoints

**Get User Profile**
```
GET /api/user/profile
Headers: { Authorization: Bearer <token> }
Response: Complete user object including themePreferences
```

**Update User Profile**
```
PUT /api/user/profile
Headers: { Authorization: Bearer <token> }
Body: { firstName, lastName, bio, avatar, ... }
```

**Update User Settings**
```
PUT /api/user/settings
Headers: { Authorization: Bearer <token> }
Body: {
  section: 'appearance' | 'general' | 'notifications' | 'security' | 'privacy' | 'performance',
  settings: { ... }
}
```

### Frontend (Client-Side)

#### 1. ThemeContext
Located at: `client/src/context/ThemeContext.jsx`

**Responsibilities**:
- Manages all theme-related state
- Loads user theme preferences from server on mount
- Syncs theme changes to server (debounced)
- Applies CSS variables for theme customization

**Key Features**:
- Initializes theme from server data
- Debounces server sync to reduce API calls
- Applies theme changes to DOM immediately

#### 2. AuthContext
Located at: `client/src/context/AuthContext.jsx`

**Updates**:
- Triggers theme preferences load on login
- Dispatches custom event `userLoggedIn` for theme sync

#### 3. API Helpers
Located at: `client/src/lib/apiHelpers.js`

**New Method**:
```javascript
profileAPI.updateSettings(section, settings)
```

#### 4. Settings Page
Located at: `client/src/pages/dashboard/Settings.jsx`

**Features**:
- Comprehensive settings management UI
- Section-based settings (general, notifications, security, appearance, privacy)
- Real-time sync with ThemeContext
- Server persistence for all settings

## Usage Guide

### For Users

#### Changing Theme Settings
1. Navigate to Settings → Appearance tab
2. Adjust any theme preference
3. Changes are automatically saved (1-second debounce)
4. Log out and log in from another device to see settings synced

#### Updating Profile
1. Navigate to Profile page
2. Click "Edit Profile"
3. Update your information
4. Click "Save Changes"
5. Profile updates are immediately saved to the server

#### Managing Preferences
1. Navigate to Settings
2. Select the appropriate tab:
   - **General**: Business info, timezone, currency, language
   - **Notifications**: Email, SMS, push notification preferences
   - **Security**: 2FA, session timeout, password policies
   - **Appearance**: Theme, colors, layout preferences
   - **Privacy**: Data sharing, analytics preferences
3. Click "Save" button for the section
4. Settings are persisted to the database

### For Developers

#### Adding New Theme Preferences

1. **Update User Model** (`server/models/user.js`):
```javascript
themePreferences: {
  // ... existing fields
  newPreference: { type: String, default: 'defaultValue' }
}
```

2. **Update ThemeContext** (`client/src/context/ThemeContext.jsx`):
```javascript
const [newPreference, setNewPreference] = useState('defaultValue');

// Add to load effect
setNewPreference(themePrefs.newPreference || 'defaultValue');

// Add to sync effect dependency array
useEffect(() => {
  // ... sync logic
}, [/* ... */, newPreference]);

// Add to context value
const themeContextValue = {
  // ... existing values
  newPreference,
  setNewPreference
};
```

3. **Update Settings Controller** (`server/controllers/userController.js`):
```javascript
case 'appearance':
  updateData = {
    themePreferences: {
      // ... existing fields
      newPreference: settings.newPreference
    }
  };
```

#### Adding New Settings Sections

1. **Update User Model** with new fields
2. **Update userController.updateSettings()** with new case
3. **Update Settings.jsx** with new tab and UI
4. **Update apiHelpers.js** if needed

## Data Flow

### On Login
1. User logs in → Token saved to localStorage
2. AuthContext sets user and dispatches `userLoggedIn` event
3. ThemeContext listens for login and fetches user profile
4. Theme preferences loaded from `user.themePreferences`
5. Theme state updated → CSS variables applied to DOM

### On Theme Change
1. User changes theme setting (e.g., toggles dark mode)
2. ThemeContext state updated immediately
3. CSS variables applied to DOM (instant visual feedback)
4. After 1-second debounce, change synced to server
5. Server updates `user.themePreferences`

### On Settings Save
1. User clicks "Save" in Settings page
2. Settings sent to `/api/user/settings` endpoint
3. Controller validates and updates appropriate fields
4. Success response triggers toast notification
5. ThemeContext automatically syncs if appearance changed

## Benefits

1. **Consistent User Experience**: Settings persist across sessions and devices
2. **Reduced Server Load**: Debouncing prevents excessive API calls
3. **Instant Feedback**: UI updates immediately while sync happens in background
4. **Reliable**: Graceful error handling with fallback to defaults
5. **Scalable**: Easy to add new preferences or settings
6. **User-Friendly**: Automatic sync means users don't need to manually save preferences

## Error Handling

- Network errors during sync are logged but don't affect UI
- Failed loads fall back to default values
- User can manually save settings via Settings page if auto-sync fails
- All errors are logged to console for debugging

## Performance Considerations

- **Debouncing**: 1-second debounce on theme changes reduces API calls
- **Lazy Loading**: Theme preferences only loaded on login
- **Selective Updates**: Only changed fields are sent to server
- **No Blocking**: Theme sync happens asynchronously, doesn't block UI

## Security

- All API calls require authentication token
- User can only update their own settings
- Password and sensitive fields protected from updates
- Settings validated on server-side

## Future Enhancements

- [ ] Import/Export settings feature
- [ ] Settings presets/templates
- [ ] Settings backup and restore
- [ ] Settings versioning
- [ ] Multi-profile support
- [ ] Workspace-specific settings
- [ ] Admin-enforced settings policies
