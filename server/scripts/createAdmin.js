const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/omnibiz', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// User Schema (simplified - adjust to match your actual schema)
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: {
    type: String,
    enum: ['user', 'admin', 'superadmin', 'owner'],
    default: 'user'
  },
  permissions: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function createSuperAdmin() {
  try {
    console.log('🔧 Creating Super Admin Account...\n');

    // Check if super admin already exists
    const existingAdmin = await User.findOne({ role: 'owner' });
    
    if (existingAdmin) {
      console.log('✅ Super Admin already exists:');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log('\n💡 Updating to ensure full privileges...\n');
      
      // Update existing admin with full permissions
      existingAdmin.role = 'owner';
      existingAdmin.permissions = [
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
        'edit_any'
      ];
      existingAdmin.isActive = true;
      existingAdmin.isEmailVerified = true;
      
      await existingAdmin.save();
      
      console.log('✅ Super Admin Updated Successfully!');
      console.log(`   Name: ${existingAdmin.name}`);
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log(`   Permissions: ${existingAdmin.permissions.length} permissions granted`);
      
    } else {
      // Create new super admin
      console.log('📝 Enter Super Admin Details:\n');
      
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });

      readline.question('Name: ', async (name) => {
        readline.question('Email: ', async (email) => {
          readline.question('Password: ', async (password) => {
            
            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create super admin
            const superAdmin = new User({
              name,
              email,
              password: hashedPassword,
              role: 'owner',
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
                'edit_any'
              ],
              isActive: true,
              isEmailVerified: true
            });

            await superAdmin.save();

            console.log('\n✅ Super Admin Created Successfully!\n');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('   Name:', name);
            console.log('   Email:', email);
            console.log('   Role: OWNER (Full Privileges)');
            console.log('   Permissions: ALL');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
            console.log('🔐 You can now login with these credentials');
            console.log('🚀 Navigate to /login and use your credentials\n');

            readline.close();
            mongoose.connection.close();
            process.exit(0);
          });
        });
      });
    }
  } catch (error) {
    console.error('❌ Error creating super admin:', error);
    mongoose.connection.close();
    process.exit(1);
  }
}

// If existing admin found and updated, close connection
mongoose.connection.once('open', async () => {
  console.log('✅ Connected to MongoDB\n');
  await createSuperAdmin();
  
  // Only close if we updated existing admin (not waiting for input)
  const existingAdmin = await User.findOne({ role: 'owner' });
  if (existingAdmin) {
    mongoose.connection.close();
    process.exit(0);
  }
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});
