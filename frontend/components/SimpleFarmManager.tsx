import React, { useState, useEffect } from 'react';
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { 
  simpleLandLedgerContract, 
  Farm,
  createNewFarm,
  investInFarmland,
  initializeFarmRegistry 
} from "../utils/simpleLandLedgerContract";

export default function SimpleFarmManager() {
  const { account, connected } = useWallet();
  const [balance, setBalance] = useState<number>(0);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [hasRegistry, setHasRegistry] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  
  // Form state for creating new farm
  const [farmForm, setFarmForm] = useState({
    name: '',
    location: '',
    areaAcres: 0,
    totalTokens: 0,
    pricePerToken: 0,
    landId: '',
    geoTag: '',
    proofHash: ''
  });

  // Load account data
  useEffect(() => {
    if (connected && account?.address) {
      loadAccountData();
    }
  }, [connected, account?.address]);

  const loadAccountData = async () => {
    if (!account?.address) return;
    
    try {
      setLoading(true);
      
      const addressString = account.address.toString();
      
      // Get balance
      const accountBalance = await simpleLandLedgerContract.getAccountBalance(addressString);
      setBalance(accountBalance);
      
      // Check if registry exists
      const registryExists = await simpleLandLedgerContract.hasRegistry(addressString);
      setHasRegistry(registryExists);
      
      // Get farms if registry exists
      if (registryExists) {
        const userFarms = await simpleLandLedgerContract.getFarms(addressString);
        setFarms(userFarms);
      }
      
    } catch (error) {
      console.error('Error loading account data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInitializeRegistry = async () => {
    try {
      setLoading(true);
      await initializeFarmRegistry();
      await loadAccountData();
    } catch (error) {
      console.error('Error initializing registry:', error);
      alert('Error initializing farm registry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      await createNewFarm(
        farmForm.name,
        farmForm.location,
        farmForm.areaAcres,
        farmForm.totalTokens,
        farmForm.pricePerToken,
        farmForm.landId,
        farmForm.geoTag,
        farmForm.proofHash
      );
      
      // Reset form
      setFarmForm({
        name: '',
        location: '',
        areaAcres: 0,
        totalTokens: 0,
        pricePerToken: 0,
        landId: '',
        geoTag: '',
        proofHash: ''
      });
      
      // Reload data
      await loadAccountData();
      
    } catch (error) {
      console.error('Error creating farm:', error);
      alert('Error creating farm. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInvestInFarm = async (farmOwner: string, farmId: number, tokens: number) => {
    try {
      setLoading(true);
      await investInFarmland(farmOwner, farmId, tokens);
      await loadAccountData();
    } catch (error) {
      console.error('Error investing in farm:', error);
      alert('Error investing in farm. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!connected) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Simple Farm Manager</CardTitle>
          <CardDescription>Please connect your wallet to continue</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Address:</strong> {account?.address?.toString()}</p>
            <p><strong>Balance:</strong> {balance.toFixed(4)} APT</p>
            <p><strong>Registry Status:</strong> {hasRegistry ? 'Initialized' : 'Not Initialized'}</p>
            <p><strong>Farms Owned:</strong> {farms.length}</p>
          </div>
          
          {!hasRegistry && (
            <Button 
              onClick={handleInitializeRegistry}
              disabled={loading}
              className="mt-4"
            >
              {loading ? 'Initializing...' : 'Initialize Farm Registry'}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Create Farm Form */}
      {hasRegistry && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Farm</CardTitle>
            <CardDescription>Add a new farm to your registry</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateFarm} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Farm Name</Label>
                  <Input
                    id="name"
                    value={farmForm.name}
                    onChange={(e) => setFarmForm({...farmForm, name: e.target.value})}
                    placeholder="Enter farm name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={farmForm.location}
                    onChange={(e) => setFarmForm({...farmForm, location: e.target.value})}
                    placeholder="Enter location"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="areaAcres">Area (Acres)</Label>
                  <Input
                    id="areaAcres"
                    type="number"
                    value={farmForm.areaAcres}
                    onChange={(e) => setFarmForm({...farmForm, areaAcres: Number(e.target.value)})}
                    placeholder="0"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="totalTokens">Total Tokens</Label>
                  <Input
                    id="totalTokens"
                    type="number"
                    value={farmForm.totalTokens}
                    onChange={(e) => setFarmForm({...farmForm, totalTokens: Number(e.target.value)})}
                    placeholder="0"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="pricePerToken">Price per Token (APT)</Label>
                  <Input
                    id="pricePerToken"
                    type="number"
                    step="0.01"
                    value={farmForm.pricePerToken}
                    onChange={(e) => setFarmForm({...farmForm, pricePerToken: Number(e.target.value)})}
                    placeholder="0.00"
                    min="0.01"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="landId">Land ID</Label>
                  <Input
                    id="landId"
                    value={farmForm.landId}
                    onChange={(e) => setFarmForm({...farmForm, landId: e.target.value})}
                    placeholder="Enter land ID"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="geoTag">Geo Tag</Label>
                  <Input
                    id="geoTag"
                    value={farmForm.geoTag}
                    onChange={(e) => setFarmForm({...farmForm, geoTag: e.target.value})}
                    placeholder="geo:lat,lng"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="proofHash">Proof Hash</Label>
                  <Input
                    id="proofHash"
                    value={farmForm.proofHash}
                    onChange={(e) => setFarmForm({...farmForm, proofHash: e.target.value})}
                    placeholder="Enter proof hash"
                    required
                  />
                </div>
              </div>
              
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Creating Farm...' : 'Create Farm'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Farms List */}
      {farms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Farms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {farms.map((farm, index) => (
                <Card key={index} className="p-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p><strong>Name:</strong> {farm.name}</p>
                      <p><strong>Location:</strong> {farm.location}</p>
                      <p><strong>Area:</strong> {farm.area_acres} acres</p>
                    </div>
                    <div>
                      <p><strong>Total Tokens:</strong> {farm.total_tokens}</p>
                      <p><strong>Tokens Sold:</strong> {farm.tokens_sold}</p>
                      <p><strong>Price per Token:</strong> {simpleLandLedgerContract.formatApt(farm.price_per_token)}</p>
                    </div>
                    <div>
                      <p><strong>Land ID:</strong> {farm.land_id}</p>
                      <p><strong>Geo Tag:</strong> {farm.geo_tag}</p>
                      <Button 
                        size="sm" 
                        onClick={() => handleInvestInFarm(account?.address?.toString() || '', farm.id, 1)}
                        disabled={loading}
                        className="mt-2"
                      >
                        Invest 1 Token
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
