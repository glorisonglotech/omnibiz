/**
 * Database Seeding Script
 * Run this to populate your database with sample data for testing
 * 
 * Usage: node server/scripts/seedDatabase.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import your models
const Product = require('../models/product');
const Order = require('../models/order');
const Team = require('../models/team');
const Location = require('../models/location');
const User = require('../models/user');

// Sample data
const sampleProducts = [
  {
    name: 'Premium Hair Shampoo',
    description: 'Nourishing shampoo for all hair types with natural ingredients',
    sku: 'SHP-001',
    category: 'Hair Care',
    price: 29.99,
    stockQuantity: 150,
    reorderLevel: 20,
    supplierName: 'Beauty Supplies Co.',
    image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400'
  },
  {
    name: 'Hair Styling Gel',
    description: 'Strong hold gel with natural finish, alcohol-free formula',
    sku: 'GEL-001',
    category: 'Hair Care',
    price: 15.99,
    stockQuantity: 200,
    reorderLevel: 30,
    supplierName: 'Style Pro Inc.',
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400'
  },
  {
    name: 'Organic Face Mask',
    description: 'Deep cleansing and hydrating mask with clay and botanicals',
    sku: 'MSK-001',
    category: 'Skincare',
    price: 44.99,
    stockQuantity: 75,
    reorderLevel: 15,
    supplierName: 'Organic Beauty Ltd.',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400'
  },
  {
    name: 'Professional Hair Dryer',
    description: 'Fast drying with ionic technology and multiple heat settings',
    sku: 'DRY-001',
    category: 'Tools',
    price: 199.99,
    stockQuantity: 25,
    reorderLevel: 5,
    supplierName: 'ProTools Supplies',
    image: 'https://images.unsplash.com/photo-1522338140262-f46f5913618a?w=400'
  },
  {
    name: 'Moisturizing Conditioner',
    description: 'Rich conditioner for smooth and silky hair',
    sku: 'CND-001',
    category: 'Hair Care',
    price: 32.99,
    stockQuantity: 120,
    reorderLevel: 20,
    supplierName: 'Beauty Supplies Co.',
    image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400'
  },
  {
    name: 'Hair Straightener',
    description: 'Ceramic plates with adjustable temperature control',
    sku: 'STR-001',
    category: 'Tools',
    price: 149.99,
    stockQuantity: 18,
    reorderLevel: 5,
    supplierName: 'ProTools Supplies',
    image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=400'
  },
  {
    name: 'Facial Serum',
    description: 'Anti-aging serum with vitamin C and hyaluronic acid',
    sku: 'SER-001',
    category: 'Skincare',
    price: 59.99,
    stockQuantity: 60,
    reorderLevel: 10,
    supplierName: 'Organic Beauty Ltd.',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400'
  },
  {
    name: 'Hair Spray',
    description: 'Flexible hold spray for all-day styling',
    sku: 'SPR-001',
    category: 'Hair Care',
    price: 18.99,
    stockQuantity: 180,
    reorderLevel: 25,
    supplierName: 'Style Pro Inc.',
    image: 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=400'
  },
  {
    name: 'Nail Polish Set',
    description: 'Set of 12 vibrant colors, long-lasting formula',
    sku: 'NPL-001',
    category: 'Nails',
    price: 34.99,
    stockQuantity: 90,
    reorderLevel: 15,
    supplierName: 'Beauty Supplies Co.',
    image: 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=400'
  },
  {
    name: 'Makeup Brush Set',
    description: 'Professional 10-piece brush set with travel case',
    sku: 'BRS-001',
    category: 'Makeup',
    price: 79.99,
    stockQuantity: 45,
    reorderLevel: 10,
    supplierName: 'ProTools Supplies',
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400'
  }
];

const sampleOrders = [
  {
    customer: {
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      phone: '+254712345678'
    },
    items: [
      { product: 'Premium Hair Shampoo', quantity: 2, price: 29.99 },
      { product: 'Hair Styling Gel', quantity: 1, price: 15.99 }
    ],
    total: 75.97,
    status: 'Delivered',
    paymentStatus: 'Paid',
    paymentMethod: 'M-Pesa',
    shippingAddress: {
      street: '123 Kimathi Street',
      city: 'Nairobi',
      state: 'Nairobi County',
      zipCode: '00100',
      country: 'Kenya'
    },
    orderDate: new Date('2025-01-10')
  },
  {
    customer: {
      name: 'Michael Ochieng',
      email: 'm.ochieng@example.com',
      phone: '+254723456789'
    },
    items: [
      { product: 'Professional Hair Dryer', quantity: 1, price: 199.99 }
    ],
    total: 199.99,
    status: 'Processing',
    paymentStatus: 'Paid',
    paymentMethod: 'Card',
    shippingAddress: {
      street: '456 Moi Avenue',
      city: 'Mombasa',
      state: 'Mombasa County',
      zipCode: '80100',
      country: 'Kenya'
    },
    orderDate: new Date('2025-01-12')
  },
  {
    customer: {
      name: 'Grace Wanjiku',
      email: 'grace.w@example.com',
      phone: '+254734567890'
    },
    items: [
      { product: 'Organic Face Mask', quantity: 2, price: 44.99 },
      { product: 'Facial Serum', quantity: 1, price: 59.99 }
    ],
    total: 149.97,
    status: 'Shipped',
    paymentStatus: 'Paid',
    paymentMethod: 'M-Pesa',
    shippingAddress: {
      street: '789 Kenyatta Avenue',
      city: 'Kisumu',
      state: 'Kisumu County',
      zipCode: '40100',
      country: 'Kenya'
    },
    orderDate: new Date('2025-01-13')
  },
  {
    customer: {
      name: 'David Mutua',
      email: 'd.mutua@example.com',
      phone: '+254745678901'
    },
    items: [
      { product: 'Makeup Brush Set', quantity: 1, price: 79.99 },
      { product: 'Nail Polish Set', quantity: 1, price: 34.99 }
    ],
    total: 114.98,
    status: 'Pending',
    paymentStatus: 'Pending',
    paymentMethod: 'Cash on Delivery',
    shippingAddress: {
      street: '321 Uhuru Highway',
      city: 'Nakuru',
      state: 'Nakuru County',
      zipCode: '20100',
      country: 'Kenya'
    },
    orderDate: new Date('2025-01-14')
  }
];

const sampleLocations = [
  {
    name: 'Main Store - Westlands',
    address: '123 Westlands Avenue',
    city: 'Nairobi',
    state: 'Nairobi County',
    zipCode: '00100',
    country: 'Kenya',
    phone: '+254711111111',
    email: 'westlands@omnibiz.com',
    type: 'Store',
    isActive: true,
    operatingHours: {
      monday: '8:00 AM - 8:00 PM',
      tuesday: '8:00 AM - 8:00 PM',
      wednesday: '8:00 AM - 8:00 PM',
      thursday: '8:00 AM - 8:00 PM',
      friday: '8:00 AM - 9:00 PM',
      saturday: '9:00 AM - 9:00 PM',
      sunday: '10:00 AM - 6:00 PM'
    }
  },
  {
    name: 'Branch Office - Karen',
    address: '456 Karen Road',
    city: 'Nairobi',
    state: 'Nairobi County',
    zipCode: '00200',
    country: 'Kenya',
    phone: '+254722222222',
    email: 'karen@omnibiz.com',
    type: 'Office',
    isActive: true,
    operatingHours: {
      monday: '9:00 AM - 6:00 PM',
      tuesday: '9:00 AM - 6:00 PM',
      wednesday: '9:00 AM - 6:00 PM',
      thursday: '9:00 AM - 6:00 PM',
      friday: '9:00 AM - 6:00 PM',
      saturday: 'Closed',
      sunday: 'Closed'
    }
  },
  {
    name: 'Warehouse - Industrial Area',
    address: '789 Industrial Area Road',
    city: 'Nairobi',
    state: 'Nairobi County',
    zipCode: '00500',
    country: 'Kenya',
    phone: '+254733333333',
    email: 'warehouse@omnibiz.com',
    type: 'Warehouse',
    isActive: true,
    operatingHours: {
      monday: '6:00 AM - 6:00 PM',
      tuesday: '6:00 AM - 6:00 PM',
      wednesday: '6:00 AM - 6:00 PM',
      thursday: '6:00 AM - 6:00 PM',
      friday: '6:00 AM - 6:00 PM',
      saturday: '6:00 AM - 2:00 PM',
      sunday: 'Closed'
    }
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to MongoDB (use local first)
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/omnibiz', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing sample data...');
    await Product.deleteMany({ sku: { $in: sampleProducts.map(p => p.sku) } });
    await Order.deleteMany({ 'customer.email': { $in: sampleOrders.map(o => o.customer.email) } });
    await Location.deleteMany({ name: { $in: sampleLocations.map(l => l.name) } });

    // Get or create a user to associate data with
    let user = await User.findOne();
    if (!user) {
      console.log('⚠️  No user found. Skipping seeding - please create a user first.');
      console.log('   Run: node scripts/createTestUser.js or node scripts/makeAdmin.js --create-defaults');
      process.exit(0);
    }
    console.log(`✅ Using user: ${user.name} (${user.email})`);

    // Seed products
    console.log('📦 Seeding products...');
    const products = await Product.insertMany(
      sampleProducts.map(p => ({ ...p, userId: user?._id }))
    );
    console.log(`✅ Created ${products.length} products`);

    // Seed orders
    console.log('🛒 Seeding orders...');
    const orders = await Order.insertMany(
      sampleOrders.map((o, index) => ({
        ...o,
        userId: user?._id,
        orderId: `ORD-${Date.now()}-${index + 1}`
      }))
    );
    console.log(`✅ Created ${orders.length} orders`);

    // Seed locations (commented out due to schema mismatch)
    // console.log('📍 Seeding locations...');
    // const locations = await Location.insertMany(
    //   sampleLocations.map(l => ({ ...l, userId: user?._id }))
    // );
    // console.log(`✅ Created ${locations.length} locations`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Products: ${products.length}`);
    console.log(`   - Orders: ${orders.length}`);
    // console.log(`   - Locations: ${locations.length}`);
    console.log('\n💡 You can now use the application with sample data!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
    process.exit(0);
  }
}

// Run the seeding script
seedDatabase();
