const express = require('express');
const User = require('../models/User');
const Farm = require('../models/Farm');
const router = express.Router();

// Helper function to create user response (without password)
const createUserResponse = (user) => {
  const userObj = user.toObject();
  delete userObj.password;
  return userObj;
};

// @route   GET /api/users
// @desc    Get all users
// @access  Public (for demo purposes)
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: users.length,
      users: users.map(user => createUserResponse(user))
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting users'
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Public (for demo purposes)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findOne({ id: req.params.id }).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: createUserResponse(user)
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting user'
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (should be authenticated)
router.put('/:id', async (req, res) => {
  try {
    const { name, balance, landOwned, tokensOwned, description } = req.body;
    
    const user = await User.findOne({ id: req.params.id });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields if provided
    if (name !== undefined) user.name = name;
    if (balance !== undefined) user.balance = balance;
    if (landOwned !== undefined) user.landOwned = landOwned;
    if (tokensOwned !== undefined) user.tokensOwned = tokensOwned;
    if (description !== undefined) user.description = description;

    await user.save();

    res.json({
      success: true,
      message: 'User updated successfully',
      user: createUserResponse(user)
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating user'
    });
  }
});

// @route   POST /api/users/:id/transaction
// @desc    Add transaction to user
// @access  Private
router.post('/:id/transaction', async (req, res) => {
  try {
    const { type, amount, transactionHash, details } = req.body;
    
    const user = await User.findOne({ id: req.params.id });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.addTransaction({
      type,
      amount,
      transactionHash,
      details
    });

    res.json({
      success: true,
      message: 'Transaction added successfully',
      user: createUserResponse(user)
    });
  } catch (error) {
    console.error('Add transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding transaction'
    });
  }
});

// @route   POST /api/users/:id/farm-investment
// @desc    Add farm investment to user
// @access  Private
router.post('/:id/farm-investment', async (req, res) => {
  try {
    const { farmId, farmOwner, tokensOwned, investmentAmount } = req.body;
    
    const user = await User.findOne({ id: req.params.id });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.addFarmInvestment({
      farmId,
      farmOwner,
      tokensOwned,
      investmentAmount
    });

    res.json({
      success: true,
      message: 'Farm investment added successfully',
      user: createUserResponse(user)
    });
  } catch (error) {
    console.error('Add farm investment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding farm investment'
    });
  }
});

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Public
router.get('/analytics/stats', async (req, res) => {
  try {
    const userStats = await User.getUserStats();
    const farmStats = await Farm.getFarmStats();
    
    res.json({
      success: true,
      stats: {
        users: userStats,
        farms: farmStats,
        lastUpdated: new Date()
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting statistics'
    });
  }
});

module.exports = router;
