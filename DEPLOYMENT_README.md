# LandLedger - Aptos Farmland Investment Platform

A decentralized platform for farmland investment using Aptos blockchain with Petra wallet integration.

## Features

- **Petra Wallet Integration**: Secure authentication using Petra wallet
- **Farmland Investment**: Invest in tokenized farmland using APT tokens
- **Real Wallet Transactions**: All operations use actual testnet APT from your wallet
- **MongoDB Backend**: Persistent user data and farm information
- **Move Smart Contracts**: Secure blockchain operations on Aptos

## Architecture

### Frontend
- **Framework**: Vite + React + TypeScript
- **Wallet**: @aptos-labs/wallet-adapter-react (Petra)
- **Styling**: Tailwind CSS + shadcn/ui components
- **State**: In-memory auth store with Petra wallet integration

### Backend
- **Server**: Node.js + Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT tokens + Petra wallet verification
- **APIs**: RESTful endpoints for users, farms, and transactions

### Blockchain
- **Platform**: Aptos Testnet
- **Language**: Move
- **Contracts**: Farmland investment, token management, income distribution

## Quick Start

### Prerequisites
```bash
node >= 18.0.0
npm or yarn
Petra Wallet browser extension
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/landledger.git
cd landledger
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Install backend dependencies**
```bash
cd backend
npm install
cd ..
```

4. **Environment Setup**
```bash
# Create backend/.env with MongoDB connection
echo 'MONGODB_URI=your_mongodb_connection_string' > backend/.env
echo 'JWT_SECRET=your_jwt_secret' >> backend/.env
echo 'PORT=3001' >> backend/.env
```

### Development

1. **Start the backend server**
```bash
cd backend
npm start
# Server runs on http://localhost:3001
```

2. **Start the frontend development server**
```bash
npm run dev
# Frontend runs on http://localhost:5173
```

3. **Compile Move contracts**
```bash
npm run move:compile
```

## Deployment

### Vercel Deployment (Frontend Only)

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Deploy to Vercel**
```bash
vercel --prod
```

3. **Configure Environment Variables** in Vercel dashboard:
   - Add any frontend environment variables (VITE_*)

### Full Stack Deployment

For backend deployment, consider:
- **Railway**: Easy MongoDB + Node.js deployment
- **Render**: Free tier with database support
- **Heroku**: Traditional PaaS option
- **DigitalOcean**: App platform with database

## Project Structure

```
landledger/
├── frontend/           # React frontend
│   ├── components/     # UI components
│   ├── utils/         # Utilities and stores
│   └── view-functions/# Aptos view functions
├── backend/           # Express.js backend
│   ├── models/        # MongoDB models
│   ├── routes/        # API routes
│   └── database.js    # Database connection
├── move/              # Move smart contracts
│   ├── sources/       # Contract source files
│   └── tests/         # Contract tests
└── scripts/           # Build and deployment scripts
```

## Key Features

### Wallet-Only Authentication
- No auto-funding or faucet
- Users must have testnet APT in their Petra wallet
- All transactions require wallet approval
- Real balance display from wallet

### Smart Contract Operations
- **Farm Investment**: Buy farmland tokens using APT
- **Income Distribution**: Receive returns from farm investments
- **Token Management**: Secure token transfers and balances
- **Marketplace**: Trade farmland tokens between users

### Backend Integration
- **User Persistence**: MongoDB storage for user profiles
- **Transaction History**: Track all blockchain interactions
- **Farm Management**: Store farm data and investor information
- **API Documentation**: Available at `/api/docs`

## Environment Variables

### Frontend (.env)
```
VITE_APP_NETWORK=testnet
VITE_MODULE_ADDRESS=your_deployed_contract_address
```

### Backend (.env)
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/landledger
JWT_SECRET=your-secret-key
PORT=3001
NODE_ENV=production
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with username/password
- `POST /api/auth/wallet-login` - Login with Petra wallet

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `POST /api/users/:id/transactions` - Add transaction
- `POST /api/users/:id/farm-investments` - Add farm investment

### Farms
- `GET /api/farms` - Get all farms
- `POST /api/farms` - Create new farm
- `GET /api/farms/:id` - Get farm by ID
- `PUT /api/farms/:id` - Update farm
- `POST /api/farms/:id/invest` - Invest in farm

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For questions or support:
- Create an issue on GitHub
- Check the documentation
- Review the API docs at `/api/docs`
