import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

interface DemoModeSelectorProps {
  onUserSelect: (user: DemoUser) => void;
  currentUser: DemoUser | null;
}

export function DemoModeSelector({ onUserSelect, currentUser }: DemoModeSelectorProps) {
  const { toast } = useToast();

  const demoUsers: DemoUser[] = [
    {
      id: "farmer1",
      name: "John Smith",
      role: "farmer",
      avatar: "👨‍🌾",
      wallet: "0x000000000000000000000000000000000000000000000000000000000000f001",
      balance: 15000,
      landOwned: 3,
      description: "Corn and soybean farmer from Iowa with 150 acres of premium farmland"
    },
    {
      id: "farmer2", 
      name: "Maria Rodriguez",
      role: "farmer",
      avatar: "👩‍🌾",
      wallet: "0x000000000000000000000000000000000000000000000000000000000000f002",
      balance: 22000,
      landOwned: 2,
      description: "Organic vegetable farmer from California specializing in sustainable agriculture"
    },
    {
      id: "investor1",
      name: "David Chen",
      role: "investor",
      avatar: "👨‍💼",
      wallet: "0x000000000000000000000000000000000000000000000000000000000000i001",
      balance: 50000,
      tokensOwned: 1250,
      description: "Tech entrepreneur interested in agricultural technology and sustainable farming"
    },
    {
      id: "investor2",
      name: "Sarah Johnson",
      role: "investor",
      avatar: "👩‍💼",
      wallet: "0x000000000000000000000000000000000000000000000000000000000000i002",
      balance: 75000,
      tokensOwned: 2100,
      description: "ESG fund manager focusing on agricultural sustainability and rural development"
    },
    {
      id: "investor3",
      name: "Alex Kim",
      role: "investor",
      avatar: "🧑‍💻",
      wallet: "0x000000000000000000000000000000000000000000000000000000000000i003",
      balance: 30000,
      tokensOwned: 850,
      description: "Young professional looking to diversify portfolio with agricultural investments"
    }
  ];

  const handleUserSelect = (user: DemoUser) => {
    onUserSelect(user);
    toast({
      title: `🎭 Switched to ${user.role === "farmer" ? "Farmer" : "Investor"} Mode`,
      description: `Now viewing as ${user.name} - ${user.description.slice(0, 50)}...`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Demo Mode Header */}
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mb-4">
            <span className="text-3xl">🎭</span>
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-800">Demo Mode</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Choose a demo user to experience LandLedger from different perspectives. 
          No real wallet or money required!
        </p>
      </div>

      {/* Current User Display */}
      {currentUser && (
        <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <span className="text-4xl">{currentUser.avatar}</span>
              <div>
                <div className="text-xl font-bold">{currentUser.name}</div>
                <div className="text-green-100 capitalize">{currentUser.role}</div>
                <div className="text-sm text-green-100">Balance: {currentUser.balance} APT</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Farmer Personas */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <span>👨‍🌾</span>
          Farmer Personas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {demoUsers.filter(user => user.role === "farmer").map((user) => (
            <Card key={user.id} className="hover:shadow-lg transition-all cursor-pointer border-2 border-green-200 bg-gradient-to-br from-white to-green-50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3">
                  <span className="text-3xl">{user.avatar}</span>
                  <div>
                    <div className="text-lg">{user.name}</div>
                    <div className="text-sm text-green-600 font-normal">Land Owner & Farmer</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 mb-4">{user.description}</p>
                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                  <div className="bg-white p-2 rounded border">
                    <div className="text-gray-500">APT Balance</div>
                    <div className="font-bold text-green-600">{user.balance}</div>
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <div className="text-gray-500">Lands Owned</div>
                    <div className="font-bold text-green-600">{user.landOwned}</div>
                  </div>
                </div>
                <Button 
                  onClick={() => handleUserSelect(user)}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  👨‍🌾 Switch to {user.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Investor Personas */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <span>👨‍💼</span>
          Investor Personas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {demoUsers.filter(user => user.role === "investor").map((user) => (
            <Card key={user.id} className="hover:shadow-lg transition-all cursor-pointer border-2 border-blue-200 bg-gradient-to-br from-white to-blue-50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3">
                  <span className="text-3xl">{user.avatar}</span>
                  <div>
                    <div className="text-lg">{user.name}</div>
                    <div className="text-sm text-blue-600 font-normal">Investor</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 mb-4">{user.description}</p>
                <div className="grid grid-cols-1 gap-2 text-sm mb-4">
                  <div className="bg-white p-2 rounded border">
                    <div className="text-gray-500">APT Balance</div>
                    <div className="font-bold text-blue-600">{user.balance}</div>
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <div className="text-gray-500">Tokens Owned</div>
                    <div className="font-bold text-blue-600">{user.tokensOwned}</div>
                  </div>
                </div>
                <Button 
                  onClick={() => handleUserSelect(user)}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  👨‍💼 Switch to {user.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Demo Instructions */}
      <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
        <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-3">
            <span>🎯</span>
            Hackathon Demo Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">🌾 As a Farmer:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Mint land NFTs representing your farmland</li>
                <li>• Fractionalize land into tradeable tokens</li>
                <li>• Distribute harvest income to token holders</li>
                <li>• Track land performance and efficiency</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">💼 As an Investor:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Browse and purchase fractional land tokens</li>
                <li>• Build a diversified agricultural portfolio</li>
                <li>• Claim proportional harvest income</li>
                <li>• Track investment performance</li>
              </ul>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <p className="text-sm text-blue-700">
                <strong>💡 Demo Tip:</strong> Switch between farmer and investor modes during your presentation 
                to show both sides of the platform. All transactions are simulated - no real money involved!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
