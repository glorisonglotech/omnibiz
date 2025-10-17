// backend/controllers/authController.js
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { activityLogger } = require('../services/activityLogger');
const { emailService } = require('../config/email');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
exports.registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      businessName,
      role = 'client',
      clientType = 'individual'
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Set default permissions based on role
    const { setDefaultPermissions } = require('../middlewares/roleMiddleware');
    const defaultPermissions = setDefaultPermissions(role);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      businessName,
      role,
      clientType,
      permissions: defaultPermissions,
      accountStatus: 'active',
      verificationStatus: {
        email: false,
        phone: false,
        business: false
      }
    });

    const token = generateToken(user._id);

    // Don't send password in response
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      businessName: user.businessName,
      role: user.role,
      clientType: user.clientType,
      permissions: user.permissions,
      accountStatus: user.accountStatus
    };

    res.status(201).json({
      user: userResponse,
      token,
      message: 'Registration successful'
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email })
      .populate('assignedAdmin', 'name email')
      .populate('managedClients', 'name email businessName');

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if account is active
    if (user.accountStatus !== 'active') {
      return res.status(403).json({
        message: 'Account is not active',
        accountStatus: user.accountStatus
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Log failed login attempt
      await activityLogger.logLogin(user._id, req, false, 'Invalid credentials');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    // Get user permissions
    const { getUserPermissions } = require('../middlewares/roleMiddleware');
    const permissions = getUserPermissions(user);

    // Log successful login
    await activityLogger.logLogin(user._id, req, true);

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        businessName: user.businessName,
        role: user.role,
        clientType: user.clientType,
        permissions,
        accountStatus: user.accountStatus,
        assignedAdmin: user.assignedAdmin,
        managedClients: user.managedClients,
        lastLogin: user.lastLogin
      },
      token,
      message: 'Login successful'
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('assignedAdmin', 'name email phone')
      .populate('managedClients', 'name email businessName clientType');

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Get user permissions
    const { getUserPermissions } = require('../middlewares/roleMiddleware');
    const permissions = getUserPermissions(user);

    res.status(200).json({
      ...user.toObject(),
      permissions
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
};

// @desc    Update user role (admin only)
// @route   PUT /api/auth/users/:id/role
// @access  Private (Admin)
exports.updateUserRole = async (req, res) => {
  try {
    const { role, permissions } = req.body;
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update role and permissions
    user.role = role;
    if (permissions) {
      user.permissions = { ...user.permissions, ...permissions };
    } else {
      // Set default permissions for new role
      const { setDefaultPermissions } = require('../middlewares/roleMiddleware');
      user.permissions = setDefaultPermissions(role);
    }

    await user.save();

    res.status(200).json({
      message: 'User role updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user role', error: error.message });
  }
};

// @desc    Assign admin to client
// @route   PUT /api/auth/clients/:id/assign-admin
// @access  Private (Super Admin)
exports.assignAdminToClient = async (req, res) => {
  try {
    const { adminId } = req.body;
    const clientId = req.params.id;

    const [client, admin] = await Promise.all([
      User.findById(clientId),
      User.findById(adminId)
    ]);

    if (!client) return res.status(404).json({ message: 'Client not found' });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    if (client.role !== 'client') {
      return res.status(400).json({ message: 'User is not a client' });
    }

    if (!['admin', 'super_admin'].includes(admin.role)) {
      return res.status(400).json({ message: 'User is not an admin' });
    }

    // Update client's assigned admin
    client.assignedAdmin = adminId;
    await client.save();

    // Add client to admin's managed clients
    if (!admin.managedClients.includes(clientId)) {
      admin.managedClients.push(clientId);
      await admin.save();
    }

    res.status(200).json({
      message: 'Admin assigned to client successfully',
      client: {
        id: client._id,
        name: client.name,
        email: client.email,
        assignedAdmin: {
          id: admin._id,
          name: admin.name,
          email: admin.email
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to assign admin', error: error.message });
  }
};

// @desc    Request password reset
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.status(200).json({ 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Save hashed token and expiration (1 hour)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    // Send email
    try {
      await emailService.sendMail({
        to: user.email,
        subject: 'Password Reset Request - OmniBiz',
        html: `
          <h2>Password Reset Request</h2>
          <p>Hi ${user.name},</p>
          <p>You requested to reset your password. Click the link below to reset it:</p>
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
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      
      return res.status(500).json({ 
        message: 'Error sending email. Please try again later.' 
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Failed to process request', error: error.message });
  }
};

// @desc    Reset password with token
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Hash the token from URL
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid or expired reset token' 
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Send confirmation email
    try {
      await emailService.sendMail({
        to: user.email,
        subject: 'Password Reset Successful - OmniBiz',
        html: `
          <h2>Password Reset Successful</h2>
          <p>Hi ${user.name},</p>
          <p>Your password has been successfully reset.</p>
          <p>If you didn't make this change, please contact support immediately.</p>
          <p>Best regards,<br>OmniBiz Team</p>
        `
      });
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
    }

    res.status(200).json({ 
      message: 'Password reset successful. You can now login with your new password.' 
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Failed to reset password', error: error.message });
  }
};
