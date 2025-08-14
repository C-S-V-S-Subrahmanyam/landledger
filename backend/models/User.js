const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User Schema
const userSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  role: {
    type: String,
    required: true,
    enum: ['farmer', 'investor', 'admin'],
    default: 'investor'
  },
  avatar: {
    type: String,
    default: function() {
      const avatars = ["👨‍🌾", "👩‍🌾", "👨‍💼", "👩‍💼", "🧑‍🚀", "👨‍🔬", "👩‍🔬"];
      return avatars[Math.floor(Math.random() * avatars.length)];
    }
  },
  wallet: {
    type: String,
    default: function() {
      return `0x${Math.random().toString(16).substr(2, 40)}`;
    }
  },
  balance: {
    type: Number,
    default: 1000,
    min: 0
  },
  landOwned: {
    type: Number,
    default: 0,
    min: 0
  },
  tokensOwned: {
    type: Number,
    default: 0,
    min: 0
  },
  description: {
    type: String,
    default: function() {
      return this.role === 'farmer' 
        ? 'Sustainable farming expert focused on crop diversification and yield optimization.'
        : 'Strategic investor interested in agricultural technology and sustainable farming initiatives.';
    }
  },
  // Wallet integration fields
  walletAddress: {
    type: String,
    sparse: true, // Allow multiple null values but enforce uniqueness for non-null values
    unique: true
  },
  walletConnected: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  // Activity tracking
  transactionHistory: [{
    type: {
      type: String,
      enum: ['mint', 'fractionalize', 'invest', 'income_distribution', 'transfer']
    },
    amount: Number,
    transactionHash: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: mongoose.Schema.Types.Mixed
  }],
  // Portfolio data
  farmTokens: [{
    farmId: String,
    farmOwner: String,
    tokensOwned: Number,
    investmentAmount: Number,
    purchaseDate: {
      type: Date,
      default: Date.now
    }
  }],
  ownedFarms: [{
    farmId: String,
    farmName: String,
    location: String,
    totalTokens: Number,
    tokensSold: Number,
    createdDate: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual fields
userSchema.virtual('totalInvestments').get(function() {
  return this.farmTokens.reduce((total, farm) => total + farm.investmentAmount, 0);
});

userSchema.virtual('portfolioValue').get(function() {
  // This would calculate current value based on market prices
  return this.totalInvestments * 1.05; // Simplified 5% growth assumption
});

// Indexes for better query performance
userSchema.index({ username: 1 });
userSchema.index({ walletAddress: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const hashedPassword = await bcrypt.hash(this.password, 12);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// Instance method to add transaction
userSchema.methods.addTransaction = function(transactionData) {
  this.transactionHistory.push(transactionData);
  return this.save();
};

// Instance method to add farm token investment
userSchema.methods.addFarmInvestment = function(farmData) {
  const existingFarm = this.farmTokens.find(farm => 
    farm.farmId === farmData.farmId && farm.farmOwner === farmData.farmOwner
  );
  
  if (existingFarm) {
    existingFarm.tokensOwned += farmData.tokensOwned;
    existingFarm.investmentAmount += farmData.investmentAmount;
  } else {
    this.farmTokens.push(farmData);
  }
  
  this.tokensOwned += farmData.tokensOwned;
  return this.save();
};

// Instance method to add owned farm
userSchema.methods.addOwnedFarm = function(farmData) {
  this.ownedFarms.push(farmData);
  this.landOwned += 1;
  return this.save();
};

// Static method to find by username
userSchema.statics.findByUsername = function(username) {
  return this.findOne({ username: username.toLowerCase() });
};

// Static method to find by wallet address
userSchema.statics.findByWallet = function(walletAddress) {
  return this.findOne({ walletAddress: walletAddress });
};

// Static method to get user stats
userSchema.statics.getUserStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        totalFarmers: { $sum: { $cond: [{ $eq: ['$role', 'farmer'] }, 1, 0] } },
        totalInvestors: { $sum: { $cond: [{ $eq: ['$role', 'investor'] }, 1, 0] } },
        totalBalance: { $sum: '$balance' },
        totalLandOwned: { $sum: '$landOwned' },
        totalTokensOwned: { $sum: '$tokensOwned' }
      }
    }
  ]);
  
  return stats[0] || {
    totalUsers: 0,
    totalFarmers: 0,
    totalInvestors: 0,
    totalBalance: 0,
    totalLandOwned: 0,
    totalTokensOwned: 0
  };
};

module.exports = mongoose.model('User', userSchema);
