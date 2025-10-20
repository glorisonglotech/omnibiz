// server/controllers/customerAuthController.js
const Customer = require('../models/customer');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { emailService } = require('../config/email');

// Generate JWT token for customers
const generateCustomerToken = (customerId, customerEmail) => {
  return jwt.sign(
    { id: customerId, email: customerEmail, type: 'customer' }, // Include email and type to differentiate from user tokens
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// @desc    Register a new customer via invite link
// @route   POST /api/customers/auth/register
// @access  Public (but requires valid invite code)
exports.registerCustomer = async (req, res) => {
  try {
    const { name, email, password, phone, inviteCode } = req.body;

    // Validate required fields
    if (!name || !email || !password || !inviteCode) {
      return res.status(400).json({ 
        message: 'Please provide name, email, password, and invite code' 
      });
    }

    // Check if email already exists
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(400).json({ 
        message: 'A customer with this email already exists' 
      });
    }

    // Verify invite code and find the referring user
    const referringUser = await User.findOne({ inviteCode });
    if (!referringUser) {
      return res.status(400).json({ 
        message: 'Invalid invite code' 
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedVerificationToken = crypto.createHash('sha256')
      .update(verificationToken)
      .digest('hex');

    // Create customer
    const customer = await Customer.create({
      name,
      email,
      password: hashedPassword,
      phone,
      invitedBy: referringUser._id,
      usedInviteCode: inviteCode,
      emailVerificationToken: hashedVerificationToken,
      emailVerificationExpires: Date.now() + 24 * 3600000 // 24 hours
    });

    // Generate token
    const token = generateCustomerToken(customer._id, customer.email);

    // Send verification email
    try {
      const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:5174'}/verify-email?token=${verificationToken}`;
      
      await emailService.sendMail({
        to: customer.email,
        subject: 'Welcome! Verify Your Email - OmniBiz',
        html: `
          <h2>Welcome to ${referringUser.businessName || referringUser.name}'s Store!</h2>
          <p>Hi ${customer.name},</p>
          <p>Thank you for registering. Please verify your email address to complete your registration:</p>
          <p><a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #16a34a; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a></p>
          <p>Or copy this link: ${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <p>Best regards,<br>OmniBiz Team</p>
        `
      });
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      // Don't fail registration if email fails
    }

    // Return customer data without password
    const customerResponse = {
      id: customer._id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      invitedBy: referringUser._id,
      isEmailVerified: customer.isEmailVerified,
      isActive: customer.isActive
    };

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      customer: customerResponse,
      token,
      storeOwner: {
        name: referringUser.name,
        businessName: referringUser.businessName
      }
    });
  } catch (error) {
    console.error('Customer registration error:', error);
    res.status(500).json({ 
      message: 'Registration failed', 
      error: error.message 
    });
  }
};

// @desc    Login customer
// @route   POST /api/customers/auth/login
// @access  Public
exports.loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Please provide email and password' 
      });
    }

    // Find customer
    const customer = await Customer.findOne({ email })
      .populate('invitedBy', 'name businessName email');

    if (!customer) {
      return res.status(404).json({ 
        message: 'Invalid email or password' 
      });
    }

    // Check if account is active
    if (!customer.isActive) {
      return res.status(403).json({ 
        message: 'Your account has been deactivated. Please contact support.' 
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, customer.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }

    // Update last login
    customer.lastLogin = new Date();
    await customer.save();

    // Generate token
    const token = generateCustomerToken(customer._id, customer.email);

    // Return customer data
    res.status(200).json({
      success: true,
      message: 'Login successful',
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        invitedBy: customer.invitedBy,
        isEmailVerified: customer.isEmailVerified,
        totalOrders: customer.totalOrders,
        totalSpent: customer.totalSpent,
        lastLogin: customer.lastLogin
      },
      token,
      storeOwner: {
        name: customer.invitedBy.name,
        businessName: customer.invitedBy.businessName
      }
    });
  } catch (error) {
    console.error('Customer login error:', error);
    res.status(500).json({ 
      message: 'Login failed', 
      error: error.message 
    });
  }
};

// @desc    Get customer profile
// @route   GET /api/customers/auth/profile
// @access  Private (Customer)
exports.getCustomerProfile = async (req, res) => {
  try {
    const customer = await Customer.findById(req.customer.id)
      .select('-password')
      .populate('invitedBy', 'name businessName email phone');

    if (!customer) {
      return res.status(404).json({ 
        message: 'Customer not found' 
      });
    }

    res.status(200).json({
      success: true,
      customer
    });
  } catch (error) {
    console.error('Get customer profile error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch profile', 
      error: error.message 
    });
  }
};

// @desc    Update customer profile
// @route   PUT /api/customers/auth/profile
// @access  Private (Customer)
exports.updateCustomerProfile = async (req, res) => {
  try {
    const { name, phone, address, preferences } = req.body;

    const customer = await Customer.findById(req.customer.id);
    if (!customer) {
      return res.status(404).json({ 
        message: 'Customer not found' 
      });
    }

    // Update allowed fields
    if (name) customer.name = name;
    if (phone) customer.phone = phone;
    if (address) customer.address = { ...customer.address, ...address };
    if (preferences) customer.preferences = { ...customer.preferences, ...preferences };

    await customer.save();

    const updatedCustomer = await Customer.findById(customer._id)
      .select('-password')
      .populate('invitedBy', 'name businessName');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      customer: updatedCustomer
    });
  } catch (error) {
    console.error('Update customer profile error:', error);
    res.status(500).json({ 
      message: 'Failed to update profile', 
      error: error.message 
    });
  }
};

// @desc    Verify customer email
// @route   GET /api/customers/auth/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ 
        message: 'Verification token is required' 
      });
    }

    // Hash the token from URL
    const hashedToken = crypto.createHash('sha256')
      .update(token)
      .digest('hex');

    // Find customer with valid token
    const customer = await Customer.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!customer) {
      return res.status(400).json({ 
        message: 'Invalid or expired verification token' 
      });
    }

    // Mark email as verified
    customer.isEmailVerified = true;
    customer.emailVerificationToken = undefined;
    customer.emailVerificationExpires = undefined;
    await customer.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully. You can now login.'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ 
      message: 'Email verification failed', 
      error: error.message 
    });
  }
};

// @desc    Request password reset
// @route   POST /api/customers/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        message: 'Email is required' 
      });
    }

    const customer = await Customer.findOne({ email });
    if (!customer) {
      // Don't reveal if customer exists
      return res.status(200).json({ 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Save hashed token and expiration (1 hour)
    customer.resetPasswordToken = hashedToken;
    customer.resetPasswordExpires = Date.now() + 3600000;
    await customer.save();

    // Create reset URL
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5174'}/reset-password?token=${resetToken}`;

    // Send email
    try {
      await emailService.sendMail({
        to: customer.email,
        subject: 'Password Reset Request - OmniBiz',
        html: `
          <h2>Password Reset Request</h2>
          <p>Hi ${customer.name},</p>
          <p>You requested to reset your password. Click the link below:</p>
          <p><a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #16a34a; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
          <p>Or copy this link: ${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Best regards,<br>OmniBiz Team</p>
        `
      });

      res.status(200).json({ 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      });
    } catch (emailError) {
      console.error('Error sending reset email:', emailError);
      customer.resetPasswordToken = undefined;
      customer.resetPasswordExpires = undefined;
      await customer.save();
      
      return res.status(500).json({ 
        message: 'Error sending email. Please try again later.' 
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      message: 'Failed to process request', 
      error: error.message 
    });
  }
};

// @desc    Reset password with token
// @route   POST /api/customers/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ 
        message: 'Token and new password are required' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Hash the token from URL
    const hashedToken = crypto.createHash('sha256')
      .update(token)
      .digest('hex');

    // Find customer with valid token
    const customer = await Customer.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!customer) {
      return res.status(400).json({ 
        message: 'Invalid or expired reset token' 
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    customer.password = hashedPassword;
    customer.resetPasswordToken = undefined;
    customer.resetPasswordExpires = undefined;
    await customer.save();

    // Send confirmation email
    try {
      await emailService.sendMail({
        to: customer.email,
        subject: 'Password Reset Successful - OmniBiz',
        html: `
          <h2>Password Reset Successful</h2>
          <p>Hi ${customer.name},</p>
          <p>Your password has been successfully reset.</p>
          <p>If you didn't make this change, please contact support immediately.</p>
          <p>Best regards,<br>OmniBiz Team</p>
        `
      });
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
    }

    res.status(200).json({
      success: true,
      message: 'Password reset successful. You can now login with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      message: 'Failed to reset password', 
      error: error.message 
    });
  }
};

// @desc    Change customer password
// @route   PUT /api/customers/auth/change-password
// @access  Private (Customer)
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: 'Current password and new password are required' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: 'New password must be at least 6 characters long' 
      });
    }

    const customer = await Customer.findById(req.customer.id);
    if (!customer) {
      return res.status(404).json({ 
        message: 'Customer not found' 
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, customer.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: 'Current password is incorrect' 
      });
    }

    // Hash and save new password
    customer.password = await bcrypt.hash(newPassword, 10);
    await customer.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      message: 'Failed to change password', 
      error: error.message 
    });
  }
};
