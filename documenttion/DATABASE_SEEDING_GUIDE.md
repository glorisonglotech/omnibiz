# Database Seeding Guide

## Overview
This guide explains how to populate your OmniBiz database with sample data instead of using hardcoded mock data in the frontend.

---

## What Changed

### Removed Mock Data Fallbacks

**Files Updated:**
1. `client/src/pages/dashboard/Search.jsx` - Now shows "No results" instead of mock data
2. `client/src/pages/Store.jsx` - Now shows empty state instead of mock products

**Behavior:**
- ✅ All components now fetch data from the database only
- ✅ If no data exists, users see appropriate empty states
- ✅ Better reflects real application state
- ✅ Encourages proper data management

---

## Using the Database Seed Script

### Prerequisites
- MongoDB installed and running
- Environment variables configured (`.env` file)
- Node.js installed

### Step 1: Configure Environment Variables

Ensure your `.env` file has the MongoDB connection string:

```env
MONGODB_URI=mongodb://localhost:27017/omnibiz
# or for MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/omnibiz
```

### Step 2: Run the Seed Script

```bash
# Navigate to project root
cd c:\Users\Melanie\omnibiz

# Run the seed script
node server/scripts/seedDatabase.js
```

### Step 3: Verify Data

The script will:
1. ✅ Connect to your MongoDB database
2. ✅ Clear existing sample data (optional)
3. ✅ Insert sample products (10 items)
4. ✅ Insert sample orders (4 orders)
5. ✅ Insert sample locations (3 locations)
6. ✅ Display summary of created records

**Expected Output:**
```
🌱 Starting database seeding...
✅ Connected to MongoDB
🗑️  Clearing existing sample data...
📦 Seeding products...
✅ Created 10 products
🛒 Seeding orders...
✅ Created 4 orders
📍 Seeding locations...
✅ Created 3 locations

🎉 Database seeding completed successfully!

📊 Summary:
   - Products: 10
   - Orders: 4
   - Locations: 3

💡 You can now use the application with sample data!
```

---

## Sample Data Included

### Products (10 items)
- **Hair Care:** Premium Shampoo, Styling Gel, Conditioner, Hair Spray
- **Skincare:** Organic Face Mask, Facial Serum
- **Tools:** Professional Hair Dryer, Hair Straightener
- **Makeup:** Makeup Brush Set
- **Nails:** Nail Polish Set

**Features:**
- Realistic product names and descriptions
- SKU codes for inventory tracking
- Various categories
- Stock quantities and reorder levels
- Supplier information
- Pricing from $15.99 to $199.99

### Orders (4 orders)
- Mix of order statuses: Delivered, Processing, Shipped, Pending
- Various payment methods: M-Pesa, Card, Cash on Delivery
- Complete customer information
- Kenyan addresses for realistic context
- Multiple items per order

### Locations (3 locations)
- **Main Store** - Westlands (Retail)
- **Branch Office** - Karen (Office)
- **Warehouse** - Industrial Area (Storage)

**Features:**
- Complete address details
- Operating hours for each day
- Contact information
- Location types

---

## Customizing Sample Data

### Adding More Products

Edit `server/scripts/seedDatabase.js` and add to the `sampleProducts` array:

```javascript
{
  name: 'Your Product Name',
  description: 'Product description',
  sku: 'SKU-001',
  category: 'Category Name',
  price: 29.99,
  stockQuantity: 100,
  reorderLevel: 15,
  supplierName: 'Supplier Name',
  image: 'https://example.com/image.jpg'
}
```

### Adding More Orders

Add to the `sampleOrders` array:

```javascript
{
  customer: {
    name: 'Customer Name',
    email: 'customer@example.com',
    phone: '+254712345678'
  },
  items: [
    { product: 'Product Name', quantity: 1, price: 29.99 }
  ],
  total: 29.99,
  status: 'Processing',
  paymentStatus: 'Paid',
  paymentMethod: 'M-Pesa',
  shippingAddress: {
    street: 'Street Address',
    city: 'City',
    state: 'State',
    zipCode: '00100',
    country: 'Kenya'
  },
  orderDate: new Date()
}
```

### Adding More Locations

Add to the `sampleLocations` array:

```javascript
{
  name: 'Location Name',
  address: 'Street Address',
  city: 'City',
  state: 'State',
  zipCode: '00100',
  country: 'Kenya',
  phone: '+254700000000',
  email: 'location@omnibiz.com',
  type: 'Store', // or 'Office', 'Warehouse'
  isActive: true,
  operatingHours: {
    monday: '9:00 AM - 6:00 PM',
    // ... other days
  }
}
```

---

## Important Notes

### User Association

The seed script associates data with the first admin user it finds:

```javascript
let user = await User.findOne({ role: 'admin' });
```

**If no admin user exists:**
1. Create an admin user first through signup
2. Or uncomment the user creation section in the script
3. Or modify the script to skip user association

### Clearing Existing Data

By default, the script clears sample data before inserting new records:

```javascript
await Product.deleteMany({ sku: { $in: sampleProducts.map(p => p.sku) } });
```

**To preserve existing data:**
- Comment out the deletion lines
- Or modify the filter to be more specific

### Re-running the Script

You can run the script multiple times:
- It will clear previous sample data
- Insert fresh sample data
- Safe to run during development

---

## Verifying Data in Application

### 1. Check Products (Store Page)
```
Navigate to: /store
Expected: See 10 sample products displayed
```

### 2. Check Orders (E-Commerce Dashboard)
```
Navigate to: /dashboard/ecommerce
Expected: See 4 sample orders
```

### 3. Check Search
```
Navigate to: /dashboard/search
Search for: "hair"
Expected: See relevant products in results
```

### 4. Check Locations
```
Navigate to: /dashboard/locations
Expected: See 3 sample locations
```

---

## Troubleshooting

### Error: "Cannot find module"
**Solution:** Ensure you're running from project root and models exist

### Error: "Connection failed"
**Solution:** 
1. Check MongoDB is running
2. Verify MONGODB_URI in `.env`
3. Test connection: `mongosh your-connection-string`

### Error: "No admin user found"
**Solution:**
1. Create admin user via signup
2. Or modify script to skip user check
3. Or create default user in script

### No Data Showing in Application
**Solution:**
1. Verify seed script completed successfully
2. Check database using MongoDB Compass or mongosh
3. Verify API endpoints are working
4. Check browser console for errors

---

## Alternative: Manual Data Entry

If you prefer to add data manually:

### Via API Endpoints (Postman/Insomnia)

**Add Product:**
```http
POST /api/products
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Product Name",
  "sku": "SKU-001",
  "category": "Category",
  "price": 29.99,
  "stockQuantity": 100,
  "reorderLevel": 15,
  "supplierName": "Supplier"
}
```

**Add Order:**
```http
POST /api/orders
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "customer": {
    "name": "Customer Name",
    "email": "customer@example.com"
  },
  "items": [
    { "product": "Product ID", "quantity": 1, "price": 29.99 }
  ],
  "total": 29.99
}
```

### Via Application UI

1. **Products:** Go to E-Commerce Dashboard → Click "Add Product"
2. **Orders:** Create through checkout process
3. **Locations:** Go to Locations → Click "Add Location"

---

## Best Practices

### For Development
- ✅ Use seed script for quick setup
- ✅ Re-run script when testing fresh states
- ✅ Keep seed data realistic

### For Production
- ❌ Don't use seed script in production
- ✅ Use real data entry workflows
- ✅ Import data from existing systems
- ✅ Set up proper data migration

### For Testing
- ✅ Create separate test database
- ✅ Use seed script before each test run
- ✅ Include edge cases in sample data

---

## Next Steps

1. **Run the seed script** to populate your database
2. **Restart your application** to ensure fresh data loading
3. **Test each component** to verify data displays correctly
4. **Add your own data** through the application UI
5. **Backup your database** before making major changes

---

## Summary

✅ **Mock data removed** from frontend components  
✅ **Database seed script created** with realistic sample data  
✅ **10 products, 4 orders, 3 locations** included  
✅ **Easy to customize** for your needs  
✅ **Production-ready** data structure  

**Run this command to get started:**
```bash
node server/scripts/seedDatabase.js
```

---

**For questions or issues, refer to the main project documentation or contact the development team.**
