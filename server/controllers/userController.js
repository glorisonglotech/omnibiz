const User = require('../models/user');
const bcrypt = require('bcryptjs');

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = { ...req.body };
    delete updateData.password;
    delete updateData.email;
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long' });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
    await User.findByIdAndUpdate(userId, {
      password: hashedNewPassword,
      lastPasswordChange: new Date()
    });
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
};

// Update user settings
exports.updateSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { section, settings } = req.body;
    let updateData = {};
    switch (section) {
      case 'general':
        updateData = {
          businessName: settings.businessName,
          businessEmail: settings.businessEmail,
          businessPhone: settings.businessPhone,
          businessAddress: settings.businessAddress,
          timezone: settings.timezone,
          currency: settings.currency,
          language: settings.language
        };
        break;
      case 'notifications':
        updateData = {
          emailNotifications: settings.emailNotifications,
          smsNotifications: settings.smsNotifications,
          pushNotifications: settings.pushNotifications,
          marketingEmails: settings.marketingEmails
        };
        break;
      case 'security':
        updateData = {
          twoFactorAuth: settings.twoFactorAuth,
          sessionTimeout: settings.sessionTimeout,
          passwordExpiry: settings.passwordExpiry
        };
        break;
      case 'privacy':
        updateData = {
          dataSharing: settings.dataSharing,
          analytics: settings.analytics,
          crashReporting: settings.crashReporting,
          usageStatistics: settings.usageStatistics
        };
        break;
      case 'appearance':
        updateData = {
          themePreferences: {
            theme: settings.theme,
            sidebarCollapsed: settings.sidebarCollapsed,
            compactMode: settings.compactMode,
            highContrast: settings.highContrast,
            reducedMotion: settings.reducedMotion,
            customAccentColor: settings.customAccentColor,
            animations: settings.animations,
            fontSize: settings.fontSize,
            borderRadius: settings.borderRadius,
            soundEnabled: settings.soundNotifications !== undefined ? settings.soundNotifications : settings.soundEnabled,
            autoSave: settings.autoSave
          }
        };
        break;
      case 'performance':
        updateData = {
          'themePreferences.autoSave': settings.autoSave
        };
        break;
      default:
        return res.status(400).json({ error: 'Invalid settings section' });
    }
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: `${section} settings updated successfully`, user });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
};

// Update last login
exports.updateLastLogin = async (req, res) => {
  try {
    const userId = req.user.id;
    await User.findByIdAndUpdate(userId, {
      lastLogin: new Date()
    });
    res.json({ message: 'Last login updated successfully' });
  } catch (error) {
    console.error('Error updating last login:', error);
    res.status(500).json({ error: 'Failed to update last login' });
  }
};

// Save invite code
exports.saveInviteCode = async (req, res) => {
  try {
    const { inviteCode } = req.body;
    const userId = req.user.id;
    console.log("Saving invite code:", { inviteCode, userId }); 
    if (!inviteCode) {
      console.log("Missing inviteCode in request body"); 
      return res.status(400).json({ error: 'Invite code is required' });
    }
    const user = await User.findById(userId);
    if (!user) {
      console.log("User not found for ID:", userId); 
      return res.status(404).json({ error: 'User not found' });
    }
    const existingUser = await User.findOne({ inviteCode });
    if (existingUser && existingUser._id.toString() !== userId) {
      console.log("Invite code already in use:", inviteCode); 
      return res.status(400).json({ error: 'Invite code is already in use' });
    }
    user.inviteCode = inviteCode;
    await user.save();
    console.log("Invite code saved for user:", { userId, inviteCode }); 
    res.json({ message: 'Invite code saved successfully', inviteCode });
  } catch (error) {
    console.error('Error saving invite code:', error);
    res.status(500).json({ error: 'Failed to save invite code' });
  }
};

// Get store owner by invite code
exports.getStoreOwnerByInviteCode = async (req, res) => {
  try {
    const { inviteCode } = req.params;
    console.log("Fetching store owner for inviteCode:", inviteCode); // Debug
    const user = await User.findOne({ inviteCode }).select('name businessName');
    if (!user) {
      console.log("No user found for inviteCode:", inviteCode); // Debug
      return res.status(404).json({ error: 'Store owner not found for this invite code' });
    }
    res.json({
      businessName: user.businessName || `${user.name}'s Store`,
      ownerName: user.name,
    });
  } catch (error) {
    console.error('Error fetching store owner:', error);
    res.status(500).json({ error: 'Failed to fetch store owner' });
  }
};

// Delete user account and all associated data
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find user first to verify existence
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete all user-related data from other collections
    // This should be expanded based on your schema relationships
    const mongoose = require('mongoose');
    const db = mongoose.connection;

    // Delete orders
    if (db.models.Order) {
      await db.models.Order.deleteMany({ userId: userId });
    }

    // Delete products
    if (db.models.Product) {
      await db.models.Product.deleteMany({ userId: userId });
    }

    // Delete invoices
    if (db.models.Invoice) {
      await db.models.Invoice.deleteMany({ userId: userId });
    }

    // Delete appointments
    if (db.models.Appointment) {
      await db.models.Appointment.deleteMany({ userId: userId });
    }

    // Delete user activity
    if (db.models.UserActivity) {
      await db.models.UserActivity.deleteMany({ userId: userId });
    }

    // Finally, delete the user account
    await User.findByIdAndDelete(userId);

    console.log(`✅ User account ${userId} and all associated data deleted successfully`);
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
};
//modified