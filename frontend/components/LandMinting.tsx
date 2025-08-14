import { useState, useEffect } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useLandLedgerContract } from "@/utils/landLedgerContractNew";

interface DemoUser {
  id: string;
  name: string;
  role: "farmer" | "investor";
  avatar: string;
  wallet: string;
  balance: number;
  landOwned?: number;
  tokensOwned?: number;
  description: string;
}

interface LandMintingProps {
  currentUser?: DemoUser | null;
}

export function LandMinting({ currentUser: _currentUser }: LandMintingProps) {
  const { connected, account } = useWallet();
  const { toast } = useToast();
  const { mintLandNFT, getBalance, transferAPT, isConnected: _isConnected } = useLandLedgerContract();
  const [isLoading, setIsLoading] = useState(false);
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  
  // Minting fee configuration
  const MINTING_FEE_APT = 0.5; // 0.5 APT fee for minting
  const PLATFORM_WALLET = "0x2161395c0ca6a820e5c864436a90c863439a4d3370b8ce49987d58efc9ad44fe"; // Platform wallet to receive fees
  
  const [formData, setFormData] = useState({
    landId: "",
    ownerId: "",
    geoTag: "",
    proofHash: "",
    areaAcres: "",
    location: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Demo data generator
  const fillDemoData = () => {
    const demoData = {
      landId: `FARM${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      ownerId: account?.address.toString() || `FARMER${Math.floor(Math.random() * 100)}`,
      geoTag: `${(40 + Math.random() * 10).toFixed(6)},${(-95 - Math.random() * 10).toFixed(6)}`,
      proofHash: `ipfs_demo_${Date.now()}`,
      areaAcres: Math.floor(Math.random() * 50 + 10).toString(),
      location: ["Iowa, USA", "Nebraska, USA", "Kansas, USA", "Illinois, USA"][Math.floor(Math.random() * 4)],
    };
    setFormData(demoData);
    toast({
      title: "Demo Data Filled!",
      description: "Ready to mint your land NFT with real transaction",
    });
  };

  // Load balance on component mount
  const loadBalance = async () => {
    if (connected && account) {
      try {
        const balance = await getBalance();
        setCurrentBalance(balance);
      } catch (error) {
        console.error("Error loading balance:", error);
      }
    }
  };

  // Load balance when wallet connects
  useEffect(() => {
    loadBalance();
  }, [connected, account]);

  const handleMintLand = async () => {
    if (!connected || !account) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your Petra wallet to continue",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      // Validate form
      if (!formData.landId || !formData.ownerId || !formData.areaAcres || !formData.location) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      // Check current balance before transaction
      const balanceBefore = await getBalance();
      setCurrentBalance(balanceBefore);

      // Check if user has enough balance for minting fee
      if (balanceBefore < MINTING_FEE_APT + 0.01) { // Extra 0.01 for network fees
        toast({
          title: "Insufficient Balance",
          description: `You need at least ${MINTING_FEE_APT + 0.01} APT to mint (${MINTING_FEE_APT} APT minting fee + network fees)`,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "🚀 Processing Minting Fee",
        description: `Charging ${MINTING_FEE_APT} APT minting fee. Petra wallet will prompt for approval...`,
      });

      // Step 1: Charge minting fee - Transfer APT to platform wallet
      let feeTransferHash;
      try {
        feeTransferHash = await transferAPT(PLATFORM_WALLET, MINTING_FEE_APT);
      } catch (feeError: any) {
        console.error("Fee transfer failed:", feeError);
        
        let errorMessage = "Minting fee payment failed";
        if (feeError.message?.includes('rejected by user')) {
          errorMessage = "Payment was cancelled by user";
        } else if (feeError.message?.includes('insufficient')) {
          errorMessage = `Insufficient balance. Need ${MINTING_FEE_APT + 0.01} APT minimum`;
        }
        
        toast({
          title: "💸 Payment Failed",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      if (!feeTransferHash) {
        toast({
          title: "Payment Failed",
          description: "Minting fee payment was cancelled or failed",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "✅ Payment Successful",
        description: `Minting fee paid! Now creating your Land NFT...`,
      });

      // Step 2: Mint the Land NFT (this might also prompt wallet if contracts are deployed)
      try {
        const nftMintHash = await mintLandNFT(
          formData.landId,
          formData.ownerId,
          formData.geoTag || `${(40 + Math.random() * 10).toFixed(6)},${(-95 - Math.random() * 10).toFixed(6)}`,
          formData.proofHash || `proof_${Date.now()}`,
          parseInt(formData.areaAcres),
          formData.location
        );

        // Check balance after all transactions
        setTimeout(async () => {
          const balanceAfter = await getBalance();
          setCurrentBalance(balanceAfter);
          const totalDeducted = balanceBefore - balanceAfter;

          toast({
            title: "🎉 Land NFT Minted Successfully!",
            description: `NFT: ${nftMintHash?.slice(0, 16)}... | Fee: ${MINTING_FEE_APT} APT | Total deducted: ${totalDeducted.toFixed(4)} APT`,
            duration: 8000,
          });
        }, 3000);

      } catch (nftError: any) {
        console.error("NFT minting failed, but fee was charged:", nftError);
        
        // Update balance even if NFT minting fails
        setTimeout(async () => {
          const balanceAfter = await getBalance();
          setCurrentBalance(balanceAfter);
        }, 2000);

        // Provide specific error messages based on error type
        let errorTitle = "⚠️ NFT Minting Failed";
        let errorDescription = `Minting fee (${MINTING_FEE_APT} APT) was charged, but NFT creation failed.`;
        
        if (nftError.message?.includes('Smart contracts not deployed')) {
          errorTitle = "📋 Contracts Not Deployed";
          errorDescription = `Fee charged: ${MINTING_FEE_APT} APT. NFT contracts need to be published to testnet first. Contact administrator.`;
        } else if (nftError.message?.includes('rejected by user')) {
          errorTitle = "❌ Transaction Rejected";
          errorDescription = `Fee was charged: ${MINTING_FEE_APT} APT, but you rejected the NFT creation. Try again to complete minting.`;
        } else if (nftError.message?.includes('insufficient')) {
          errorTitle = "💰 Insufficient Balance";
          errorDescription = `Fee charged: ${MINTING_FEE_APT} APT, but insufficient balance for NFT gas fees. Add more APT to complete.`;
        }

        toast({
          title: errorTitle,
          description: errorDescription,
          variant: "destructive",
          duration: 8000,
        });
      }

      // Reset form on success
      setFormData({
        landId: "",
        ownerId: "",
        geoTag: "",
        proofHash: "",
        areaAcres: "",
        location: "",
      });

    } catch (error) {
      console.error("Error minting land NFT:", error);
      
      // Update balance after any error
      setTimeout(async () => {
        const balanceAfter = await getBalance();
        setCurrentBalance(balanceAfter);
      }, 2000);
      
      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes("User rejected")) {
          toast({
            title: "Transaction Cancelled",
            description: "You cancelled the transaction in Petra wallet.",
            variant: "destructive",
          });
        } else if (error.message.includes("insufficient")) {
          toast({
            title: "Insufficient Balance",
            description: "You don't have enough APT to complete this transaction.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Transaction Failed",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to process minting transaction. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Mock function to simulate IPFS upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Simulate IPFS upload
      const mockHash = `ipfs_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9]/g, '')}`;
      handleInputChange("proofHash", mockHash);
      toast({
        title: "📁 File Uploaded to Demo IPFS",
        description: `Mock hash: ${mockHash}`,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="text-center space-y-3 mb-8">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center mb-4">
            <span className="text-3xl">🌾</span>
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-800">Tokenize Your Agricultural Land</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Convert your farmland into NFTs with proof of ownership, location data, and area details. 
          Start your journey towards fractional land ownership and investment opportunities.
        </p>
      </div>

      {/* Wallet Status Section */}
      {connected && account ? (
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-white text-sm">💰</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Petra Wallet Connected</p>
                  <p className="text-sm text-gray-600">
                    {account.address.toString().slice(0, 8)}...{account.address.toString().slice(-6)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-green-600">
                  {currentBalance.toFixed(4)} APT
                </p>
                <p className="text-xs text-gray-500">Live Balance</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-blue-200">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Minting Fee:</span>
                <span className="font-semibold text-blue-600">{MINTING_FEE_APT} APT</span>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
                <span>Network Fees:</span>
                <span>~0.001-0.01 APT</span>
              </div>
              {currentBalance < MINTING_FEE_APT + 0.01 && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
                  ⚠️ Insufficient balance for minting. Need at least {MINTING_FEE_APT + 0.01} APT
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6 bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                <span className="text-white text-sm">⚠️</span>
              </div>
              <div>
                <p className="font-semibold text-gray-800">Wallet Not Connected</p>
                <p className="text-sm text-gray-600">
                  Please connect your Petra wallet to mint land NFTs with real transactions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-green-50">
        <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-3 text-xl">
            <span>🌾</span>
            Mint Land NFT
          </CardTitle>
          <p className="text-green-100 text-sm">
            Create a new tokenized land parcel by providing land details and proof of ownership.
          </p>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          {/* Demo Button */}
          <div className="flex justify-center">
            <Button 
              onClick={fillDemoData}
              variant="outline"
              className="border-green-300 text-green-700 hover:bg-green-50"
            >
              🎲 Fill Demo Data
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="landId" className="text-gray-700 font-medium">Land ID *</Label>
              <Input
                id="landId"
                placeholder="e.g., FARM001"
                value={formData.landId}
                onChange={(e) => handleInputChange("landId", e.target.value)}
                className="border-gray-300 focus:border-green-500 focus:ring-green-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ownerId" className="text-gray-700 font-medium">Owner ID *</Label>
              <Input
                id="ownerId"
                placeholder="e.g., FARMER123"
                value={formData.ownerId}
                onChange={(e) => handleInputChange("ownerId", e.target.value)}
                className="border-gray-300 focus:border-green-500 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="areaAcres" className="text-gray-700 font-medium">Area (Acres) *</Label>
              <Input
                id="areaAcres"
                type="number"
                placeholder="e.g., 10"
                value={formData.areaAcres}
                onChange={(e) => handleInputChange("areaAcres", e.target.value)}
                className="border-gray-300 focus:border-green-500 focus:ring-green-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location" className="text-gray-700 font-medium">Location *</Label>
              <Input
                id="location"
                placeholder="e.g., Iowa, USA"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                className="border-gray-300 focus:border-green-500 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="geoTag" className="text-gray-700 font-medium">Geo-Tag (Coordinates)</Label>
            <Input
              id="geoTag"
              placeholder="e.g., 41.5868,-93.6250"
              value={formData.geoTag}
              onChange={(e) => handleInputChange("geoTag", e.target.value)}
              className="border-gray-300 focus:border-green-500 focus:ring-green-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="proofFile" className="text-gray-700 font-medium">Upload Proof (Photo/Document)</Label>
            <Input
              id="proofFile"
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileUpload}
              className="border-gray-300 focus:border-green-500 focus:ring-green-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            />
            {formData.proofHash && (
              <p className="text-xs text-green-600 bg-green-50 p-2 rounded">
                📁 Proof Hash: {formData.proofHash}
              </p>
            )}
          </div>

          <Button 
            onClick={handleMintLand} 
            disabled={isLoading || !connected || (currentBalance !== null && currentBalance < 0.51)}
            className={`w-full py-6 text-lg font-medium shadow-lg ${
              currentBalance !== null && currentBalance < 0.51 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            } text-white`}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Minting Land NFT...
              </>
            ) : currentBalance !== null && currentBalance < 0.51 ? (
              <>
                💳 Insufficient Balance (Need {MINTING_FEE_APT} APT + fees)
              </>
            ) : (
              <>
                🌾 Mint Land NFT (Fee: {MINTING_FEE_APT} APT)
              </>
            )}
          </Button>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">💡 Minting Information:</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• Minting fee: {MINTING_FEE_APT} APT (real transaction)</p>
              <p>• Requires minimum {MINTING_FEE_APT + 0.01} APT (including network fees)</p>
              <p>• Land ID should be unique for your property</p>
              <p>• Geo-tag helps with location verification</p>
              <p>• Proof documents are stored on IPFS for transparency</p>
              <p>• All transactions are real on Aptos testnet</p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 mb-2">⚠️ Contract Status:</h4>
            <div className="text-sm text-yellow-700 space-y-1">
              <p>• APT transfers work perfectly (real wallet deduction)</p>
              <p>• NFT minting may fail if Move contracts aren't deployed</p>
              <p>• If NFT creation fails, only the {MINTING_FEE_APT} APT fee is charged</p>
              <p>• Contact admin to deploy contracts for full functionality</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
