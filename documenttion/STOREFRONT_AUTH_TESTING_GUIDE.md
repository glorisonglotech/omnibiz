# Storefront Authentication Testing Guide

**Quick Reference for Testing All Auth Features**

---

## 🧪 **Quick Test Steps**

### **1. Registration Test**
```
URL: /client/register/{inviteCode}

Steps:
1. Enter valid invite code in URL
2. Fill in form:
   - Name: "Test Customer"
   - Email: "test@example.com"
   - Password: "password123"
   - Phone: "+254712345678"
3. Click "Create Account"

Expected:
✅ Success message
✅ Auto-logged in
✅ Redirected to storefront
✅ Token in localStorage
✅ Customer data in localStorage

Check Console:
"✅ Customer registered: test@example.com"
```

---

### **2. Login Test**
```
URL: /client/login/{inviteCode}

Steps:
1. Enter credentials:
   - Email: "test@example.com"
   - Password: "password123"
2. Click "Sign In"

Expected:
✅ Success message
✅ Logged in
✅ Redirected to storefront
✅ Token saved
✅ Customer data saved

Check Console:
"✅ Customer logged in: test@example.com"
```

---

### **3. Session Persistence Test**
```
Steps:
1. Login as customer
2. Press F5 (refresh page)

Expected:
✅ Still logged in
✅ No re-login required
✅ Customer data visible
✅ All features accessible

Check Console:
"✅ Customer authenticated: test@example.com"
```

---

### **4. Orders Test**
```
Steps:
1. Login as customer
2. Go to "Orders" tab

Expected:
✅ Orders load (if any exist)
✅ Or "No orders yet" message
✅ No 400 error
✅ No 401 error

Check Console:
"📦 [CUSTOMER] Fetching orders for: test@example.com"
"✅ [CUSTOMER] Found X orders"
```

---

### **5. Profile Update Test**
```
Steps:
1. Login as customer
2. Go to "Account" tab
3. Click "Edit" button
4. Update name or phone
5. Click "Save Changes"

Expected:
✅ "Profile updated successfully" message
✅ Page refreshes
✅ Changes visible
✅ localStorage updated

Check localStorage:
customerData should show new values
```

---

### **6. Logout Test**
```
Steps:
1. Login as customer
2. Click logout button

Expected:
✅ "Logged out successfully" message
✅ Token cleared from localStorage
✅ Customer data cleared
✅ Redirected to login page
✅ Can't access protected features

Check localStorage:
customerToken: null
customerData: null
```

---

### **7. Token Expiry Test**
```
Steps:
1. Login as customer
2. Manually expire token in localStorage:
   - Open DevTools > Application > localStorage
   - Edit customerToken
   - Change 'exp' value to past date
3. Try to access orders or refresh page

Expected:
✅ "Session expired" message
✅ Auto-logout
✅ Redirected to login
✅ Token cleared

Check Console:
"⏰ Token expired, clearing session"
```

---

### **8. Invalid Token Test**
```
Steps:
1. Login as customer
2. Manually corrupt token in localStorage:
   - Change a few characters in customerToken
3. Try to access orders or refresh page

Expected:
✅ "Invalid token" or "Authentication failed" message
✅ Auto-logout
✅ Redirected to login
✅ Session cleared
```

---

### **9. Network Error Test**
```
Steps:
1. Login as customer
2. Stop backend server
3. Try to access orders

Expected:
✅ "Network error" message
✅ Session NOT cleared (stays logged in)
✅ Can retry when server back online
✅ "Try Again" button available
```

---

### **10. Concurrent Sessions Test**
```
Steps:
1. Login in Browser 1
2. Login in Browser 2 (same user)
3. Use both browsers

Expected:
✅ Both sessions work independently
✅ Each has own token
✅ Both can access data
✅ Logout in one doesn't affect other
```

---

## 🔍 **Browser Console Checks**

### **Successful Login:**
```javascript
✅ Customer logged in: customer@email.com
```

### **Successful Registration:**
```javascript
✅ Customer registered: customer@email.com
```

### **Session Verification:**
```javascript
✅ Customer authenticated: customer@email.com
```

### **Orders Fetch:**
```javascript
📦 [CUSTOMER] Fetching orders for: customer@email.com
✅ [CUSTOMER] Found X orders for customer@email.com
```

### **Token Expiry:**
```javascript
⏰ Token expired, clearing session
```

### **Auth Error:**
```javascript
❌ Customer auth check failed: [error details]
```

---

## 📦 **localStorage Inspection**

### **Logged In State:**
```javascript
// Check in DevTools > Application > localStorage

customerToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
// Should be a long JWT string

customerData: '{"id":"...","name":"Test Customer","email":"test@example.com"}'
// Should be JSON string with customer info
```

### **Logged Out State:**
```javascript
customerToken: null
customerData: null
```

---

## 🌐 **Network Tab Checks**

### **Registration:**
```
Request:
POST /api/customers/auth/register
Status: 201 Created

Response:
{
  "success": true,
  "message": "Registration successful...",
  "customer": {...},
  "token": "eyJ...",
  "storeOwner": {...}
}
```

### **Login:**
```
Request:
POST /api/customers/auth/login
Status: 200 OK

Response:
{
  "success": true,
  "message": "Login successful",
  "customer": {...},
  "token": "eyJ...",
  "storeOwner": {...}
}
```

### **Profile Fetch:**
```
Request:
GET /api/customers/auth/profile
Headers: Authorization: Bearer eyJ...
Status: 200 OK

Response:
{
  "success": true,
  "customer": {...}
}
```

### **Orders Fetch:**
```
Request:
GET /api/customer/orders
Headers: Authorization: Bearer eyJ...
Status: 200 OK

Response:
{
  "success": true,
  "orders": [...],
  "total": 5
}
```

---

## ❌ **Common Errors & Solutions**

### **Error: 400 Bad Request on Orders**
```
Problem: Old token format
Solution: 
- Logout and login again
- New token will have email field
- Should work after re-login
```

### **Error: 401 Unauthorized**
```
Problem: Token expired or invalid
Solution:
- Check token in localStorage
- Login again
- Check backend JWT_SECRET matches
```

### **Error: "Customer email not found"**
```
Problem: Old token without email
Solution:
- Clear localStorage
- Login again with new token format
```

### **Error: Network Error**
```
Problem: Backend not running
Solution:
- Start backend: cd server && npm run dev
- Check http://localhost:5000
```

### **Error: "Invalid invite code"**
```
Problem: Wrong or missing invite code
Solution:
- Get valid invite code from admin
- Check URL has correct code
- Verify in database: db.users.findOne({inviteCode: 'CODE'})
```

---

## ✅ **Success Indicators**

### **Auth Working Correctly:**
```
✅ Can register new account
✅ Can login with credentials
✅ Token persists across refreshes
✅ Orders load without errors
✅ Profile can be updated
✅ Logout clears session
✅ Expired tokens auto-logout
✅ Clear error messages
✅ Auto-redirect on errors
✅ Loading states show properly
```

### **Console Should Show:**
```
No red errors
Green checkmarks for auth operations
Successful API calls (200/201 status)
Proper logging messages
```

### **localStorage Should Have:**
```
customerToken: Valid JWT
customerData: Customer object
No errors or null values (when logged in)
```

---

## 🛠️ **Debugging Commands**

### **Check Token Expiry:**
```javascript
// In browser console:
const token = localStorage.getItem('customerToken');
const decoded = JSON.parse(atob(token.split('.')[1]));
console.log('Token expires:', new Date(decoded.exp * 1000));
console.log('Time now:', new Date());
console.log('Expired:', decoded.exp < (Date.now() / 1000));
```

### **Check Customer Data:**
```javascript
// In browser console:
const data = JSON.parse(localStorage.getItem('customerData'));
console.log('Customer:', data);
```

### **Test API Call:**
```javascript
// In browser console:
const token = localStorage.getItem('customerToken');
fetch('http://localhost:5000/api/customer/orders', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(data => console.log('Orders:', data));
```

### **Clear Session:**
```javascript
// In browser console:
localStorage.removeItem('customerToken');
localStorage.removeItem('customerData');
console.log('Session cleared');
location.reload();
```

---

## 📝 **Test Data**

### **Valid Test Customer:**
```
Email: test@example.com
Password: password123
Name: Test Customer
Phone: +254712345678
```

### **Valid Invite Code:**
```
Get from: Admin dashboard or database
Format: 12-character code (e.g., "67d96111a113")
```

---

## 🎯 **Quick Troubleshooting**

### **Problem: Can't login**
```
1. Check email/password correct
2. Check backend running
3. Check network tab for error
4. Check backend logs
5. Verify customer exists in DB
```

### **Problem: Orders not loading**
```
1. Check logged in (token in localStorage)
2. Check network tab for error details
3. Check backend logs
4. Try logout and login again
5. Check customer has orders in DB
```

### **Problem: Session expires immediately**
```
1. Check token expiry in decoded JWT
2. Check backend JWT_SECRET
3. Check system time is correct
4. Verify token generation in backend
```

---

**All tests passing = Authentication system working perfectly! ✅**

---

**Last Updated:** October 22, 2025  
**Version:** 1.0.0  
**Status:** Complete Testing Guide
