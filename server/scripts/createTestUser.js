const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/user');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for user creation');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const createTestUser = async () => {
  try {
    await connectDB();

    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@omnibiz.com' });
    if (existingUser) {
      console.log('Test user already exists:');
      console.log('Email: test@omnibiz.com');
      console.log('Password: password123');
      return;
    }

    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const testUser = await User.create({
      name: 'Test User',
      email: 'test@omnibiz.com',
      password: hashedPassword,
      phone: '+254700000000',
      businessName: 'Test Business',
      firstName: 'Test',
      lastName: 'User',
      businessEmail: 'business@omnibiz.com',
      businessPhone: '+254700000001',
      jobTitle: 'Business Owner',
      department: 'Management',
      bio: 'Test user for OmniBiz application',
      address: '123 Test Street',
      city: 'Nairobi',
      state: 'Nairobi',
      country: 'Kenya',
      zipCode: '00100',
      timezone: 'Africa/Nairobi',
      currency: 'KES',
      language: 'en',
      notifications: {
        email: true,
        sms: true,
        push: true,
        marketing: false
      },
      security: {
        twoFactorEnabled: false,
        sessionTimeout: 30,
        passwordExpiry: 90
      },
      privacy: {
        dataSharing: false,
        analytics: true
      }
    });

    console.log('Test user created successfully!');
    console.log('Login credentials:');
    console.log('Email: test@omnibiz.com');
    console.log('Password: password123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating test user:', error);
    process.exit(1);
  }
};

createTestUser();
