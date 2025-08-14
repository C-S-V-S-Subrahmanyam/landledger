// Simplified LandLedger Contract Interface for farmland_simple module
// WALLET-ONLY TRANSACTIONS - All operations require real APT from user's Petra wallet
import { 
  Aptos, 
  AptosConfig, 
  Network, 
  AccountAddress
} from "@aptos-labs/ts-sdk";

// Contract addresses and configuration
export const LANDLEDGER_CONTRACT_ADDRESS = import.meta.env.VITE_MODULE_ADDRESS || "0x2161395c0ca6a820e5c864436a90c863439a4d3370b8ce49987d58efc9ad44fe";

export interface Farm {
  id: number;
  owner: string;
  name: string;
  location: string;
  area_acres: number;
  total_tokens: number;
  tokens_sold: number;
  price_per_token: number;
  land_id: string;
  geo_tag: string;
  proof_hash: string;
}

export class SimpleLandLedgerContract {
  private aptos: Aptos;
  private contractAddress: string;

  constructor(network: Network = Network.TESTNET) {
    const config = new AptosConfig({ network });
    this.aptos = new Aptos(config);
    this.contractAddress = LANDLEDGER_CONTRACT_ADDRESS;
  }

  // ===== WALLET VALIDATION =====

  /**
   * Validate minimum wallet balance before transaction
   */
  private async validateWalletBalance(accountAddress: string, requiredAmount: number): Promise<void> {
    const balance = await this.getAccountBalance(accountAddress);
    if (balance < requiredAmount) {
      throw new Error(`Insufficient wallet balance. Required: ${requiredAmount} APT, Available: ${balance} APT`);
    }
  }

  // ===== UTILITY FUNCTIONS =====

  /**
   * Get account APT balance
   */
  async getAccountBalance(accountAddress: string): Promise<number> {
    try {
      const balance = await this.aptos.getAccountAPTAmount({
        accountAddress: AccountAddress.fromString(accountAddress)
      });
      // Convert from octas to APT
      return balance / 100_000_000;
    } catch (error) {
      console.error('Error getting balance:', error);
      return 0;
    }
  }

  /**
   * Get account info
   */
  async getAccountInfo(accountAddress: string): Promise<any> {
    try {
      const accountInfo = await this.aptos.getAccountInfo({
        accountAddress: AccountAddress.fromString(accountAddress)
      });
      return accountInfo;
    } catch (error) {
      console.error('Error getting account info:', error);
      return null;
    }
  }

  // ===== FARM REGISTRY FUNCTIONS =====

  /**
   * Initialize farm registry for an account (with wallet) - Requires 0.001 APT fee
   */
  async initializeRegistryWithWallet(
    signAndSubmitTransaction: any,
    userAddress: string
  ): Promise<string> {
    try {
      // Validate wallet has minimum balance for transaction
      await this.validateWalletBalance(userAddress, 0.001);
      
      const transaction = {
        function: `${this.contractAddress}::farmland_simple::init`,
        functionArguments: []
      };

      console.log('🏗️ Initializing farm registry with wallet transaction...');
      const response = await signAndSubmitTransaction({ transaction });
      
      // Wait for transaction confirmation
      await this.aptos.waitForTransaction({
        transactionHash: response.hash
      });

      console.log('✅ Farm registry initialized:', response.hash);
      return response.hash;
    } catch (error) {
      console.error('❌ Error initializing registry:', error);
      throw error;
    }
  }

  // Note: No direct-account variant. Wallet-only enforced.

  /**
   * Create a new farm (with wallet) - Requires 0.1 APT creation fee
   */
  async createFarmWithWallet(
    signAndSubmitTransaction: any,
    userAddress: string,
    name: string,
    location: string,
    areaAcres: number,
    totalTokens: number,
    pricePerToken: number, // in octas
    landId: string,
    geoTag: string,
    proofHash: string
  ): Promise<string> {
    try {
      // Validate wallet has sufficient balance (0.1 APT fee + gas)
      const requiredBalance = 0.15; // 0.1 APT fee + 0.05 APT for gas
      await this.validateWalletBalance(userAddress, requiredBalance);
      
      const transaction = {
        function: `${this.contractAddress}::farmland_simple::create_farm`,
        functionArguments: [
          name,
          location,
          areaAcres,
          totalTokens,
          pricePerToken,
          landId,
          geoTag,
          proofHash
        ]
      };

      console.log('🚜 Creating farm with wallet transaction...', {
        name,
        location,
        fee: '0.1 APT',
        pricePerToken: this.formatApt(pricePerToken)
      });
      
      const response = await signAndSubmitTransaction({ transaction });
      
      // Wait for transaction confirmation
      await this.aptos.waitForTransaction({
        transactionHash: response.hash
      });

      console.log('✅ Farm created successfully:', response.hash);
      return response.hash;
    } catch (error) {
      console.error('❌ Error creating farm:', error);
      throw error;
    }
  }

  // Note: No direct-account variant. Wallet-only enforced.

  /**
   * Invest in a farm (with wallet) - Direct APT transfer to farm owner
   */
  async investInFarmWithWallet(
    signAndSubmitTransaction: any,
    userAddress: string,
    farmOwner: string,
    farmId: number,
    tokensToInvest: number
  ): Promise<string> {
    try {
      // Get farm details to calculate investment cost
      const farm = await this.getFarm(farmOwner, farmId);
      if (!farm) {
        throw new Error('Farm not found');
      }
      
      const investmentCost = this.octasToApt(tokensToInvest * farm.price_per_token);
      const requiredBalance = investmentCost + 0.05; // Investment + gas
      
      // Validate wallet has sufficient balance
      await this.validateWalletBalance(userAddress, requiredBalance);
      
      const transaction = {
        function: `${this.contractAddress}::farmland_simple::invest_in_farm`,
        functionArguments: [
          farmOwner,
          farmId,
          tokensToInvest
        ]
      };

      console.log('💰 Investing in farm with wallet transaction...', {
        farmOwner,
        farmId,
        tokens: tokensToInvest,
        cost: `${investmentCost} APT`
      });

      const response = await signAndSubmitTransaction({ transaction });
      
      await this.aptos.waitForTransaction({
        transactionHash: response.hash
      });

      console.log('✅ Investment completed:', response.hash);
      return response.hash;
    } catch (error) {
      console.error('❌ Error investing in farm:', error);
      throw error;
    }
  }

  // Note: No direct-account variant. Wallet-only enforced.

  /**
   * Distribute income to a farm (with wallet) - Requires farmer's wallet balance
   */
  async distributeIncomeWithWallet(
    signAndSubmitTransaction: any,
    userAddress: string,
    farmId: number,
    totalIncome: number // in octas
  ): Promise<string> {
    try {
      const requiredBalance = this.octasToApt(totalIncome) + 0.05; // Income + gas
      
      // Validate wallet has sufficient balance
      await this.validateWalletBalance(userAddress, requiredBalance);
      
      const transaction = {
        function: `${this.contractAddress}::farmland_simple::distribute_income`,
        functionArguments: [
          farmId,
          totalIncome
        ]
      };

      console.log('💸 Distributing farm income with wallet transaction...', {
        farmId,
        income: this.formatApt(totalIncome)
      });

      const response = await signAndSubmitTransaction({ transaction });
      
      await this.aptos.waitForTransaction({
        transactionHash: response.hash
      });

      console.log('✅ Income distributed:', response.hash);
      return response.hash;
    } catch (error) {
      console.error('❌ Error distributing income:', error);
      throw error;
    }
  }

  // Note: No direct-account variant. Wallet-only enforced.

  // ===== VIEW FUNCTIONS =====

  /**
   * Check if an address has a farm registry
   */
  async hasRegistry(ownerAddress: string): Promise<boolean> {
    try {
      const result = await this.aptos.view({
        payload: {
          function: `${this.contractAddress}::farmland_simple::has_registry`,
          typeArguments: [],
          functionArguments: [ownerAddress]
        }
      });
      return result[0] as boolean;
    } catch (error) {
      console.error('Error checking registry:', error);
      return false;
    }
  }

  /**
   * Get all farms for an owner
   */
  async getFarms(ownerAddress: string): Promise<Farm[]> {
    try {
      const result = await this.aptos.view({
        payload: {
          function: `${this.contractAddress}::farmland_simple::get_farms`,
          typeArguments: [],
          functionArguments: [ownerAddress]
        }
      });
      return result[0] as Farm[];
    } catch (error) {
      console.error('Error getting farms:', error);
      return [];
    }
  }

  /**
   * Get a specific farm by index
   */
  async getFarm(ownerAddress: string, farmIndex: number): Promise<Farm | null> {
    try {
      const result = await this.aptos.view({
        payload: {
          function: `${this.contractAddress}::farmland_simple::get_farm`,
          typeArguments: [],
          functionArguments: [ownerAddress, farmIndex]
        }
      });
      return result[0] as Farm;
    } catch (error) {
      console.error('Error getting farm:', error);
      return null;
    }
  }

  /**
   * Get total number of farms for an owner
   */
  async getFarmCount(ownerAddress: string): Promise<number> {
    try {
      const result = await this.aptos.view({
        payload: {
          function: `${this.contractAddress}::farmland_simple::get_farm_count`,
          typeArguments: [],
          functionArguments: [ownerAddress]
        }
      });
      return Number(result[0]);
    } catch (error) {
      console.error('Error getting farm count:', error);
      return 0;
    }
  }

  // ===== CONVENIENCE FUNCTIONS =====

  /**
   * Convert APT to octas
   */
  aptToOctas(apt: number): number {
    return Math.floor(apt * 100_000_000);
  }

  /**
   * Convert octas to APT
   */
  octasToApt(octas: number): number {
    return octas / 100_000_000;
  }

  /**
   * Get formatted APT amount
   */
  formatApt(octas: number): string {
    return `${this.octasToApt(octas).toFixed(4)} APT`;
  }
}

// Export a singleton instance
export const simpleLandLedgerContract = new SimpleLandLedgerContract();

// ===== WALLET HOOK FUNCTIONS =====
// These functions work with the useWallet hook from @aptos-labs/wallet-adapter-react

/**
 * Hook-based function to initialize farm registry (requires wallet with balance)
 */
export async function initializeFarmRegistry() {
  const { useWallet } = await import("@aptos-labs/wallet-adapter-react");
  const { account, signAndSubmitTransaction } = useWallet();
  
  if (!account || !signAndSubmitTransaction) throw new Error('Wallet not connected');
  
  const userAddress = account.address.toString();
  return await simpleLandLedgerContract.initializeRegistryWithWallet(signAndSubmitTransaction, userAddress);
}

/**
 * Hook-based function to create a farm (requires 0.1 APT fee from wallet)
 */
export async function createNewFarm(
  name: string,
  location: string,
  areaAcres: number,
  totalTokens: number,
  pricePerTokenAPT: number, // in APT, will be converted to octas
  landId: string,
  geoTag: string,
  proofHash: string
) {
  const { useWallet } = await import("@aptos-labs/wallet-adapter-react");
  const { account, signAndSubmitTransaction } = useWallet();
  
  if (!account || !signAndSubmitTransaction) throw new Error('Wallet not connected');
  
  const userAddress = account.address.toString();
  const pricePerTokenOctas = simpleLandLedgerContract.aptToOctas(pricePerTokenAPT);
  
  return await simpleLandLedgerContract.createFarmWithWallet(
    signAndSubmitTransaction, userAddress, name, location, areaAcres, totalTokens, 
    pricePerTokenOctas, landId, geoTag, proofHash
  );
}

/**
 * Hook-based function to invest in a farm (transfers real APT from wallet)
 */
export async function investInFarmland(
  farmOwner: string,
  farmId: number,
  tokensToInvest: number
) {
  const { useWallet } = await import("@aptos-labs/wallet-adapter-react");
  const { account, signAndSubmitTransaction } = useWallet();
  
  if (!account || !signAndSubmitTransaction) throw new Error('Wallet not connected');
  
  const userAddress = account.address.toString();
  
  return await simpleLandLedgerContract.investInFarmWithWallet(
    signAndSubmitTransaction, userAddress, farmOwner, farmId, tokensToInvest
  );
}

/**
 * Hook-based function to distribute farm income (requires farmer's wallet balance)
 */
export async function distributeFarmIncome(
  farmOwner: string,
  farmId: number,
  totalIncomeAPT: number // in APT, will be converted to octas
) {
  const { useWallet } = await import("@aptos-labs/wallet-adapter-react");
  const { account, signAndSubmitTransaction } = useWallet();
  
  if (!account || !signAndSubmitTransaction) throw new Error('Wallet not connected');
  
  // Validate farm exists for the provided owner and id
  const farm = await simpleLandLedgerContract.getFarm(farmOwner, farmId);
  if (!farm) {
    throw new Error('Farm not found for the given owner and id');
  }

  const userAddress = account.address.toString();
  const totalIncomeOctas = simpleLandLedgerContract.aptToOctas(totalIncomeAPT);
  
  return await simpleLandLedgerContract.distributeIncomeWithWallet(
    signAndSubmitTransaction, userAddress, farmId, totalIncomeOctas
  );
}
