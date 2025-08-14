import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { authStore } from "@/utils/authStore";
import { PetraWalletIntegration } from "./PetraWalletIntegration";

interface LoginProps {
  onLogin: (userId: string) => void;
  onSwitchToSignup: () => void;
}

export function Login({ onLogin, onSwitchToSignup }: LoginProps) {
  const { toast } = useToast();
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loginMode, setLoginMode] = useState<"demo" | "wallet">("demo");

  const handleLogin = async () => {
    if (!credentials.username || !credentials.password) {
      toast({
        title: "Error",
        description: "Please enter both username and password",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    const user = authStore.login(credentials.username, credentials.password);
    
    setTimeout(() => {
      if (user) {
        toast({
          title: "Login Successful",
          description: `Welcome back, ${user.name}!`,
        });
        onLogin(user.id);
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid username or password",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1000); // Simulate loading
  };


  const handleWalletLogin = (walletAddress: string, role: 'farmer' | 'investor') => {
    try {
      const walletUser = authStore.loginWithWallet(walletAddress, role);
      onLogin(walletUser.id);
    } catch (error) {
      toast({
        title: "Login Error",
        description: "Failed to login with wallet. Please try again.",
        variant: "destructive",
      });
    }
  };

  // const existingUsers = authStore.getAllUsers();
  // const farmers = existingUsers.filter((u: any) => u.role === "farmer");
  // const investors = existingUsers.filter((u: any) => u.role === "investor");

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Login Form */}
        <div className="flex items-center justify-center min-h-screen col-span-full">
          <Card className="shadow-lg w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Login to LandLedger</CardTitle>
              <p className="text-gray-600">Agricultural Land Tokenization Platform</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Login Mode Toggle */}
              <div className="flex justify-center space-x-4 border-b pb-4">
                <button
                  onClick={() => setLoginMode('demo')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    loginMode === 'demo' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Demo Account
                </button>
                <button
                  onClick={() => setLoginMode('wallet')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    loginMode === 'wallet' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Petra Wallet
                </button>
              </div>

              {loginMode === 'demo' ? (
                <>
                  {/* Demo Login Form */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={credentials.username}
                        onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                        placeholder="Enter your username"
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={credentials.password}
                        onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Enter your password"
                      />
                    </div>
                    <Button 
                      onClick={handleLogin} 
                      disabled={isLoading}
                      className="w-full"
                    >
                      {isLoading ? "Logging in..." : "Login with Demo Account"}
                    </Button>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Don't have an account?{" "}
                      <button
                        onClick={onSwitchToSignup}
                        className="text-blue-600 hover:underline"
                      >
                        Sign up here
                      </button>
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {/* Petra Wallet Integration */}
                  <div className="text-center mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      Connect your Petra wallet to use real testnet tokens
                    </p>
                    <p className="text-xs text-green-600">
                      ✓ Real blockchain transactions ✓ Persistent storage ✓ Test APT tokens
                    </p>
                  </div>
                  <PetraWalletIntegration onLogin={handleWalletLogin} />
                </>
              )}

              {/* <div className="border-t pt-4 text-center">
            <div className="text-xs text-gray-500 mb-2">
              <strong>Demo Credentials:</strong>
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              <div><strong>Farmers:</strong> farmer1, farmer2, farmer3</div>
              <div><strong>Investors:</strong> investor1, investor2, investor3, etc.</div>
              <div><strong>Password:</strong> 12345 (for all users)</div>
            </div>
              </div> */}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
