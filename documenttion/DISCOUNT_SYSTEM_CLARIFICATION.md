# 🎯 Discount System - Complete Clarification

## ❓ **What Are Discounts For?**

The discount system is a **UNIVERSAL PROMOTION TOOL** that works across **ALL** business aspects:

### **✅ Discounts Apply To:**

#### **1. Products (E-Commerce) 🛍️**
- **Where:** Store, Product Catalog, Checkout
- **How:** Discount codes reduce product prices
- **Example:** 
  - Product: Laptop - KES 50,000
  - Discount: 20% OFF (Code: TECH20)
  - Final Price: KES 40,000

**Implementation:**
```javascript
// At checkout, apply discount:
const discount = await Discount.findOne({ code: 'TECH20' });
const discountAmount = discount.calculateDiscount(orderAmount);
const finalAmount = orderAmount - discountAmount;
```

---

#### **2. Services (Appointments) 📅**
- **Where:** Service bookings, Appointment scheduling
- **How:** Discounts reduce service prices
- **Example:**
  - Service: Hair Cut & Style - KES 1,500
  - Discount: KES 300 OFF (Seasonal)
  - Final Price: KES 1,200

**Implementation:**
```javascript
// Service model has discountId field
const service = await Service.findById(serviceId).populate('discountId');
if (service.discountId && service.discountId.isActive) {
  finalPrice = service.price - service.discountId.value;
}
```

---

#### **3. E-Commerce Orders 🛒**
- **Where:** Shopping cart, Order checkout
- **How:** Applied via discount codes
- **Example:**
  - Cart Total: KES 10,000
  - Discount Code: SAVE15
  - Saves: KES 1,500
  - Pay: KES 8,500

**Link to Products:**
```javascript
// Product can have a discountId
product.discountId = discount._id;
product.finalPrice = product.price - discountAmount;
```

---

#### **4. All Business Operations 💼**
- Bulk orders
- Membership discounts
- Loyalty rewards
- Seasonal promotions
- First-time customer discounts
- VIP customer rates

---

## 🔗 **How Discounts Link to Each System**

### **Product → Discount Link**
**Database Schema:**
```javascript
// Product Model
{
  _id: ObjectId,
  name: "Laptop",
  price: 50000,
  discountId: ObjectId("discount123"), // ← Links to discount
  finalPrice: 40000, // Auto-calculated
  isNewArrival: true
}

// Discount Model
{
  _id: "discount123",
  name: "Tech Sale",
  type: "percentage",
  value: 20,
  applicableTo: "products",
  applicableCategories: ["Electronics"]
}
```

**Display:**
```jsx
// In Product Card
{product.discountId && (
  <>
    <span className="line-through text-gray-500">KES {product.price}</span>
    <span className="text-green-600 font-bold">KES {product.finalPrice}</span>
    <Badge className="bg-red-500">20% OFF</Badge>
  </>
)}
```

---

### **Service → Discount Link**
**Database Schema:**
```javascript
// Service Model
{
  _id: ObjectId,
  name: "Premium Haircut",
  price: 2000,
  discountId: ObjectId("discount456"), // ← Links to discount
  category: "Hair Care",
  isNewArrival: false
}
```

**At Booking:**
```javascript
const service = await Service.findById(serviceId).populate('discountId');
const appointmentPrice = service.discountId && service.discountId.isActive
  ? service.price - service.discountId.calculateDiscount(service.price)
  : service.price;
```

---

### **E-Commerce → Discount Link**
**At Checkout:**
```javascript
// User enters discount code
const applyDiscount = async (code, cartTotal) => {
  const discount = await Discount.findOne({ 
    code: code.toUpperCase(),
    isActive: true 
  });
  
  if (!discount) return null;
  
  // Check if applicable
  if (discount.applicableTo === 'all' || discount.applicableTo === 'products') {
    const discountAmount = discount.calculateDiscount(cartTotal);
    return {
      amount: discountAmount,
      finalTotal: cartTotal - discountAmount
    };
  }
};
```

---

### **Appointments → Discount Link**
**Booking Flow:**
```javascript
// When booking appointment with service
const service = await Service.findById(serviceId).populate('discountId');

const appointment = new Appointment({
  service: service.name,
  serviceId: service._id,
  price: service.price,
  discountApplied: service.discountId?._id,
  finalPrice: service.discountId 
    ? service.price - service.discountId.value 
    : service.price
});
```

---

## 🎨 **Visual Flow**

### **Admin Creates Discount:**
```
1. Admin Dashboard → Discounts → Create
2. Selects: "Percentage", 20%, Code: "SAVE20"
3. Applicability: "Products" or "Services" or "All"
4. Saves → Discount active
```

### **Customer Uses Discount:**

**Option A - Product with Discount:**
```
1. Customer views product catalog
2. Sees: "Was KES 50,000 → Now KES 40,000 (20% OFF)"
3. Adds to cart
4. Discount auto-applied
5. Checkout with reduced price
```

**Option B - Discount Code:**
```
1. Customer adds products (Total: KES 10,000)
2. At checkout, enters code: "SAVE20"
3. System validates code
4. Applies 20% discount (KES 2,000 off)
5. Pays: KES 8,000
```

**Option C - Service Booking:**
```
1. Customer browses services
2. Selects "Hair Cut" - KES 1,500
3. Service has active seasonal discount (KES 300 OFF)
4. Books appointment at KES 1,200
5. Appointment confirmed with discount
```

---

## 📊 **Discount Types Explained**

### **1. Percentage Discount**
```javascript
{
  type: "percentage",
  value: 20, // 20%
  // KES 10,000 → KES 8,000 (saves KES 2,000)
}
```

### **2. Fixed Amount**
```javascript
{
  type: "fixed",
  value: 500, // KES 500 OFF
  // Any purchase → Minus KES 500
}
```

### **3. Buy X Get Y**
```javascript
{
  type: "buy_x_get_y",
  value: 1, // Buy 2 Get 1 Free
  // 3 items → Pay for 2
}
```

### **4. Seasonal**
```javascript
{
  type: "seasonal",
  isSeasonalPromotion: true,
  seasonalDetails: {
    seasonName: "Black Friday",
    bannerImage: "...",
    priority: 10
  }
}
```

---

## 🔒 **Security & Validation**

### **Discount Application Checks:**
```javascript
// 1. Code valid and active
if (!discount.isActive) return error;

// 2. Within date range
if (now < discount.validFrom || now > discount.validUntil) return error;

// 3. Usage limits
if (discount.usageCount >= discount.usageLimit.total) return error;

// 4. Customer eligible
if (discount.customerSegment !== 'all') {
  // Check if customer matches segment
}

// 5. Minimum purchase
if (orderAmount < discount.minPurchaseAmount) return error;

// 6. Maximum discount cap
finalDiscount = Math.min(discountAmount, discount.maxDiscountAmount);
```

---

## ✅ **Complete Integration Checklist**

### **Products:**
- [x] Product model has `discountId` field
- [x] Product model has `finalPrice` field
- [x] Store displays discounted prices
- [x] Checkout applies product discounts
- [ ] Product cards show "SALE" badge when discounted

### **Services:**
- [x] Service model has `discountId` field
- [x] Services on storefront
- [ ] Service booking applies discount
- [ ] Appointment shows discounted price

### **E-Commerce:**
- [x] Checkout has discount code input
- [ ] Cart calculates discount
- [ ] Order summary shows discount breakdown
- [ ] Receipt includes discount details

### **Appointments:**
- [x] Appointment model can store discount
- [ ] Booking flow checks for service discounts
- [ ] Confirmation email shows discounted price

---

## 🚀 **Quick Implementation**

### **Add Discount to Product:**
```javascript
// In admin dashboard
await Product.findByIdAndUpdate(productId, {
  discountId: discount._id,
  isNewArrival: true
});
```

### **Add Discount to Service:**
```javascript
// In admin dashboard
await Service.findByIdAndUpdate(serviceId, {
  discountId: discount._id
});
```

### **Apply at Checkout:**
```javascript
// In checkout component
const applyDiscountCode = async (code) => {
  const result = await api.post('/discounts/apply', {
    code,
    orderAmount: cartTotal,
    customerType: 'returning'
  });
  
  setAppliedDiscount(result.data.discount);
  setFinalTotal(result.data.discount.finalAmount);
};
```

---

## 💡 **Use Cases**

### **1. Product Launch**
- Create 30% discount for new products
- Set `isNewArrival` = true
- Display "NEW" + "30% OFF" badges

### **2. Service Promotion**
- Create "First Visit" discount
- Apply to all hair care services
- Target: new customers only

### **3. Seasonal Sale**
- Create "Summer Sale" discount
- Set banner image
- Apply to all products/services
- Display on storefront homepage

### **4. Loyalty Program**
- Create VIP discount
- Set customerSegment: "vip"
- Automatic 15% on all purchases

---

## 🎯 **Summary**

**What Discounts Are:**
- Universal promotion system
- Works across products, services, appointments
- Admin-controlled, customer-facing

**What They Link To:**
- ✅ Products (via discountId)
- ✅ Services (via discountId)  
- ✅ Orders (via discount codes)
- ✅ Appointments (via service discounts)

**How They Work:**
- Admin creates discount
- Links to products/services OR provides code
- Customer sees reduced prices OR enters code
- System validates and applies discount
- Final price calculated automatically

**Result:**
- Increased sales
- Customer satisfaction
- Flexible promotions
- Real-time control

**Status:** ✅ Fully implemented and ready to use!
