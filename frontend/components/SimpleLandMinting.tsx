import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { User } from "@/components/UserSelector";
import { dataStore } from "@/utils/dataStore";

interface LandMintingProps {
  currentUser: User | null;
  onDataChange: () => void;
}

export function SimpleLandMinting({ currentUser, onDataChange }: LandMintingProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    location: "",
    acres: "",
    cropType: "",
  });

  const handleSubmit = () => {
    if (!currentUser || currentUser.role !== "farmer") {
      toast({
        title: "Error",
        description: "Only farmers can mint land NFTs",
        variant: "destructive",
      });
      return;
    }

    if (!formData.location || !formData.acres || !formData.cropType) {
      toast({
        title: "Error",
        description: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }

    const landId = dataStore.mintLand(currentUser.id, {
      location: formData.location,
      acres: parseFloat(formData.acres),
      cropType: formData.cropType,
    });

    toast({
      title: "Success",
      description: `Land NFT minted with ID: ${landId}`,
    });

    setFormData({ location: "", acres: "", cropType: "" });
    onDataChange();
  };

  const userLands = dataStore.getLands().filter(land => land.ownerId === currentUser?.id);

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
        <p className="text-gray-600">Only farmers can mint land NFTs</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Mint Land NFT</h2>
        <p className="text-gray-600">Create a new land NFT for your farm</p>
      </div>

      {/* Mint Form */}
      <Card>
        <CardHeader>
          <CardTitle>Land Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="e.g., Iowa, USA"
            />
          </div>
          <div>
            <Label htmlFor="acres">Area (Acres)</Label>
            <Input
              id="acres"
              type="number"
              value={formData.acres}
              onChange={(e) => setFormData(prev => ({ ...prev, acres: e.target.value }))}
              placeholder="e.g., 100"
            />
          </div>
          <div>
            <Label htmlFor="cropType">Crop Type</Label>
            <Input
              id="cropType"
              value={formData.cropType}
              onChange={(e) => setFormData(prev => ({ ...prev, cropType: e.target.value }))}
              placeholder="e.g., Corn, Wheat, Soybeans"
            />
          </div>
          <Button onClick={handleSubmit} className="w-full">
            Mint Land NFT
          </Button>
        </CardContent>
      </Card>

      {/* User's Lands */}
      <Card>
        <CardHeader>
          <CardTitle>Your Land NFTs ({userLands.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {userLands.length === 0 ? (
            <p className="text-gray-600 text-center py-4">No land NFTs yet</p>
          ) : (
            <div className="space-y-3">
              {userLands.map((land) => (
                <div key={land.id} className="border rounded p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{land.location}</div>
                      <div className="text-sm text-gray-600">
                        {land.acres} acres • {land.cropType}
                      </div>
                      <div className="text-xs text-gray-500">ID: {land.id}</div>
                    </div>
                    <div className="text-right text-sm">
                      {land.isFramentalized ? (
                        <div>
                          <div className="text-green-600">Fractionalized</div>
                          <div>{land.tokensSold}/{land.totalTokens} tokens sold</div>
                        </div>
                      ) : (
                        <div className="text-blue-600">Not Fractionalized</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
