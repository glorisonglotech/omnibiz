const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/user');
const Product = require('../models/product');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Sample products
const sampleProducts = [
  {
    name: 'Premium Hair Shampoo',
    description: 'Nourishing shampoo for all hair types with natural ingredients',
    sku: 'SHPX-001',
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
    sku: 'GELX-001',
    category: 'Hair Care',
    price: 15.99,
    stockQuantity: 200,
    reorderLevel: 30,
    supplierName: 'Style Pro Inc.',
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400'
  },
  {
    name: 'Organic Face Mask',
    description: 'Detoxifying clay mask with activated charcoal and tea tree oil',
    sku: 'MASKX-001',
    category: 'Skincare',
    price: 24.99,
    stockQuantity: 100,
    reorderLevel: 15,
    supplierName: 'Natural Beauty Ltd.',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400'
  },
  {
    name: 'Moisturizing Conditioner',
    description: 'Deep conditioning treatment with argan oil and keratin',
    sku: 'CONDX-001',
    category: 'Hair Care',
    price: 32.99,
    stockQuantity: 120,
    reorderLevel: 20,
    supplierName: 'Beauty Supplies Co.',
    image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400'
  },
  {
    name: 'Professional Hair Dryer',
    description: 'Ionic hair dryer with multiple heat settings and cool shot button',
    sku: 'DRYX-001',
    category: 'Tools',
    price: 89.99,
    stockQuantity: 45,
    reorderLevel: 10,
    supplierName: 'Pro Tools Inc.',
    image: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400'
  },
  {
    name: 'Facial Serum',
    description: 'Anti-aging serum with vitamin C and hyaluronic acid',
    sku: 'SERX-001',
    category: 'Skincare',
    price: 45.99,
    stockQuantity: 80,
    reorderLevel: 15,
    supplierName: 'Natural Beauty Ltd.',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400'
  },
  {
    name: 'Hair Straightener',
    description: 'Ceramic plate straightener with adjustable temperature control',
    sku: 'STRX-001',
    category: 'Tools',
    price: 79.99,
    stockQuantity: 35,
    reorderLevel: 8,
    supplierName: 'Pro Tools Inc.',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400'
  },
  {
    name: 'Volumizing Hair Spray',
    description: 'Lightweight spray for extra volume and hold without stiffness',
    sku: 'SPRX-001',
    category: 'Hair Care',
    price: 18.99,
    stockQuantity: 180,
    reorderLevel: 25,
    supplierName: 'Style Pro Inc.',
    image: 'https://images.unsplash.com/photo-1583334733127-e5a7b8c8c7e9?w=400'
  },
  {
    name: 'Makeup Brush Set',
    description: 'Professional 12-piece brush set with synthetic bristles',
    sku: 'BRUX-001',
    category: 'Makeup',
    price: 54.99,
    stockQuantity: 60,
    reorderLevel: 12,
    supplierName: 'Beauty Supplies Co.',
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400'
  },
  {
    name: 'Nail Polish Set',
    description: 'Set of 10 vibrant colors, long-lasting formula',
    sku: 'POLX-001',
    category: 'Nails',
    price: 34.99,
    stockQuantity: 90,
    reorderLevel: 18,
    supplierName: 'Color Pro Ltd.',
    image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=400'
  },
  {
    name: 'Exfoliating Body Scrub',
    description: 'Natural sugar scrub with coconut oil and vanilla',
    sku: 'SCRX-001',
    category: 'Skincare',
    price: 28.99,
    stockQuantity: 110,
    reorderLevel: 20,
    supplierName: 'Natural Beauty Ltd.',
    image: 'https://images.unsplash.com/photo-1556228852-80c3c6d5e1a8?w=400'
  },
  {
    name: 'Hair Color Kit',
    description: 'Ammonia-free permanent hair color with conditioning treatment',
    sku: 'COLX-001',
    category: 'Hair Care',
    price: 42.99,
    stockQuantity: 75,
    reorderLevel: 15,
    supplierName: 'Color Pro Ltd.',
    image: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400'
  },
  {
    name: 'Cuticle Oil',
    description: 'Nourishing oil blend for healthy nails and cuticles',
    sku: 'OILX-001',
    category: 'Nails',
    price: 12.99,
    stockQuantity: 140,
    reorderLevel: 25,
    supplierName: 'Natural Beauty Ltd.',
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400'
  },
  {
    name: 'Curling Iron',
    description: 'Ceramic barrel curling iron with multiple heat settings',
    sku: 'CURX-001',
    category: 'Tools',
    price: 69.99,
    stockQuantity: 40,
    reorderLevel: 10,
    supplierName: 'Pro Tools Inc.',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400'
  },
  {
    name: 'Lip Gloss Collection',
    description: 'Set of 6 moisturizing lip glosses in trendy shades',
    sku: 'LIPX-001',
    category: 'Makeup',
    price: 29.99,
    stockQuantity: 95,
    reorderLevel: 18,
    supplierName: 'Beauty Supplies Co.',
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400'
  }
];

async function seedProducts() {
  try {
    console.log('🌱 Starting product seeding for inviteCode user...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find user with inviteCode
    const user = await User.findOne({ inviteCode: { $exists: true, $ne: null } });
    
    if (!user) {
      console.log('❌ No user with inviteCode found. Please create a user with inviteCode first.');
      process.exit(1);
    }

    console.log(`✅ Using user: ${user.name} (${user.email}) with inviteCode: ${user.inviteCode}`);

    // Check if user already has products
    const existingProducts = await Product.countDocuments({ userId: user._id });
    if (existingProducts > 0) {
      console.log(`⚠️  User already has ${existingProducts} products. Skipping...`);
      process.exit(0);
    }

    // Seed products
    console.log('📦 Seeding products...');
    const products = await Product.insertMany(
      sampleProducts.map(p => ({ ...p, userId: user._id }))
    );
    console.log(`✅ Created ${products.length} products`);

    console.log('\n🎉 Product seeding completed successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   - User: ${user.email}`);
    console.log(`   - InviteCode: ${user.inviteCode}`);
    console.log(`   - Products: ${products.length}`);
    console.log(`\n💡 Products are now available in the storefront!`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    process.exit(1);
  }
}

seedProducts();

