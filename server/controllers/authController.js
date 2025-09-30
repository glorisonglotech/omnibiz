// backend/controllers/authController.js
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { activityLogger } = require('../services/activityLogger');

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
