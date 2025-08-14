const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./database');

const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});

app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'LandLedger Backend API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/farms', require('./routes/farms'));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🌾 LandLedger Backend API',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      farms: '/api/farms',
      health: '/health'
    },
    timestamp: new Date().toISOString()
  });
});

// API documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    title: 'LandLedger API Documentation',
    version: '1.0.0',
    description: 'Backend API for LandLedger - Agricultural Land Tokenization Platform',
    endpoints: {
      authentication: {
        'POST /api/auth/register': 'Register a new user',
        'POST /api/auth/login': 'Login with username/password',
        'POST /api/auth/wallet-login': 'Login/register with wallet',
        'GET /api/auth/me': 'Get current user info'
      },
      users: {
        'GET /api/users': 'Get all users',
        'GET /api/users/:id': 'Get user by ID',
        'PUT /api/users/:id': 'Update user',
        'POST /api/users/:id/transaction': 'Add transaction to user',
        'POST /api/users/:id/farm-investment': 'Add farm investment',
        'GET /api/users/analytics/stats': 'Get user statistics'
      },
      farms: {
        'GET /api/farms': 'Get all farms',
        'GET /api/farms/:farmId': 'Get farm by ID',
        'POST /api/farms': 'Create new farm',
        'PUT /api/farms/:farmId': 'Update farm',
        'POST /api/farms/:farmId/invest': 'Invest in farm',
        'POST /api/farms/:farmId/distribute-income': 'Distribute income',
        'GET /api/farms/owner/:ownerAddress': 'Get farms by owner',
        'GET /api/farms/marketplace/active': 'Get active farms for investment'
      }
    },
    models: {
      User: {
        id: 'String (unique)',
        username: 'String (unique)',
        name: 'String',
        role: 'String (farmer/investor)',
        wallet: 'String',
        walletAddress: 'String (for Petra wallet)',
        balance: 'Number',
        landOwned: 'Number',
        tokensOwned: 'Number',
        description: 'String',
        transactionHistory: 'Array',
        farmTokens: 'Array',
        ownedFarms: 'Array'
      },
      Farm: {
        farmId: 'String (unique)',
        owner: 'String',
        name: 'String',
        location: 'String',
        areaAcres: 'Number',
        totalTokens: 'Number',
        tokensSold: 'Number',
        pricePerToken: 'Number',
        landId: 'String (unique)',
        geoTag: 'String',
        proofHash: 'String',
        investors: 'Array',
        incomeDistributions: 'Array',
        status: 'String (active/fractionalized/sold_out/inactive)'
      }
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    availableEndpoints: {
      documentation: '/api/docs',
      health: '/health',
      auth: '/api/auth',
      users: '/api/users',
      farms: '/api/farms'
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);

  // MongoDB duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }

  // MongoDB validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Default error
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 LandLedger Backend Server running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
