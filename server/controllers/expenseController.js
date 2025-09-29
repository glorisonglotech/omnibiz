const Expense = require("../models/expense");
const { createTransactionFromExpense } = require("./transactionController");

// Create a new expense
exports.createExpense = async (req, res) => {
  try {
    const userId = req.user.id;
    const expenseData = { ...req.body, userId };

    const expense = new Expense(expenseData);
    await expense.save();

    // Create corresponding transaction
    await createTransactionFromExpense(expense._id, userId);

    res.status(201).json({ message: 'Expense created successfully', expense });
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(400).json({ error: error.message });
  }
};

// Get all expenses for the authenticated user
exports.getAllExpenses = async (req, res) => {
  try {
    const userId = req.user.id;
    const expenses = await Expense.find({ userId }).populate("userId", "name email");
    res.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get a single expense by ID
exports.getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id).populate("userId");
    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }
    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an expense
exports.updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("userId");
    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }
    res.json(expense);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete an expense
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }
    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};