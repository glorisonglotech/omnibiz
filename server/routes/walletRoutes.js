const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');

// In-memory fallback stores (replace with DB models as needed)
const userSettings = new Map();
const userConnectedAccounts = new Map();
const userBudgets = new Map();
const userRecurring = new Map();

router.use(protect);

// GET limits
router.get('/limits', (req, res) => {
  return res.json({ daily: 50000, perTransaction: 20000, todaySpent: 0 });
});

// GET budgets
router.get('/budgets', (req, res) => {
  const items = userBudgets.get(req.user._id.toString()) || [];
  return res.json(items);
});

// GET recurring payments
router.get('/recurring', (req, res) => {
  const items = userRecurring.get(req.user._id.toString()) || [];
  return res.json(items);
});

// GET connected accounts
router.get('/connected-accounts', (req, res) => {
  const items = userConnectedAccounts.get(req.user._id.toString()) || [];
  return res.json(items);
});

// POST link account
router.post('/link-account', (req, res) => {
  const userId = req.user._id.toString();
  const accounts = userConnectedAccounts.get(userId) || [];
  const account = { ...req.body, _id: `${Date.now()}`, verified: false, createdAt: new Date() };
  accounts.push(account);
  userConnectedAccounts.set(userId, accounts);
  return res.status(201).json(account);
});

// DELETE connected account
router.delete('/connected-accounts/:id', (req, res) => {
  const userId = req.user._id.toString();
  const accounts = userConnectedAccounts.get(userId) || [];
  const next = accounts.filter(a => a._id !== req.params.id);
  userConnectedAccounts.set(userId, next);
  return res.json({ message: 'Disconnected' });
});

// GET settings
router.get('/settings', (req, res) => {
  const defaults = {
    transactionNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    twoFactorAuth: false,
    autoSaveReceipts: true,
    currency: 'KES',
    language: 'en',
    theme: 'auto'
  };
  const s = userSettings.get(req.user._id.toString()) || defaults;
  return res.json(s);
});

// PUT settings
router.put('/settings', (req, res) => {
  userSettings.set(req.user._id.toString(), req.body);
  return res.json({ ok: true });
});

// POST verify pin (demo always true)
router.post('/verify-pin', (req, res) => {
  return res.json({ verified: true });
});

// POST deposit
router.post('/deposit', (req, res) => {
  // In a real impl, persist a transaction entry
  return res.status(201).json({ ok: true });
});

// POST withdraw
router.post('/withdraw', (req, res) => {
  return res.status(201).json({ ok: true });
});

// POST invest
router.post('/invest', (req, res) => {
  return res.status(201).json({ ok: true });
});

// POST external transfer
router.post('/external-transfer', (req, res) => {
  return res.status(201).json({ ok: true });
});

module.exports = router;


