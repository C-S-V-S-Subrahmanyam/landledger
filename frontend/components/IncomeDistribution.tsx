import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export function IncomeDistribution() {
  const { toast } = useToast();
  const [distributions] = useState([
    {
      id: 1,
      landId: "FARM001",
      description: "Q4 2024 Corn Harvest",
      totalIncome: 1000,
      distributionDate: "2024-12-15",
      claimed: false,
      userTokens: 50,
      userShare: 50,
      cropType: "🌽 Corn",
      efficiency: "92%"
    },
    {
      id: 2,
      landId: "FARM002", 
      description: "Q3 2024 Soybean Harvest",
      totalIncome: 800,
      distributionDate: "2024-09-30",
      claimed: true,
      userTokens: 25,
      userShare: 20,
      cropType: "🌿 Soybeans",
      efficiency: "88%"
    },
    {
      id: 3,
      landId: "FARM003",
      description: "Q2 2024 Almond Harvest",
      totalIncome: 1500,
      distributionDate: "2024-06-20",
      claimed: false,
      userTokens: 75,
      userShare: 112.5,
      cropType: "🌰 Almonds",
      efficiency: "95%"
    },
  ]);

  const handleClaimIncome = (_distributionId: number, amount: number) => {
    toast({
      title: "💰 Income Claimed!",
      description: `Successfully claimed ${amount} APT from distribution`,
    });
  };

  const handleCreateDistribution = () => {
    toast({
      title: "📊 Distribution Created!",
      description: "Demo income distribution created successfully",
    });
  };

  const handleSimulateHarvest = () => {
    toast({
      title: "🌾 Harvest Simulated!",
      description: "Demo harvest income simulation completed",
    });
  };

  const totalEarnings = distributions.reduce((sum, dist) => 
    dist.claimed ? sum + dist.userShare : sum, 0
  );
  const pendingEarnings = distributions.reduce((sum, dist) => 
    !dist.claimed ? sum + dist.userShare : sum, 0
  );

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="text-center space-y-3 mb-8">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center mb-4">
            <span className="text-3xl">💰</span>
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-800">Income Distribution Hub</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Manage harvest income distributions and claim your proportional share as a token holder. 
          Transparent, automated, and fair distribution of agricultural profits.
        </p>
      </div>

      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{totalEarnings} APT</div>
            <div className="text-sm text-green-100">Total Claimed</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-orange-500 to-red-600 text-white border-0">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{pendingEarnings} APT</div>
            <div className="text-sm text-orange-100">Pending Claims</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white border-0">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{distributions.length}</div>
            <div className="text-sm text-blue-100">Total Distributions</div>
          </CardContent>
        </Card>
      </div>
        
      {/* Create Distribution Section (For Land Owners) */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-orange-50">
        <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-3 text-xl">
            <span>📊</span>
            Create New Distribution (Land Owners)
          </CardTitle>
          <p className="text-orange-100 text-sm">
            Distribute harvest income proportionally to all token holders.
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="landTokenAddr" className="text-gray-700 font-medium">Land Token Address</Label>
              <Input 
                id="landTokenAddr" 
                placeholder="0x000...cafe" 
                className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assetAddr" className="text-gray-700 font-medium">Fractional Asset Address</Label>
              <Input 
                id="assetAddr" 
                placeholder="0x000...cafe" 
                className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalIncome" className="text-gray-700 font-medium">Total Income (APT)</Label>
              <Input 
                id="totalIncome" 
                type="number" 
                placeholder="1000" 
                className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-700 font-medium">Description</Label>
              <Input 
                id="description" 
                placeholder="Q1 2025 Harvest" 
                className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
          </div>
          <Button 
            className="w-full mt-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white py-3"
            onClick={handleCreateDistribution}
          >
            📊 Create Demo Distribution
          </Button>
        </CardContent>
      </Card>

      {/* Available Distributions to Claim */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl text-gray-800">
            <span>🌾</span>
            Available Income Distributions
          </CardTitle>
          <p className="text-gray-600 text-sm">
            Claim your proportional share of harvest income from your land investments.
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {distributions.map((dist) => (
              <Card key={dist.id} className={`border transition-all hover:shadow-md ${
                dist.claimed ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'
              }`}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold">
                        {dist.landId.slice(-3)}
                      </div>
                      <div>
                        <div className="font-bold text-lg text-gray-800">{dist.landId}</div>
                        <div className="text-sm text-gray-600">{dist.description}</div>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs text-gray-500">{dist.cropType}</span>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            {dist.efficiency} Efficiency
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-800">{dist.totalIncome} APT</div>
                      <div className="text-sm text-gray-500">Total Distribution</div>
                      {dist.claimed ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full mt-1">
                          ✓ Claimed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full mt-1">
                          ⏳ Pending
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-white p-3 rounded-lg border">
                      <div className="text-xs text-gray-500 mb-1">Your Tokens</div>
                      <div className="font-bold text-gray-800">{dist.userTokens}</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border">
                      <div className="text-xs text-gray-500 mb-1">Your Share</div>
                      <div className="font-bold text-green-600">{dist.userShare} APT</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border">
                      <div className="text-xs text-gray-500 mb-1">Distribution Date</div>
                      <div className="font-medium text-gray-700">{dist.distributionDate}</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      Income per token: {(dist.totalIncome / 1000).toFixed(3)} APT
                    </div>
                    <Button 
                      size="sm" 
                      disabled={dist.claimed}
                      className={`${
                        dist.claimed 
                          ? "bg-gray-300 text-gray-500" 
                          : "bg-green-600 hover:bg-green-700 text-white"
                      }`}
                      onClick={() => handleClaimIncome(dist.id, dist.userShare)}
                    >
                      {dist.claimed ? "✓ Claimed" : "💰 Claim Income"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Simulate Harvest Button (Demo) */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-green-50">
        <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-3 text-xl">
            <span>🌾</span>
            Demo: Simulate Harvest Income
          </CardTitle>
          <p className="text-green-100 text-sm">
            For demonstration purposes, simulate a harvest income distribution.
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="simLandAddr" className="text-gray-700 font-medium">Land Token Address</Label>
              <Input 
                id="simLandAddr" 
                placeholder="0x000...cafe" 
                className="border-gray-300 focus:border-green-500 focus:ring-green-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="simIncome" className="text-gray-700 font-medium">Simulated Income (APT)</Label>
              <Input 
                id="simIncome" 
                type="number" 
                placeholder="500" 
                className="border-gray-300 focus:border-green-500 focus:ring-green-500"
              />
            </div>
          </div>
          <Button 
            className="w-full mt-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3"
            onClick={handleSimulateHarvest}
          >
            🌾 Simulate Harvest Income
          </Button>
        </CardContent>
      </Card>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">📈 Distribution Insights:</h4>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• Income is distributed proportionally to token holdings</p>
          <p>• Claims are processed immediately on-chain</p>
          <p>• Historical distributions are tracked for transparency</p>
          <p>• Seasonal distributions based on crop cycles and yields</p>
          <p>• Demo mode: All transactions are simulated for testing</p>
        </div>
      </div>
    </div>
  );
}
