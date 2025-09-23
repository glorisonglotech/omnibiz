const express = require('express');
const router = express.Router();
const {
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense
} = require('../controllers/expenseController');
const { protect } = require('../middlewares/authMiddleware');


router.post('/', protect, createExpense);


router.get('/', protect, getAllExpenses);


router.get('/:id', protect, getExpenseById);

router.put('/:id', protect, updateExpense);

router.delete('/:id', protect, deleteExpense);

module.exports = router;
