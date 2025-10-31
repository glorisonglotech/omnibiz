const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/user');
const Transaction = require('../models/transaction');
const Invoice = require('../models/invoice');
const Expense = require('../models/expense');

// Load .env from server directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();

    // Find the first user (assuming there's at least one user)
    const user = await User.findOne();
    if (!user) {
      console.log('No users found. Please create a user first.');
      return;
    }

    console.log(`Seeding data for user: ${user.name} (${user.email})`);

    // Clear existing data for this user
    await Transaction.deleteMany({ userId: user._id });
    await Invoice.deleteMany({ userId: user._id });
    await Expense.deleteMany({ userId: user._id });

    // Create sample transactions
    const sampleTransactions = [
      {
        userId: user._id,
        description: "Payment from ABC Corp",
        amount: 25000,
        type: "income",
        category: "sales",
        status: "completed",
        date: new Date('2024-01-15'),
        notes: "Monthly service payment"
      },
      {
        userId: user._id,
        description: "Office Supplies Purchase",
        amount: 3500,
        type: "expense",
        category: "office",
        status: "completed",
        date: new Date('2024-01-14'),
        notes: "Stationery and office equipment"
      },
      {
        userId: user._id,
        description: "Consultation Fee - XYZ Ltd",
        amount: 15000,
        type: "income",
        category: "consultation",
        status: "completed",
        date: new Date('2024-01-13'),
        notes: "Business consultation services"
      },
      {
        userId: user._id,
        description: "Marketing Campaign",
        amount: 8000,
        type: "expense",
        category: "marketing",
        status: "completed",
        date: new Date('2024-01-12'),
        notes: "Social media advertising"
      },
      {
        userId: user._id,
        description: "Product Sales - Online Store",
        amount: 12000,
        type: "income",
        category: "product",
        status: "completed",
        date: new Date('2024-01-11'),
        notes: "E-commerce sales"
      },
      {
        userId: user._id,
        description: "Transport Expenses",
        amount: 2500,
        type: "expense",
        category: "transport",
        status: "completed",
        date: new Date('2024-01-10'),
        notes: "Client meetings and deliveries"
      },
      {
        userId: user._id,
        description: "Service Payment - DEF Company",
        amount: 18000,
        type: "income",
        category: "service",
        status: "pending",
        date: new Date('2024-01-09'),
        notes: "Pending payment for services rendered"
      }
    ];

    await Transaction.insertMany(sampleTransactions);
    console.log('Sample transactions created');

    // Create sample invoices
    const sampleInvoices = [
      {
        userId: user._id,
        customerName: "ABC Corporation",
        clientEmail: "finance@abccorp.com",
        totalAmount: 25000,
        paymentStatus: "Paid",
        issuedDate: new Date('2024-01-01'),
        dueDate: new Date('2024-01-15')
      },
      {
        userId: user._id,
        customerName: "XYZ Limited",
        clientEmail: "accounts@xyzltd.com",
        totalAmount: 15000,
        paymentStatus: "Paid",
        issuedDate: new Date('2024-01-05'),
        dueDate: new Date('2024-01-13')
      },
      {
        userId: user._id,
        customerName: "DEF Company",
        clientEmail: "billing@defcompany.com",
        totalAmount: 18000,
        paymentStatus: "Pending",
        issuedDate: new Date('2024-01-08'),
        dueDate: new Date('2024-01-22')
      },
      {
        userId: user._id,
        customerName: "GHI Enterprises",
        clientEmail: "payments@ghient.com",
        totalAmount: 22000,
        paymentStatus: "Unpaid",
        issuedDate: new Date('2024-01-12'),
        dueDate: new Date('2024-01-26')
      }
    ];

    await Invoice.insertMany(sampleInvoices);
    console.log('Sample invoices created');

    // Create sample expenses
    const sampleExpenses = [
      {
        userId: user._id,
        title: "Office Supplies",
        amount: 3500,
        category: "office",
        date: new Date('2024-01-14'),
        notes: "Stationery and office equipment"
      },
      {
        userId: user._id,
        title: "Marketing Campaign",
        amount: 8000,
        category: "marketing",
        date: new Date('2024-01-12'),
        notes: "Social media advertising"
      },
      {
        userId: user._id,
        title: "Transport Expenses",
        amount: 2500,
        category: "transport",
        date: new Date('2024-01-10'),
        notes: "Client meetings and deliveries"
      },
      {
        userId: user._id,
        title: "Utilities Bill",
        amount: 4500,
        category: "utilities",
        date: new Date('2024-01-08'),
        notes: "Electricity and internet"
      }
    ];

    await Expense.insertMany(sampleExpenses);
    console.log('Sample expenses created');

    console.log('Database seeding completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
