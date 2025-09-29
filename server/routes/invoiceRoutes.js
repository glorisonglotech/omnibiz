const express = require("express");
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();
const {createInvoice,updateInvoice,deleteInvoice,getAllInvoices,getInvoiceById,markInvoiceAsPaid} = require('../controllers/invoiceController');

router.get('/',protect,getAllInvoices);
router.get('/:id',protect,getInvoiceById);
router.delete('/:id',protect,deleteInvoice);
router.put('/:id',protect,updateInvoice);
router.put('/:id/mark-paid',protect,markInvoiceAsPaid);
router.post('/',protect,createInvoice);

module.exports = router;
