const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  confirmAppointment,
  rejectAppointment,
  completeAppointment,
  getAppointmentStats
} = require('../controllers/AppointmentController');
const { protect } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');


router.post('/', protect, createAppointment);


router.get('/', protect, getAllAppointments);


router.get('/:id', protect, getAppointmentById);


router.put('/:id', protect, updateAppointment);


router.delete('/:id', protect, deleteAppointment);

// Admin routes
router.put('/:id/confirm', protect, requireRole(['admin', 'super_admin']), confirmAppointment);
router.put('/:id/reject', protect, requireRole(['admin', 'super_admin']), rejectAppointment);
router.put('/:id/complete', protect, requireRole(['admin', 'super_admin']), completeAppointment);

// Statistics
router.get('/stats/overview', protect, getAppointmentStats);

module.exports = router;
