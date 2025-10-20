const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Service = require('../models/service');
const User = require('../models/user');

dotenv.config();

// Comprehensive service categories with multiple services
const serviceTemplates = [
  // Hair Care Services
  {
    name: 'Hair Cut & Style',
    description: 'Professional haircut with styling and blow-dry. Includes consultation.',
    price: 1500,
    duration: '45 min',
    category: 'Hair Care',
    isActive: true,
    rating: 4.8
  },
  {
    name: 'Hair Coloring',
    description: 'Full hair coloring service with premium products. Includes root touch-up.',
    price: 3500,
    duration: '90 min',
    category: 'Hair Care',
    isActive: true,
    rating: 4.9
  },
  {
    name: 'Hair Treatment & Spa',
    description: 'Deep conditioning treatment with scalp massage and hair spa therapy.',
    price: 2500,
    duration: '60 min',
    category: 'Hair Care',
    isActive: true,
    rating: 4.7
  },
  {
    name: 'Braiding & Extensions',
    description: 'Professional braiding service with quality extensions. Multiple styles available.',
    price: 4000,
    duration: '120 min',
    category: 'Hair Care',
    isActive: true,
    rating: 4.9
  },

  // Beauty & Skincare Services
  {
    name: 'Facial Treatment',
    description: 'Luxury facial with deep cleansing, exfoliation, and hydrating mask.',
    price: 2000,
    duration: '60 min',
    category: 'Skincare',
    isActive: true,
    rating: 4.8
  },
  {
    name: 'Makeup Application',
    description: 'Professional makeup for events, weddings, or photoshoots. Premium products.',
    price: 3000,
    duration: '75 min',
    category: 'Beauty',
    isActive: true,
    rating: 5.0
  },
  {
    name: 'Eyebrow Shaping & Tinting',
    description: 'Professional eyebrow shaping with optional tinting for defined look.',
    price: 800,
    duration: '30 min',
    category: 'Beauty',
    isActive: true,
    rating: 4.6
  },
  {
    name: 'Eyelash Extensions',
    description: 'Premium eyelash extension application. Classic or volume styles available.',
    price: 3500,
    duration: '90 min',
    category: 'Beauty',
    isActive: true,
    rating: 4.9
  },

  // Nail Services
  {
    name: 'Manicure',
    description: 'Complete manicure service with nail shaping, cuticle care, and polish.',
    price: 1200,
    duration: '45 min',
    category: 'Nail Care',
    isActive: true,
    rating: 4.7
  },
  {
    name: 'Pedicure',
    description: 'Relaxing pedicure with foot soak, exfoliation, massage, and polish.',
    price: 1500,
    duration: '60 min',
    category: 'Nail Care',
    isActive: true,
    rating: 4.8
  },
  {
    name: 'Gel Nails',
    description: 'Long-lasting gel nail application with UV curing. Lasts 2-3 weeks.',
    price: 2000,
    duration: '60 min',
    category: 'Nail Care',
    isActive: true,
    rating: 4.9
  },
  {
    name: 'Nail Art & Design',
    description: 'Creative nail art and custom designs. Price varies by complexity.',
    price: 2500,
    duration: '75 min',
    category: 'Nail Care',
    isActive: true,
    rating: 5.0
  },

  // Spa & Wellness Services
  {
    name: 'Full Body Massage',
    description: 'Therapeutic full body massage to relieve tension and promote relaxation.',
    price: 3500,
    duration: '90 min',
    category: 'Spa & Wellness',
    isActive: true,
    rating: 4.9
  },
  {
    name: 'Hot Stone Therapy',
    description: 'Relaxing hot stone massage therapy for deep muscle relaxation.',
    price: 4000,
    duration: '90 min',
    category: 'Spa & Wellness',
    isActive: true,
    rating: 5.0
  },
  {
    name: 'Body Scrub & Wrap',
    description: 'Exfoliating body scrub followed by nourishing body wrap treatment.',
    price: 3000,
    duration: '75 min',
    category: 'Spa & Wellness',
    isActive: true,
    rating: 4.7
  },

  // Specialized Services
  {
    name: 'Bridal Package',
    description: 'Complete bridal beauty package: hair, makeup, nails, and spa treatment.',
    price: 12000,
    duration: '240 min',
    category: 'Special Packages',
    isActive: true,
    rating: 5.0
  },
  {
    name: 'Men\'s Grooming',
    description: 'Complete grooming service for men: haircut, beard trim, and facial.',
    price: 2500,
    duration: '60 min',
    category: 'Men\'s Services',
    isActive: true,
    rating: 4.8
  },
  {
    name: 'Teen Makeover',
    description: 'Age-appropriate makeover for teens including hair, makeup, and styling tips.',
    price: 2000,
    duration: '60 min',
    category: 'Special Packages',
    isActive: true,
    rating: 4.6
  },
  {
    name: 'Waxing Services',
    description: 'Professional waxing service for smooth skin. Various areas available.',
    price: 1500,
    duration: '45 min',
    category: 'Beauty',
    isActive: true,
    rating: 4.7
  },
  {
    name: 'Consultation & Styling',
    description: 'Personal styling consultation with color analysis and wardrobe recommendations.',
    price: 1800,
    duration: '60 min',
    category: 'Consultation',
    isActive: true,
    rating: 4.8
  }
];

const seedServices = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find all admin/super_admin users to seed services for
    const users = await User.find({ 
      role: { $in: ['admin', 'super_admin'] } 
    }).limit(10);

    if (users.length === 0) {
      console.log('No admin users found. Please create an admin user first.');
      process.exit(1);
    }

    console.log(`Found ${users.length} admin user(s). Creating services...`);

    let totalCreated = 0;

    for (const user of users) {
      // Check if user already has services
      const existingServices = await Service.countDocuments({ userId: user._id });
      
      if (existingServices > 0) {
        console.log(`User ${user.email} already has ${existingServices} service(s). Skipping...`);
        continue;
      }

      // Create services for this user
      const servicesForUser = serviceTemplates.map(template => ({
        ...template,
        userId: user._id,
        bookings: Math.floor(Math.random() * 50) // Random bookings for demo
      }));

      const createdServices = await Service.insertMany(servicesForUser);
      totalCreated += createdServices.length;

      console.log(`✅ Created ${createdServices.length} services for ${user.email}`);
    }

    console.log(`\n🎉 Successfully seeded ${totalCreated} services total!`);
    console.log('Service categories included:');
    const categories = [...new Set(serviceTemplates.map(s => s.category))];
    categories.forEach(cat => console.log(`  - ${cat}`));

    process.exit(0);
  } catch (error) {
    console.error('Error seeding services:', error);
    process.exit(1);
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedServices();
}

module.exports = { seedServices, serviceTemplates };
