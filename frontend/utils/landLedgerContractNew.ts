// Smart Contract Interface for LandLedger Move Contracts
import { 
  Account, 
  Aptos, 
  AptosConfig, 
  Network, 
  AccountAddress
} from "@aptos-labs/ts-sdk";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

// Contract addresses and configuration
export const LANDLEDGER_CONTRACT_ADDRESS = import.meta.env.VITE_MODULE_ADDRESS || "0x2161395c0ca6a820e5c864436a90c863439a4d3370b8ce49987d58efc9ad44fe";

export class LandLedgerContract {
  private aptos: Aptos;
  private contractAddress: string;

  constructor(network: Network = Network.TESTNET) {
    const config = new AptosConfig({ network });
    this.aptos = new Aptos(config);
    this.contractAddress = LANDLEDGER_CONTRACT_ADDRESS;
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

  /**
   * Get transaction details
   */
  async getTransaction(transactionHash: string): Promise<any> {
    try {
      return await this.aptos.getTransactionByHash({
        transactionHash
      });
    } catch (error) {
      console.error('Error getting transaction:', error);
      return null;
    }
  }

  /**
   * Transfer APT tokens
   */
  async transferAPT(
    account: Account,
    recipientAddress: string,
    amount: number
  ): Promise<string | null> {
    try {
      const transaction = await this.aptos.transferCoinTransaction({
        sender: account.accountAddress,
        recipient: AccountAddress.fromString(recipientAddress),
        amount: amount * 100_000_000 // Convert APT to octas
      });

      const pendingTransaction = await this.aptos.signAndSubmitTransaction({
        signer: account,
        transaction
      });

      const committedTransaction = await this.aptos.waitForTransaction({
        transactionHash: pendingTransaction.hash
      });

      return committedTransaction.hash;
    } catch (error) {
      console.error('Error transferring APT:', error);
      return null;
    }
  }

  // ===== REAL SMART CONTRACT FUNCTIONS =====
  // These functions will interact with Petra wallet and require user approval

  /**
   * Transfer APT tokens (REAL transaction - will prompt Petra wallet)
   */
  async transferAPTWithWallet(
    signAndSubmitTransaction: any,
    recipientAddress: string,
    amount: number
  ): Promise<string | null> {
    try {
      const transaction = {
        function: "0x1::aptos_account::transfer",
        functionArguments: [recipientAddress, amount * 100_000_000] // Convert APT to octas
      };

      console.log('💰 Submitting APT transfer transaction:', {
        to: recipientAddress,
        amount: amount,
        octas: amount * 100_000_000
      });

      const response = await signAndSubmitTransaction({ transaction });
      console.log('✅ APT transfer submitted:', response.hash);
      
      // Wait for transaction confirmation
      const committedTransaction = await this.aptos.waitForTransaction({
        transactionHash: response.hash
      });

      console.log(`🎉 APT transfer successful: ${committedTransaction.hash}`);
      return committedTransaction.hash;
    } catch (error: any) {
      console.error('❌ Error transferring APT:', error);
      
      // Check if user rejected transaction
      if (error?.message?.includes('User rejected') || 
          error?.message?.includes('rejected') ||
          error?.code === 4001) {
        throw new Error('Transaction was rejected by user');
      }
      
      // Check for insufficient balance
      if (error?.message?.includes('INSUFFICIENT_BALANCE') ||
          error?.message?.includes('insufficient')) {
        throw new Error('Insufficient balance for transfer and gas fees');
      }
      
      throw error;
    }
  }

  /**
   * Initialize Land NFT Collection (REAL transaction)
   */
  async initializeLandCollection(
    signAndSubmitTransaction: any
  ): Promise<string | null> {
    try {
      const transaction = {
        function: `${this.contractAddress}::land_nft::initialize_collection`,
        functionArguments: []
      };

      const response = await signAndSubmitTransaction({ transaction });
      
      const committedTransaction = await this.aptos.waitForTransaction({
        transactionHash: response.hash
      });

      console.log(`Land collection initialized: ${committedTransaction.hash}`);
      return committedTransaction.hash;
    } catch (error) {
      console.error('Error initializing land collection:', error);
      throw error;
    }
  }

  /**
   * Mint Land NFT (REAL transaction - will prompt Petra wallet)
   */
  async mintLandNFTWithWallet(
    signAndSubmitTransaction: any,
    landId: string,
    ownerId: string,
    geoTag: string,
    proofHash: string,
    areaAcres: number,
    location: string
  ): Promise<string | null> {
    try {
      const transaction = {
        function: `${this.contractAddress}::land_nft::mint_land_nft`,
        functionArguments: [
          landId,
          ownerId,
          geoTag,
          proofHash,
          areaAcres,
          location
        ]
      };

      console.log('📄 Submitting Land NFT minting transaction:', {
        contractAddress: this.contractAddress,
        function: transaction.function,
        arguments: transaction.functionArguments
      });

      const response = await signAndSubmitTransaction({ transaction });
      console.log('✅ Transaction submitted:', response.hash);
      
      const committedTransaction = await this.aptos.waitForTransaction({
        transactionHash: response.hash
      });

      console.log(`🎉 Land NFT minted successfully: ${committedTransaction.hash}`);
      return committedTransaction.hash;
    } catch (error: any) {
      console.error('❌ Error minting land NFT:', error);
      
      // Check if it's a contract not found error
      if (error?.message?.includes('EMODULE_NOT_FOUND') || 
          error?.message?.includes('FUNCTION_NOT_FOUND') ||
          error?.message?.includes('MODULE_NOT_FOUND')) {
        throw new Error('Smart contracts not deployed yet. The Move contracts need to be published to testnet first.');
      }
      
      // Check if user rejected transaction
      if (error?.message?.includes('User rejected') || 
          error?.message?.includes('rejected') ||
          error?.code === 4001) {
        throw new Error('Transaction was rejected by user');
      }
      
      // Check for insufficient balance
      if (error?.message?.includes('INSUFFICIENT_BALANCE') ||
          error?.message?.includes('insufficient')) {
        throw new Error('Insufficient balance for transaction and gas fees');
      }
      
      throw error;
    }
  }

  /**
   * Create Fractional Tokens (REAL transaction)
   */
  async createFractionalTokensWithWallet(
    signAndSubmitTransaction: any,
    assetMetadataAddress: string,
    totalSupply: number,
    decimals: number
  ): Promise<string | null> {
    try {
      const transaction = {
        function: `${this.contractAddress}::fractional_token::create_fractional_tokens`,
        functionArguments: [
          assetMetadataAddress,
          totalSupply,
          decimals
        ]
      };

      const response = await signAndSubmitTransaction({ transaction });
      
      const committedTransaction = await this.aptos.waitForTransaction({
        transactionHash: response.hash
      });

      console.log(`Fractional tokens created: ${committedTransaction.hash}`);
      return committedTransaction.hash;
    } catch (error) {
      console.error('Error creating fractional tokens:', error);
      throw error;
    }
  }

  // ===== SMART CONTRACT SIMULATION =====
  // Note: These are simulated for demo purposes since the contracts may not be deployed

  /**
   * Simulate minting a land NFT (for demo)
   */
  async simulateMintLandNFT(
    landId: string,
    ownerId: string,
    geoTag: string,
    proofHash: string,
    areaAcres: number,
    location: string
  ): Promise<string> {
    // Generate a simulated transaction hash
    const simulatedHash = "0x" + Math.random().toString(16).substr(2, 64);
    
    console.log(`Simulated land NFT minting:`, {
      landId,
      ownerId,
      geoTag,
      proofHash,
      areaAcres,
      location,
      transactionHash: simulatedHash
    });

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return simulatedHash;
  }

  /**
   * Simulate creating fractional tokens (for demo)
   */
  async simulateCreateFractionalTokens(
    landTokenAddress: string,
    fractionsPerAcre: number
  ): Promise<string> {
    const simulatedHash = "0x" + Math.random().toString(16).substr(2, 64);
    
    console.log(`Simulated fractional token creation:`, {
      landTokenAddress,
      fractionsPerAcre,
      transactionHash: simulatedHash
    });

    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return simulatedHash;
  }

  /**
   * Simulate marketplace purchase (for demo)
   */
  async simulatePurchaseTokens(
    listingId: number,
    amount: number,
    pricePerToken: number
  ): Promise<string> {
    const simulatedHash = "0x" + Math.random().toString(16).substr(2, 64);
    
    console.log(`Simulated token purchase:`, {
      listingId,
      amount,
      pricePerToken,
      totalCost: amount * pricePerToken,
      transactionHash: simulatedHash
    });

    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return simulatedHash;
  }

  /**
   * Simulate income distribution (for demo)
   */
  async simulateDistributeIncome(
    assetMetadataAddress: string,
    totalAmount: number
  ): Promise<string> {
    const simulatedHash = "0x" + Math.random().toString(16).substr(2, 64);
    
    console.log(`Simulated income distribution:`, {
      assetMetadataAddress,
      totalAmount,
      transactionHash: simulatedHash
    });

    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return simulatedHash;
  }
}

// Hook for using the contract with wallet
export function useLandLedgerContract() {
  const { account, signAndSubmitTransaction } = useWallet();
  const contract = new LandLedgerContract();

  // ===== REAL TRANSACTION FUNCTIONS (will prompt Petra wallet) =====
  
  const transferAPT = async (recipientAddress: string, amount: number) => {
    if (!account || !signAndSubmitTransaction) throw new Error('Wallet not connected');
    return await contract.transferAPTWithWallet(signAndSubmitTransaction, recipientAddress, amount);
  };

  const initializeLandCollection = async () => {
    if (!account || !signAndSubmitTransaction) throw new Error('Wallet not connected');
    return await contract.initializeLandCollection(signAndSubmitTransaction);
  };

  const mintLandNFT = async (
    landId: string,
    ownerId: string,
    geoTag: string,
    proofHash: string,
    areaAcres: number,
    location: string
  ) => {
    if (!account || !signAndSubmitTransaction) throw new Error('Wallet not connected');
    
    return await contract.mintLandNFTWithWallet(
      signAndSubmitTransaction, landId, ownerId, geoTag, proofHash, areaAcres, location
    );
  };

  const createFractionalTokens = async (
    assetMetadataAddress: string,
    totalSupply: number,
    decimals: number
  ) => {
    if (!account || !signAndSubmitTransaction) throw new Error('Wallet not connected');
    
    return await contract.createFractionalTokensWithWallet(
      signAndSubmitTransaction, assetMetadataAddress, totalSupply, decimals
    );
  };

  // ===== SIMULATION FUNCTIONS (for demo purposes) =====

  const simulateMintLandNFT = async (
    landId: string,
    ownerId: string,
    geoTag: string,
    proofHash: string,
    areaAcres: number,
    location: string
  ) => {
    return await contract.simulateMintLandNFT(
      landId, ownerId, geoTag, proofHash, areaAcres, location
    );
  };

  const createFractionalTokensSimulation = async (
    landTokenAddress: string,
    fractionsPerAcre: number
  ) => {
    if (!account) throw new Error('Wallet not connected');
    
    return await contract.simulateCreateFractionalTokens(
      landTokenAddress, fractionsPerAcre
    );
  };

  const purchaseTokens = async (
    listingId: number,
    amount: number,
    pricePerToken: number
  ) => {
    if (!account) throw new Error('Wallet not connected');
    
    return await contract.simulatePurchaseTokens(
      listingId, amount, pricePerToken
    );
  };

  const distributeIncome = async (
    assetMetadataAddress: string,
    totalAmount: number
  ) => {
    if (!account) throw new Error('Wallet not connected');
    
    return await contract.simulateDistributeIncome(
      assetMetadataAddress, totalAmount
    );
  };

  // ===== UTILITY FUNCTIONS =====

  const getBalance = async () => {
    if (!account) return 0;
    return await contract.getAccountBalance(account.address.toString());
  };

  return {
    account,
    contract,
    // Real transaction functions (will prompt Petra wallet)
    transferAPT,
    initializeLandCollection,
    mintLandNFT,
    createFractionalTokens,
    // Simulation functions (for demo)
    simulateMintLandNFT,
    createFractionalTokensSimulation,
    purchaseTokens,
    distributeIncome,
    // Utility functions
    getBalance,
    isConnected: !!account
  };
}

export const landLedgerContract = new LandLedgerContract();
