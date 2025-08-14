import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { authStore } from "@/utils/authStore";

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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Login to LandLedger</CardTitle>
          <p className="text-gray-600">Agricultural Land Tokenization Platform</p>
        </CardHeader>
        <CardContent className="space-y-6">
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
              {isLoading ? "Logging in..." : "Login"}
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

          <div className="border-t pt-4 text-center">
            <div className="text-xs text-gray-500 mb-2">
              <strong>Demo Credentials:</strong>
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              <div><strong>Farmers:</strong> farmer1, farmer2, farmer3</div>
              <div><strong>Investors:</strong> investor1, investor2, investor3, etc.</div>
              <div><strong>Password:</strong> 12345 (for all users)</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
