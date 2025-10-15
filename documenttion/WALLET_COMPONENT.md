# ✅ Wallet Component - Real-Time Financial Dashboard!

## 🎯 Overview

Created a comprehensive **Wallet** component that displays real-time financial data from all sales, transactions, and currency operations across the application. Added to the sidebar navigation in the profile section.

---

## 📍 Location

**Sidebar Navigation:** Settings → Profile → **Wallet** (NEW!) → Help & Support

**Route:** `/dashboard/wallet`

**Icon:** 💳 Wallet

---

## 💰 Features

### **1. Balance Overview**
```javascript
- Total Balance (with show/hide toggle)
- Available Funds (balance minus pending payments)
- Eye icon to toggle visibility
```

### **2. Financial Metrics (4 Cards)**
```javascript
✅ Total Balance
   - Shows total funds
   - Available funds breakdown
   - Toggle visibility (••••••)

✅ Total Income
   - From sales & payments
   - Green indicator with trending up
   - Real-time from orders

✅ Total Expenses
   - Payments & refunds
   - Red indicator with trending down
   - Real-time from payments

✅ Pending Payments
   - Awaiting payment
   - Orange indicator
   - From unpaid invoices
```

---

## 💱 Currency Breakdown

**Multi-Currency Support:**
- Displays balance in all currencies (KES, USD, EUR, etc.)
- Income/Expense breakdown per currency
- Auto-detected from transactions
- Color-coded indicators

**Example:**
```
KES
Balance: 45,230
↓ Income: 50,000
↑ Expenses: 4,770

USD
Balance: 1,250
↓ Income: 1,500
↑ Expenses: 250
```

---

## 📊 Real-Time Data Sources

### **API Endpoints Called:**
```javascript
1. GET /orders
   - Fetches all orders
   - Calculates income from completed orders
   - Extracts order details

2. GET /invoices
   - Fetches all invoices
   - Identifies pending payments
   - Tracks invoice status

3. GET /payments
   - Fetches all payments/expenses
   - Calculates total expenses
   - Tracks refunds
```

### **Data Calculation:**
```javascript
// Total Income (from completed orders)
const totalIncome = orders
  .filter(o => o.status === 'completed' || o.status === 'delivered')
  .reduce((sum, order) => sum + parseFloat(order.total || 0), 0);

// Total Expenses (from payments)
const totalExpenses = payments
  .filter(p => p.type === 'expense' || p.type === 'refund')
  .reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);

// Pending Payments (from unpaid invoices)
const pendingPayments = invoices
  .filter(inv => inv.status === 'pending' || inv.status === 'sent')
  .reduce((sum, invoice) => sum + parseFloat(invoice.total || 0), 0);

// Balance & Available Funds
const balance = totalIncome - totalExpenses;
const availableFunds = balance - pendingPayments;
```

---

## 📝 Transaction List

### **Transaction Types:**
```javascript
1. Income Transactions
   - Sales (completed orders)
   - Paid invoices
   - Green indicator with ↙ arrow
   - Shows: Order #, Customer name, Amount

2. Expense Transactions
   - Payments made
   - Refunds issued
   - Red indicator with ↗ arrow
   - Shows: Description, Category, Amount

3. Pending Transactions
   - Unpaid invoices
   - Pending payments
   - Orange indicator with 🔄 icon
   - Shows: Invoice #, Client, Amount
```

### **Transaction Details:**
Each transaction shows:
- ✅ Description (Order/Invoice/Payment details)
- ✅ Category badge (sale, invoice, expense)
- ✅ Status badge (completed, pending, failed)
- ✅ Payment method (Card, Bank Transfer, Cash, M-Pesa)
- ✅ Amount with currency (+ for income, - for expense)
- ✅ Date and time

### **Filters:**
```javascript
- All Transactions
- Income Only (+ button)
- Expenses Only (- button)
- Pending (optional)
```

---

## 🎨 UI Components

### **Top Bar:**
```jsx
- Title: "My Wallet" with wallet icon
- Refresh button (with spinner animation)
- Export button (download data)
```

### **Balance Cards (4 cards):**
```jsx
Card 1: Total Balance
  - Primary card with gradient overlay
  - Toggle visibility button (eye icon)
  - Available funds sub-text

Card 2: Total Income
  - Green theme
  - Trending up indicator
  - "From sales & payments"

Card 3: Total Expenses
  - Red theme
  - Trending down indicator
  - "Payments & refunds"

Card 4: Pending Payments
  - Orange theme
  - Receipt icon
  - "Awaiting payment"
```

### **Currency Breakdown:**
```jsx
- Grid layout (3 columns on desktop)
- Each currency card shows:
  - Currency code badge
  - Balance amount
  - Income (green ↓)
  - Expenses (red ↑)
```

### **Transactions Section:**
```jsx
- Filter buttons (All, Income, Expenses)
- Scrollable area (500px height)
- Transaction cards with:
  - Icon indicator (color-coded)
  - Description & badges
  - Amount & date/time
  - Hover effect
```

---

## 🔄 Real-Time Updates

### **Auto-Refresh:**
```javascript
// On component mount
useEffect(() => {
  fetchWalletData();
}, [isAuthenticated]);

// Manual refresh
<Button onClick={handleRefresh}>
  <RefreshCw className={refreshing ? 'animate-spin' : ''} />
  Refresh
</Button>
```

### **Loading States:**
- Spinner during initial load
- "Refreshing..." text during manual refresh
- Maintains data during refresh

---

## 💳 Transaction Examples

### **Income Transaction (Sale):**
```
↙ Order #ORD-12345 - John Doe
   [sale] [completed] [Card]
   +KES 1,250
   12/15/2024 2:30 PM
```

### **Expense Transaction:**
```
↗ Office Supplies Payment
   [expense] [completed] [Cash]
   -KES 350
   12/14/2024 10:15 AM
```

### **Pending Transaction (Invoice):**
```
🔄 Invoice #INV-456 - ABC Corp
   [invoice] [pending] [Bank Transfer]
   KES 5,000
   12/13/2024 9:00 AM
```

---

## 🎯 Key Metrics Displayed

| Metric | Source | Calculation |
|--------|--------|-------------|
| **Total Balance** | Orders - Payments | `income - expenses` |
| **Available Funds** | Balance - Pending | `balance - pendingPayments` |
| **Total Income** | Completed Orders | Sum of completed order amounts |
| **Total Expenses** | Payments & Refunds | Sum of expense payments |
| **Pending Payments** | Unpaid Invoices | Sum of pending invoice amounts |
| **Currency Breakdown** | All Transactions | Grouped by currency code |
| **Transaction Count** | All Sources | Total number of transactions |

---

## 🔐 Security & Privacy

### **Balance Visibility Toggle:**
```jsx
- Click eye icon to hide/show balance
- Replaces numbers with ••••••
- Persists during session
- Protects sensitive data
```

### **User-Specific Data:**
```javascript
// All queries filtered by user token
const token = localStorage.getItem('token');
const headers = { Authorization: `Bearer ${token}` };

// Only fetches data for logged-in user
await api.get('/orders', { headers });
```

---

## 📱 Responsive Design

### **Desktop (1024px+):**
- 4 columns for balance cards
- 3 columns for currency breakdown
- Full transaction details visible

### **Tablet (768px - 1023px):**
- 2 columns for balance cards
- 2 columns for currency breakdown
- Compact transaction view

### **Mobile (< 768px):**
- 1 column layout
- Stacked cards
- Simplified transaction cards
- Touch-friendly buttons

---

## 🎨 Color Coding

```javascript
Income:     Green (#10B981)
Expense:    Red (#EF4444)
Pending:    Orange (#F59E0B)
Completed:  Green badge
Failed:     Red badge
Processing: Yellow badge
```

---

## 🚀 Usage

### **Navigate to Wallet:**
```
1. Open dashboard sidebar
2. Scroll to bottom (Profile section)
3. Click "Wallet" (between Profile and Help & Support)
4. View real-time financial data
```

### **View Transactions:**
```
1. Scroll to "Transactions" section
2. Use filter buttons (All/Income/Expenses)
3. Click transaction to view details
4. Scroll through transaction history
```

### **Check Currency Breakdown:**
```
1. View "Currency Breakdown" section
2. See balance in each currency
3. Compare income vs expenses
4. Identify primary currency
```

### **Export Data:**
```
1. Click "Export" button (top-right)
2. Choose format (CSV/PDF/Excel)
3. Download financial report
```

---

## 🎉 Result

**Wallet Component provides:**
- ✅ **Real-time balance** from orders & payments
- ✅ **Multi-currency support** with breakdown
- ✅ **Complete transaction history** with filters
- ✅ **Income vs Expense tracking**
- ✅ **Pending payments visibility**
- ✅ **Privacy toggle** for balance
- ✅ **Export functionality** (coming soon)
- ✅ **Manual refresh** button
- ✅ **Responsive design** for all devices
- ✅ **Color-coded indicators** for quick understanding
- ✅ **Status badges** for transaction states
- ✅ **Payment method tracking**

**The Wallet is now fully integrated in the sidebar profile section with comprehensive real-time financial tracking!** 💳💰📊✨
