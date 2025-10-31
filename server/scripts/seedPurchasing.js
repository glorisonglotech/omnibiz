require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/user');
const Supplier = require('../models/supplier');
const PurchaseOrder = require('../models/purchaseOrder');

const seedPurchasing = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/ominbiz';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Get the user (devtechs842@gmail.com)
    const user = await User.findOne({ email: 'devtechs842@gmail.com' });
    if (!user) {
      console.error('❌ User not found');
      process.exit(1);
    }

    console.log(`✅ Found user: ${user.email}`);

    // Create sample suppliers
    const suppliers = [
      {
        userId: user._id,
        name: 'Global Tech Supplies Ltd',
        contact: 'John Kamau',
        email: 'sales@globaltechsupplies.co.ke',
        phone: '+254712345678',
        address: {
          street: 'Mombasa Road',
          city: 'Nairobi',
          state: 'Nairobi County',
          zipCode: '00100',
          country: 'Kenya'
        },
        category: 'Equipment',
        paymentTerms: 'Net 30',
        rating: 4.5,
        status: 'active',
        notes: 'Reliable supplier for tech equipment'
      },
      {
        userId: user._id,
        name: 'Office Essentials Kenya',
        contact: 'Mary Wanjiru',
        email: 'info@officeessentials.co.ke',
        phone: '+254723456789',
        address: {
          street: 'Ngong Road',
          city: 'Nairobi',
          state: 'Nairobi County',
          zipCode: '00100',
          country: 'Kenya'
        },
        category: 'Office Supplies',
        paymentTerms: 'Net 15',
        rating: 5,
        status: 'active',
        notes: 'Best prices for office supplies'
      },
      {
        userId: user._id,
        name: 'Fresh Produce Distributors',
        contact: 'Peter Omondi',
        email: 'orders@freshproduce.co.ke',
        phone: '+254734567890',
        address: {
          street: 'Wakulima Market',
          city: 'Nairobi',
          state: 'Nairobi County',
          zipCode: '00100',
          country: 'Kenya'
        },
        category: 'Raw Materials',
        paymentTerms: 'Cash on Delivery',
        rating: 4,
        status: 'active',
        notes: 'Fresh produce daily'
      },
      {
        userId: user._id,
        name: 'Industrial Machinery Co.',
        contact: 'James Mwangi',
        email: 'sales@industrialmachinery.co.ke',
        phone: '+254745678901',
        address: {
          street: 'Industrial Area',
          city: 'Nairobi',
          state: 'Nairobi County',
          zipCode: '00100',
          country: 'Kenya'
        },
        category: 'Equipment',
        paymentTerms: 'Net 60',
        rating: 4.8,
        status: 'active',
        notes: 'Heavy machinery and equipment'
      },
      {
        userId: user._id,
        name: 'Cleaning Services Pro',
        contact: 'Sarah Akinyi',
        email: 'info@cleaningpro.co.ke',
        phone: '+254756789012',
        address: {
          street: 'Westlands',
          city: 'Nairobi',
          state: 'Nairobi County',
          zipCode: '00100',
          country: 'Kenya'
        },
        category: 'Services',
        paymentTerms: 'Net 30',
        rating: 4.2,
        status: 'active',
        notes: 'Professional cleaning services'
      }
    ];

    // Clear existing suppliers for this user
    await Supplier.deleteMany({ userId: user._id });
    console.log('🗑️  Cleared existing suppliers');

    // Insert suppliers
    const createdSuppliers = await Supplier.insertMany(suppliers);
    console.log(`✅ Created ${createdSuppliers.length} suppliers`);

    // Create sample purchase orders
    const purchaseOrders = [
      {
        userId: user._id,
        orderNumber: 'PO-000001',
        supplier: createdSuppliers[0]._id,
        supplierName: createdSuppliers[0].name,
        items: [
          {
            product: 'Dell Laptop XPS 15',
            quantity: 5,
            unitPrice: 120000,
            totalPrice: 600000
          },
          {
            product: 'HP Printer LaserJet Pro',
            quantity: 2,
            unitPrice: 35000,
            totalPrice: 70000
          }
        ],
        totalAmount: 670000,
        status: 'approved',
        priority: 'high',
        orderDate: new Date('2025-10-15'),
        expectedDelivery: new Date('2025-11-05'),
        notes: 'Urgent order for new office setup',
        approvedBy: user._id,
        approvedAt: new Date('2025-10-16')
      },
      {
        userId: user._id,
        orderNumber: 'PO-000002',
        supplier: createdSuppliers[1]._id,
        supplierName: createdSuppliers[1].name,
        items: [
          {
            product: 'A4 Paper (500 sheets)',
            quantity: 20,
            unitPrice: 450,
            totalPrice: 9000
          },
          {
            product: 'Ballpoint Pens (Box of 50)',
            quantity: 10,
            unitPrice: 800,
            totalPrice: 8000
          },
          {
            product: 'Stapler Heavy Duty',
            quantity: 5,
            unitPrice: 1200,
            totalPrice: 6000
          }
        ],
        totalAmount: 23000,
        status: 'received',
        priority: 'medium',
        orderDate: new Date('2025-10-20'),
        expectedDelivery: new Date('2025-10-25'),
        actualDelivery: new Date('2025-10-24'),
        notes: 'Monthly office supplies',
        approvedBy: user._id,
        approvedAt: new Date('2025-10-20'),
        receivedBy: user._id,
        receivedAt: new Date('2025-10-24')
      },
      {
        userId: user._id,
        orderNumber: 'PO-000003',
        supplier: createdSuppliers[2]._id,
        supplierName: createdSuppliers[2].name,
        items: [
          {
            product: 'Fresh Vegetables (Mixed)',
            quantity: 50,
            unitPrice: 200,
            totalPrice: 10000
          },
          {
            product: 'Fresh Fruits (Seasonal)',
            quantity: 30,
            unitPrice: 300,
            totalPrice: 9000
          }
        ],
        totalAmount: 19000,
        status: 'pending',
        priority: 'urgent',
        orderDate: new Date('2025-10-28'),
        expectedDelivery: new Date('2025-10-31'),
        notes: 'Weekly fresh produce order'
      },
      {
        userId: user._id,
        orderNumber: 'PO-000004',
        supplier: createdSuppliers[3]._id,
        supplierName: createdSuppliers[3].name,
        items: [
          {
            product: 'Industrial Mixer 500L',
            quantity: 1,
            unitPrice: 450000,
            totalPrice: 450000
          }
        ],
        totalAmount: 450000,
        status: 'ordered',
        priority: 'high',
        orderDate: new Date('2025-10-10'),
        expectedDelivery: new Date('2025-11-20'),
        notes: 'New production equipment',
        approvedBy: user._id,
        approvedAt: new Date('2025-10-11')
      }
    ];

    // Clear existing purchase orders for this user
    await PurchaseOrder.deleteMany({ userId: user._id });
    console.log('🗑️  Cleared existing purchase orders');

    // Insert purchase orders
    const createdOrders = await PurchaseOrder.insertMany(purchaseOrders);
    console.log(`✅ Created ${createdOrders.length} purchase orders`);

    // Update supplier stats
    for (const supplier of createdSuppliers) {
      const orders = createdOrders.filter(o => o.supplier.toString() === supplier._id.toString());
      supplier.totalOrders = orders.length;
      supplier.totalSpent = orders.reduce((sum, o) => sum + o.totalAmount, 0);
      supplier.lastOrderDate = orders.length > 0 ? orders[orders.length - 1].orderDate : null;
      await supplier.save();
    }
    console.log('✅ Updated supplier statistics');

    console.log('\n🎉 Purchasing data seeded successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Suppliers: ${createdSuppliers.length}`);
    console.log(`   - Purchase Orders: ${createdOrders.length}`);
    console.log(`   - Total Value: KES ${createdOrders.reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString()}`);

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error seeding purchasing data:', error);
    process.exit(1);
  }
};

seedPurchasing();

