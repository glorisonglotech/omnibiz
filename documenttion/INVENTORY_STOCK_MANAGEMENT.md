# Inventory & Stock Management System

**Version**: 2.0.0  
**Last Updated**: October 17, 2025  
**Status**: ✅ Complete Auto-Stock Management with Real-Time Updates

---

## 🎯 Overview

The inventory management system has been enhanced with **automatic stock updates**, **real-time status tracking**, and **environment-based configurations** for development and production environments.

---

## ✨ Key Features

### 1. **Automatic Stock Updates After Purchase**
- ✅ Stock automatically deducted when order status is "Paid"
- ✅ Real-time status updates (In Stock → Low Stock → Out of Stock)
- ✅ Socket.IO alerts for low/out of stock items
- ✅ Console logging in development mode

### 2. **Stock Status Management**
Three automatic statuses:
- **In Stock**: `stockQuantity > reorderLevel`
- **Low Stock**: `stockQuantity ≤ reorderLevel` (default: 5)
- **Out of Stock**: `stockQuantity === 0`

### 3. **Real-Time Alerts**
Via Socket.IO events:
- `stock_alert` - When stock becomes low or runs out
- `inventory_updated` - When any stock changes occur
- `product_restocked` - When products are manually restocked

### 4. **Environment-Aware Logging**
- **Development**: Detailed console logs with emojis
- **Production**: Minimal logging for performance

---

## 🔧 How It Works

### Workflow: Purchase → Stock Update

```
Customer Places Order
    ↓
Order Status: "Paid"
    ↓
Order Created/Updated (orderController.js)
    ↓
Triggers: updateStockAfterOrder()
    ↓
For Each Product in Order:
  1. Get current stockQuantity
  2. Deduct quantity sold
  3. Update stockQuantity
  4. Update product status
  5. Save product
  6. Emit Socket.IO alerts
    ↓
Stock Updated ✅
Status Updated ✅
Alerts Sent ✅
```

---

## 📊 Stock Status Logic

### Automatic Status Updates

```javascript
// Function in productController.js & inventoryController.js
const updateProductStatus = (product) => {
  if (product.stockQuantity === 0) {
    product.status = "Out of Stock";
  } else if (product.stockQuantity <= product.reorderLevel) {
    product.status = "Low Stock";
  } else {
    product.status = "In Stock";
  }
  return product;
};
```

### When Status Updates Happen

1. **Product Creation** - Initial status set
2. **Product Update** - Status recalculated on manual stock change
3. **Order Placed (Paid)** - Status recalculated after stock deduction
4. **Product Restocked** - Status updated after adding stock

---

## 🔔 Real-Time Alerts

### Socket.IO Events

#### 1. Stock Alert Event
```javascript
socket.on('stock_alert', (data) => {
  // data.alertType: 'low_stock', 'out_of_stock', 'restocked'
  // data.product: { id, name, sku, stockQuantity, reorderLevel, status }
  // data.timestamp
});
```

**Triggered When**:
- Product goes from normal stock → low stock
- Product goes from any stock → out of stock
- Product is restocked (low/out → normal)

#### 2. Inventory Updated Event
```javascript
socket.on('inventory_updated', (data) => {
  // data.updates: array of stock changes
  // data.orderId: the order that caused the update
  // data.timestamp
});
```

**Triggered When**:
- Any order with "Paid" status is created/updated

#### 3. Product Restocked Event
```javascript
socket.on('product_restocked', (data) => {
  // data.product: { id, name, oldStock, newStock, added }
  // data.note
  // data.timestamp
});
```

**Triggered When**:
- Manual restock via `/api/inventory/restock`

---

## 🛠️ API Endpoints

### Inventory Management

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/inventory/summary` | GET | Get comprehensive inventory report |
| `/api/inventory/movements` | GET | View stock movement history |
| `/api/inventory/restock` | POST | Manually restock a product |

### Product Management

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/products` | GET | Get all products |
| `/api/products` | POST | Create product (auto-status) |
| `/api/products/:id` | PUT | Update product (auto-status) |
| `/api/products/:id` | DELETE | Delete product |

### Orders (Auto-Stock Update)

| Endpoint | Method | Stock Update Trigger |
|----------|--------|---------------------|
| `/api/orders` | POST | If status = "Paid" |
| `/api/orders/:id` | PUT | If status changes to "Paid" |

---

## 📝 Code Examples

### 1. Create Product with Stock
```javascript
POST /api/products
{
  "name": "Premium Shampoo",
  "category": "Hair Care",
  "price": 25.99,
  "stockQuantity": 50,
  "reorderLevel": 10,
  "supplierName": "Beauty Co"
}

// Response includes auto-calculated status
{
  "_id": "...",
  "name": "Premium Shampoo",
  "stockQuantity": 50,
  "reorderLevel": 10,
  "status": "In Stock",  // ✅ Auto-calculated
  ...
}
```

### 2. Place Order (Auto Stock Deduction)
```javascript
POST /api/orders
{
  "status": "Paid",
  "items": [
    {
      "productId": "product_id_here",
      "name": "Premium Shampoo",
      "quantity": 5,
      "price": 25.99
    }
  ],
  "total": 129.95
}

// System automatically:
// 1. Deducts 5 from stockQuantity (50 → 45)
// 2. Updates status if needed
// 3. Emits Socket.IO events
// 4. Logs in development mode:
//    "📦 Stock Updated: Premium Shampoo | 50 → 45 | Status: In Stock"
```

### 3. Manual Restock
```javascript
POST /api/inventory/restock
{
  "productId": "product_id_here",
  "quantity": 20,
  "note": "Weekly supply"
}

// Response
{
  "message": "Product restocked successfully",
  "product": {
    "id": "...",
    "name": "Premium Shampoo",
    "oldStock": 45,
    "newStock": 65,
    "quantityAdded": 20
  }
}
```

### 4. Get Inventory Summary
```javascript
GET /api/inventory/summary

// Response includes comprehensive data
{
  "overview": {
    "totalProducts": 50,
    "totalStock": 2450,
    "lowStockCount": 5,
    "outOfStockCount": 2,
    "totalProductsSold": 342,
    "totalRevenue": 12450.50
  },
  "products": [...],
  "topSelling": [...],
  "topRevenue": [...],
  "lowStockProducts": [...],
  "outOfStockProducts": [...]
}
```

---

## 🔧 Environment Configuration

### Required Environment Variables

```env
# MongoDB
MONGO_URI=mongodb://localhost:27017/omnibiz

# Node Environment (affects logging verbosity)
NODE_ENV=development  # or 'production'

# Gemini AI (for AI features)
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-pro
GEMINI_TEMPERATURE=0.7
GEMINI_MAX_TOKENS=2048
```

### Development vs Production Behavior

#### Development Mode (`NODE_ENV=development`)
```javascript
// Detailed console logging:
console.log('📦 Stock Updated: Product Name | 50 → 45 | Status: In Stock');
console.log('✅ Inventory updated: 3 products affected');
console.log('⚠️  Stock alerts: low_stock: Product A, out_of_stock: Product B');
console.log('📢 Stock Alert [low_stock]: Product C - Stock: 4');
```

#### Production Mode (`NODE_ENV=production`)
```javascript
// Minimal logging (performance optimized)
// Only errors are logged
```

---

## 🎨 Client-Side Integration

### Listen for Stock Alerts
```javascript
import { useSocket } from '@/context/SocketContext';

const { socket } = useSocket();

useEffect(() => {
  socket.on('stock_alert', (data) => {
    if (data.alertType === 'out_of_stock') {
      toast.error(`${data.product.name} is now out of stock!`);
    } else if (data.alertType === 'low_stock') {
      toast.warning(`${data.product.name} is running low (${data.product.stockQuantity} left)`);
    }
  });

  socket.on('inventory_updated', (data) => {
    // Refresh product list
    fetchProducts();
  });

  return () => {
    socket.off('stock_alert');
    socket.off('inventory_updated');
  };
}, [socket]);
```

### Display Stock Status
```javascript
const getStockBadgeColor = (product) => {
  if (product.status === 'Out of Stock') return 'destructive';
  if (product.status === 'Low Stock') return 'warning';
  return 'default';
};

<Badge variant={getStockBadgeColor(product)}>
  {product.status}
</Badge>
```

---

## 📈 Stock Movement Tracking

### Get Movement History
```javascript
GET /api/inventory/movements?productId=xxx&limit=50

// Response
[
  {
    "orderId": "...",
    "orderNumber": "ORD-123",
    "productId": "...",
    "productName": "Premium Shampoo",
    "quantity": 5,
    "type": "sale",
    "date": "2025-10-17T...",
    "status": "Paid"
  },
  ...
]
```

---

## 🚨 Important Notes

### Stock Deduction Triggers

**Stock IS deducted when**:
- ✅ Order created with `status: "Paid"`
- ✅ Order updated from any status → `"Paid"`

**Stock is NOT deducted when**:
- ❌ Order created with `status: "Pending"`
- ❌ Order created with `status: "Cancelled"`
- ❌ Order deleted

### Preventing Negative Stock
```javascript
const newStock = Math.max(0, oldStock - quantitySold);
```
Stock can never go below 0.

### Product Status Field
The `status` field in the Product model is:
- Automatically calculated
- Should NOT be manually set (will be overridden)
- Based solely on `stockQuantity` and `reorderLevel`

---

## 🐛 Troubleshooting

### Stock Not Updating After Order

**Check**:
1. Order status is "Paid"
2. Order items have valid `productId`
3. Server console shows stock update logs (development)
4. No errors in console

**Fix**:
```javascript
// Verify order structure
{
  "status": "Paid",  // ✅ Must be "Paid"
  "items": [
    {
      "productId": "valid_id_here",  // ✅ Must exist
      "quantity": 5  // ✅ Must be > 0
    }
  ]
}
```

### Status Not Updating

**Cause**: Manual status override

**Fix**: Don't set `status` manually. It's auto-calculated based on:
```javascript
stockQuantity vs reorderLevel
```

### No Socket.IO Alerts

**Check**:
1. Socket.IO server running
2. Client connected to socket
3. User joined correct room (`user_${userId}`)

**Fix**:
```javascript
// Client should connect and join room
const socket = io(SOCKET_URL);
socket.emit('join_room', `user_${userId}`);
```

---

## ✅ Testing Checklist

- [ ] Create product with stock (status auto-set)
- [ ] Update product stock manually (status updates)
- [ ] Place order with "Paid" status (stock deducts)
- [ ] Verify stock deduction in database
- [ ] Check product status updated correctly
- [ ] Confirm Socket.IO events emitted
- [ ] Test low stock alert (quantity ≤ reorderLevel)
- [ ] Test out of stock alert (quantity = 0)
- [ ] Test manual restock function
- [ ] Verify inventory summary endpoint
- [ ] Check stock movement history
- [ ] Test in development (detailed logs)
- [ ] Test in production (minimal logs)

---

## 🎯 Best Practices

### 1. Set Appropriate Reorder Levels
```javascript
{
  "name": "Fast-moving product",
  "stockQuantity": 100,
  "reorderLevel": 20  // 20% of stock
}
```

### 2. Monitor Low Stock Alerts
```javascript
// Set up email notifications for low stock
socket.on('stock_alert', async (data) => {
  if (data.alertType === 'low_stock') {
    await sendEmailToAdmin({
      subject: `Low Stock Alert: ${data.product.name}`,
      body: `Only ${data.product.stockQuantity} units left`
    });
  }
});
```

### 3. Regular Stock Audits
```javascript
// Weekly inventory check
GET /api/inventory/summary

// Review:
// - outOfStockProducts
// - lowStockProducts
// - turnoverRate
```

### 4. Use Stock Movement History
```javascript
// Analyze sales patterns
GET /api/inventory/movements?startDate=2025-10-01&endDate=2025-10-17

// Identify:
// - Best-selling products
// - Slow-moving inventory
// - Seasonal trends
```

---

## 📚 Related Files

- `server/controllers/productController.js` - Product CRUD with auto-status
- `server/controllers/inventoryController.js` - Stock management
- `server/controllers/orderController.js` - Auto stock deduction
- `server/models/product.js` - Product schema
- `server/models/order.js` - Order schema

---

## 🎉 Summary

### What Was Implemented

✅ **Automatic Stock Deduction**: When orders are paid  
✅ **Auto Status Updates**: Based on stock levels  
✅ **Real-Time Alerts**: Via Socket.IO  
✅ **Movement Tracking**: Full audit trail  
✅ **Environment Awareness**: Dev vs prod logging  
✅ **Stock Validation**: Prevents negative stock  
✅ **Comprehensive API**: Full inventory management  

### Stock Lifecycle

```
Product Created (with initial stock)
    ↓
Status Auto-Set (In Stock/Low/Out)
    ↓
Order Placed (Paid)
    ↓
Stock Deducted Automatically
    ↓
Status Updated Automatically
    ↓
Alerts Sent (if low/out)
    ↓
Admin Restocks (manual)
    ↓
Status Updated
    ↓
Restock Alert Sent
```

**The inventory system is now fully automated and production-ready!** 🚀

---

**Environment**: `NODE_ENV=development` recommended for setup/testing  
**Production**: Set `NODE_ENV=production` for deployment
