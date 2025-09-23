const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment
} = require('../controllers/appointmentController');
const { protect } = require('../middlewares/authMiddleware');


router.post('/', protect, createAppointment);


router.get('/', protect, getAllAppointments);


router.get('/:id', protect, getAppointmentById);


router.put('/:id', protect, updateAppointment);


router.delete('/:id', protect, deleteAppointment);

module.exports = router;
