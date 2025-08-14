const express = require('express');
const Farm = require('../models/Farm');
const router = express.Router();

// @route   GET /api/farms
// @desc    Get all farms
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { owner, status, limit = 50 } = req.query;
    
    let query = {};
    if (owner) query.owner = owner;
    if (status) query.status = status;
    
    const farms = await Farm.find(query)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: farms.length,
      farms
    });
  } catch (error) {
    console.error('Get farms error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting farms'
    });
  }
});

// @route   GET /api/farms/:farmId
// @desc    Get farm by ID
// @access  Public
router.get('/:farmId', async (req, res) => {
  try {
    const farm = await Farm.findOne({ farmId: req.params.farmId });
    
    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found'
      });
    }

    res.json({
      success: true,
      farm
    });
  } catch (error) {
    console.error('Get farm error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting farm'
    });
  }
});

// @route   POST /api/farms
// @desc    Create a new farm
// @access  Private
router.post('/', async (req, res) => {
  try {
    const {
      farmId,
      owner,
      name,
      location,
      areaAcres,
      totalTokens,
      pricePerToken,
      landId,
      geoTag,
      proofHash,
      cropType,
      nftTokenAddress,
      mintTransactionHash
    } = req.body;

    // Validation
    if (!farmId || !owner || !name || !location || !areaAcres || !totalTokens || !pricePerToken || !landId || !geoTag || !proofHash) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if farm ID already exists
    const existingFarm = await Farm.findOne({ farmId });
    if (existingFarm) {
      return res.status(400).json({
        success: false,
        message: 'Farm ID already exists'
      });
    }

    // Check if land ID already exists
    const existingLandId = await Farm.findOne({ landId });
    if (existingLandId) {
      return res.status(400).json({
        success: false,
        message: 'Land ID already exists'
      });
    }

    const newFarm = new Farm({
      farmId,
      owner,
      name,
      location,
      areaAcres,
      totalTokens,
      pricePerToken,
      landId,
      geoTag,
      proofHash,
      cropType: cropType || 'Mixed Crops',
      nftTokenAddress,
      mintTransactionHash,
      status: 'active'
    });

    await newFarm.save();

    res.status(201).json({
      success: true,
      message: 'Farm created successfully',
      farm: newFarm
    });

  } catch (error) {
    console.error('Create farm error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating farm'
    });
  }
});

// @route   PUT /api/farms/:farmId
// @desc    Update farm
// @access  Private
router.put('/:farmId', async (req, res) => {
  try {
    const updates = req.body;
    
    const farm = await Farm.findOne({ farmId: req.params.farmId });
    
    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found'
      });
    }

    // Update fields
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        farm[key] = updates[key];
      }
    });

    await farm.save();

    res.json({
      success: true,
      message: 'Farm updated successfully',
      farm
    });
  } catch (error) {
    console.error('Update farm error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating farm'
    });
  }
});

// @route   POST /api/farms/:farmId/invest
// @desc    Add investment to farm
// @access  Private
router.post('/:farmId/invest', async (req, res) => {
  try {
    const { userAddress, userName, tokensOwned, investmentAmount, transactionHash } = req.body;
    
    const farm = await Farm.findOne({ farmId: req.params.farmId });
    
    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found'
      });
    }

    // Check if there are enough tokens available
    if (farm.tokensAvailable < tokensOwned) {
      return res.status(400).json({
        success: false,
        message: 'Not enough tokens available'
      });
    }

    await farm.addInvestor({
      userAddress,
      userName,
      tokensOwned,
      investmentAmount,
      transactionHash
    });

    res.json({
      success: true,
      message: 'Investment added successfully',
      farm
    });
  } catch (error) {
    console.error('Add investment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding investment'
    });
  }
});

// @route   POST /api/farms/:farmId/distribute-income
// @desc    Distribute income to farm investors
// @access  Private
router.post('/:farmId/distribute-income', async (req, res) => {
  try {
    const { totalIncome, description, transactionHash } = req.body;
    
    const farm = await Farm.findOne({ farmId: req.params.farmId });
    
    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found'
      });
    }

    if (farm.tokensSold === 0) {
      return res.status(400).json({
        success: false,
        message: 'No tokens sold yet, cannot distribute income'
      });
    }

    const distributedPerToken = totalIncome / farm.tokensSold;

    await farm.distributeIncome({
      totalIncome,
      distributedPerToken,
      description,
      transactionHash
    });

    res.json({
      success: true,
      message: 'Income distributed successfully',
      farm,
      distributedPerToken
    });
  } catch (error) {
    console.error('Distribute income error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error distributing income'
    });
  }
});

// @route   GET /api/farms/owner/:ownerAddress
// @desc    Get farms by owner
// @access  Public
router.get('/owner/:ownerAddress', async (req, res) => {
  try {
    const farms = await Farm.findByOwner(req.params.ownerAddress);
    
    res.json({
      success: true,
      count: farms.length,
      farms
    });
  } catch (error) {
    console.error('Get farms by owner error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting farms by owner'
    });
  }
});

// @route   GET /api/farms/marketplace/active
// @desc    Get active farms available for investment
// @access  Public
router.get('/marketplace/active', async (req, res) => {
  try {
    const farms = await Farm.findAvailableForInvestment();
    
    res.json({
      success: true,
      count: farms.length,
      farms
    });
  } catch (error) {
    console.error('Get marketplace farms error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting marketplace farms'
    });
  }
});

module.exports = router;
