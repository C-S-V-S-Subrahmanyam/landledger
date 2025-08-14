import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

// Initialize Aptos client for devnet
const config = new AptosConfig({ network: Network.DEVNET });
export const aptos = new Aptos(config);

export interface TestTokenParams {
  recipientAddress: string;
  amount: number;
}

export class AptosTestTokens {
  private static readonly FAUCET_URL = "https://faucet.devnet.aptoslabs.com/mint";

  /**
   * Request test APT tokens from the Aptos faucet
   */
  static async requestTestTokens(address: string, amount: number = 50000): Promise<boolean> {
    try {
      const response = await fetch(this.FAUCET_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: address,
          amount: amount * 100000000, // Convert to octas (1 APT = 100,000,000 octas)
        }),
      });

      if (response.ok) {
        console.log(`Successfully minted ${amount} test APT tokens to ${address}`);
        return true;
      } else {
        console.error("Failed to request test tokens:", response.statusText);
        return false;
      }
    } catch (error) {
      console.error("Error requesting test tokens:", error);
      return false;
    }
  }

  /**
   * Get account balance
   */
  static async getAccountBalance(address: string): Promise<number> {
    try {
      const resources = await aptos.getAccountResources({
        accountAddress: address,
      });

      const coinResource = resources.find(
        (resource) => resource.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
      );

      if (coinResource) {
        const balance = (coinResource.data as any).coin.value;
        return parseInt(balance) / 100000000; // Convert from octas to APT
      }
      return 0;
    } catch (error) {
      console.error("Error getting account balance:", error);
      return 0;
    }
  }

  /**
   * Generate a new random wallet address for demo purposes
   */
  static generateRandomWalletAddress(): string {
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    return "0x" + Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Simulate token generation for demo purposes
   * In production, this would interact with actual smart contracts
   */
  static async simulateTokenGeneration(_userAddress: string): Promise<{
    success: boolean;
    transactionHash?: string;
    balance: number;
  }> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For demo purposes, always return success with a mock transaction hash
      const mockTxHash = "0x" + Math.random().toString(16).substr(2, 64);
      
      return {
        success: true,
        transactionHash: mockTxHash,
        balance: 50000, // Default test token amount
      };
    } catch (error) {
      console.error("Error simulating token generation:", error);
      return {
        success: false,
        balance: 0,
      };
    }
  }

  /**
   * Initialize user with test tokens (for new signups)
   */
  static async initializeUserTokens(userAddress: string): Promise<boolean> {
    try {
      // In a real application, you would:
      // 1. Create an account if it doesn't exist
      // 2. Fund it with test tokens from a faucet
      // 3. Initialize any required coin stores
      
      console.log(`Initializing test tokens for address: ${userAddress}`);
      
      // For demo purposes, simulate successful initialization
      const result = await this.simulateTokenGeneration(userAddress);
      return result.success;
    } catch (error) {
      console.error("Error initializing user tokens:", error);
      return false;
    }
  }
}
