// Backend API integration for LandLedger
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export interface User {
  id: string;
  username: string;
  name: string;
  role: 'farmer' | 'investor';
  avatar: string;
  wallet: string;
  walletAddress?: string;
  balance: number;
  landOwned: number;
  tokensOwned: number;
  description: string;
  transactionHistory?: any[];
  farmTokens?: any[];
  ownedFarms?: any[];
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Farm {
  farmId: string;
  owner: string;
  name: string;
  location: string;
  areaAcres: number;
  totalTokens: number;
  tokensSold: number;
  pricePerToken: number;
  landId: string;
  geoTag: string;
  proofHash: string;
  cropType?: string;
  status: 'active' | 'fractionalized' | 'sold_out' | 'inactive';
  investors: any[];
  incomeDistributions: any[];
  totalRaised: number;
  nftTokenAddress?: string;
  fractionalTokenAddress?: string;
  mintTransactionHash?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class BackendAPI {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
    // Load token from localStorage if available
    this.token = localStorage.getItem('authToken');
  }

  // Helper method to make API calls
  private async apiCall(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Call Error:', error);
      throw error;
    }
  }

  // Set authentication token
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  // Clear authentication token
  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  // Authentication endpoints
  async register(userData: {
    username: string;
    password: string;
    name: string;
    role: 'farmer' | 'investor';
  }): Promise<{ success: boolean; user?: User; token?: string; message: string }> {
    const result = await this.apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });

    if (result.success && result.token) {
      this.setToken(result.token);
    }

    return result;
  }

  async login(credentials: {
    username: string;
    password: string;
  }): Promise<{ success: boolean; user?: User; token?: string; message: string }> {
    const result = await this.apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });

    if (result.success && result.token) {
      this.setToken(result.token);
    }

    return result;
  }

  async walletLogin(walletData: {
    walletAddress: string;
    role: 'farmer' | 'investor';
    name?: string;
  }): Promise<{ success: boolean; user?: User; token?: string; message: string }> {
    const result = await this.apiCall('/auth/wallet-login', {
      method: 'POST',
      body: JSON.stringify(walletData)
    });

    if (result.success && result.token) {
      this.setToken(result.token);
    }

    return result;
  }

  async getCurrentUser(): Promise<{ success: boolean; user?: User }> {
    if (!this.token) {
      return { success: false };
    }

    try {
      return await this.apiCall('/auth/me');
    } catch (error) {
      // Token might be expired
      this.clearToken();
      return { success: false };
    }
  }

  // User endpoints
  async getAllUsers(): Promise<{ success: boolean; users: User[]; count: number }> {
    return await this.apiCall('/users');
  }

  async getUserById(userId: string): Promise<{ success: boolean; user?: User }> {
    return await this.apiCall(`/users/${userId}`);
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<{ success: boolean; user?: User; message: string }> {
    return await this.apiCall(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async addUserTransaction(userId: string, transactionData: {
    type: string;
    amount: number;
    transactionHash: string;
    details?: any;
  }): Promise<{ success: boolean; user?: User; message: string }> {
    return await this.apiCall(`/users/${userId}/transaction`, {
      method: 'POST',
      body: JSON.stringify(transactionData)
    });
  }

  async addUserFarmInvestment(userId: string, investmentData: {
    farmId: string;
    farmOwner: string;
    tokensOwned: number;
    investmentAmount: number;
  }): Promise<{ success: boolean; user?: User; message: string }> {
    return await this.apiCall(`/users/${userId}/farm-investment`, {
      method: 'POST',
      body: JSON.stringify(investmentData)
    });
  }

  // Farm endpoints
  async getAllFarms(filters?: {
    owner?: string;
    status?: string;
    limit?: number;
  }): Promise<{ success: boolean; farms: Farm[]; count: number }> {
    const queryParams = new URLSearchParams();
    if (filters?.owner) queryParams.append('owner', filters.owner);
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());

    const endpoint = `/farms${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await this.apiCall(endpoint);
  }

  async getFarmById(farmId: string): Promise<{ success: boolean; farm?: Farm }> {
    return await this.apiCall(`/farms/${farmId}`);
  }

  async createFarm(farmData: Omit<Farm, 'tokensSold' | 'status' | 'investors' | 'incomeDistributions' | 'totalRaised'>): Promise<{ success: boolean; farm?: Farm; message: string }> {
    return await this.apiCall('/farms', {
      method: 'POST',
      body: JSON.stringify(farmData)
    });
  }

  async updateFarm(farmId: string, updates: Partial<Farm>): Promise<{ success: boolean; farm?: Farm; message: string }> {
    return await this.apiCall(`/farms/${farmId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async investInFarm(farmId: string, investmentData: {
    userAddress: string;
    userName: string;
    tokensOwned: number;
    investmentAmount: number;
    transactionHash?: string;
  }): Promise<{ success: boolean; farm?: Farm; message: string }> {
    return await this.apiCall(`/farms/${farmId}/invest`, {
      method: 'POST',
      body: JSON.stringify(investmentData)
    });
  }

  async distributeFarmIncome(farmId: string, distributionData: {
    totalIncome: number;
    description?: string;
    transactionHash?: string;
  }): Promise<{ success: boolean; farm?: Farm; message: string; distributedPerToken?: number }> {
    return await this.apiCall(`/farms/${farmId}/distribute-income`, {
      method: 'POST',
      body: JSON.stringify(distributionData)
    });
  }

  async getFarmsByOwner(ownerAddress: string): Promise<{ success: boolean; farms: Farm[]; count: number }> {
    return await this.apiCall(`/farms/owner/${ownerAddress}`);
  }

  async getMarketplaceFarms(): Promise<{ success: boolean; farms: Farm[]; count: number }> {
    return await this.apiCall('/farms/marketplace/active');
  }

  // Statistics endpoints
  async getStats(): Promise<{ success: boolean; stats: any }> {
    return await this.apiCall('/users/analytics/stats');
  }

  // Health check
  async healthCheck(): Promise<{ success: boolean; message: string; timestamp: string }> {
    try {
      const response = await fetch(`${this.baseURL.replace('/api', '')}/health`);
      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Backend server is not reachable',
        timestamp: new Date().toISOString()
      };
    }
  }

  // Logout
  logout() {
    this.clearToken();
  }
}

// Export singleton instance
export const backendAPI = new BackendAPI();

// Export the class for testing purposes
export { BackendAPI };
