# 🔄 OmniBiz Repository Status & AI Response Configuration

**Date**: October 31, 2025  
**Repository**: https://github.com/glorisonglotech/omnibiz.git  
**Team**: glorisonglotech (collaborative team repository)

---

## 📊 Current Repository Status

### Branch Structure

You are currently on: **`feature/tailwind-setup-and-components`**

```
Branches:
├── main (origin/main) ✅ HAS ALL RECENT CHANGES
│   ├── Latest: 165dc08 - docs: Add AI fix and deployment documentation
│   ├── Previous: 9ff09fe - feat: Complete OmniBiz platform enhancements
│   └── Includes: AI fixes, purchasing system, team-location, favicons
│
└── feature/tailwind-setup-and-components (YOUR CURRENT BRANCH)
    ├── Latest: 49500db - feat: Implement comprehensive authentication system
    ├── Status: DOES NOT have the recent changes from main
    └── Focus: Tailwind CSS setup and component updates
```

### ✅ Changes ARE in Main Repo (glorisonglotech)

**YES!** All the changes we made (AI fixes, purchasing system, etc.) **ARE successfully pushed** to the main glorisonglotech repository on the `main` branch.

**Commits in origin/main**:
1. `165dc08` - docs: Add AI fix and deployment documentation
2. `9ff09fe` - feat: Complete OmniBiz platform enhancements - AI, purchasing, team-location integration
3. `061534b` - Enhance ChatInterface error handling and logging
4. `a47e8b1` - Refactor customer authentication flow
5. And more...

---

## 🔀 How to Get Changes on Your Current Branch

Since you're on `feature/tailwind-setup-and-components` and want the latest changes from `main`:

### Option 1: Switch to Main Branch (Recommended for now)
```bash
cd /home/darkhat/react-projects/ominbiz/omnibiz
git checkout main
git pull origin main
```

### Option 2: Merge Main into Your Feature Branch
```bash
cd /home/darkhat/react-projects/ominbiz/omnibiz
git checkout feature/tailwind-setup-and-components
git merge main
# Resolve any conflicts if they occur
git push origin feature/tailwind-setup-and-components
```

### Option 3: Rebase Your Feature Branch on Main
```bash
cd /home/darkhat/react-projects/ominbiz/omnibiz
git checkout feature/tailwind-setup-and-components
git rebase main
# Resolve any conflicts if they occur
git push origin feature/tailwind-setup-and-components --force-with-lease
```

---

## 🤖 AI Response Configuration

### Current AI Setup (on main branch)

The AI service is configured to provide **different responses** based on who is using it:

#### 1. **Business Owner/Admin Dashboard** (`dashboardType: 'admin'` or `'main'`)

**System Prompt**:
```
You are an AI assistant for a business owner/administrator using the OmniBiz platform.

User: [Business Owner Name] (super_admin/admin)
Business: [Business Name]

Provide insights about:
- Business analytics and performance
- Inventory management
- Sales trends and revenue
- Team management
- Customer analytics
- Financial reports

Be professional, data-driven, and actionable in your responses.
```

**Example Response**:
> "Based on your sales data, I notice a 15% increase in revenue this month. Your top-selling product is 'Premium Coffee Beans' with 234 units sold. I recommend increasing inventory for this item and running a promotion on slower-moving products."

---

#### 2. **Customer Storefront** (`dashboardType: 'storefront'` or `'client'`)

**System Prompt for Registered Customers**:
```
You are an AI shopping assistant for [Business Name] online store.

Customer: [Customer Name] (Registered Customer)
Email: [customer@email.com]

You can help with:
- Product discovery and recommendations
- Order tracking and status (check their orders)
- Appointment booking and scheduling
- Product details and specifications
- Shopping cart and checkout assistance
- Store policies and information
- Customer support and inquiries
- Account management

Response Style:
- Be warm, friendly, and helpful
- Use conversational language
- Suggest products when relevant
- Make shopping enjoyable and easy
- Use light emojis for friendliness

Remember: This is a valued customer, provide personalized service
```

**System Prompt for Guest Visitors**:
```
You are an AI shopping assistant for [Business Name] online store.

Customer: Guest (Guest Visitor)
Browsing as guest

You can help with:
- Product discovery and recommendations
- Order tracking and status (they need to sign in)
- Appointment booking and scheduling
- Product details and specifications
- Shopping cart and checkout assistance
- Store policies and information
- Customer support and inquiries
- Account creation benefits

Response Style:
- Be warm, friendly, and helpful
- Use conversational language
- Suggest products when relevant
- Encourage sign-up for guests (mention benefits)
- Make shopping enjoyable and easy
- Use light emojis for friendliness

Remember: This is a guest, encourage them to create an account for better experience
```

**Example Response (Customer)**:
> "Hi Sarah! 👋 I'd be happy to help you find the perfect product! Based on your previous orders, I think you'd love our new 'Organic Tea Collection'. Would you like me to show you some options? I can also check the status of your recent order if you'd like!"

**Example Response (Guest)**:
> "Welcome to our store! 👋 I can help you find exactly what you're looking for. By the way, creating a free account gives you access to exclusive deals, order tracking, and personalized recommendations. Would you like to browse our featured products or search for something specific?"

---

## 🎨 Client Storefront Theme Issues

### Current Theme System (on main branch)

The storefront uses **ThemeSelector** component with multiple themes:

**Available Themes** (from `AVAILABLE_THEMES`):
- Default
- Dark
- Blue
- Green
- Purple
- Orange
- Pink
- Custom business themes

### Common Theme Issues & Solutions

#### Issue 1: Theme Not Persisting
**Cause**: Theme not saved to localStorage or database
**Solution**: Check `ThemeContext` and ensure theme is saved:
```javascript
localStorage.setItem('selectedTheme', themeName);
```

#### Issue 2: Colors Not Matching Business Brand
**Cause**: Using default theme instead of business-specific theme
**Solution**: Set business theme in user settings or ThemeSelector

#### Issue 3: Dark Mode Not Working
**Cause**: CSS variables not properly defined
**Solution**: Check `index.css` for `.dark` class definitions

#### Issue 4: Storefront Looks Different from Admin Dashboard
**Cause**: This is **intentional** - storefront should look customer-friendly, not admin-like
**Solution**: Customize storefront theme separately from admin theme

---

## 📁 File Locations (on main branch)

### AI Configuration Files:
- `server/controllers/aiController.js` - AI chat logic with different prompts
- `server/services/aiService.js` - Gemini AI service (gemini-2.0-flash-exp)
- `server/services/geminiAI.js` - Legacy Gemini service
- `server/routes/aiRoutes.js` - AI API endpoints

### Storefront Files:
- `client/src/pages/client/ClientStorefront.jsx` - Main storefront page
- `client/src/components/storefront/ChatInterface.jsx` - Customer chat widget
- `client/src/components/ThemeSelector.jsx` - Theme selection component
- `client/src/context/ThemeContext.jsx` - Theme management context
- `client/src/index.css` - CSS variables for themes

### Admin Dashboard Files:
- `client/src/pages/Dashboard.jsx` - Admin dashboard
- `client/src/components/dashboard/` - Admin-specific components
- `client/src/components/FloatingAI.jsx` - Admin AI assistant

---

## 🔧 How AI Determines User Type

The AI controller checks in this order:

```javascript
const isCustomer = req.customer !== undefined && req.customer !== null;
const isAdmin = req.user !== undefined && req.user !== null && !isCustomer;
const isGuest = !isAdmin && !isCustomer;
```

**Authentication Headers**:
- **Admin/Business Owner**: `Authorization: Bearer <businessToken>`
- **Customer**: `Authorization: Bearer <customerToken>`
- **Guest**: No authorization header

**Dashboard Type Parameter**:
```javascript
// In API request
{
  "message": "What are my orders?",
  "dashboardType": "storefront" // or "admin"
}
```

---

## ✅ Verification Checklist

To ensure AI responses vary correctly:

- [ ] Check `dashboardType` is sent in API request
- [ ] Verify correct token is used (customer vs business)
- [ ] Test as guest (no token)
- [ ] Test as registered customer (customerToken)
- [ ] Test as business owner (businessToken)
- [ ] Check AI response tone and content differ
- [ ] Verify theme applies correctly on storefront

---

## 🚀 Quick Test Commands

### Test AI as Business Owner:
```bash
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <businessToken>" \
  -d '{"message": "How are my sales?", "dashboardType": "admin"}'
```

### Test AI as Customer:
```bash
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <customerToken>" \
  -d '{"message": "What products do you recommend?", "dashboardType": "storefront"}'
```

### Test AI as Guest:
```bash
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What products do you have?", "dashboardType": "storefront"}'
```

---

## 📝 Next Steps

1. **Switch to main branch** to access all recent changes
2. **Test AI responses** with different user types
3. **Check storefront theme** and customize if needed
4. **Merge or rebase** your feature branch with main when ready
5. **Test thoroughly** before pushing to production

---

## 🆘 Need Help?

**If AI responses are not varying**:
1. Check `dashboardType` parameter in API calls
2. Verify correct authentication token
3. Check server logs for AI request details
4. Ensure `aiController.js` has the enhanced prompts

**If theme issues persist**:
1. Check browser console for errors
2. Verify `ThemeContext` is wrapping the app
3. Check localStorage for saved theme
4. Clear browser cache and reload

---

**Status**: ✅ All changes are in the main glorisonglotech repository  
**Your Current Branch**: `feature/tailwind-setup-and-components` (needs merge/rebase with main)  
**Recommendation**: Switch to `main` branch or merge `main` into your feature branch

