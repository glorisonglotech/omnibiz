/**
 * Test script for Database Connection with Fallback
 * 
 * Usage:
 *   node test-db-connection.js
 * 
 * This script tests:
 * 1. Database connection initialization
 * 2. Atlas vs Local connection
 * 3. Fallback mechanism
 * 4. Connection status
 */

require('dotenv').config();
const connectDB = require('./config/db');
const { getDBStatus } = require('./config/db');
const mongoose = require('mongoose');

console.log('\n🧪 Testing Database Connection with Fallback\n');
console.log('='.repeat(60));

// Test 1: Check Environment Configuration
console.log('\n📋 Test 1: Environment Configuration');
console.log('-'.repeat(60));

const atlasURI = process.env.MONGODB_URI;
const localURI = process.env.MONGO_URI;

console.log('Configuration Status:');
console.log(`  MONGODB_URI (Atlas): ${atlasURI ? '✅ Configured' : '❌ Not configured'}`);
console.log(`  MONGO_URI (Local):   ${localURI ? '✅ Configured' : '❌ Not configured'}`);

if (!atlasURI && !localURI) {
    console.error('\n❌ No database configuration found!');
    console.error('   Please configure MONGODB_URI or MONGO_URI in .env');
    process.exit(1);
}

// Test 2: Connection Test
async function testConnection() {
    console.log('\n🔌 Test 2: Database Connection');
    console.log('-'.repeat(60));

    try {
        const connected = await connectDB();

        if (connected) {
            console.log('\n✅ Connection test successful!');
        } else {
            console.log('\n❌ Connection test failed!');
            process.exit(1);
        }
    } catch (error) {
        console.error('\n❌ Connection error:', error.message);
        process.exit(1);
    }
}

// Test 3: Connection Status
async function testStatus() {
    console.log('\n📊 Test 3: Connection Status');
    console.log('-'.repeat(60));

    const status = getDBStatus();
    
    console.log('Current Status:');
    console.log(`  Status:      ${status.status}`);
    console.log(`  Database:    ${status.name}`);
    console.log(`  Host:        ${status.host}`);
    console.log(`  Connected:   ${status.isConnected ? '✅ Yes' : '❌ No'}`);
}

// Test 4: Database Operations
async function testOperations() {
    console.log('\n🔧 Test 4: Basic Database Operations');
    console.log('-'.repeat(60));

    try {
        // Test: List collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log(`✅ Database accessible`);
        console.log(`   Collections found: ${collections.length}`);
        
        if (collections.length > 0) {
            console.log(`   Sample collections: ${collections.slice(0, 3).map(c => c.name).join(', ')}`);
        }

        // Test: Database stats
        const stats = await mongoose.connection.db.stats();
        console.log(`   Database size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   Collections: ${stats.collections}`);
        console.log(`   Indexes: ${stats.indexes}`);

    } catch (error) {
        console.error('❌ Database operations error:', error.message);
    }
}

// Test 5: Connection Type Detection
async function testConnectionType() {
    console.log('\n🌐 Test 5: Connection Type Detection');
    console.log('-'.repeat(60));

    const host = mongoose.connection.host;
    
    if (host.includes('mongodb.net') || host.includes('atlas')) {
        console.log('✅ Connected to MongoDB Atlas (Cloud)');
        console.log('   Type: Primary Connection');
    } else if (host.includes('localhost') || host.includes('127.0.0.1')) {
        console.log('✅ Connected to Local MongoDB');
        console.log('   Type: Fallback Connection');
    } else {
        console.log(`✅ Connected to: ${host}`);
    }
}

// Test 6: Fallback Mechanism Info
async function testFallbackInfo() {
    console.log('\n🔄 Test 6: Fallback Mechanism');
    console.log('-'.repeat(60));

    if (atlasURI && localURI) {
        console.log('✅ Both connections configured - fallback ready');
        console.log('   Primary: MongoDB Atlas (MONGODB_URI)');
        console.log('   Fallback: Local MongoDB (MONGO_URI)');
        console.log('   If Atlas fails, Local will automatically take over');
    } else if (atlasURI) {
        console.log('⚠️  Only Atlas configured - no fallback');
        console.log('   Primary: MongoDB Atlas (MONGODB_URI)');
        console.log('   Fallback: None');
    } else if (localURI) {
        console.log('⚠️  Only Local configured - no fallback');
        console.log('   Primary: Local MongoDB (MONGO_URI)');
        console.log('   Fallback: None');
    }
}

// Run all tests
async function runAllTests() {
    try {
        await testConnection();
        await testStatus();
        await testConnectionType();
        await testOperations();
        await testFallbackInfo();

        console.log('\n' + '='.repeat(60));
        console.log('✅ All database tests completed successfully!');
        console.log('='.repeat(60) + '\n');

        // Close connection
        await mongoose.connection.close();
        console.log('🔌 Database connection closed\n');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Test suite error:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

// Run tests
runAllTests();

