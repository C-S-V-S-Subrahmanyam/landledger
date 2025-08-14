const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Helper function to generate JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Helper function to create user response (without password)
const createUserResponse = (user) => {
  const userObj = user.toObject();
  delete userObj.password;
  return userObj;
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { username, password, name, role } = req.body;

    // Validation
    if (!username || !password || !name || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username, password, name, and role'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    if (!['farmer', 'investor'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either farmer or investor'
      });
    }

    // Check if user already exists
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }

    // Generate unique user ID
    const userId = `${role}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    // Create new user
    const newUser = new User({
      id: userId,
      username: username.toLowerCase(),
      password,
      name,
      role
    });

    await newUser.save();

    // Generate token
    const token = generateToken(newUser._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: createUserResponse(newUser),
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username and password'
      });
    }

    // Find user by username
    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    await user.updateLastLogin();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      user: createUserResponse(user),
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   POST /api/auth/wallet-login
// @desc    Login or register with wallet
// @access  Public
router.post('/wallet-login', async (req, res) => {
  try {
    const { walletAddress, role, name } = req.body;

    // Validation
    if (!walletAddress || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide wallet address and role'
      });
    }

    if (!['farmer', 'investor'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either farmer or investor'
      });
    }

    // Check if user exists with this wallet
    let user = await User.findByWallet(walletAddress);

    if (user) {
      // Update last login and wallet connection status
      user.walletConnected = true;
      user.lastLogin = new Date();
      await user.save();
    } else {
      // Create new user with wallet
      const userId = `wallet_${role}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const username = `wallet_${walletAddress.slice(0, 8)}`;

      user = new User({
        id: userId,
        username,
        password: Math.random().toString(36), // Random password for wallet users
        name: name || `${role.charAt(0).toUpperCase() + role.slice(1)} User`,
        role,
        walletAddress,
        walletConnected: true
      });

      await user.save();
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: user.walletAddress ? 'Wallet login successful' : 'Wallet registered and logged in',
      user: createUserResponse(user),
      token
    });

  } catch (error) {
    console.error('Wallet login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during wallet login'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    res.json({
      success: true,
      user: createUserResponse(user)
    });

  } catch (error) {
    console.error('Auth verification error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

module.exports = router;
