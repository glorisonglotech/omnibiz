const Transaction = require('../models/transaction');
const Invoice = require('../models/invoice');
const Expense = require('../models/expense');

// Get all transactions for a user
exports.getTransactions = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, type, category, startDate, endDate } = req.query;
    
    // Build filter object
    const filter = { userId };
    
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    
    const transactions = await Transaction.find(filter)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('userId', 'name email');
    
    const total = await Transaction.countDocuments(filter);
    
    res.json({
      transactions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

// Create a new transaction
exports.createTransaction = async (req, res) => {
  try {
    const userId = req.user._id;
    const { description, amount, type, category, status, reference, notes } = req.body;
    
    // Validate required fields
    if (!description || !amount || !type || !category) {
      return res.status(400).json({ 
        error: 'Description, amount, type, and category are required' 
      });
    }
    
    // Validate amount
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ 
        error: 'Amount must be a positive number' 
      });
    }
    
    // Maximum transaction limit
    if (parsedAmount > 10000000) {
      return res.status(400).json({ 
        error: 'Amount exceeds maximum limit of KES 10,000,000' 
      });
    }
    
    // Validate type
    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ 
        error: 'Type must be either income or expense' 
      });
    }
    
    const transaction = new Transaction({
      userId,
      description: description.trim(),
      amount: parsedAmount,
      type,
      category,
      status: status || 'completed',
      reference,
      notes
    });
    
    await transaction.save();
    
    res.status(201).json({ 
      message: 'Transaction created successfully', 
      transaction 
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
};

// Get financial summary
exports.getFinancialSummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;
    
    // Default to current month if no dates provided
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date();
    
    // Get transactions for the period
    const transactions = await Transaction.find({
      userId,
      date: { $gte: start, $lte: end }
    });
    
    // Calculate totals
    const totalRevenue = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const netProfit = totalRevenue - totalExpenses;
    
    // Get pending invoices
    const pendingInvoices = await Invoice.find({
      userId,
      paymentStatus: { $in: ['Pending', 'Unpaid'] }
    });
    
    const pendingInvoicesAmount = pendingInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    
    // Get recent transactions (last 5)
    const recentTransactions = await Transaction.find({ userId })
      .sort({ date: -1 })
      .limit(5)
      .select('description amount type category status date');
    
    // Format amounts
    const formatAmount = (amount) => `KES ${amount.toLocaleString()}`;
    
    const summary = {
      totalRevenue: formatAmount(totalRevenue),
      totalExpenses: formatAmount(totalExpenses),
      netProfit: formatAmount(netProfit),
      pendingInvoices: formatAmount(pendingInvoicesAmount),
      recentTransactions: recentTransactions.map(t => ({
        id: t._id,
        description: t.description,
        amount: formatAmount(t.amount),
        type: t.type,
        category: t.category,
        status: t.status,
        date: t.date.toLocaleDateString()
      }))
    };
    
    res.json(summary);
  } catch (error) {
    console.error('Error fetching financial summary:', error);
    res.status(500).json({ error: 'Failed to fetch financial summary' });
  }
};

// Update transaction
exports.updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const updateData = req.body;
    
    const transaction = await Transaction.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json({ message: 'Transaction updated successfully', transaction });
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
};

// Delete transaction
exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    const transaction = await Transaction.findOneAndDelete({ _id: id, userId });
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
};

// Create transaction from invoice payment
exports.createTransactionFromInvoice = async (invoiceId, userId) => {
  try {
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) return;
    
    const transaction = new Transaction({
      userId,
      description: `Payment received from ${invoice.customerName}`,
      amount: invoice.totalAmount,
      type: 'income',
      category: 'sales',
      status: 'completed',
      reference: invoiceId,
      notes: `Invoice payment - ${invoice.customerName}`
    });
    
    await transaction.save();
    return transaction;
  } catch (error) {
    console.error('Error creating transaction from invoice:', error);
  }
};

// Create transaction from expense
exports.createTransactionFromExpense = async (expenseId, userId) => {
  try {
    const expense = await Expense.findById(expenseId);
    if (!expense) return;
    
    const transaction = new Transaction({
      userId,
      description: expense.title || 'Business expense',
      amount: expense.amount,
      type: 'expense',
      category: expense.category || 'other_expense',
      status: 'completed',
      reference: expenseId,
      notes: expense.notes
    });
    
    await transaction.save();
    return transaction;
  } catch (error) {
    console.error('Error creating transaction from expense:', error);
  }
};
