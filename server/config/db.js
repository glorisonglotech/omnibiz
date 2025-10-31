const mongoose = require('mongoose');

/**
 * Database Connection with Fallback Support
 *
 * Primary: MongoDB Atlas (MONGODB_URI) - Cloud database
 * Fallback: Local MongoDB (MONGO_URI) - Local development database
 *
 * The system will try to connect to MongoDB Atlas first.
 * If that fails, it will automatically fall back to local MongoDB.
 */

const connectDB = async () => {
    // Get connection URIs from environment
    const atlasURI = process.env.MONGODB_URI;
    const localURI = process.env.MONGO_URI;

    // Validate that at least one URI is configured
    if (!atlasURI && !localURI) {
        console.error('❌ No database configuration found!');
        console.error('   Please configure MONGODB_URI (Atlas) or MONGO_URI (local) in .env');
        return;
    }

    // Connection options for better reliability
    const options = {
        serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
        socketTimeoutMS: 45000,
    };

    let connected = false;
    let connectionType = '';

    // Try MongoDB Atlas first (Primary)
    if (atlasURI && !connected) {
        try {
            console.log('🔄 Attempting to connect to MongoDB Atlas (Primary)...');
            await mongoose.connect(atlasURI, options);
            connected = true;
            connectionType = 'Atlas (Cloud)';
            console.log('✅ Connected to MongoDB Atlas successfully!');
        } catch (error) {
            console.warn('⚠️  MongoDB Atlas connection failed:', error.message);
            console.log('🔄 Falling back to local MongoDB...');
        }
    }

    // Try Local MongoDB (Fallback)
    if (localURI && !connected) {
        try {
            console.log('🔄 Attempting to connect to Local MongoDB (Fallback)...');
            await mongoose.connect(localURI, options);
            connected = true;
            connectionType = 'Local';
            console.log('✅ Connected to Local MongoDB successfully!');
        } catch (error) {
            console.error('❌ Local MongoDB connection failed:', error.message);
        }
    }

    // Final status check
    if (connected) {
        console.log(`📊 Database Status: Connected to ${connectionType} MongoDB`);
        console.log(`   Database: ${mongoose.connection.name}`);
        console.log(`   Host: ${mongoose.connection.host}`);

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err.message);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('⚠️  MongoDB disconnected');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('✅ MongoDB reconnected');
        });

        mongoose.connection.on('connected', () => {
            console.log('✅ MongoDB connected');
        });

    } else {
        console.error('❌ Failed to connect to any MongoDB instance!');
        console.error('   Tried:');
        if (atlasURI) console.error('   - MongoDB Atlas (MONGODB_URI)');
        if (localURI) console.error('   - Local MongoDB (MONGO_URI)');
        console.error('   Please check your database configuration and ensure MongoDB is running.');
    }

    return connected;
};

/**
 * Get current database connection status
 */
const getDBStatus = () => {
    const state = mongoose.connection.readyState;
    const states = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    };

    return {
        status: states[state] || 'unknown',
        name: mongoose.connection.name || 'N/A',
        host: mongoose.connection.host || 'N/A',
        isConnected: state === 1
    };
};

module.exports = connectDB;
module.exports.getDBStatus = getDBStatus;