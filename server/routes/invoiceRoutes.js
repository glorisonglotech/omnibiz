const express = require("express");
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();
const {createInvoice,updateInvoice,deleteInvoice,getAllInvoices,getInvoiceById} = require('../controllers/invoiceController');

router.get('/',protect,getAllInvoices);
router.get('/:id',protect,getInvoiceById);
router.delete('/:id',protect,deleteInvoice);
router.put('/:id',protect,updateInvoice);
router.post('/',protect,createInvoice);

module.exports = router;
