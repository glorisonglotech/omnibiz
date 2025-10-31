const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  getAllPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrder,
  approvePurchaseOrder,
  deletePurchaseOrder,
  getAllSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier
} = require('../controllers/purchasingController');

// Purchase Order Routes
router.get('/orders', protect, getAllPurchaseOrders);
router.get('/orders/:id', protect, getPurchaseOrderById);
router.post('/orders', protect, createPurchaseOrder);
router.put('/orders/:id', protect, updatePurchaseOrder);
router.put('/orders/:id/approve', protect, approvePurchaseOrder);
router.delete('/orders/:id', protect, deletePurchaseOrder);

// Supplier Routes
router.get('/suppliers', protect, getAllSuppliers);
router.post('/suppliers', protect, createSupplier);
router.put('/suppliers/:id', protect, updateSupplier);
router.delete('/suppliers/:id', protect, deleteSupplier);

module.exports = router;

