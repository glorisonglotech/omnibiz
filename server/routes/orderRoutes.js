const express = require("express");
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();
const {createOrder,updateOrder,deleteOrder,getAllOrders,getOrderById} = require('../controllers/orderController');

router.get('/',protect,getAllOrders);
router.get('/:id',protect,getOrderById);
router.put('/:id',protect,updateOrder);
router.post('/',protect,createOrder);
router.delete('/:id',protect,deleteOrder);

module.exports = router;