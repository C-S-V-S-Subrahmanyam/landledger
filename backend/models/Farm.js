const mongoose = require('mongoose');

// Farm Schema for storing farm data
const farmSchema = new mongoose.Schema({
  farmId: {
    type: String,
    required: true,
    unique: true
  },
  owner: {
    type: String,
    required: true,
    ref: 'User'
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  location: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  areaAcres: {
    type: Number,
    required: true,
    min: 0.1
  },
  totalTokens: {
    type: Number,
    required: true,
    min: 1
  },
  tokensSold: {
    type: Number,
    default: 0,
    min: 0
  },
  pricePerToken: {
    type: Number,
    required: true,
    min: 0.001 // Minimum price in APT
  },
  landId: {
    type: String,
    required: true,
    unique: true
  },
  geoTag: {
    type: String,
    required: true
  },
  proofHash: {
    type: String,
    required: true
  },
  // Additional farm details
  cropType: {
    type: String,
    default: 'Mixed Crops'
  },
  soilType: {
    type: String,
    default: 'Fertile Loam'
  },
  irrigationType: {
    type: String,
    default: 'Sprinkler System'
  },
  certifications: [{
    type: String,
    enum: ['Organic', 'Sustainable', 'Fair Trade', 'Non-GMO', 'Carbon Neutral']
  }],
  // Investment tracking
  investors: [{
    userAddress: String,
    userName: String,
    tokensOwned: Number,
    investmentAmount: Number,
    investmentDate: {
      type: Date,
      default: Date.now
    }
  }],
  // Income distribution history
  incomeDistributions: [{
    totalIncome: Number,
    distributionDate: {
      type: Date,
      default: Date.now
    },
    distributedPerToken: Number,
    transactionHash: String,
    description: String
  }],
  // Blockchain data
  nftTokenAddress: String,
  fractionalTokenAddress: String,
  mintTransactionHash: String,
  fractionalizeTransactionHash: String,
  // Status and metrics
  status: {
    type: String,
    enum: ['active', 'fractionalized', 'sold_out', 'inactive'],
    default: 'active'
  },
  totalRaised: {
    type: Number,
    default: 0
  },
  averageYield: {
    type: Number,
    default: 0
  },
  lastHarvestDate: Date,
  nextHarvestDate: Date,
  // Performance metrics
  roi: {
    type: Number,
    default: 0
  },
  totalIncomeDistributed: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual fields
farmSchema.virtual('tokensAvailable').get(function() {
  return this.totalTokens - this.tokensSold;
});

farmSchema.virtual('percentageSold').get(function() {
  return (this.tokensSold / this.totalTokens) * 100;
});

farmSchema.virtual('totalValue').get(function() {
  return this.totalTokens * this.pricePerToken;
});

farmSchema.virtual('currentMarketCap').get(function() {
  return this.tokensSold * this.pricePerToken;
});

// Indexes for better query performance
farmSchema.index({ owner: 1 });
farmSchema.index({ location: 1 });
farmSchema.index({ status: 1 });
farmSchema.index({ createdAt: -1 });
farmSchema.index({ farmId: 1 });
farmSchema.index({ landId: 1 });

// Instance methods
farmSchema.methods.addInvestor = function(investorData) {
  const existingInvestor = this.investors.find(inv => 
    inv.userAddress === investorData.userAddress
  );
  
  if (existingInvestor) {
    existingInvestor.tokensOwned += investorData.tokensOwned;
    existingInvestor.investmentAmount += investorData.investmentAmount;
  } else {
    this.investors.push(investorData);
  }
  
  this.tokensSold += investorData.tokensOwned;
  this.totalRaised += investorData.investmentAmount;
  
  // Update status if sold out
  if (this.tokensSold >= this.totalTokens) {
    this.status = 'sold_out';
  }
  
  return this.save();
};

farmSchema.methods.distributeIncome = function(distributionData) {
  this.incomeDistributions.push(distributionData);
  this.totalIncomeDistributed += distributionData.totalIncome;
  
  // Update ROI calculation
  if (this.totalRaised > 0) {
    this.roi = (this.totalIncomeDistributed / this.totalRaised) * 100;
  }
  
  return this.save();
};

// Static methods
farmSchema.statics.findByOwner = function(ownerAddress) {
  return this.find({ owner: ownerAddress }).sort({ createdAt: -1 });
};

farmSchema.statics.findActive = function() {
  return this.find({ status: { $in: ['active', 'fractionalized'] } }).sort({ createdAt: -1 });
};

farmSchema.statics.findAvailableForInvestment = function() {
  return this.find({ 
    status: { $in: ['active', 'fractionalized'] },
    tokensSold: { $lt: this.totalTokens }
  }).sort({ createdAt: -1 });
};

farmSchema.statics.getFarmStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalFarms: { $sum: 1 },
        totalAcres: { $sum: '$areaAcres' },
        totalTokens: { $sum: '$totalTokens' },
        totalTokensSold: { $sum: '$tokensSold' },
        totalValueLocked: { $sum: '$totalRaised' },
        averageTokenPrice: { $avg: '$pricePerToken' },
        totalIncomeDistributed: { $sum: '$totalIncomeDistributed' }
      }
    }
  ]);
  
  return stats[0] || {
    totalFarms: 0,
    totalAcres: 0,
    totalTokens: 0,
    totalTokensSold: 0,
    totalValueLocked: 0,
    averageTokenPrice: 0,
    totalIncomeDistributed: 0
  };
};

module.exports = mongoose.model('Farm', farmSchema);
