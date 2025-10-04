const express = require('express')
const { protect } = require('../middlewares/authMiddleware');
const { initiateSTKPush, handleCallback } = require(   "../controllers/mpesaController.js");

const router = express.Router();

router.post("/stkpush", protect, initiateSTKPush);
router.post("/callback",protect, handleCallback);


module.exports = router;
