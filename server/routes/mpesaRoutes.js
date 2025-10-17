const express = require('express')
const { protect } = require('../middlewares/authMiddleware');
const { initiateSTKPush, handleCallback } = require("../controllers/mpesaController.js");

const router = express.Router();

// STK Push - requires authentication (user initiating payment)
router.post("/stk-push", protect, initiateSTKPush);
router.post("/stkpush", protect, initiateSTKPush); // Legacy route

// Callback - NO authentication (M-Pesa server sends this)
router.post("/callback", handleCallback);

module.exports = router;
