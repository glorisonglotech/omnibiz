const express = require("express");
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();
const {createProduct,getAllProducts,getProductById,updateProduct,deleteProduct} = require('../controllers/productController');
const {getInventorySummary,getStockMovements,restockProduct} = require('../controllers/inventoryController');


// Inventory management routes (must come before /:id routes)
router.get('/inventory/summary',protect,getInventorySummary);
router.get('/inventory/movements',protect,getStockMovements);
router.post('/inventory/restock',protect,restockProduct);

// Product routes
router.get('/',protect,getAllProducts);
router.get('/:id',protect,getProductById);
router.post('/',protect,createProduct);
router.put('/:id',protect,updateProduct);
router.delete('/:id',protect,deleteProduct);

module.exports = router;
