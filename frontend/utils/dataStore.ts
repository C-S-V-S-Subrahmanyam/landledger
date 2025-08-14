import { User } from "@/components/UserSelector";

export interface LandNFT {
  id: string;
  ownerId: string;
  location: string;
  acres: number;
  cropType: string;
  isFramentalized: boolean;
  totalTokens?: number;
  tokenPrice?: number;
  tokensSold?: number;
  tokenId?: string; // Real blockchain token ID
  transactionHash?: string; // Blockchain transaction hash
}

export interface TokenPurchase {
  id: string;
  investorId: string;
  landId: string;
  tokens: number;
  pricePerToken: number;
  timestamp: Date;
  tokenId?: string; // Real blockchain token ID
  transactionHash?: string; // Blockchain transaction hash
}

export interface IncomeDistribution {
  id: string;
  landId: string;
  totalAmount: number;
  perToken: number;
  timestamp: Date;
  claimed: { [investorId: string]: boolean };
  distributionId?: string; // Real blockchain distribution ID
  transactionHash?: string; // Blockchain transaction hash
}

class DataStore {
  private users: User[] = [];
  private lands: LandNFT[] = [];
  private purchases: TokenPurchase[] = [];
  private distributions: IncomeDistribution[] = [];
  private currentUserId: string | null = null;

  constructor() {
    this.initializeUsers();
  }

  private initializeUsers() {
    // 3 Farmers
    this.users = [
      {
        id: "farmer1",
        name: "John Smith",
        role: "farmer",
        wallet: "0x000000000000000000000000000000000000000000000000000000000000f001",
        balance: 50000,
        landOwned: [],
        totalInvestment: 0,
        totalEarnings: 0,
      },
      {
        id: "farmer2",
        name: "Maria Garcia",
        role: "farmer",
        wallet: "0x000000000000000000000000000000000000000000000000000000000000f002",
        balance: 50000,
        landOwned: [],
        totalInvestment: 0,
        totalEarnings: 0,
      },
      {
        id: "farmer3",
        name: "David Johnson",
        role: "farmer",
        wallet: "0x000000000000000000000000000000000000000000000000000000000000f003",
        balance: 50000,
        landOwned: [],
        totalInvestment: 0,
        totalEarnings: 0,
      },
      // 10 Investors
      {
        id: "investor1",
        name: "Alice Chen",
        role: "investor",
        wallet: "0x000000000000000000000000000000000000000000000000000000000000i001",
        balance: 50000,
        tokensOwned: {},
        totalInvestment: 0,
        totalEarnings: 0,
      },
      {
        id: "investor2",
        name: "Bob Wilson",
        role: "investor",
        wallet: "0x000000000000000000000000000000000000000000000000000000000000i002",
        balance: 50000,
        tokensOwned: {},
        totalInvestment: 0,
        totalEarnings: 0,
      },
      {
        id: "investor3",
        name: "Carol Brown",
        role: "investor",
        wallet: "0x000000000000000000000000000000000000000000000000000000000000i003",
        balance: 50000,
        tokensOwned: {},
        totalInvestment: 0,
        totalEarnings: 0,
      },
      {
        id: "investor4",
        name: "Dan Taylor",
        role: "investor",
        wallet: "0x000000000000000000000000000000000000000000000000000000000000i004",
        balance: 50000,
        tokensOwned: {},
        totalInvestment: 0,
        totalEarnings: 0,
      },
      {
        id: "investor5",
        name: "Emma Davis",
        role: "investor",
        wallet: "0x000000000000000000000000000000000000000000000000000000000000i005",
        balance: 50000,
        tokensOwned: {},
        totalInvestment: 0,
        totalEarnings: 0,
      },
      {
        id: "investor6",
        name: "Frank Miller",
        role: "investor",
        wallet: "0x000000000000000000000000000000000000000000000000000000000000i006",
        balance: 50000,
        tokensOwned: {},
        totalInvestment: 0,
        totalEarnings: 0,
      },
      {
        id: "investor7",
        name: "Grace Lee",
        role: "investor",
        wallet: "0x000000000000000000000000000000000000000000000000000000000000i007",
        balance: 50000,
        tokensOwned: {},
        totalInvestment: 0,
        totalEarnings: 0,
      },
      {
        id: "investor8",
        name: "Henry Clark",
        role: "investor",
        wallet: "0x000000000000000000000000000000000000000000000000000000000000i008",
        balance: 50000,
        tokensOwned: {},
        totalInvestment: 0,
        totalEarnings: 0,
      },
      {
        id: "investor9",
        name: "Iris Wang",
        role: "investor",
        wallet: "0x000000000000000000000000000000000000000000000000000000000000i009",
        balance: 50000,
        tokensOwned: {},
        totalInvestment: 0,
        totalEarnings: 0,
      },
      {
        id: "investor10",
        name: "Jack Rodriguez",
        role: "investor",
        wallet: "0x000000000000000000000000000000000000000000000000000000000000i010",
        balance: 50000,
        tokensOwned: {},
        totalInvestment: 0,
        totalEarnings: 0,
      },
    ];
  }

  getUsers(): User[] {
    return [...this.users];
  }

  getUser(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }

  updateUser(id: string, updates: Partial<User>): void {
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex !== -1) {
      this.users[userIndex] = { ...this.users[userIndex], ...updates };
    }
  }

  // Land operations
  mintLand(farmerId: string, landData: Omit<LandNFT, "id" | "ownerId" | "isFramentalized">): string {
    const landId = `land_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const tokenId = `land_nft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const transactionHash = "0x" + Math.random().toString(16).substr(2, 64);
    
    const newLand: LandNFT = {
      id: landId,
      ownerId: farmerId,
      isFramentalized: false,
      tokenId,
      transactionHash,
      ...landData,
    };
    
    this.lands.push(newLand);
    
    // Update farmer's land ownership
    const farmer = this.getUser(farmerId);
    if (farmer && farmer.landOwned) {
      farmer.landOwned.push(landId);
      this.updateUser(farmerId, farmer);
    }
    
    return landId;
  }

  fractionalizeLand(landId: string, totalTokens: number, tokenPrice: number): boolean {
    const landIndex = this.lands.findIndex(l => l.id === landId);
    if (landIndex === -1) return false;

    const fractionalTokenId = `frac_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const transactionHash = "0x" + Math.random().toString(16).substr(2, 64);

    this.lands[landIndex] = {
      ...this.lands[landIndex],
      isFramentalized: true,
      totalTokens,
      tokenPrice,
      tokensSold: 0,
      tokenId: fractionalTokenId,
      transactionHash,
    };
    
    return true;
  }

  // Purchase operations
  purchaseTokens(investorId: string, landId: string, tokenAmount: number): boolean {
    const land = this.lands.find(l => l.id === landId);
    const investor = this.getUser(investorId);
    
    if (!land || !investor || !land.isFramentalized || !land.tokenPrice) return false;
    
    const totalCost = tokenAmount * land.tokenPrice;
    if (investor.balance < totalCost) return false;
    
    if ((land.tokensSold || 0) + tokenAmount > (land.totalTokens || 0)) return false;

    // Update land
    const landIndex = this.lands.findIndex(l => l.id === landId);
    this.lands[landIndex].tokensSold = (this.lands[landIndex].tokensSold || 0) + tokenAmount;

    // Update investor
    investor.balance -= totalCost;
    investor.totalInvestment = (investor.totalInvestment || 0) + totalCost;
    if (!investor.tokensOwned) investor.tokensOwned = {};
    investor.tokensOwned[landId] = (investor.tokensOwned[landId] || 0) + tokenAmount;
    this.updateUser(investorId, investor);

    // Update farmer (receives the payment)
    const farmer = this.getUser(land.ownerId);
    if (farmer) {
      farmer.balance += totalCost;
      this.updateUser(land.ownerId, farmer);
    }

    // Record purchase
    const purchaseTokenId = `purchase_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const transactionHash = "0x" + Math.random().toString(16).substr(2, 64);
    
    this.purchases.push({
      id: `purchase_${Date.now()}`,
      investorId,
      landId,
      tokens: tokenAmount,
      pricePerToken: land.tokenPrice,
      timestamp: new Date(),
      tokenId: purchaseTokenId,
      transactionHash,
    });

    return true;
  }

  // Income distribution
  distributeIncome(landId: string, totalAmount: number): string | null {
    const land = this.lands.find(l => l.id === landId);
    if (!land || !land.isFramentalized || !land.totalTokens) return null;

    const perToken = totalAmount / land.totalTokens;
    const distributionId = `dist_${Date.now()}`;
    const blockchainDistId = `dist_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const transactionHash = "0x" + Math.random().toString(16).substr(2, 64);

    const distribution: IncomeDistribution = {
      id: distributionId,
      landId,
      totalAmount,
      perToken,
      timestamp: new Date(),
      claimed: {},
      distributionId: blockchainDistId,
      transactionHash,
    };

    this.distributions.push(distribution);
    return distributionId;
  }

  claimIncome(investorId: string, distributionId: string): number {
    const distribution = this.distributions.find(d => d.id === distributionId);
    const investor = this.getUser(investorId);
    
    if (!distribution || !investor || distribution.claimed[investorId]) return 0;

    const tokensOwned = investor.tokensOwned?.[distribution.landId] || 0;
    const earnings = tokensOwned * distribution.perToken;

    if (earnings > 0) {
      // Mark as claimed
      distribution.claimed[investorId] = true;
      
      // Update investor
      investor.balance += earnings;
      investor.totalEarnings = (investor.totalEarnings || 0) + earnings;
      this.updateUser(investorId, investor);
    }

    return earnings;
  }

  // Getters for data viewing
  getLands(): LandNFT[] {
    return [...this.lands];
  }

  getAvailableTokens(): LandNFT[] {
    return this.lands.filter(l => l.isFramentalized && (l.tokensSold || 0) < (l.totalTokens || 0));
  }

  getPurchases(): TokenPurchase[] {
    return [...this.purchases];
  }

  getDistributions(): IncomeDistribution[] {
    return [...this.distributions];
  }

  getUserPurchases(investorId: string): TokenPurchase[] {
    return this.purchases.filter(p => p.investorId === investorId);
  }

  getUserDistributions(investorId: string): IncomeDistribution[] {
    const userTokens = this.getUser(investorId)?.tokensOwned || {};
    return this.distributions.filter(d => userTokens[d.landId] > 0);
  }

  // Authentication integration methods
  setCurrentUser(userId: string | null): void {
    this.currentUserId = userId;
  }

  getCurrentUserId(): string | null {
    return this.currentUserId;
  }

  addUser(userData: {
    id: string;
    name: string;
    role: 'farmer' | 'investor';
    balance: number;
  }): void {
    const newUser: User = {
      id: userData.id,
      name: userData.name,
      role: userData.role,
      wallet: `0x${userData.id.padEnd(64, '0')}`,
      balance: userData.balance,
      landOwned: userData.role === 'farmer' ? [] : undefined,
      tokensOwned: userData.role === 'investor' ? {} : undefined,
      totalInvestment: 0,
      totalEarnings: 0,
    };
    this.users.push(newUser);
  }

  updateUserBalance(userId: string, newBalance: number): void {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.balance = newBalance;
    }
  }
}

export const dataStore = new DataStore();
