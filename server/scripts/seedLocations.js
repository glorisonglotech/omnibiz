const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Location = require('../models/location');
const User = require('../models/user');

// Sample locations in Nairobi, Kenya
const sampleLocations = [
  {
    name: 'Westlands Branch',
    address: 'Westlands Shopping Mall, Waiyaki Way',
    city: 'Nairobi',
    state: 'Nairobi County',
    zipCode: '00100',
    phone: '+254712345678',
    email: 'westlands@omnibiz.com',
    manager: 'John Kamau',
    operatingHours: '8:00 AM - 8:00 PM',
    description: 'Main branch in Westlands area',
    status: 'active',
    employees: 15,
    inventory: 500,
    dailyRevenue: 150000,
    dailyOrders: 45,
    dailyCustomers: 120,
    performance: 92,
    coordinates: {
      lat: -1.2676,
      lng: 36.8070
    },
    type: 'branch',
    customers: 1200,
    revenue: 4500000
  },
  {
    name: 'CBD Headquarters',
    address: 'Kenyatta Avenue, City Center',
    city: 'Nairobi',
    state: 'Nairobi County',
    zipCode: '00100',
    phone: '+254723456789',
    email: 'cbd@omnibiz.com',
    manager: 'Mary Wanjiku',
    operatingHours: '7:00 AM - 9:00 PM',
    description: 'Central business district headquarters',
    status: 'active',
    employees: 25,
    inventory: 800,
    dailyRevenue: 250000,
    dailyOrders: 75,
    dailyCustomers: 200,
    performance: 95,
    coordinates: {
      lat: -1.2864,
      lng: 36.8172
    },
    type: 'headquarters',
    customers: 2500,
    revenue: 7500000
  },
  {
    name: 'Karen Store',
    address: 'Karen Shopping Center, Langata Road',
    city: 'Nairobi',
    state: 'Nairobi County',
    zipCode: '00100',
    phone: '+254734567890',
    email: 'karen@omnibiz.com',
    manager: 'David Omondi',
    operatingHours: '9:00 AM - 7:00 PM',
    description: 'Upscale store in Karen area',
    status: 'active',
    employees: 12,
    inventory: 400,
    dailyRevenue: 180000,
    dailyOrders: 35,
    dailyCustomers: 90,
    performance: 88,
    coordinates: {
      lat: -1.3197,
      lng: 36.7078
    },
    type: 'store',
    customers: 800,
    revenue: 5400000
  },
  {
    name: 'Eastleigh Warehouse',
    address: '1st Avenue, Eastleigh',
    city: 'Nairobi',
    state: 'Nairobi County',
    zipCode: '00100',
    phone: '+254745678901',
    email: 'eastleigh@omnibiz.com',
    manager: 'Ahmed Hassan',
    operatingHours: '6:00 AM - 6:00 PM',
    description: 'Main warehouse and distribution center',
    status: 'active',
    employees: 30,
    inventory: 2000,
    dailyRevenue: 100000,
    dailyOrders: 150,
    dailyCustomers: 50,
    performance: 90,
    coordinates: {
      lat: -1.2833,
      lng: 36.8500
    },
    type: 'warehouse',
    customers: 300,
    revenue: 3000000
  },
  {
    name: 'Kilimani Office',
    address: 'Argwings Kodhek Road, Kilimani',
    city: 'Nairobi',
    state: 'Nairobi County',
    zipCode: '00100',
    phone: '+254756789012',
    email: 'kilimani@omnibiz.com',
    manager: 'Grace Njeri',
    operatingHours: '8:00 AM - 6:00 PM',
    description: 'Administrative office',
    status: 'active',
    employees: 20,
    inventory: 100,
    dailyRevenue: 50000,
    dailyOrders: 10,
    dailyCustomers: 30,
    performance: 85,
    coordinates: {
      lat: -1.2921,
      lng: 36.7856
    },
    type: 'office',
    customers: 200,
    revenue: 1500000
  }
];

async function seedLocations() {
  try {
    // Connect to MongoDB
    const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/ominbiz';
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find user with inviteCode (the main user)
    const user = await User.findOne({ inviteCode: { $exists: true, $ne: null } });
    
    if (!user) {
      console.log('❌ No user with inviteCode found. Please create a user first.');
      process.exit(1);
    }

    console.log(`📍 Seeding locations for user: ${user.email}\n`);

    // Delete existing locations for this user
    await Location.deleteMany({ userId: user._id });
    console.log('🗑️  Cleared existing locations\n');

    // Create locations
    const locations = await Location.insertMany(
      sampleLocations.map(loc => ({ ...loc, userId: user._id }))
    );

    console.log(`✅ Created ${locations.length} locations:\n`);
    locations.forEach(loc => {
      console.log(`   📍 ${loc.name}`);
      console.log(`      Address: ${loc.address}, ${loc.city}`);
      console.log(`      Coordinates: ${loc.coordinates.lat}, ${loc.coordinates.lng}`);
      console.log(`      Type: ${loc.type}`);
      console.log(`      Manager: ${loc.manager}`);
      console.log(`      Performance: ${loc.performance}%\n`);
    });

    console.log('🎉 Location seeding complete!\n');

  } catch (error) {
    console.error('❌ Error seeding locations:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedLocations();

