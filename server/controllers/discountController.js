const Discount = require('../models/discount');
const Product = require('../models/product');
const Service = require('../models/service');
const User = require('../models/user');
const { getIO } = require('../config/socket');

// @desc    Create discount
// @route   POST /api/discounts
// @access  Private (Admin)
exports.createDiscount = async (req, res) => {
  try {
    const discount = new Discount({
      ...req.body,
      userId: req.user._id
    });

    await discount.save();

    // Emit real-time event
    const io = getIO();
    io.to('admins').emit('discount_created', { discount });
    
    // If show on storefront, emit to storefronts
    if (discount.showOnStorefront) {
      const user = await User.findById(req.user._id);
      if (user?.inviteCode) {
        io.to(`storefront_${user.inviteCode}`).emit('discount_sync', {
          type: 'insert',
          discount
        });
      }
    }

    res.status(201).json({
      message: 'Discount created successfully',
      discount
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all discounts
// @route   GET /api/discounts
// @access  Private (Admin)
exports.getDiscounts = async (req, res) => {
  try {
    const { isActive, isSeasonalPromotion, applicableTo } = req.query;
    
    const filter = { userId: req.user._id };
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (isSeasonalPromotion !== undefined) filter.isSeasonalPromotion = isSeasonalPromotion === 'true';
    if (applicableTo) filter.applicableTo = applicableTo;

    const discounts = await Discount.find(filter)
      .sort({ displayOrder: -1, createdAt: -1 });

    res.json({ discounts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single discount
// @route   GET /api/discounts/:id
// @access  Private (Admin)
exports.getDiscountById = async (req, res) => {
  try {
    const discount = await Discount.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!discount) {
      return res.status(404).json({ message: 'Discount not found' });
    }

    res.json({ discount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update discount
// @route   PUT /api/discounts/:id
// @access  Private (Admin)
exports.updateDiscount = async (req, res) => {
  try {
    const discount = await Discount.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!discount) {
      return res.status(404).json({ message: 'Discount not found' });
    }

    // Emit real-time update
    const io = getIO();
    const user = await User.findById(req.user._id);
    if (user?.inviteCode) {
      io.to(`storefront_${user.inviteCode}`).emit('discount_sync', {
        type: 'update',
        discount
      });
    }

    res.json({ message: 'Discount updated', discount });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Toggle discount active status
// @route   PATCH /api/discounts/:id/toggle
// @access  Private (Admin)
exports.toggleDiscountStatus = async (req, res) => {
  try {
    const discount = await Discount.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!discount) {
      return res.status(404).json({ message: 'Discount not found' });
    }

    discount.isActive = !discount.isActive;
    await discount.save();

    // Emit real-time update
    const io = getIO();
    const user = await User.findById(req.user._id);
    if (user?.inviteCode) {
      io.to(`storefront_${user.inviteCode}`).emit('discount_sync', {
        type: 'update',
        discount
      });
    }

    res.json({ 
      message: `Discount ${discount.isActive ? 'activated' : 'deactivated'}`,
      discount 
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete discount
// @route   DELETE /api/discounts/:id
// @access  Private (Admin)
exports.deleteDiscount = async (req, res) => {
  try {
    const discount = await Discount.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!discount) {
      return res.status(404).json({ message: 'Discount not found' });
    }

    // Emit real-time deletion
    const io = getIO();
    const user = await User.findById(req.user._id);
    if (user?.inviteCode) {
      io.to(`storefront_${user.inviteCode}`).emit('discount_sync', {
        type: 'delete',
        discount: { _id: discount._id }
      });
    }

    res.json({ message: 'Discount deleted' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Apply discount code
// @route   POST /api/discounts/apply
// @access  Public
exports.applyDiscountCode = async (req, res) => {
  try {
    const { code, orderAmount, customerId, customerType = 'returning' } = req.body;

    const discount = await Discount.findOne({ 
      code: code.toUpperCase(),
      isActive: true
    });

    if (!discount) {
      return res.status(404).json({ message: 'Invalid discount code' });
    }

    // Check validity
    const now = new Date();
    if (now < discount.validFrom || now > discount.validUntil) {
      return res.status(400).json({ message: 'Discount code has expired' });
    }

    // Check usage limits
    if (discount.usageLimit.total && discount.usageCount >= discount.usageLimit.total) {
      return res.status(400).json({ message: 'Discount code usage limit reached' });
    }

    // Check if customer can use
    if (!discount.canBeUsedBy(customerId, customerType)) {
      return res.status(400).json({ message: 'You are not eligible for this discount' });
    }

    // Calculate discount
    const discountAmount = discount.calculateDiscount(orderAmount);

    if (discountAmount === 0) {
      return res.status(400).json({ 
        message: `Minimum purchase amount of KES ${discount.minPurchaseAmount} required` 
      });
    }

    res.json({
      success: true,
      discount: {
        id: discount._id,
        name: discount.name,
        type: discount.type,
        discountAmount,
        finalAmount: orderAmount - discountAmount
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get active storefront discounts (Public)
// @route   GET /api/public/discounts
// @access  Public
exports.getStorefrontDiscounts = async (req, res) => {
  try {
    const { inviteCode } = req.query;
    
    if (!inviteCode) {
      return res.status(400).json({ message: 'inviteCode required' });
    }

    const owner = await User.findOne({ inviteCode });
    if (!owner) {
      return res.status(404).json({ message: 'Store not found' });
    }

    const now = new Date();
    const discounts = await Discount.find({
      userId: owner._id,
      isActive: true,
      showOnStorefront: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now }
    })
    .populate('applicableProducts', 'name image price category')
    .populate('applicableServices', 'name image price duration category')
    .sort({ 
      'seasonalDetails.priority': -1, 
      displayOrder: -1, 
      createdAt: -1 
    });

    // Increment view count
    await Discount.updateMany(
      { _id: { $in: discounts.map(d => d._id) } },
      { $inc: { 'stats.views': 1 } }
    );

    // Format response with populated data
    const formattedDiscounts = discounts.map(discount => ({
      ...discount.toObject(),
      products: discount.applicableProducts || [],
      services: discount.applicableServices || []
    }));

    console.log(`✅ [STOREFRONT] Loaded ${formattedDiscounts.length} active discounts for ${owner.email}`);
    
    res.json({ discounts: formattedDiscounts });
  } catch (error) {
    console.error('Error fetching storefront discounts:', error);
    res.status(500).json({ message: error.message });
  }
};
