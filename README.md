# 🚀 LandLedger – Micro-Ownership of Agricultural Land

**Track: Payments & Finance**

**One-Liner:** Fractionalize farmland into blockchain tokens so farmers get instant capital while keeping operational control, and investors earn from crop yields.

## 🌾 Project Overview

LandLedger enables farmers to tokenize their agricultural land as NFTs and fractionalize them into tradeable tokens. This allows:

- **Farmers**: Get instant capital while retaining operational control
- **Investors**: Own fractional shares of farmland and earn from crop yields
- **Transparency**: All transactions and income distributions are on-chain

## 🏗️ Architecture

```
[Farmer UI] --- (Land Details + Proof) ---> [Land Tokenization Smart Contract] --- (Mint NFT + Fraction Tokens)
        \                                                                      /
         \-------> [IPFS Storage for Land Proofs] <----------------------------

[Investor UI] --- (Buy/Sell Fractions) ---> [Marketplace Contract] --- (Token Transfers)

[Income Source (Mock)] ---> [Income Distribution Contract] ---> [Investor Wallets]

Aptos Blockchain <--- All Contracts + Transactions
```

## 🔧 Core Components

### Smart Contracts (Move Language on Aptos)

1. **Land NFT Contract** - Mint 1 NFT per land parcel with metadata: owner ID, geo-tag, proof hash
2. **Fractional Token Contract** - Split NFT into fungible tokens (e.g., 1,000 units = 1 acre)
3. **Marketplace Contract** - Buy/sell fractions with Aptos tokens
4. **Income Distribution Contract** - Mock income distribution with automatic payouts to token holders

### Frontend

- **React + Aptos Wallet Adapter** for farmer/investor dashboards
- **Farmer Dashboard**: Upload proof (photo/geo-tag → IPFS), Mint land NFT + fractional tokens
- **Investor Dashboard**: Browse available land parcels, Buy fractions, see payout history

### Mock Integrations for Demo

- Mock Land Registry API returning verification success
- Static Geo-Tag + image from uploaded proof
- Simulated monthly/seasonal yield income triggered manually

## 🛠️ Tech Stack

- **Blockchain**: Aptos (Move Language)
- **Frontend**: React.js + TailwindCSS + Vite
- **Wallet**: Petra Wallet / Martian Wallet integration
- **Storage**: IPFS via web3.storage / Pinata (simulated)
- **Backend**: Node.js for helper APIs (mock registry checks)

## 📁 Project Structure

```
landledger/
├── move/                 # Move smart contracts
│   ├── sources/
│   │   ├── land_nft.move
│   │   ├── fractional_token.move
│   │   ├── marketplace.move
│   │   └── income_distribution.move
│   └── Move.toml
├── frontend/            # React application
│   ├── components/
│   │   ├── LandMinting.tsx
│   │   ├── FractionalizeLand.tsx
│   │   ├── Marketplace.tsx
│   │   └── IncomeDistribution.tsx
│   └── utils/
└── scripts/            # Deployment scripts
```

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- Aptos CLI
- Petra/Martian Wallet

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd landledger
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Compile Move contracts**
   ```bash
   npm run move:compile
   ```

4. **Start the frontend**
   ```bash
   npm run dev
   ```

5. **Deploy contracts (optional)**
   ```bash
   npm run move:publish
   ```

## 📋 Available Commands

- `npm run move:publish` - Publish Move contracts to testnet
- `npm run move:test` - Run Move contract unit tests
- `npm run move:compile` - Compile Move contracts
- `npm run move:upgrade` - Upgrade deployed contracts
- `npm run dev` - Start frontend development server
- `npm run build` - Build frontend for production

## 🎯 Demo Features

1. **Land Tokenization**: Mint NFTs for agricultural parcels
2. **Fractionalization**: Split land into tradeable tokens
3. **Marketplace**: Trade fractional ownership tokens
4. **Income Distribution**: Simulate and distribute harvest profits
5. **Wallet Integration**: Full Aptos wallet connectivity

## 🔮 Future Enhancements

- Real land registry API integration
- Satellite imagery verification
- IoT sensor data for crop monitoring
- Insurance integration
- Multi-chain support
- Real-world pilot programs

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
