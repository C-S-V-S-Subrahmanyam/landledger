import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { User } from "@/components/UserSelector";
import { dataStore } from "@/utils/dataStore";

interface MarketplaceProps {
  currentUser: User | null;
  onDataChange: () => void;
}

export function SimpleMarketplace({ currentUser, onDataChange }: MarketplaceProps) {
  const { toast } = useToast();
  const [purchaseAmounts, setPurchaseAmounts] = useState<{ [landId: string]: string }>({});

  const handlePurchase = (landId: string) => {
    if (!currentUser || currentUser.role !== "investor") {
      toast({
        title: "Error",
        description: "Only investors can purchase tokens",
        variant: "destructive",
      });
      return;
    }

    const amount = parseInt(purchaseAmounts[landId] || "0");
    if (amount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    const success = dataStore.purchaseTokens(currentUser.id, landId, amount);
    if (success) {
      toast({
        title: "Success",
        description: `Purchased ${amount} tokens successfully`,
      });
      setPurchaseAmounts(prev => ({ ...prev, [landId]: "" }));
      onDataChange();
    } else {
      toast({
        title: "Error",
        description: "Purchase failed. Check balance and token availability.",
        variant: "destructive",
      });
    }
  };

  const availableTokens = dataStore.getAvailableTokens();
  const userPurchases = currentUser ? dataStore.getUserPurchases(currentUser.id) : [];

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
        <h2 className="text-2xl font-bold mb-2">Marketplace</h2>
        <p className="text-gray-600">Buy fractional land tokens</p>
      </div>

      {/* Available Tokens */}
      <Card>
        <CardHeader>
          <CardTitle>Available Tokens</CardTitle>
        </CardHeader>
        <CardContent>
          {availableTokens.length === 0 ? (
            <p className="text-gray-600 text-center py-4">No tokens available for purchase</p>
          ) : (
            <div className="space-y-4">
              {availableTokens.map((land) => (
                <div key={land.id} className="border rounded p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-medium">{land.location}</div>
                      <div className="text-sm text-gray-600">
                        {land.acres} acres • {land.cropType}
                      </div>
                      <div className="text-sm text-blue-600">
                        {land.tokenPrice} APT per token
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div>{(land.totalTokens || 0) - (land.tokensSold || 0)} tokens available</div>
                      <div className="text-gray-500">
                        {land.tokensSold}/{land.totalTokens} sold
                      </div>
                    </div>
                  </div>
                  
                  {currentUser.role === "investor" && (
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Label htmlFor={`amount-${land.id}`}>Amount to buy</Label>
                        <Input
                          id={`amount-${land.id}`}
                          type="number"
                          value={purchaseAmounts[land.id] || ""}
                          onChange={(e) => setPurchaseAmounts(prev => ({ 
                            ...prev, 
                            [land.id]: e.target.value 
                          }))}
                          placeholder="Enter amount"
                        />
                      </div>
                      <Button onClick={() => handlePurchase(land.id)}>
                        Buy Tokens
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* User's Purchases */}
      {currentUser.role === "investor" && (
        <Card>
          <CardHeader>
            <CardTitle>Your Purchases ({userPurchases.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {userPurchases.length === 0 ? (
              <p className="text-gray-600 text-center py-4">No purchases yet</p>
            ) : (
              <div className="space-y-3">
                {userPurchases.map((purchase) => {
                  const land = dataStore.getLands().find(l => l.id === purchase.landId);
                  return (
                    <div key={purchase.id} className="border rounded p-3">
                      <div className="flex justify-between">
                        <div>
                          <div className="font-medium">{land?.location || "Unknown"}</div>
                          <div className="text-sm text-gray-600">
                            {purchase.tokens} tokens @ {purchase.pricePerToken} APT
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <div className="font-medium">
                            {purchase.tokens * purchase.pricePerToken} APT
                          </div>
                          <div className="text-gray-500">
                            {purchase.timestamp.toLocaleDateString()}
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
      )}

      {/* Current Holdings */}
      {currentUser.role === "investor" && currentUser.tokensOwned && (
        <Card>
          <CardHeader>
            <CardTitle>Current Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(currentUser.tokensOwned).length === 0 ? (
              <p className="text-gray-600 text-center py-4">No tokens owned</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(currentUser.tokensOwned).map(([landId, tokens]) => {
                  const land = dataStore.getLands().find(l => l.id === landId);
                  return (
                    <div key={landId} className="border rounded p-3">
                      <div className="flex justify-between">
                        <div>
                          <div className="font-medium">{land?.location || "Unknown"}</div>
                          <div className="text-sm text-gray-600">
                            {land?.acres} acres • {land?.cropType}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{tokens} tokens</div>
                          <div className="text-sm text-gray-600">
                            {tokens / (land?.totalTokens || 1) * 100}% ownership
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
      )}
    </div>
  );
}
