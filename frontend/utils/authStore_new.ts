// Simple in-memory auth store for Petra wallet-only authentication
// This file maintains Petra wallet functionality without MongoDB backend

export interface User {
  id: string;
  username: string;
  name: string;
  role: 'farmer' | 'investor';
  avatar: string;
  wallet: string;
  balance: number;
  landOwned?: number;
  tokensOwned?: number;
  description: string;
}

class AuthStore {
  private users: User[] = [
    // Farmers
    {
      id: "farmer1",
      username: "farmer1", 
      name: "John Farmer",
      role: "farmer",
      avatar: "👨‍🌾",
      wallet: "0x1234567890abcdef1234567890abcdef12345678",
      balance: 2500,
      landOwned: 3,
      tokensOwned: 0,
      description: "Experienced corn and soybean farmer with 15 years in sustainable agriculture."
    },
    {
      id: "farmer2",
      username: "farmer2",
      name: "Sarah Green",
      role: "farmer",
      avatar: "👩‍🌾",
      wallet: "0x2345678901bcdef12345678901bcdef123456789",
      balance: 1800,
      landOwned: 2,
      tokensOwned: 0,
      description: "Organic vegetable farmer specializing in climate-resistant crop varieties."
    },
    {
      id: "farmer3",
      username: "farmer3",
      name: "Mike Fields",
      role: "farmer", 
      avatar: "👨‍🌾",
      wallet: "0x3456789012cdef123456789012cdef1234567890",
      balance: 3200,
      landOwned: 4,
      tokensOwned: 0,
      description: "Diversified farmer growing grains, legumes, and maintaining livestock operations."
    },
    // Investors
    {
      id: "investor1",
      username: "investor1",
      name: "Alex Chen",
      role: "investor",
      avatar: "👨‍💼",
      wallet: "0x4567890123def1234567890123def12345678901",
      balance: 5000,
      landOwned: 0,
      tokensOwned: 150,
      description: "Agricultural investment specialist with focus on sustainable farming technologies."
    },
    {
      id: "investor2",
      username: "investor2",
      name: "Emily Davis",
      role: "investor",
      avatar: "👩‍💼",
      wallet: "0x567890123ef12345678901234ef123456789012",
      balance: 4200,
      landOwned: 0,
      tokensOwned: 200,
      description: "Impact investor passionate about food security and regenerative agriculture."
    },
    {
      id: "investor3",
      username: "investor3", 
      name: "David Kim",
      role: "investor",
      avatar: "👨‍💼",
      wallet: "0x67890123f123456789012345f1234567890123",
      balance: 3800,
      landOwned: 0,
      tokensOwned: 120,
      description: "Portfolio manager specializing in agricultural commodities and farmland investments."
    },
    {
      id: "investor4",
      username: "investor4",
      name: "Lisa Wang",
      role: "investor",
      avatar: "👩‍💼",
      wallet: "0x7890123f12345678901234f12345678901234",
      balance: 6500,
      landOwned: 0,
      tokensOwned: 300,
      description: "Venture capitalist investing in agtech startups and sustainable farming initiatives."
    },
    {
      id: "investor5",
      username: "investor5",
      name: "Carlos Rodriguez",
      role: "investor",
      avatar: "👨‍💼",
      wallet: "0x890123f123456789012f123456789012345",
      balance: 2900,
      landOwned: 0,
      tokensOwned: 85,
      description: "ESG-focused investor supporting environmentally responsible agricultural practices."
    }
  ];

  private currentUser: User | null = null;

  getAllUsers(): User[] {
    return this.users;
  }

  // Simple login for demo purposes (passwords are hardcoded as "12345")
  login(username: string, password: string): User | null {
    if (password !== "12345") return null;
    
    const user = this.users.find(u => u.username === username);
    if (user) {
      this.currentUser = user;
      return user;
    }
    return null;
  }

  // Wallet-based login/registration - This is the main auth method for Petra
  loginWithWallet(walletAddress: string, role: 'farmer' | 'investor'): User {
    // Check if user exists with this wallet address
    let user = this.users.find(u => u.wallet === walletAddress);
    
    if (!user) {
      // Create new user with wallet
      const newUser: User = {
        id: `${role}_${Date.now()}`,
        username: `${role}_${walletAddress.slice(0, 8)}`,
        name: `${role === 'farmer' ? 'Farmer' : 'Investor'} ${walletAddress.slice(0, 8)}`,
        role,
        avatar: role === 'farmer' ? '👨‍🌾' : '👨‍💼',
        wallet: walletAddress,
        balance: 0, // Will be fetched from actual wallet
        landOwned: 0,
        tokensOwned: 0,
        description: `${role === 'farmer' ? 'Farm owner' : 'Investor'} using Petra wallet`
      };
      
      this.users.push(newUser);
      user = newUser;
    }
    
    this.currentUser = user;
    return user;
  }

  logout(): void {
    this.currentUser = null;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getUser(userId: string): User | null {
    return this.users.find(u => u.id === userId) || null;
  }

  updateUser(userId: string, updates: Partial<User>): User | null {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      this.users[userIndex] = { ...this.users[userIndex], ...updates };
      return this.users[userIndex];
    }
    return null;
  }

  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }
}

export const authStore = new AuthStore();
