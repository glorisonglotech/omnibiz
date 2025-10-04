const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const asyncHandler = require('../middlewares/asyncHandler');
const User = require('../models/user');

// Mock subscription data structure
const subscriptionPlans = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 0,
    features: ['100 products', 'Basic inventory', '5 team members'],
    limits: { products: 100, teamMembers: 5 }
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    price: 29,
    features: ['Unlimited products', 'Advanced inventory', 'Unlimited team'],
    limits: { products: -1, teamMembers: -1 }
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'custom',
    features: ['Everything in Professional', 'Dedicated support', 'Custom features'],
    limits: { products: -1, teamMembers: -1 }
  }
};

// @desc    Get current subscription
// @route   GET /api/subscriptions/current
// @access  Private
const getCurrentSubscription = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  // Mock subscription data - in real app this would come from payment provider
  const subscription = user.subscription || {
    plan: 'starter',
    status: 'active',
    startDate: new Date(),
    nextBilling: null,
    cancelAtPeriodEnd: false
  };

  res.json({
    success: true,
    subscription: {
      ...subscription,
      planDetails: subscriptionPlans[subscription.plan]
    }
  });
});

// @desc    Subscribe to a plan
// @route   POST /api/subscriptions/subscribe
// @access  Private
const subscribeToPlan = asyncHandler(async (req, res) => {
  const { planId, isAnnual, amount, paymentMethod } = req.body;
  const userId = req.user._id;

  // Validate plan
  if (!subscriptionPlans[planId]) {
    return res.status(400).json({ message: 'Invalid plan selected' });
  }

  // Validate payment method (mock validation)
  if (!paymentMethod.cardNumber || !paymentMethod.expiryDate || !paymentMethod.cvv) {
    return res.status(400).json({ message: 'Invalid payment information' });
  }

  try {
    // Mock payment processing
    const paymentResult = await processPayment({
      amount,
      paymentMethod,
      planId,
      userId
    });

    if (paymentResult.success) {
      // Update user subscription
      const nextBilling = new Date();
      nextBilling.setMonth(nextBilling.getMonth() + (isAnnual ? 12 : 1));

      const subscription = {
        plan: planId,
        status: 'active',
        startDate: new Date(),
        nextBilling,
        isAnnual,
        amount,
        cancelAtPeriodEnd: false,
        paymentMethodId: paymentResult.paymentMethodId
      };

      await User.findByIdAndUpdate(userId, { subscription });

      // Log subscription activity
      const activityLogger = require('../services/activityLogger');
      await activityLogger.logActivity(userId, 'subscription', 'plan_subscribed', {
        planId,
        amount,
        isAnnual
      });

      res.json({
        success: true,
        message: `Successfully subscribed to ${subscriptionPlans[planId].name}`,
        subscription
      });
    } else {
      res.status(400).json({ message: paymentResult.error || 'Payment failed' });
    }
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ message: 'Subscription failed. Please try again.' });
  }
});

// @desc    Activate free plan
// @route   POST /api/subscriptions/activate
// @access  Private
const activateFreePlan = asyncHandler(async (req, res) => {
  const { planId } = req.body;
  const userId = req.user._id;

  if (planId !== 'starter') {
    return res.status(400).json({ message: 'Only starter plan can be activated for free' });
  }

  try {
    const subscription = {
      plan: 'starter',
      status: 'active',
      startDate: new Date(),
      nextBilling: null,
      isAnnual: false,
      amount: 0,
      cancelAtPeriodEnd: false
    };

    await User.findByIdAndUpdate(userId, { subscription });

    // Log activity
    const activityLogger = require('../services/activityLogger');
    await activityLogger.logActivity(userId, 'subscription', 'plan_activated', {
      planId: 'starter'
    });

    res.json({
      success: true,
      message: 'Starter plan activated successfully',
      subscription
    });
  } catch (error) {
    console.error('Plan activation error:', error);
    res.status(500).json({ message: 'Failed to activate plan' });
  }
});

// @desc    Cancel subscription
// @route   POST /api/subscriptions/cancel
// @access  Private
const cancelSubscription = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId);

  if (!user.subscription || user.subscription.plan === 'starter') {
    return res.status(400).json({ message: 'No active subscription to cancel' });
  }

  try {
    // Update subscription to cancel at period end
    const updatedSubscription = {
      ...user.subscription,
      cancelAtPeriodEnd: true,
      cancelDate: new Date()
    };

    await User.findByIdAndUpdate(userId, { subscription: updatedSubscription });

    // Log activity
    const activityLogger = require('../services/activityLogger');
    await activityLogger.logActivity(userId, 'subscription', 'plan_cancelled', {
      planId: user.subscription.plan,
      cancelAtPeriodEnd: true
    });

    res.json({
      success: true,
      message: 'Subscription will be cancelled at the end of the billing period',
      subscription: updatedSubscription
    });
  } catch (error) {
    console.error('Cancellation error:', error);
    res.status(500).json({ message: 'Failed to cancel subscription' });
  }
});

// @desc    Update payment method
// @route   POST /api/subscriptions/payment-method
// @access  Private
const updatePaymentMethod = asyncHandler(async (req, res) => {
  const { paymentMethod } = req.body;
  const userId = req.user._id;

  try {
    // Mock payment method update
    const paymentResult = await updatePaymentMethodForUser(userId, paymentMethod);

    if (paymentResult.success) {
      res.json({
        success: true,
        message: 'Payment method updated successfully',
        paymentMethodId: paymentResult.paymentMethodId
      });
    } else {
      res.status(400).json({ message: paymentResult.error || 'Failed to update payment method' });
    }
  } catch (error) {
    console.error('Payment method update error:', error);
    res.status(500).json({ message: 'Failed to update payment method' });
  }
});

// @desc    Get subscription usage
// @route   GET /api/subscriptions/usage
// @access  Private
const getSubscriptionUsage = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId);
  
  // Mock usage data - in real app this would be calculated from actual usage
  const usage = {
    products: Math.floor(Math.random() * 50) + 10,
    teamMembers: Math.floor(Math.random() * 8) + 2,
    storage: Math.floor(Math.random() * 1000) + 100, // MB
    apiCalls: Math.floor(Math.random() * 5000) + 500
  };

  const plan = subscriptionPlans[user.subscription?.plan || 'starter'];
  const limits = plan.limits;

  res.json({
    success: true,
    usage,
    limits,
    plan: user.subscription?.plan || 'starter'
  });
});

// Mock payment processing function
const processPayment = async ({ amount, paymentMethod, planId, userId }) => {
  // Simulate payment processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Mock validation
  if (paymentMethod.cardNumber.replace(/\s/g, '').length < 16) {
    return { success: false, error: 'Invalid card number' };
  }
  
  if (!paymentMethod.cvv || paymentMethod.cvv.length < 3) {
    return { success: false, error: 'Invalid CVV' };
  }

  // Mock successful payment
  return {
    success: true,
    paymentMethodId: `pm_${Date.now()}`,
    transactionId: `txn_${Date.now()}`
  };
};

// Mock payment method update function
const updatePaymentMethodForUser = async (userId, paymentMethod) => {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    success: true,
    paymentMethodId: `pm_${Date.now()}`
  };
};

// Routes
router.get('/current', protect, getCurrentSubscription);
router.post('/subscribe', protect, subscribeToPlan);
router.post('/activate', protect, activateFreePlan);
router.post('/cancel', protect, cancelSubscription);
router.post('/payment-method', protect, updatePaymentMethod);
router.get('/usage', protect, getSubscriptionUsage);

module.exports = router;
