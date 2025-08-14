import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { User } from "@/components/UserSelector";
import { dataStore } from "@/utils/dataStore";

interface FractionalizeLandProps {
  currentUser: User | null;
  onDataChange: () => void;
}

export function SimpleFractionalizeLand({ currentUser, onDataChange }: FractionalizeLandProps) {
  const { toast } = useToast();
  const [selectedLandId, setSelectedLandId] = useState("");
  const [totalTokens, setTotalTokens] = useState("");
  const [tokenPrice, setTokenPrice] = useState("");

  const handleSubmit = () => {
    if (!currentUser || currentUser.role !== "farmer") {
      toast({
        title: "Error",
        description: "Only farmers can fractionalize land",
        variant: "destructive",
      });
      return;
    }

    if (!selectedLandId || !totalTokens || !tokenPrice) {
      toast({
        title: "Error",
        description: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }

    const success = dataStore.fractionalizeLand(
      selectedLandId, 
      parseInt(totalTokens), 
      parseFloat(tokenPrice)
    );

    if (success) {
      toast({
        title: "Success",
        description: `Land fractionalized into ${totalTokens} tokens at ${tokenPrice} APT each`,
      });
      setSelectedLandId("");
      setTotalTokens("");
      setTokenPrice("");
      onDataChange();
    } else {
      toast({
        title: "Error",
        description: "Failed to fractionalize land",
        variant: "destructive",
      });
    }
  };

  const userLands = dataStore.getLands().filter(
    land => land.ownerId === currentUser?.id && !land.isFramentalized
  );

  if (!currentUser) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Please select a user first</p>
      </div>
    );
  }

  if (currentUser.role !== "farmer") {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Only farmers can fractionalize land</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Fractionalize Land</h2>
        <p className="text-gray-600">Convert your land NFT into tradeable tokens</p>
      </div>

      {userLands.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-600">No land NFTs available for fractionalization</p>
            <p className="text-sm text-gray-500">Mint a land NFT first</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Fractionalize Land</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="landSelect">Select Land</Label>
              <select
                id="landSelect"
                value={selectedLandId}
                onChange={(e) => setSelectedLandId(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Select a land...</option>
                {userLands.map((land) => (
                  <option key={land.id} value={land.id}>
                    {land.location} - {land.acres} acres ({land.cropType})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="totalTokens">Total Tokens</Label>
              <Input
                id="totalTokens"
                type="number"
                value={totalTokens}
                onChange={(e) => setTotalTokens(e.target.value)}
                placeholder="e.g., 1000"
              />
            </div>
            <div>
              <Label htmlFor="tokenPrice">Price per Token (APT)</Label>
              <Input
                id="tokenPrice"
                type="number"
                step="0.1"
                value={tokenPrice}
                onChange={(e) => setTokenPrice(e.target.value)}
                placeholder="e.g., 5.0"
              />
            </div>
            {totalTokens && tokenPrice && (
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm">
                  Total Value: {(parseInt(totalTokens || "0") * parseFloat(tokenPrice || "0")).toFixed(2)} APT
                </p>
              </div>
            )}
            <Button onClick={handleSubmit} className="w-full">
              Fractionalize Land
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
