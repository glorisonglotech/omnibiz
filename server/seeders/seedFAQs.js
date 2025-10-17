const mongoose = require('mongoose');
const FAQ = require('../models/faq');
require('dotenv').config();

const faqs = [
  {
    question: 'How do I create a new order?',
    answer: 'To create a new order, navigate to the Orders page from the sidebar, click the "Create Order" button, select products, enter customer information, and submit the order.',
    category: 'general',
    tags: ['orders', 'create', 'getting-started'],
    order: 1,
    isPublished: true
  },
  {
    question: 'How can I track my inventory?',
    answer: 'Go to the Inventory or Products section in your dashboard. Here you can view stock levels, add new products, and receive low-stock alerts.',
    category: 'features',
    tags: ['inventory', 'products', 'stock'],
    order: 2,
    isPublished: true
  },
  {
    question: 'How do I accept payments?',
    answer: 'OmniBiz supports M-Pesa and PayPal integrations. Configure your payment credentials in Settings > Payments, then you can process payments directly from orders.',
    category: 'billing',
    tags: ['payments', 'mpesa', 'paypal'],
    order: 3,
    isPublished: true
  },
  {
    question: 'Can I manage multiple locations?',
    answer: 'Yes! Navigate to Settings > Locations to add and manage multiple business locations. Each location can have separate inventory and staff assignments.',
    category: 'features',
    tags: ['locations', 'multi-location', 'branches'],
    order: 4,
    isPublished: true
  },
  {
    question: 'How do appointments work?',
    answer: 'Use the Appointments section to schedule services, assign team members, and send automatic reminders to customers via email and SMS.',
    category: 'features',
    tags: ['appointments', 'scheduling', 'calendar'],
    order: 5,
    isPublished: true
  },
  {
    question: 'How do I add team members?',
    answer: 'Go to Team Management, click "Add Team Member", enter their details, assign a role (staff/manager/admin), and set their permissions.',
    category: 'account',
    tags: ['team', 'staff', 'users', 'roles'],
    order: 6,
    isPublished: true
  },
  {
    question: 'Can I generate reports?',
    answer: 'Yes, the Reports section offers sales reports, inventory reports, financial summaries, and custom analytics. You can export them as PDF or Excel.',
    category: 'features',
    tags: ['reports', 'analytics', 'export'],
    order: 7,
    isPublished: true
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes, we use bank-level encryption (SSL/TLS), regular security audits, and secure data centers. Your data is backed up daily and can be exported anytime.',
    category: 'security',
    tags: ['security', 'encryption', 'privacy'],
    order: 8,
    isPublished: true
  },
  {
    question: 'How do I reset my password?',
    answer: 'Click "Forgot Password" on the login page, enter your email, and you\'ll receive a reset link. The link expires in 1 hour for security.',
    category: 'account',
    tags: ['password', 'reset', 'login'],
    order: 9,
    isPublished: true
  },
  {
    question: 'Can I use this on mobile?',
    answer: 'Yes! OmniBiz is a Progressive Web App (PWA). You can install it on your phone for offline access and native app-like experience.',
    category: 'technical',
    tags: ['mobile', 'pwa', 'app', 'offline'],
    order: 10,
    isPublished: true
  },
  {
    question: 'How do I contact support?',
    answer: 'Use the Help & Support page to create a ticket, start a live chat, or call us. Our support team is available 24/7 for urgent issues.',
    category: 'general',
    tags: ['support', 'help', 'contact'],
    order: 11,
    isPublished: true
  },
  {
    question: 'What are the subscription plans?',
    answer: 'We offer Starter, Professional, and Enterprise plans. Each plan includes different features and limits. Check the Subscriptions page for details.',
    category: 'billing',
    tags: ['subscription', 'pricing', 'plans'],
    order: 12,
    isPublished: true
  },
  {
    question: 'Can I customize invoices?',
    answer: 'Yes, go to Settings > Invoice Settings to customize your invoice template, add your logo, change colors, and set default terms.',
    category: 'features',
    tags: ['invoices', 'customization', 'branding'],
    order: 13,
    isPublished: true
  },
  {
    question: 'How do I export my data?',
    answer: 'Navigate to Settings > Data Export. You can export all your data (orders, customers, products) as CSV or JSON format.',
    category: 'account',
    tags: ['export', 'data', 'backup'],
    order: 14,
    isPublished: true
  },
  {
    question: 'What is the AI assistant?',
    answer: 'Our AI assistant (powered by Google Gemini) provides real-time business insights, answers questions, and offers recommendations to help grow your business.',
    category: 'features',
    tags: ['ai', 'assistant', 'insights', 'gemini'],
    order: 15,
    isPublished: true
  }
];

async function seedFAQs() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing FAQs (optional)
    await FAQ.deleteMany({});
    console.log('🗑️  Cleared existing FAQs');

    // Insert new FAQs
    const inserted = await FAQ.insertMany(faqs);
    console.log(`✅ Inserted ${inserted.length} FAQs`);

    console.log('✅ FAQ seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding FAQs:', error);
    process.exit(1);
  }
}

seedFAQs();
