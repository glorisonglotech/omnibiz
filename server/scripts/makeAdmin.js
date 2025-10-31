const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/ominbiz';
mongoose.connect(MONGO_URI);

const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

// Socket.IO setup for real-time notifications
const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Try to connect to existing server's Socket.IO if available
let socketConnected = false;
try {
  const socketClient = require('socket.io-client');
  const clientSocket = socketClient('http://localhost:5000');

  clientSocket.on('connect', () => {
    console.log('✅ Connected to main server Socket.IO');
    socketConnected = true;
  });

  // Function to emit notification through client socket
  global.emitNotification = (userId, notification) => {
    if (socketConnected) {
      clientSocket.emit('admin_notification', { userId, notification });
    }
  };
} catch (error) {
  console.log('⚠️  Could not connect to main server Socket.IO (this is okay)');
  global.emitNotification = () => {}; // No-op if not connected
}

// Default super-admin users to create
const defaultSuperAdmins = [
  {
    email: 'devtechs842@gmail.com',
    password: '1234dan',
    name: 'DevTech Solutions',
    businessName: 'OmniBiz Pro',
    phone: '+254758175275',
    role: 'super_admin'
  },
  {
    email: 'glorisonglotech@gmail.com',
    password: '1234',
    name: 'Glorison Ouma',
    businessName: 'glotech',
    phone: '+254717055797',
    role: 'super_admin'
  }
];

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function createDefaultSuperAdmins() {
  console.log('🚀 Creating default super-admin accounts...\n');

  for (const admin of defaultSuperAdmins) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: admin.email });

      if (existingUser) {
        console.log(`⏭️  User already exists: ${admin.email}`);
        continue;
      }

      // Hash password
      const hashedPassword = await hashPassword(admin.password);

      // Create new super-admin user
      const newUser = new User({
        ...admin,
        password: hashedPassword,
        inviteCode: generateInviteCode(),
        isActive: true,
        isEmailVerified: true,
        permissions: [
          'all',
          'manage_users',
          'manage_products',
          'manage_orders',
          'manage_services',
          'manage_appointments',
          'manage_finances',
          'manage_team',
          'manage_locations',
          'manage_settings',
          'view_analytics',
          'manage_discounts',
          'manage_feedback',
          'manage_support',
          'delete_any',
          'edit_any',
          'super_admin',
          'system_config',
          'security_monitoring',
          'audit_logs'
        ],
        createdAt: new Date(),
        lastLogin: null,
        loginAttempts: 0,
        accountLocked: false
      });

      await newUser.save();

      console.log(`✅ Created super-admin: ${admin.email}`);
      console.log(`   Name: ${admin.name}`);
      console.log(`   Role: SUPER_ADMIN`);
      console.log(`   Business: ${admin.businessName}`);
      console.log(`   Phone: ${admin.phone}`);
      console.log(`   Invite Code: ${newUser.inviteCode}\n`);

    } catch (error) {
      console.error(`❌ Error creating ${admin.email}:`, error.message);
    }
  }
}

function generateInviteCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function makeUserAdmin(email) {
  try {
    console.log('🔍 Finding user:', email);

    const user = await User.findOne({ email });

    if (!user) {
      console.log('❌ User not found:', email);
      console.log('\n💡 Available users:');
      const allUsers = await User.find({}).select('email name role');
      allUsers.forEach(u => {
        console.log(`   - ${u.email} (${u.name}) - Current role: ${u.role || 'user'}`);
      });
      process.exit(1);
    }

    console.log('✅ User found:', user.name);
    console.log('   Current role:', user.role || 'user');

    const oldRole = user.role || 'user';

    // Update to super_admin with all permissions
    user.role = 'super_admin';
    user.permissions = [
      'all',
      'manage_users',
      'manage_products',
      'manage_orders',
      'manage_services',
      'manage_appointments',
      'manage_finances',
      'manage_team',
      'manage_locations',
      'manage_settings',
      'view_analytics',
      'manage_discounts',
      'manage_feedback',
      'manage_support',
      'delete_any',
      'edit_any',
      'super_admin',
      'system_config',
      'security_monitoring',
      'audit_logs'
    ];
    user.isActive = true;
    user.isEmailVerified = true;
    user.accountLocked = false;
    user.loginAttempts = 0;

    await user.save();

    console.log('\n✅ SUCCESS! User upgraded to SUPER_ADMIN\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('   Name:', user.name);
    console.log('   Email:', user.email);
    console.log('   Role: SUPER_ADMIN (Full System Access)');
    console.log('   Permissions: ALL (including system config)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🎉 You now have full administrative privileges!');
    console.log('🔐 Login to access the security dashboard and all admin features\n');

    // Send real-time notification to user
    try {
      global.emitNotification(user._id.toString(), {
        type: 'role_update',
        title: '🎉 Admin Privileges Granted!',
        message: `Your account has been upgraded from ${oldRole} to SUPER_ADMIN with full system access.`,
        timestamp: new Date(),
        read: false
      });
      console.log('📡 Real-time notification sent to user\n');
    } catch (notifError) {
      console.log('⚠️  Could not send real-time notification (user may need to refresh)\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    // Give time for notification to be sent
    setTimeout(() => {
      mongoose.connection.close();
      process.exit(0);
    }, 1000);
  }
}

mongoose.connection.once('open', async () => {
  console.log('✅ Connected to MongoDB\n');

  // Check if --create-defaults flag is passed
  if (process.argv.includes('--create-defaults')) {
    await createDefaultSuperAdmins();
    console.log('🎉 Default super-admins created successfully!');
    mongoose.connection.close();
    process.exit(0);
  }

  // Get email from command line argument
  const email = process.argv[2];

  if (!email) {
    console.log('❌ Please provide an email address or use --create-defaults');
    console.log('\nUsage:');
    console.log('   node makeAdmin.js your@email.com    # Upgrade existing user');
    console.log('   node makeAdmin.js --create-defaults # Create default super-admins\n');
    mongoose.connection.close();
    process.exit(1);
  }

  makeUserAdmin(email);
});
