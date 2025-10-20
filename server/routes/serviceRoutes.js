const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');

const {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService,
  toggleServiceStatus,
  getServiceCategories,
  bulkCreateServices
} = require('../controllers/serviceController');

// Apply authentication
router.use(protect);

// Service CRUD routes
router.post('/', requireRole(['admin', 'super_admin']), createService);
router.get('/', getServices);
router.get('/categories', getServiceCategories);
router.get('/:id', getServiceById);
router.put('/:id', requireRole(['admin', 'super_admin']), updateService);
router.delete('/:id', requireRole(['admin', 'super_admin']), deleteService);
router.patch('/:id/toggle', requireRole(['admin', 'super_admin']), toggleServiceStatus);

// Bulk operations
router.post('/bulk', requireRole(['admin', 'super_admin']), bulkCreateServices);

module.exports = router;
