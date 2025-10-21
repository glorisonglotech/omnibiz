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

// Service CRUD routes (allow any authenticated user to manage their own services)
router.post('/', createService); // Removed role requirement - users can create their own services
router.get('/', getServices);
router.get('/categories', getServiceCategories);
router.get('/:id', getServiceById);
router.put('/:id', updateService); // Removed role requirement
router.delete('/:id', deleteService); // Removed role requirement
router.patch('/:id/toggle', toggleServiceStatus); // Removed role requirement

// Bulk operations (allow any authenticated user)
router.post('/bulk', bulkCreateServices); // Removed role requirement

module.exports = router;
