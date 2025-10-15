const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  createLocation,
  getAllLocations,
  getLocationById,
  updateLocation,
  deleteLocation,
  getLocationStats,
  seedDefaultLocations
} = require('../controllers/locationController');

// POST /api/locations/seed - Seed default locations (must come before /:id routes)
router.post('/seed', protect, seedDefaultLocations);

// GET /api/locations/stats - Get location statistics
router.get('/stats', protect, getLocationStats);

// GET /api/locations - Get all locations
router.get('/', protect, getAllLocations);

// GET /api/locations/:id - Get location by ID
router.get('/:id', protect, getLocationById);

// POST /api/locations - Create new location
router.post('/', protect, createLocation);

// PUT /api/locations/:id - Update location
router.put('/:id', protect, updateLocation);

// DELETE /api/locations/:id - Delete location
router.delete('/:id', protect, deleteLocation);

module.exports = router;
