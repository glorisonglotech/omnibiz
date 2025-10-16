# Storefront Testing - Quick Reference Card

**Quick Start:** Run `client/test-storefront.ps1` to start all configurations

---

## Test URLs

| Configuration | URL | Purpose |
|---------------|-----|---------|
| **Desktop 1** | `http://localhost:5173/store/TEST2025` | Main testing |
| **Desktop 2** | `http://localhost:5174/store/TEST2025` | Concurrent sessions |
| **Mobile** | `http://YOUR_IP:5173/store/TEST2025` | Mobile/tablet testing |

**Replace `TEST2025` with your actual invite code**

---

## Quick Test Checklist

### Orders Testing (5 minutes)

```
1. View Products
   ✓ Products display
   ✓ Images load
   ✓ Prices show

2. Add to Cart
   ✓ Click "Add to Cart"
   ✓ Cart badge updates
   ✓ Cart opens

3. Checkout
   ✓ Fill customer details
   ✓ Select payment method
   ✓ Place order
   ✓ Get confirmation

4. Verify
   ✓ Order number received
   ✓ Email sent
   ✓ Order in history
```

### Appointments Testing (3 minutes)

```
1. Navigate to Appointments
   ✓ Click Appointments tab
   ✓ Calendar displays

2. Book Appointment
   ✓ Select date
   ✓ Choose time slot
   ✓ Fill details
   ✓ Submit

3. Verify
   ✓ Confirmation message
   ✓ Email notification
   ✓ Appears in list
```

---

## Test Accounts

| Role | Email | Password | Use For |
|------|-------|----------|---------|
| Owner | owner@teststore.com | Test123! | Managing store |
| Customer | customer@example.com | Test123! | Logged-in orders |
| Guest | (none) | (none) | Guest checkout |

---

## Test Invite Codes

```
TEST2025  - General testing
DEMO2025  - Demo purposes
STORE001  - Alternative store
```

---

## Common Test Scenarios

### Scenario 1: Guest Order
```
1. Open: http://localhost:5173/store/TEST2025
2. Browse products
3. Add 2-3 items to cart
4. Checkout as guest
5. Fill: name, email, phone, address
6. Complete order
```

### Scenario 2: Registered User Order
```
1. Login first
2. Open storefront link
3. Add items to cart
4. Checkout (details pre-filled)
5. Complete order
6. Check order history
```

### Scenario 3: Appointment Booking
```
1. Open storefront
2. Go to Appointments tab
3. Select tomorrow's date
4. Choose 10:00 AM slot
5. Fill details
6. Book appointment
```

### Scenario 4: Multi-Device
```
1. Desktop: Add items to cart
2. Mobile: Open same store link
3. Verify independent carts
4. Complete order on each
```

---

## Quick Commands

### Start Everything
```powershell
cd client
.\test-storefront.ps1
```

### Start Server Only
```bash
cd server
npm run dev
```

### Start Client (Port 5173)
```bash
cd client
npm run dev
```

### Start Client (Port 5174)
```bash
cd client
npm run dev -- --port 5174
```

### Start with Network Access
```bash
cd client
npm run dev -- --host
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| 404 on storefront | Check invite code exists |
| No products | Verify products in database |
| Cart not saving | Check localStorage enabled |
| Checkout fails | Check API endpoint working |
| No appointments | Enable in store settings |

---

## Test Data

### Sample Product
```json
{
  "name": "Test Product",
  "price": 29.99,
  "stock": 50,
  "category": "Electronics"
}
```

### Sample Order
```json
{
  "customer": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+254700000000"
  },
  "items": [
    { "productId": "xxx", "quantity": 2 }
  ]
}
```

### Sample Appointment
```json
{
  "date": "2025-10-20",
  "time": "10:00",
  "type": "Consultation",
  "customer": {
    "name": "Jane Smith",
    "email": "jane@example.com"
  }
}
```

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Page Load | < 2 seconds |
| API Response | < 200ms |
| Checkout | < 5 seconds |
| Concurrent Users | 100+ |

---

## Browser Testing

```
✓ Chrome (Desktop & Mobile)
✓ Firefox
✓ Safari (Desktop & iOS)
✓ Edge
✓ Mobile browsers
```

---

## Device Testing

```
✓ Desktop (1920x1080)
✓ Laptop (1366x768)
✓ Tablet (1024x768)
✓ Mobile (375x667)
```

---

## Quick Validation

**After each test:**
```
[ ] Order appears in dashboard
[ ] Email notification sent
[ ] Payment recorded (if applicable)
[ ] Stock updated
[ ] Customer notified
```

---

## Support

**Documentation:** `STOREFRONT_TESTING_GUIDE.md`
**Issues:** Check browser console
**API Errors:** Check server logs

---

**Last Updated:** October 16, 2025
**Version:** 2.0
