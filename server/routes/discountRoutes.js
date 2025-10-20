const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');

const {
  createDiscount,
  getDiscounts,
  getDiscountById,
  updateDiscount,
  toggleDiscountStatus,
  deleteDiscount,
  applyDiscountCode
} = require('../controllers/discountController');

// Apply authentication for admin routes
router.use(protect);

// Admin routes
router.post('/', requireRole(['admin', 'super_admin']), createDiscount);
router.get('/', getDiscounts);
router.get('/:id', getDiscountById);
router.put('/:id', requireRole(['admin', 'super_admin']), updateDiscount);
router.patch('/:id/toggle', requireRole(['admin', 'super_admin']), toggleDiscountStatus);
router.delete('/:id', requireRole(['admin', 'super_admin']), deleteDiscount);

// Public route for applying discount
router.post('/apply', applyDiscountCode);

module.exports = router;
