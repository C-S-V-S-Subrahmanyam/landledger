import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export function FractionalizeLand() {
  const { toast } = useToast();
  const [landTokenAddress, setLandTokenAddress] = useState("");
  const [totalTokens, setTotalTokens] = useState("");
  const [tokenPrice, setTokenPrice] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFractionalize = async () => {
    if (!landTokenAddress || !totalTokens || !tokenPrice) {
      toast({
        title: "⚠️ Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    // Simulate processing time
    setTimeout(() => {
      toast({
        title: "🎉 Land Fractionalized Successfully!",
        description: `Created ${totalTokens} fractional tokens at ${tokenPrice} APT each`,
      });
      setIsProcessing(false);
      // Reset form
      setLandTokenAddress("");
      setTotalTokens("");
      setTokenPrice("");
    }, 2000);
  };

  const generateDemoData = () => {
    setLandTokenAddress("0x000000000000000000000000000000000000000000000000000000000000cafe");
    setTotalTokens("1000");
    setTokenPrice("5");
    toast({
      title: "📋 Demo Data Generated",
      description: "Form filled with sample data for testing",
    });
  };

  const presetConfigs = [
    { label: "Small Farm (1000 tokens)", tokens: "1000", price: "5" },
    { label: "Medium Farm (5000 tokens)", tokens: "5000", price: "3" },
    { label: "Large Farm (10000 tokens)", tokens: "10000", price: "2" },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="text-center space-y-3 mb-8">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center mb-4">
            <span className="text-3xl">🔀</span>
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-800">Fractionalize Your Land</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Transform your land NFT into tradeable fractional tokens. Enable micro-ownership 
          and create liquidity for your agricultural assets.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-0">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">1,247</div>
            <div className="text-sm text-purple-100">Lands Fractionalized</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">2.4M</div>
            <div className="text-sm text-green-100">Tokens Created</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-orange-500 to-red-600 text-white border-0">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">$892K</div>
            <div className="text-sm text-orange-100">Total Value Locked</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Fractionalization Form */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-purple-50">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-3 text-xl">
            <span>🔀</span>
            Create Fractional Tokens
          </CardTitle>
          <p className="text-purple-100 text-sm">
            Convert your land NFT into divisible ownership tokens for increased liquidity.
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="landToken" className="text-gray-700 font-medium">
                Land Token Address *
              </Label>
              <Input
                id="landToken"
                value={landTokenAddress}
                onChange={(e) => setLandTokenAddress(e.target.value)}
                placeholder="0x000000000000000000000000000000000000000000000000000000000000cafe"
                className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
              />
              <p className="text-sm text-gray-500">
                The address of your minted land NFT that you want to fractionalize
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalTokens" className="text-gray-700 font-medium">
                  Total Fractional Tokens *
                </Label>
                <Input
                  id="totalTokens"
                  type="number"
                  value={totalTokens}
                  onChange={(e) => setTotalTokens(e.target.value)}
                  placeholder="1000"
                  className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                />
                <p className="text-sm text-gray-500">
                  Number of tokens to create (more tokens = smaller ownership units)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tokenPrice" className="text-gray-700 font-medium">
                  Price per Token (APT) *
                </Label>
                <Input
                  id="tokenPrice"
                  type="number"
                  step="0.1"
                  value={tokenPrice}
                  onChange={(e) => setTokenPrice(e.target.value)}
                  placeholder="5.0"
                  className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                />
                <p className="text-sm text-gray-500">
                  Initial trading price for each fractional token
                </p>
              </div>
            </div>

            {/* Preset Configurations */}
            <div className="space-y-3">
              <Label className="text-gray-700 font-medium">Quick Presets:</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {presetConfigs.map((preset, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTotalTokens(preset.tokens);
                      setTokenPrice(preset.price);
                    }}
                    className="text-sm border-purple-200 text-purple-700 hover:bg-purple-50"
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Calculation Preview */}
            {totalTokens && tokenPrice && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-medium text-purple-800 mb-2">📊 Fractionalization Preview:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Total Tokens:</span>
                    <span className="font-medium ml-2">{totalTokens}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Token Price:</span>
                    <span className="font-medium ml-2">{tokenPrice} APT</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Value:</span>
                    <span className="font-medium ml-2 text-green-600">
                      {(parseFloat(totalTokens) * parseFloat(tokenPrice)).toFixed(2)} APT
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Min Investment:</span>
                    <span className="font-medium ml-2">{tokenPrice} APT (1 token)</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button 
                onClick={handleFractionalize}
                disabled={isProcessing}
                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3"
              >
                {isProcessing ? (
                  <>
                    <span className="mr-2">⏳</span>
                    Processing...
                  </>
                ) : (
                  <>
                    <span className="mr-2">🔀</span>
                    Create Fractional Tokens
                  </>
                )}
              </Button>
              <Button 
                onClick={generateDemoData}
                variant="outline"
                className="border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                📋 Demo Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-3 text-xl">
            <span>💡</span>
            How Fractionalization Works
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Own Land NFT</h4>
                  <p className="text-sm text-gray-600">You must own a minted land NFT to fractionalize it</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Set Parameters</h4>
                  <p className="text-sm text-gray-600">Choose total tokens and price per token</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Create Tokens</h4>
                  <p className="text-sm text-gray-600">Fractional tokens are minted and ready for trading</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-gray-800">🎯 Benefits:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Enable micro-ownership of expensive farmland</li>
                <li>• Create liquid markets for agricultural assets</li>
                <li>• Allow investors to diversify across multiple farms</li>
                <li>• Maintain proportional income distribution rights</li>
                <li>• Transparent on-chain ownership tracking</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demo Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-800 mb-2">🚀 Demo Mode:</h4>
        <p className="text-sm text-yellow-700">
          This is a demonstration of the fractionalization process. In the live version, 
          this would interact with the Aptos blockchain to create actual fractional tokens 
          backed by your land NFT ownership.
        </p>
      </div>
    </div>
  );
}
