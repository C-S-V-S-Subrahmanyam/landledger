import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { User } from "@/components/UserSelector";
import { dataStore } from "@/utils/dataStore";

interface IncomeDistributionProps {
  currentUser: User | null;
  onDataChange: () => void;
}

export function SimpleIncomeDistribution({ currentUser, onDataChange }: IncomeDistributionProps) {
  const { toast } = useToast();
  const [selectedLandId, setSelectedLandId] = useState("");
  const [incomeAmount, setIncomeAmount] = useState("");

  const handleDistribute = () => {
    if (!currentUser || currentUser.role !== "farmer") {
      toast({
        title: "Error",
        description: "Only farmers can distribute income",
        variant: "destructive",
      });
      return;
    }

    if (!selectedLandId || !incomeAmount) {
      toast({
        title: "Error",
        description: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }

    const distributionId = dataStore.distributeIncome(selectedLandId, parseFloat(incomeAmount));
    if (distributionId) {
      toast({
        title: "Success",
        description: `Income distributed: ${incomeAmount} APT`,
      });
      setSelectedLandId("");
      setIncomeAmount("");
      onDataChange();
    } else {
      toast({
        title: "Error",
        description: "Failed to distribute income",
        variant: "destructive",
      });
    }
  };

  const handleClaim = (distributionId: string) => {
    if (!currentUser || currentUser.role !== "investor") {
      toast({
        title: "Error",
        description: "Only investors can claim income",
        variant: "destructive",
      });
      return;
    }

    const earnings = dataStore.claimIncome(currentUser.id, distributionId);
    if (earnings > 0) {
      toast({
        title: "Success",
        description: `Claimed ${earnings.toFixed(2)} APT`,
      });
      onDataChange();
    } else {
      toast({
        title: "Error",
        description: "No earnings to claim or already claimed",
        variant: "destructive",
      });
    }
  };

  const farmerLands = currentUser?.role === "farmer" 
    ? dataStore.getLands().filter(land => land.ownerId === currentUser.id && land.isFramentalized)
    : [];

  const investorDistributions = currentUser?.role === "investor"
    ? dataStore.getUserDistributions(currentUser.id)
    : [];

  const allDistributions = dataStore.getDistributions();

  if (!currentUser) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Please select a user first</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Income Distribution</h2>
        <p className="text-gray-600">
          {currentUser.role === "farmer" ? "Distribute harvest income" : "Claim your earnings"}
        </p>
      </div>

      {/* Farmer: Distribute Income */}
      {currentUser.role === "farmer" && (
        <Card>
          <CardHeader>
            <CardTitle>Distribute Income</CardTitle>
          </CardHeader>
          <CardContent>
            {farmerLands.length === 0 ? (
              <p className="text-gray-600 text-center py-4">
                No fractionalized land to distribute income from
              </p>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="landSelect">Select Land</Label>
                  <select
                    id="landSelect"
                    value={selectedLandId}
                    onChange={(e) => setSelectedLandId(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">Select a land...</option>
                    {farmerLands.map((land) => (
                      <option key={land.id} value={land.id}>
                        {land.location} - {land.acres} acres ({land.cropType})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="incomeAmount">Income Amount (APT)</Label>
                  <Input
                    id="incomeAmount"
                    type="number"
                    step="0.1"
                    value={incomeAmount}
                    onChange={(e) => setIncomeAmount(e.target.value)}
                    placeholder="e.g., 1000"
                  />
                </div>
                <Button onClick={handleDistribute} className="w-full">
                  Distribute Income
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Investor: Claim Income */}
      {currentUser.role === "investor" && (
        <Card>
          <CardHeader>
            <CardTitle>Available Claims</CardTitle>
          </CardHeader>
          <CardContent>
            {investorDistributions.length === 0 ? (
              <p className="text-gray-600 text-center py-4">No income distributions available</p>
            ) : (
              <div className="space-y-3">
                {investorDistributions.map((distribution) => {
                  const land = dataStore.getLands().find(l => l.id === distribution.landId);
                  const tokensOwned = currentUser.tokensOwned?.[distribution.landId] || 0;
                  const earnings = tokensOwned * distribution.perToken;
                  const isClaimed = distribution.claimed[currentUser.id];

                  return (
                    <div key={distribution.id} className="border rounded p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-medium">{land?.location || "Unknown"}</div>
                          <div className="text-sm text-gray-600">
                            Distribution: {distribution.totalAmount} APT
                          </div>
                          <div className="text-sm text-gray-600">
                            Your tokens: {tokensOwned}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-green-600">
                            {earnings.toFixed(2)} APT
                          </div>
                          <div className="text-sm text-gray-500">
                            {distribution.timestamp.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <Button 
                        onClick={() => handleClaim(distribution.id)}
                        disabled={isClaimed || earnings === 0}
                        className="w-full"
                        variant={isClaimed ? "secondary" : "default"}
                      >
                        {isClaimed ? "Already Claimed" : earnings === 0 ? "No Earnings" : "Claim Income"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* All Distributions (for reference) */}
      <Card>
        <CardHeader>
          <CardTitle>All Income Distributions ({allDistributions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {allDistributions.length === 0 ? (
            <p className="text-gray-600 text-center py-4">No distributions yet</p>
          ) : (
            <div className="space-y-3">
              {allDistributions.map((distribution) => {
                const land = dataStore.getLands().find(l => l.id === distribution.landId);
                const claimedCount = Object.values(distribution.claimed).filter(Boolean).length;
                
                return (
                  <div key={distribution.id} className="border rounded p-3">
                    <div className="flex justify-between">
                      <div>
                        <div className="font-medium">{land?.location || "Unknown"}</div>
                        <div className="text-sm text-gray-600">
                          Total: {distribution.totalAmount} APT
                        </div>
                        <div className="text-sm text-gray-600">
                          Per token: {distribution.perToken.toFixed(4)} APT
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div>{claimedCount} claims made</div>
                        <div className="text-gray-500">
                          {distribution.timestamp.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
