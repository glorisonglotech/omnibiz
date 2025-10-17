# 🧪 Test Financial System - Quick Guide

## 🚀 Quick Start

### 1. Restart Server (Required for new models)
```bash
cd server
npm start
```

### 2. Start Client
```bash
cd client
pnpm run dev
```

### 3. Login to Application
- Go to http://localhost:5173
- Login with your credentials

### 4. Navigate to Financial Management
- Dashboard → Financial Management
- You'll see the new **Wallet Dashboard** at the top

---

## ✅ Test Checklist

### Test 1: Wallet Creation (Auto-creates)
- [ ] Open Financial Management page
- [ ] Wallet dashboard appears with KES 0 balance
- [ ] Daily limit shows: KES 100,000
- [ ] "Live" badge appears (green)

### Test 2: M-Pesa STK Push
- [ ] Enter amount: `100`
- [ ] Leave phone blank (uses your registered phone)
- [ ] Click "Pay" button
- [ ] Check your phone for M-Pesa prompt
- [ ] Enter M-Pesa PIN
- [ ] See success notification
- [ ] Balance updates automatically
- [ ] Transaction appears in history

### Test 3: Manual Deposit
- [ ] Click "Deposit" button
- [ ] Enter amount: `1000`
- [ ] Click "Deposit"
- [ ] Balance increases immediately
- [ ] See toast notification

### Test 4: Real-Time Updates
- [ ] Open browser console (F12)
- [ ] Watch for socket events:
  ```javascript
  💰 Wallet updated: {...}
  ✅ Payment successful: {...}
  ```
- [ ] Balance updates without page refresh
- [ ] Notifications appear automatically

### Test 5: Check Transaction History
- [ ] Scroll down to "Recent Transactions"
- [ ] See wallet deposits/payments
- [ ] Each has proper description
- [ ] Amounts are correct

### Test 6: Verify Graphs Update
- [ ] Check "Revenue vs Expenses" graph
- [ ] Should show real data
- [ ] Auto-refreshes every 2 minutes
- [ ] "Live Data" badge visible

---

## 🎯 Expected Results

### On M-Pesa Payment Success:
```
✅ Toast: "Payment successful! Receipt: ABC123"
✅ Balance updates from KES 0 → KES 100
✅ Transaction added to history
✅ Graph data refreshes
✅ Financial summary updates
```

### On Any Wallet Transaction:
```
✅ Real-time balance update
✅ Socket event received
✅ UI updates immediately
✅ No page refresh needed
✅ Toast notification shown
```

---

## 📱 Test M-Pesa with Your Phone

### Requirements:
- ✅ Your phone number in user profile
- ✅ M-Pesa app installed
- ✅ Sufficient M-Pesa balance
- ✅ Ngrok running (for callbacks)

### Steps:
1. **Initiate STK Push**
   ```javascript
   Amount: 10-100 KES (test amount)
   Phone: Leave blank (auto-uses your phone)
   ```

2. **On Your Phone**
   ```
   → M-Pesa prompt appears
   → Shows: "Pay KES 100 to 174379"
   → Enter M-Pesa PIN
   → Confirm
   ```

3. **In Browser**
   ```
   → "Check your phone..." notification
   → Wait 5-10 seconds
   → "Payment successful!" notification
   → Balance updates automatically
   ```

---

## 🐛 Debugging

### Check Socket Connection:
```javascript
// In browser console
console.log('Socket connected:', socket.connected);

// Listen to all events
socket.onAny((event, data) => {
  console.log('Socket event:', event, data);
});
```

### Check Wallet API:
```javascript
// In browser console
fetch('http://localhost:5000/api/wallet', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(r => r.json())
.then(console.log);
```

### Check M-Pesa Status:
```bash
# Check server logs
# Look for:
✅ M-Pesa payment successful. Wallet credited: 100
📱 STK Push Response: {...}
💰 Wallet updated
```

---

## 📊 Database Verification

### Check Wallet in MongoDB:
```javascript
// MongoDB shell
use omnibiz
db.wallets.find().pretty()
```

**Expected:**
```json
{
  "userId": ObjectId("..."),
  "balance": 100,
  "currency": "KES",
  "dailyLimit": 100000,
  "todaySpent": 0,
  "totalDeposits": 100,
  "totalTransactions": 1,
  "isActive": true
}
```

### Check Transactions:
```javascript
db.transactions.find({ category: "mpesa_payment" }).pretty()
```

---

## 🎬 Demo Flow

### Complete Payment Flow:
```
1. User opens Financial Management
   ↓
2. Sees Wallet Dashboard (KES 0)
   ↓
3. Enters 100 in M-Pesa amount
   ↓
4. Clicks "Pay"
   ↓
5. Toast: "Check your phone for M-Pesa prompt"
   ↓
6. Phone receives STK push
   ↓
7. User enters M-Pesa PIN
   ↓
8. Payment processes
   ↓
9. Server receives callback
   ↓
10. Wallet credited (KES 0 → KES 100)
    ↓
11. Socket event emitted
    ↓
12. UI updates automatically
    ↓
13. Toast: "Payment successful! Receipt: ABC123"
    ↓
14. Transaction appears in history
    ↓
15. Graphs update with new data
```

---

## 🔥 Advanced Testing

### Test Multiple Payments:
```javascript
// Pay 100 KES
→ Balance: 100

// Pay 200 KES
→ Balance: 300

// Pay 500 KES
→ Balance: 800
```

### Test Concurrent Users:
- Open two browser windows
- Login as different users
- Make payments
- Each wallet updates independently

### Test Real-Time Sync:
- Make payment from API
- Watch UI update automatically
- No refresh needed

### Test Transaction Limits:
- Try to pay more than daily limit
- Should show error
- Check limit enforcement

---

## 📝 What to Observe

### In Browser:
- ✅ Wallet balance (top of page)
- ✅ Green "Live" badge
- ✅ Transaction notifications
- ✅ Smooth animations
- ✅ No page refreshes needed

### In Console:
- ✅ Socket events logging
- ✅ API responses
- ✅ No errors

### In Server Logs:
- ✅ "M-Pesa payment successful"
- ✅ "Wallet credited"
- ✅ STK Push responses
- ✅ Socket emissions

---

## ✨ Success Indicators

### You'll Know It Works When:
1. ✅ Balance shows KES 0 initially
2. ✅ M-Pesa prompt appears on phone
3. ✅ Payment confirmation received
4. ✅ Balance updates automatically (no refresh)
5. ✅ Success notification appears
6. ✅ Transaction in history
7. ✅ Graphs show updated data

---

## 🎯 Key Features to Test

### Real User Data:
- ✅ Uses your actual phone number
- ✅ Shows your name in confirmations
- ✅ Personalized messages

### Real-Time Updates:
- ✅ Balance changes instantly
- ✅ No page refresh needed
- ✅ Socket events working
- ✅ Live badge shows green

### Payment Integration:
- ✅ M-Pesa STK Push functional
- ✅ Wallet credits automatically
- ✅ Transaction history tracked
- ✅ Receipt numbers captured

### Financial Tracking:
- ✅ All payments logged
- ✅ Graphs update with real data
- ✅ Summary cards accurate
- ✅ Auto-refresh every 2 minutes

---

## 🚨 Common Issues & Fixes

### Issue: "Check your phone" but no prompt
**Fix:**
- Verify phone number in user profile
- Check Ngrok URL in .env
- Restart server
- Try with actual phone number in field

### Issue: Payment successful but balance not updating
**Fix:**
- Check Socket.IO connection (green badge)
- Refresh page once
- Check browser console for errors
- Verify callback reached server

### Issue: "Failed to initiate payment"
**Fix:**
- Check Safaricom credentials in .env
- Verify Ngrok is running
- Check server logs for detailed error
- Ensure MongoDB is running

---

## 🎊 You're Ready!

Everything is set up and ready to test. The financial system now has:

✅ Real wallet with database tracking  
✅ M-Pesa payments with real user data  
✅ Real-time balance updates  
✅ Automatic transaction logging  
✅ Socket.IO live updates  
✅ Enhanced graphs with real data  
✅ Professional payment experience  

**Start testing and enjoy your enhanced financial management system!** 🚀

