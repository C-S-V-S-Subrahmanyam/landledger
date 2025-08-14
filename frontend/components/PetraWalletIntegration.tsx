import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { WalletSelector } from "./WalletSelector";
import { useLandLedgerContract } from "@/utils/landLedgerContractNew";

interface PetraWalletIntegrationProps {
  onWalletConnected?: (walletAddress: string, balance: number) => void;
  onLogin?: (walletAddress: string, role: 'farmer' | 'investor') => void;
}

export function PetraWalletIntegration({ onWalletConnected, onLogin }: PetraWalletIntegrationProps) {
  const { connected, account, disconnect } = useWallet();
  const { toast } = useToast();
  const { getBalance, transferAPT, mintLandNFT } = useLandLedgerContract();
  const [isLoading, setIsLoading] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [selectedRole, setSelectedRole] = useState<'farmer' | 'investor'>('investor');
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [showTransactionTest, setShowTransactionTest] = useState(false);
  const [transferAmount, setTransferAmount] = useState('0.1');
  const [transferRecipient, setTransferRecipient] = useState('');

  // Handle wallet connection changes
  useEffect(() => {
    if (connected && account) {
      // Show role selection dialog when wallet is first connected
      setShowRoleSelection(true);
    }
  }, [connected, account]);

  const handleRoleSelection = async (role: 'farmer' | 'investor') => {
    setSelectedRole(role);
    setShowRoleSelection(false);
    await handleWalletConnected(role);
  };

  const handleWalletConnected = async (role: 'farmer' | 'investor' = selectedRole) => {
    if (!account) return;
    
    setIsLoading(true);
    try {
      const walletBalance = await getBalance();
      setBalance(walletBalance);
      
      toast({
        title: "Wallet Connected",
        description: `Connected to ${account.address.toString().slice(0, 8)}... with ${walletBalance.toFixed(2)} APT`,
      });

      // Call onWalletConnected if provided
      onWalletConnected?.(account.address.toString(), walletBalance);

      // Call onLogin if provided (for Login component integration)
      onLogin?.(account.address.toString(), role);

    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Failed to get wallet balance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setBalance(0);
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
    });
  };

  const refreshBalance = async () => {
    if (!account) return;
    
    setIsLoading(true);
    try {
      const newBalance = await getBalance();
      setBalance(newBalance);
      onWalletConnected?.(account.address.toString(), newBalance);
      
      toast({
        title: "Balance Updated",
        description: `Current balance: ${newBalance.toFixed(2)} APT`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh balance.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Test APT Transfer Function (will prompt Petra wallet)
  const testAPTTransfer = async () => {
    if (!transferRecipient || !transferAmount) {
      toast({
        title: "Error",
        description: "Please fill in recipient address and amount.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const txHash = await transferAPT(transferRecipient, parseFloat(transferAmount));
      
      if (txHash) {
        toast({
          title: "Transfer Successful! 🎉",
          description: `Transferred ${transferAmount} APT. Transaction: ${txHash.slice(0, 8)}...`,
        });
        
        // Refresh balance after transfer
        setTimeout(() => refreshBalance(), 2000);
      }
    } catch (error) {
      console.error('Transfer error:', error);
      toast({
        title: "Transfer Failed",
        description: error instanceof Error ? error.message : "Transaction failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setShowTransactionTest(false);
    }
  };

  // Test Land NFT Minting (will prompt Petra wallet)
  const testMintLandNFT = async () => {
    setIsLoading(true);
    try {
      const landId = `LAND-${Date.now()}`;
      const txHash = await mintLandNFT(
        landId,
        account!.address.toString(),
        "40.7128,-74.0060", // NYC coordinates
        "QmTestHash123",
        5, // 5 acres
        "Test Farm, New York"
      );
      
      if (txHash) {
        toast({
          title: "Land NFT Minted! 🌾",
          description: `Land NFT created successfully. Transaction: ${txHash.slice(0, 8)}...`,
        });
      }
    } catch (error) {
      console.error('Mint error:', error);
      toast({
        title: "Minting Failed",
        description: error instanceof Error ? error.message : "Transaction failed. Contract may not be deployed.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!connected || !account) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-bold">Connect Petra Wallet</CardTitle>
          <p className="text-gray-600">Connect your Aptos wallet to use real testnet tokens</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-gray-600">
            <p>• Shows your actual wallet balance</p>
            <p>• Uses real APT from your wallet</p>
            <p>• Real blockchain transactions</p>
          </div>
          
          <WalletSelector />
          
          <div className="text-xs text-gray-500 text-center">
            <p><strong>Real Balance:</strong> No fake tokens or auto-funding</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-lg font-bold text-green-600">✅ Wallet Connected</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <div className="text-sm text-gray-600">
              <strong>Address:</strong>
              <br />
              <code className="text-xs bg-gray-100 p-1 rounded">
                {account.address.toString().slice(0, 20)}...
              </code>
            </div>
            
            <div className="text-lg font-bold text-blue-600">
              💰 {isLoading ? "Loading..." : `${balance.toFixed(4)} APT`}
            </div>
            
            <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
              ✅ Real wallet balance (not simulated)
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <Button
              onClick={refreshBalance}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              {isLoading ? "..." : "🔄 Refresh Balance"}
            </Button>
          </div>

          {/* Transaction Testing Section */}
          <div className="border-t pt-4 space-y-2">
            <div className="text-sm font-semibold text-gray-700 text-center">
              🧪 Test Real Transactions
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              <Button
                onClick={() => setShowTransactionTest(true)}
                disabled={isLoading}
                variant="default"
                size="sm"
                className="bg-blue-500 hover:bg-blue-600"
              >
                💸 Test APT Transfer
              </Button>
              
              <Button
                onClick={testMintLandNFT}
                disabled={isLoading}
                variant="default"
                size="sm"
                className="bg-green-500 hover:bg-green-600"
              >
                🌾 Test Mint Land NFT
              </Button>
            </div>
            
            <div className="text-xs text-gray-500 text-center">
              These will prompt Petra wallet for approval
            </div>
          </div>

          <Button
            onClick={handleDisconnect}
            variant="destructive"
            size="sm"
            className="w-full"
          >
            Disconnect Wallet
          </Button>

          <div className="text-xs text-gray-500 text-center">
            <p>Real Aptos testnet connection</p>
            <p>Showing actual wallet balance</p>
          </div>
        </CardContent>
      </Card>

      {/* Role Selection Dialog */}
      <Dialog open={showRoleSelection} onOpenChange={setShowRoleSelection}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Choose Your Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Please select your role in the LandLedger platform:
            </p>
            
            <div className="grid grid-cols-1 gap-3">
              <Button
                onClick={() => handleRoleSelection('farmer')}
                variant="outline"
                className="p-4 h-auto text-left border-2 hover:border-green-500 hover:bg-green-50"
              >
                <div>
                  <div className="font-semibold text-green-700">🌾 Farmer</div>
                  <div className="text-sm text-gray-600">
                    Create and manage agricultural land tokens
                  </div>
                </div>
              </Button>
              
              <Button
                onClick={() => handleRoleSelection('investor')}
                variant="outline"
                className="p-4 h-auto text-left border-2 hover:border-blue-500 hover:bg-blue-50"
              >
                <div>
                  <div className="font-semibold text-blue-700">💰 Investor</div>
                  <div className="text-sm text-gray-600">
                    Invest in fractional land ownership
                  </div>
                </div>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* APT Transfer Test Dialog */}
      <Dialog open={showTransactionTest} onOpenChange={setShowTransactionTest}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Test APT Transfer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              This will create a real transaction that requires Petra wallet approval.
            </p>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="recipient">Recipient Address</Label>
                <Input
                  id="recipient"
                  value={transferRecipient}
                  onChange={(e) => setTransferRecipient(e.target.value)}
                  placeholder="0x1234..."
                  className="text-xs"
                />
              </div>
              
              <div>
                <Label htmlFor="amount">Amount (APT)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="0.1"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowTransactionTest(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={testAPTTransfer}
                disabled={isLoading || !transferRecipient || !transferAmount}
                className="flex-1 bg-blue-500 hover:bg-blue-600"
              >
                {isLoading ? "Sending..." : "Send APT"}
              </Button>
            </div>
            
            <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
              ⚠️ This will prompt Petra wallet for approval and send real testnet APT!
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
