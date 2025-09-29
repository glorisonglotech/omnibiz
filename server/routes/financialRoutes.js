const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const transactionController = require('../controllers/transactionController');

// GET /api/financial-summary
router.get('/financial-summary', protect, transactionController.getFinancialSummary);

// GET /api/transactions
router.get('/transactions', protect, transactionController.getTransactions);

// POST /api/transactions
router.post('/transactions', protect, transactionController.createTransaction);

// PUT /api/transactions/:id
router.put('/transactions/:id', protect, transactionController.updateTransaction);

// DELETE /api/transactions/:id
router.delete('/transactions/:id', protect, transactionController.deleteTransaction);

module.exports = router;
