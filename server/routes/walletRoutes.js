const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const walletController = require('../controllers/walletController');

// Protect all wallet routes
router.use(protect);

// Wallet management
router.get('/', walletController.getWallet);
router.get('/balance', walletController.getBalance);
router.get('/transactions', walletController.getWalletTransactions);

// Transaction limits
router.get('/limits', walletController.getLimits);
router.put('/limits', walletController.updateLimits);

// Connected accounts
router.get('/connected-accounts', walletController.getConnectedAccounts);
router.post('/connect-account', walletController.connectAccount);
router.delete('/connected-accounts/:accountId', walletController.disconnectAccount);

// Transactions
router.post('/deposit', walletController.deposit);
router.post('/withdraw', walletController.withdraw);
router.post('/transfer', walletController.transfer);

// Security
router.post('/set-pin', walletController.setPin);
router.post('/verify-pin', walletController.verifyPin);

// Legacy routes (keep for backward compatibility)
router.get('/budgets', (req, res) => {
  return res.json([]);
});

router.get('/recurring', (req, res) => {
  return res.json([]);
});

router.get('/settings', (req, res) => {
  return res.json({
    transactionNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    twoFactorAuth: false,
    autoSaveReceipts: true,
    currency: 'KES',
    language: 'en',
    theme: 'auto'
  });
});

router.put('/settings', (req, res) => {
  return res.json({ ok: true });
});

module.exports = router;


