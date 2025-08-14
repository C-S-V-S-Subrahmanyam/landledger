# LandLedger User Credentials

## Login Information

All users have the default password: **12345**

### 🌾 Farmers (3 users)

| Username | Name | Password | Balance |
|----------|------|----------|---------|
| farmer1 | John Smith | 12345 | 50,000 APT |
| farmer2 | Maria Garcia | 12345 | 50,000 APT |
| farmer3 | David Johnson | 12345 | 50,000 APT |

### 💼 Investors (10 users)

| Username | Name | Password | Balance |
|----------|------|----------|---------|
| investor1 | Alice Chen | 12345 | 50,000 APT |
| investor2 | Bob Wilson | 12345 | 50,000 APT |
| investor3 | Carol Brown | 12345 | 50,000 APT |
| investor4 | Daniel Lopez | 12345 | 50,000 APT |
| investor5 | Emily Zhang | 12345 | 50,000 APT |
| investor6 | Frank Miller | 12345 | 50,000 APT |
| investor7 | Grace Taylor | 12345 | 50,000 APT |
| investor8 | Henry Davis | 12345 | 50,000 APT |
| investor9 | Isabella Wong | 12345 | 50,000 APT |
| investor10 | Jack Thompson | 12345 | 50,000 APT |

## How to Test

1. **Access the Application**: Open http://localhost:5175/
2. **Login**: Use any username from the table above with password "12345"
3. **Role-Based Navigation**: After login, you'll see different tabs based on your role:
   - **Farmers**: Dashboard, Income, Land NFT, Fractionalize (+ Users tab)
   - **Investors**: Dashboard, Income, Marketplace (+ Users tab)
4. **Test Different Roles**: 
   - Login as farmers to mint and fractionalize land
   - Login as investors to buy tokens and receive income distributions
5. **Create New Users**: Use the signup page to register new farmers or investors
6. **Switch Users**: Use the logout button (top-right) or Users tab to test different user perspectives

## Features Available After Login

### 👥 **For All Users**
- **Users Tab** (👥): Switch between different demo users for testing
- **Dashboard Tab** (📊): View real-time platform statistics and activity
- **Income Tab** (💰): Distribute and claim farming income

### 🌾 **For Farmers Only**
- **Land NFT Tab** (🌾): Create new land NFTs with real token IDs
- **Fractionalize Tab** (🔀): Convert land to tradeable tokens

### 💼 **For Investors Only**
- **Marketplace Tab** (🏪): Buy fractionalized land tokens

## Real Test Tokens & Blockchain Integration

- **Token IDs**: All minted lands get real blockchain-style token IDs
- **Transaction Hashes**: All operations generate mock transaction hashes
- **Purchase Tokens**: Token purchases get unique purchase token IDs  
- **Distribution IDs**: Income distributions get unique blockchain distribution IDs
- **Balance Tracking**: Real-time balance updates with 50,000 APT starting balance
- **Move Integration**: Prepared for real Move contract integration

## Enhanced Dashboard Features

- **Token ID Display**: View real token IDs for lands, purchases, and distributions
- **Transaction Tracking**: See transaction hashes for all blockchain operations
- **Real-time Updates**: Live platform statistics and user activity tracking
- **Purchase History**: Detailed token purchase records with IDs
- **Distribution Tracking**: Income distribution history with blockchain IDs

## Demo Workflow

1. **Login as a Farmer** (e.g., farmer1, password: 12345)
2. **Mint Land**: Create a new agricultural land NFT (gets real token ID)
3. **Fractionalize**: Convert the land into tradeable tokens (gets fractional token ID)
4. **Switch User**: Use Users tab to switch to an investor (e.g., investor1)
5. **Buy Tokens**: Purchase fractionalized land tokens (gets purchase token ID)
6. **Switch Back to Farmer**: Distribute farming income (gets distribution ID)
7. **Check Dashboard**: View all token IDs and transaction hashes in real-time

Enjoy testing the enhanced LandLedger platform with real token tracking! 🚀
