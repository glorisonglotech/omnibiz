const Wishlist = require('../models/wishlist');
const Product = require('../models/product');
const { getIO } = require('../config/socket');

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private (User/Customer) or Public (Guest with guestId)
exports.getWishlist = async (req, res) => {
  try {
    const { guestId } = req.query;
    let query = {};

    if (req.user) {
      // Authenticated business user
      query.userId = req.user._id;
    } else if (req.customer) {
      // Authenticated customer
      query.customerId = req.customer._id;
    } else if (guestId) {
      // Guest user
      query.guestId = guestId;
    } else {
      return res.status(400).json({ message: 'User identification required' });
    }

    const wishlistItems = await Wishlist.find(query)
      .populate('productId')
      .sort({ addedAt: -1 });

    // Filter out items where product was deleted
    const validItems = wishlistItems.filter(item => item.productId);

    res.json(validItems);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private (User/Customer) or Public (Guest with guestId)
exports.addToWishlist = async (req, res) => {
  try {
    const { productId, guestId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let wishlistData = {
      productId,
      productSnapshot: {
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category
      }
    };

    if (req.user) {
      wishlistData.userId = req.user._id;
    } else if (req.customer) {
      wishlistData.customerId = req.customer._id;
    } else if (guestId) {
      wishlistData.guestId = guestId;
    } else {
      return res.status(400).json({ message: 'User identification required' });
    }

    // Check if already in wishlist
    const existing = await Wishlist.findOne(wishlistData);
    if (existing) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }

    const wishlistItem = await Wishlist.create(wishlistData);
    const populatedItem = await Wishlist.findById(wishlistItem._id).populate('productId');

    // Emit real-time update
    try {
      const io = getIO();
      if (req.user) {
        io.to(`user_${req.user._id}`).emit('wishlist_updated', {
          type: 'add',
          item: populatedItem
        });
      } else if (req.customer) {
        io.to(`customer_${req.customer._id}`).emit('wishlist_updated', {
          type: 'add',
          item: populatedItem
        });
      }
    } catch (socketError) {
      console.log('Socket emit failed (non-critical):', socketError.message);
    }

    res.status(201).json(populatedItem);
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private (User/Customer) or Public (Guest with guestId)
exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const { guestId } = req.query;

    let query = { productId };

    if (req.user) {
      query.userId = req.user._id;
    } else if (req.customer) {
      query.customerId = req.customer._id;
    } else if (guestId) {
      query.guestId = guestId;
    } else {
      return res.status(400).json({ message: 'User identification required' });
    }

    const wishlistItem = await Wishlist.findOneAndDelete(query);

    if (!wishlistItem) {
      return res.status(404).json({ message: 'Wishlist item not found' });
    }

    // Emit real-time update
    try {
      const io = getIO();
      if (req.user) {
        io.to(`user_${req.user._id}`).emit('wishlist_updated', {
          type: 'remove',
          productId
        });
      } else if (req.customer) {
        io.to(`customer_${req.customer._id}`).emit('wishlist_updated', {
          type: 'remove',
          productId
        });
      }
    } catch (socketError) {
      console.log('Socket emit failed (non-critical):', socketError.message);
    }

    res.json({ message: 'Product removed from wishlist' });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear entire wishlist
// @route   DELETE /api/wishlist
// @access  Private (User/Customer) or Public (Guest with guestId)
exports.clearWishlist = async (req, res) => {
  try {
    const { guestId } = req.query;
    let query = {};

    if (req.user) {
      query.userId = req.user._id;
    } else if (req.customer) {
      query.customerId = req.customer._id;
    } else if (guestId) {
      query.guestId = guestId;
    } else {
      return res.status(400).json({ message: 'User identification required' });
    }

    await Wishlist.deleteMany(query);

    // Emit real-time update
    try {
      const io = getIO();
      if (req.user) {
        io.to(`user_${req.user._id}`).emit('wishlist_updated', {
          type: 'clear'
        });
      } else if (req.customer) {
        io.to(`customer_${req.customer._id}`).emit('wishlist_updated', {
          type: 'clear'
        });
      }
    } catch (socketError) {
      console.log('Socket emit failed (non-critical):', socketError.message);
    }

    res.json({ message: 'Wishlist cleared' });
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Move wishlist from guest to authenticated user
// @route   POST /api/wishlist/migrate
// @access  Private (User/Customer)
exports.migrateGuestWishlist = async (req, res) => {
  try {
    const { guestId } = req.body;

    if (!guestId) {
      return res.status(400).json({ message: 'Guest ID is required' });
    }

    // Find all guest wishlist items
    const guestItems = await Wishlist.find({ guestId });

    if (guestItems.length === 0) {
      return res.json({ message: 'No guest wishlist items to migrate', count: 0 });
    }

    let migratedCount = 0;
    const errors = [];

    for (const item of guestItems) {
      try {
        // Create new wishlist item for authenticated user
        const newItem = {
          productId: item.productId,
          productSnapshot: item.productSnapshot
        };

        if (req.user) {
          newItem.userId = req.user._id;
        } else if (req.customer) {
          newItem.customerId = req.customer._id;
        }

        // Check if already exists
        const existing = await Wishlist.findOne(newItem);
        if (!existing) {
          await Wishlist.create(newItem);
          migratedCount++;
        }

        // Delete guest item
        await Wishlist.findByIdAndDelete(item._id);
      } catch (err) {
        errors.push({ productId: item.productId, error: err.message });
      }
    }

    res.json({
      message: `Migrated ${migratedCount} items from guest wishlist`,
      count: migratedCount,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Error migrating wishlist:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = exports;

