const express = require("express");
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();
const {createProduct,getAllProducts,getProductById,updateProduct,deleteProduct} = require('../controllers/productController');


router.get('/',protect,getAllProducts);
router.get('/:id',protect,getProductById);
router.post('/',protect,createProduct);
router.put('/:id',protect,updateProduct);
router.delete('/:id',protect,deleteProduct);

module.exports = router;
