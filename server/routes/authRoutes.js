const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getProfile,
  updateUserRole,
  assignAdminToClient,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const {
  requireAdmin,
  requireSuperAdmin,
  requireUserManagement
} = require('../middlewares/roleMiddleware');


router.post('/register', registerUser);


router.post('/login', loginUser);

// Password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.get('/profile', protect, getProfile);

// Admin routes
router.put('/users/:id/role', protect, requireAdmin, requireUserManagement, updateUserRole);
router.put('/clients/:id/assign-admin', protect, requireSuperAdmin, assignAdminToClient);

// OAuth routes
router.post('/github/callback', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ message: 'Authorization code is required' });
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      })
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return res.status(400).json({ message: tokenData.error_description });
    }

    // Get user info from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/json'
      }
    });

    const githubUser = await userResponse.json();

    // Get user email (GitHub might return null for email)
    const emailResponse = await fetch('https://api.github.com/user/emails', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/json'
      }
    });
    const emails = await emailResponse.json();
    const primaryEmail = emails.find(email => email.primary)?.email || githubUser.email;

    // Find or create user
    const User = require('../models/user');
    const jwt = require('jsonwebtoken');

    let user = await User.findOne({ email: primaryEmail });

    if (!user) {
      // Create new user
      user = new User({
        name: githubUser.name || githubUser.login,
        email: primaryEmail,
        password: Math.random().toString(36).slice(-12), // Random password (OAuth users won't need it)
        authProvider: 'github',
        githubId: githubUser.id,
        avatar: githubUser.avatar_url,
        isEmailVerified: true
      });
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    res.status(500).json({ message: 'Authentication failed', error: error.message });
  }
});

router.post('/google/callback', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ message: 'Authorization code is required' });
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        redirect_uri: `${process.env.CLIENT_URL}/auth/google/callback`,
        grant_type: 'authorization_code'
      })
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return res.status(400).json({ message: tokenData.error_description });
    }

    // Get user info from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    });

    const googleUser = await userResponse.json();

    // Find or create user
    const User = require('../models/user');
    const jwt = require('jsonwebtoken');

    let user = await User.findOne({ email: googleUser.email });

    if (!user) {
      // Create new user
      user = new User({
        name: googleUser.name,
        email: googleUser.email,
        password: Math.random().toString(36).slice(-12), // Random password (OAuth users won't need it)
        authProvider: 'google',
        googleId: googleUser.id,
        avatar: googleUser.picture,
        isEmailVerified: true
      });
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(500).json({ message: 'Authentication failed', error: error.message });
  }
});

module.exports = router;
