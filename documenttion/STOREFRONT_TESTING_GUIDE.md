# Storefront Link Testing Guide - Multi-Configuration Setup

**Version:** 2.0
**Date:** October 16, 2025
**Purpose:** Test storefront links with different configurations for orders and appointments

---

## Table of Contents

1. [Overview](#overview)
2. [Configuration Setup](#configuration-setup)
3. [Testing Scenarios](#testing-scenarios)
4. [Order Testing](#order-testing)
5. [Appointment Testing](#appointment-testing)
6. [Multi-Device Testing](#multi-device-testing)
7. [Troubleshooting](#troubleshooting)

---

## 1. Overview

### Purpose

Test the client storefront functionality with different configurations to ensure:
- Customers can view products
- Orders can be placed successfully
- Appointments can be booked
- Different user roles work properly
- Links work across devices

### Storefront URL Structure

```
http://localhost:5173/store/:inviteCode
```

**Example:**
```
http://localhost:5173/store/ABC123XYZ
http://localhost:5173/store/DEMO2025
```

---

## 2. Configuration Setup

### 2.1 Server Configuration

**Development Environment:**

**File:** `server/.env`

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/omnibiz

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# CORS - Allow multiple origins for testing
CORS_ORIGIN=http://localhost:5173,http://localhost:5174,http://192.168.1.100:5173

# Storefront Settings
ENABLE_PUBLIC_STOREFRONT=true
ALLOW_GUEST_CHECKOUT=true
REQUIRE_APPOINTMENT_APPROVAL=false
```

**Start Server:**
```bash
cd server
npm install
npm run dev
```

**Server should run on:** `http://localhost:5000`

---

### 2.2 Client Configuration

**Configuration 1: Main Development (Port 5173)**

**File:** `client/.env`

```env
VITE_API_URL=http://localhost:5000
VITE_ENABLE_PWA=true
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GITHUB_CLIENT_ID=your_github_client_id
```

**Start Client:**
```bash
cd client
npm install
npm run dev
```

**Client runs on:** `http://localhost:5173`

---

**Configuration 2: Alternative Port (Port 5174)**

For testing multiple simultaneous sessions:

**Terminal 2:**
```bash
cd client
npm run dev -- --port 5174
```

**Client runs on:** `http://localhost:5174`

---

**Configuration 3: Network Access (Mobile/Tablet Testing)**

Find your local IP address:

**Windows:**
```powershell
ipconfig
# Look for IPv4 Address (e.g., 192.168.1.100)
```

**Linux/Mac:**
```bash
ifconfig
# or
ip addr show
```

**Start with host flag:**
```bash
cd client
npm run dev -- --host
```

**Access from other devices:**
```
http://192.168.1.100:5173/store/ABC123XYZ
```

---

### 2.3 Generate Test Invite Codes

**Method 1: Via API**

```bash
# Create invite code for testing
curl -X POST http://localhost:5000/api/storefront/generate-invite \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "businessName": "Test Store",
    "expiresIn": "30d"
  }'
```

**Method 2: Via Database**

```javascript
// MongoDB shell or Compass
db.inviteCodes.insertOne({
  code: "TEST2025",
  userId: ObjectId("your_user_id"),
  businessName: "Test Store",
  active: true,
  expiresAt: new Date("2025-12-31"),
  createdAt: new Date()
});
```

**Method 3: Via Dashboard**

1. Login to dashboard
2. Go to Settings → Storefront
3. Click "Generate Invite Link"
4. Copy the invite code

---

## 3. Testing Scenarios

### Scenario 1: Guest Customer (No Login)

**Configuration:**
- Port: 5173
- User: Not logged in
- Purpose: Test guest checkout

**Test URL:**
```
http://localhost:5173/store/TEST2025
```

**Expected Behavior:**
- Can view products
- Can add to cart
- Can checkout as guest
- Must provide email for order confirmation

---

### Scenario 2: Registered Customer

**Configuration:**
- Port: 5173
- User: Logged in as customer
- Purpose: Test full customer experience

**Steps:**
1. Register/Login first
2. Navigate to storefront link
3. Test order history access

**Test URL:**
```
http://localhost:5173/store/TEST2025
```

**Expected Behavior:**
- Can view products
- Can add to cart
- Checkout with saved details
- View order history
- Book appointments

---

### Scenario 3: Multiple Sessions (Different Devices)

**Configuration:**
- Device 1: Desktop (Port 5173)
- Device 2: Tablet (Port 5174)
- Device 3: Mobile (Network IP)

**Purpose:** Test concurrent access

**Test URLs:**
```
Desktop:  http://localhost:5173/store/TEST2025
Tablet:   http://localhost:5174/store/TEST2025
Mobile:   http://192.168.1.100:5173/store/TEST2025
```

**Expected Behavior:**
- All devices can access simultaneously
- Cart is independent per session
- Orders don't conflict
- Real-time updates work

---

### Scenario 4: Different Store Owners

**Configuration:**
- Store A: Invite code "STOREA2025"
- Store B: Invite code "STOREB2025"

**Test URLs:**
```
http://localhost:5173/store/STOREA2025
http://localhost:5173/store/STOREB2025
```

**Expected Behavior:**
- Each shows different products
- Different branding/business name
- Separate order systems
- Independent appointments

---

## 4. Order Testing

### 4.1 Product Viewing

**Test Checklist:**

```
Configuration: http://localhost:5173/store/TEST2025

[ ] Products load correctly
[ ] Images display properly
[ ] Prices show correctly
[ ] Stock status visible
[ ] Categories filter works
[ ] Search functionality works
[ ] Product details open
[ ] Out of stock items marked
```

**Test Data:**

Create test products with different states:

```javascript
// Product 1: In Stock
{
  name: "Test Product 1",
  price: 29.99,
  stock: 50,
  category: "Electronics",
  status: "active"
}

// Product 2: Low Stock
{
  name: "Test Product 2",
  price: 49.99,
  stock: 3,
  category: "Accessories",
  status: "active"
}

// Product 3: Out of Stock
{
  name: "Test Product 3",
  price: 19.99,
  stock: 0,
  category: "Clothing",
  status: "active"
}
```

---

### 4.2 Cart Functionality

**Test Checklist:**

```
[ ] Add to cart works
[ ] Quantity can be increased
[ ] Quantity can be decreased
[ ] Remove from cart works
[ ] Cart total calculates correctly
[ ] Cart persists on page refresh
[ ] Cart shows item count badge
[ ] Empty cart message displays
```

**Test Steps:**

1. **Add Product:**
   - Click "Add to Cart" on Product 1
   - Verify cart count increases
   - Check cart icon badge

2. **Update Quantity:**
   - Open cart
   - Click "+" to increase quantity
   - Click "-" to decrease quantity
   - Verify total updates

3. **Remove Item:**
   - Click trash icon
   - Verify item removed
   - Check total recalculates

4. **Persistence:**
   - Add items to cart
   - Refresh page
   - Verify cart retained

---

### 4.3 Checkout Process

**Guest Checkout Test:**

```
Configuration: http://localhost:5173/store/TEST2025
User: Not logged in

Steps:
1. Add products to cart
2. Click "Checkout"
3. Fill customer details:
   - Name: John Doe
   - Email: john@example.com
   - Phone: +254700000000
   - Address: 123 Test Street
4. Select payment method
5. Place order
6. Verify order confirmation

Expected:
[ ] Customer form appears
[ ] All fields validate
[ ] Email format checked
[ ] Phone format checked
[ ] Payment methods listed
[ ] Order submits successfully
[ ] Confirmation email sent
[ ] Order ID generated
```

**Registered User Checkout:**

```
Configuration: http://localhost:5173/store/TEST2025
User: Logged in

Steps:
1. Login first
2. Add products to cart
3. Click "Checkout"
4. Details pre-filled
5. Confirm and place order

Expected:
[ ] Details auto-populated
[ ] Can edit if needed
[ ] Faster checkout
[ ] Order linked to account
[ ] Appears in order history
```

---

### 4.4 Order Confirmation

**Test Checklist:**

```
After placing order:

[ ] Order confirmation page shows
[ ] Order number displayed
[ ] Order summary correct
[ ] Total amount correct
[ ] Customer details shown
[ ] Estimated delivery shown
[ ] Track order link works
[ ] Email confirmation sent
[ ] SMS notification sent (if enabled)
```

---

## 5. Appointment Testing

### 5.1 Appointment Booking

**Configuration Setup:**

Enable appointments in store settings:

```javascript
// Store settings
{
  enableAppointments: true,
  appointmentTypes: [
    "Consultation",
    "Product Demo",
    "Service",
    "Support"
  ],
  businessHours: {
    monday: { open: "09:00", close: "17:00" },
    tuesday: { open: "09:00", close: "17:00" },
    wednesday: { open: "09:00", close: "17:00" },
    thursday: { open: "09:00", close: "17:00" },
    friday: { open: "09:00", close: "17:00" },
    saturday: { open: "10:00", close: "14:00" },
    sunday: { closed: true }
  }
}
```

**Test URL:**
```
http://localhost:5173/store/TEST2025
```

**Navigate to:** Appointments tab

---

### 5.2 Appointment Booking Flow

**Test Checklist:**

```
[ ] Appointments tab visible
[ ] Calendar displays correctly
[ ] Available time slots shown
[ ] Unavailable times disabled
[ ] Past dates disabled
[ ] Business hours respected
[ ] Closed days marked

Booking Process:
[ ] Select date
[ ] Select time slot
[ ] Choose appointment type
[ ] Fill customer details
[ ] Add notes/description
[ ] Submit appointment
[ ] Confirmation received
[ ] Email notification sent
```

**Test Steps:**

1. **Select Date:**
   - Click on calendar
   - Choose future date
   - Verify available slots appear

2. **Choose Time:**
   - Select time slot
   - Verify it's within business hours
   - Check slot becomes unavailable

3. **Fill Details:**
   ```
   Name: Jane Smith
   Email: jane@example.com
   Phone: +254711111111
   Type: Consultation
   Notes: Need help with product selection
   ```

4. **Submit:**
   - Click "Book Appointment"
   - Verify confirmation message
   - Check appointment appears in list

---

### 5.3 Appointment Management

**Customer View:**

```
Configuration: http://localhost:5173/store/TEST2025
Tab: Appointments → My Appointments

Test:
[ ] View upcoming appointments
[ ] View past appointments
[ ] Cancel appointment
[ ] Reschedule appointment
[ ] Add to calendar
[ ] Receive reminders
```

**Store Owner View:**

```
Configuration: Dashboard → Appointments

Test:
[ ] See all appointments
[ ] Approve/Reject appointments
[ ] Reschedule appointments
[ ] Mark as completed
[ ] Send notifications
[ ] View customer details
```

---

## 6. Multi-Device Testing

### 6.1 Desktop Testing

**Configuration:**
```
URL: http://localhost:5173/store/TEST2025
Browser: Chrome, Firefox, Edge, Safari
Resolution: 1920x1080, 1366x768
```

**Test:**
```
[ ] Full layout displays
[ ] All features accessible
[ ] Navigation smooth
[ ] Images load properly
[ ] Forms work correctly
[ ] Checkout completes
```

---

### 6.2 Tablet Testing

**Configuration:**
```
URL: http://192.168.1.100:5173/store/TEST2025
Device: iPad, Android Tablet
Resolution: 1024x768, 768x1024
```

**Test:**
```
[ ] Responsive layout
[ ] Touch interactions work
[ ] Cart sidebar functional
[ ] Forms easy to fill
[ ] Images scale properly
[ ] Buttons large enough
```

---

### 6.3 Mobile Testing

**Configuration:**
```
URL: http://192.168.1.100:5173/store/TEST2025
Device: iPhone, Android Phone
Resolution: 375x667, 414x896
```

**Test:**
```
[ ] Mobile-optimized layout
[ ] Hamburger menu works
[ ] Product cards stack
[ ] Cart accessible
[ ] Checkout mobile-friendly
[ ] Touch targets adequate
[ ] Keyboard doesn't obscure inputs
```

---

## 7. Testing Matrix

### Complete Test Matrix

| Test Case | Port 5173 | Port 5174 | Network IP | Mobile | Status |
|-----------|-----------|-----------|------------|--------|--------|
| View Products | [ ] | [ ] | [ ] | [ ] | |
| Search Products | [ ] | [ ] | [ ] | [ ] | |
| Filter by Category | [ ] | [ ] | [ ] | [ ] | |
| Add to Cart | [ ] | [ ] | [ ] | [ ] | |
| Update Cart | [ ] | [ ] | [ ] | [ ] | |
| Guest Checkout | [ ] | [ ] | [ ] | [ ] | |
| User Checkout | [ ] | [ ] | [ ] | [ ] | |
| View Order History | [ ] | [ ] | [ ] | [ ] | |
| Book Appointment | [ ] | [ ] | [ ] | [ ] | |
| View Appointments | [ ] | [ ] | [ ] | [ ] | |
| Cancel Appointment | [ ] | [ ] | [ ] | [ ] | |
| Live Chat | [ ] | [ ] | [ ] | [ ] | |
| Payment Processing | [ ] | [ ] | [ ] | [ ] | |

---

## 8. Test Data Setup

### 8.1 Create Test Users

```javascript
// User 1: Store Owner
{
  email: "owner@teststore.com",
  password: "Test123!",
  role: "admin",
  businessName: "Test Store"
}

// User 2: Customer
{
  email: "customer@example.com",
  password: "Test123!",
  role: "client"
}

// User 3: Guest (no account)
// Uses checkout without registration
```

---

### 8.2 Create Test Products

```javascript
// Product Set 1: Electronics
[
  {
    name: "Laptop Pro 15",
    price: 1299.99,
    stock: 10,
    category: "Electronics",
    images: ["laptop1.jpg"],
    description: "High-performance laptop"
  },
  {
    name: "Wireless Mouse",
    price: 29.99,
    stock: 50,
    category: "Accessories",
    images: ["mouse1.jpg"],
    description: "Ergonomic wireless mouse"
  }
]

// Product Set 2: Low/No Stock
[
  {
    name: "Limited Edition Item",
    price: 199.99,
    stock: 2,
    category: "Special",
    description: "Only 2 left!"
  },
  {
    name: "Out of Stock Item",
    price: 49.99,
    stock: 0,
    category: "Clothing",
    description: "Currently unavailable"
  }
]
```

---

### 8.3 Create Test Appointments

```javascript
// Appointment Slots
{
  date: "2025-10-20",
  slots: [
    { time: "09:00", available: true },
    { time: "10:00", available: true },
    { time: "11:00", available: false }, // Booked
    { time: "14:00", available: true },
    { time: "15:00", available: true }
  ]
}
```

---

## 9. Troubleshooting

### Common Issues

**Issue 1: Storefront Link Not Working**

```
Problem: 404 error when accessing /store/:code
Solution:
1. Check invite code exists in database
2. Verify code is active
3. Check server route configuration
4. Ensure CORS allows origin
```

**Issue 2: Products Not Loading**

```
Problem: Empty product list
Solution:
1. Check API endpoint: GET /api/storefront/:code/products
2. Verify products exist for store owner
3. Check product status is "active"
4. Review browser console for errors
```

**Issue 3: Cart Not Persisting**

```
Problem: Cart clears on refresh
Solution:
1. Check localStorage is enabled
2. Verify cart key format
3. Check browser privacy settings
4. Test in incognito mode
```

**Issue 4: Checkout Failing**

```
Problem: Order submission fails
Solution:
1. Check API endpoint: POST /api/orders
2. Verify all required fields filled
3. Check payment gateway configuration
4. Review server logs for errors
```

**Issue 5: Appointments Not Showing**

```
Problem: No appointment slots available
Solution:
1. Check business hours configured
2. Verify appointment feature enabled
3. Check date is not in past
4. Ensure time slots not all booked
```

---

## 10. Performance Testing

### Load Testing

**Test Concurrent Users:**

```bash
# Install Apache Bench
# Windows: Download from Apache website
# Linux: sudo apt-get install apache2-utils

# Test 100 concurrent requests
ab -n 100 -c 10 http://localhost:5173/store/TEST2025

# Test checkout endpoint
ab -n 50 -c 5 -p order.json -T application/json \
  http://localhost:5000/api/orders
```

**Expected Results:**
- Response time < 200ms
- No failed requests
- Server handles load smoothly

---

## 11. Security Testing

### Test Security Features

```
[ ] SQL injection prevention
[ ] XSS protection
[ ] CSRF tokens
[ ] Rate limiting
[ ] Input validation
[ ] Secure payment processing
[ ] Data encryption
[ ] Session management
```

---

## 12. Quick Start Testing Script

**Windows PowerShell:**

```powershell
# Start Server
cd server
Start-Process powershell -ArgumentList "npm run dev"

# Start Client (Port 5173)
cd ../client
Start-Process powershell -ArgumentList "npm run dev"

# Start Client (Port 5174)
Start-Process powershell -ArgumentList "npm run dev -- --port 5174"

# Open browsers
Start-Process "http://localhost:5173/store/TEST2025"
Start-Process "http://localhost:5174/store/TEST2025"

Write-Host "Testing environment ready!"
Write-Host "Port 5173: http://localhost:5173/store/TEST2025"
Write-Host "Port 5174: http://localhost:5174/store/TEST2025"
```

---

## Result

**Storefront Testing Configurations:**

✅ **Configuration 1:** Desktop (Port 5173)
✅ **Configuration 2:** Alternative Port (5174)
✅ **Configuration 3:** Network Access (Mobile/Tablet)
✅ **Configuration 4:** Multiple Store Owners

**Features to Test:**
✅ Product viewing and search
✅ Cart management
✅ Guest checkout
✅ Registered user checkout
✅ Order confirmation
✅ Appointment booking
✅ Appointment management
✅ Multi-device access
✅ Real-time updates
✅ Payment processing

**All configurations ready for comprehensive storefront testing!**

---

END OF DOCUMENT
