const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/omnibiz', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

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
    
    // Update to owner with all permissions
    user.role = 'owner';
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
      'edit_any'
    ];
    user.isActive = true;
    user.isEmailVerified = true;
    
    await user.save();
    
    console.log('\n✅ SUCCESS! User upgraded to OWNER\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('   Name:', user.name);
    console.log('   Email:', user.email);
    console.log('   Role: OWNER (Full System Access)');
    console.log('   Permissions: ALL');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🎉 You now have full administrative privileges!');
    console.log('🔐 Login to see your admin dashboard\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}

mongoose.connection.once('open', () => {
  console.log('✅ Connected to MongoDB\n');
  
  // Get email from command line argument
  const email = process.argv[2];
  
  if (!email) {
    console.log('❌ Please provide an email address');
    console.log('\nUsage: node makeAdmin.js your@email.com\n');
    mongoose.connection.close();
    process.exit(1);
  }
  
  makeUserAdmin(email);
});
