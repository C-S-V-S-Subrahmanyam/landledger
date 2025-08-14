import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

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

interface MarketplaceProps {
  currentUser?: DemoUser | null;
}

export function Marketplace({ currentUser: _currentUser }: MarketplaceProps) {
  const { toast } = useToast();
  const [listings] = useState([
    {
      id: 1,
      landId: "FARM001",
      location: "Iowa Corn Fields, USA",
      tokensAvailable: 500,
      pricePerToken: 0.12,
      totalValue: 60,
      seller: "0x1234...abcd",
      cropType: "Corn",
      annualYield: "$1,200/acre",
      image: "🌽"
    },
    {
      id: 2,
      location: "Nebraska Wheat Farm, USA", 
      landId: "FARM002",
      tokensAvailable: 750,
      pricePerToken: 0.08,
      totalValue: 60,
      seller: "0x5678...efgh",
      cropType: "Wheat",
      annualYield: "$800/acre",
      image: "🌾"
    },
    {
      id: 3,
      landId: "FARM003",
      location: "California Almond Grove, USA",
      tokensAvailable: 300,
      pricePerToken: 0.25,
      totalValue: 75,
      seller: "0x9abc...ijkl",
      cropType: "Almonds",
      annualYield: "$2,500/acre",
      image: "🌰"
    },
  ]);

  const handleBuyTokens = (_listingId: number, landId: string) => {
    toast({
      title: "🎉 Purchase Successful!",
      description: `Demo purchase of ${landId} tokens completed`,
    });
  };

  const handleCreateListing = () => {
    toast({
      title: "📝 Listing Created!",
      description: "Demo listing created successfully",
    });
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="text-center space-y-3 mb-8">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center mb-4">
            <span className="text-3xl">🏪</span>
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-800">Agricultural Land Marketplace</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Buy and sell fractional ownership tokens of premium farmland. Diversify your portfolio 
          with agricultural real estate and earn from crop yields.
        </p>
      </div>

      {/* Market Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">24</div>
            <div className="text-sm text-green-100">Active Listings</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white border-0">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">1,250</div>
            <div className="text-sm text-blue-100">APT Volume</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-purple-500 to-pink-600 text-white border-0">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">89</div>
            <div className="text-sm text-purple-100">Active Traders</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-orange-500 to-red-600 text-white border-0">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">2.5%</div>
            <div className="text-sm text-orange-100">Platform Fee</div>
          </CardContent>
        </Card>
      </div>
        
      {/* Create Listing Section */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-purple-50">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-3 text-xl">
            <span>📝</span>
            Create New Listing
          </CardTitle>
          <p className="text-purple-100 text-sm">
            List your fractional land tokens for sale to investors worldwide.
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assetAddress" className="text-gray-700 font-medium">Token Asset Address</Label>
              <Input 
                id="assetAddress" 
                placeholder="0x000...cafe" 
                className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-gray-700 font-medium">Amount to Sell</Label>
              <Input 
                id="amount" 
                type="number" 
                placeholder="100" 
                className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price" className="text-gray-700 font-medium">Price per Token (APT)</Label>
              <Input 
                id="price" 
                type="number" 
                step="0.01" 
                placeholder="0.10" 
                className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration" className="text-gray-700 font-medium">Duration (days)</Label>
              <Input 
                id="duration" 
                type="number" 
                placeholder="30" 
                className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
          </div>
          <Button 
            className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3"
            onClick={handleCreateListing}
          >
            📝 Create Demo Listing
          </Button>
        </CardContent>
      </Card>

      {/* Active Listings */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl text-gray-800">
            <span>🌾</span>
            Premium Land Offerings
          </CardTitle>
          <p className="text-gray-600 text-sm">
            Invest in high-quality agricultural land with verified yields and ownership.
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <Card key={listing.id} className="border border-gray-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white p-4 rounded-t-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{listing.image}</span>
                      <div>
                        <div className="font-bold text-lg">{listing.landId}</div>
                        <div className="text-green-100 text-sm">{listing.cropType}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 space-y-3">
                    <div className="text-sm text-gray-600">{listing.location}</div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Available:</span>
                        <div className="font-medium">{listing.tokensAvailable} tokens</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Price:</span>
                        <div className="font-medium">{listing.pricePerToken} APT</div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">Annual Yield</div>
                      <div className="font-bold text-green-600">{listing.annualYield}</div>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <div className="text-lg font-bold text-gray-800">
                        {listing.totalValue} APT
                      </div>
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleBuyTokens(listing.id, listing.landId)}
                      >
                        🛒 Buy Tokens
                      </Button>
                    </div>
                    
                    <div className="text-xs text-gray-400 truncate">
                      Seller: {listing.seller}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">🔍 Market Information:</h4>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• All listings are verified for authenticity and ownership</p>
          <p>• Platform fee: 2.5% of transaction value</p>
          <p>• Instant settlement with smart contract escrow</p>
          <p>• All transactions are transparent and auditable on-chain</p>
          <p>• Demo mode: Purchases are simulated for testing purposes</p>
        </div>
      </div>
    </div>
  );
}
