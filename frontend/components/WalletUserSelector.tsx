import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { WalletSelector } from "./WalletSelector";
import { useLandLedgerContract } from "@/utils/landLedgerContractNew";
import { useToast } from "@/components/ui/use-toast";

export interface User {
  id: string;
  name: string;
  role: "farmer" | "investor";
  wallet: string;
  balance: number;
  landOwned?: string[];
  tokensOwned?: { [landId: string]: number };
  totalInvestment?: number;
  totalEarnings?: number;
}

interface WalletUserSelectorProps {
  onUserSelect: (user: User) => void;
  currentUser: User | null;
  users: User[];
}

export function WalletUserSelector({ onUserSelect, currentUser, users }: WalletUserSelectorProps) {
  const { connected, account, disconnect } = useWallet();
  const { getBalance } = useLandLedgerContract();
  const { toast } = useToast();
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [selectedRole, setSelectedRole] = useState<'farmer' | 'investor'>('farmer');
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load wallet balance when connected
  useEffect(() => {
    if (connected && account) {
      loadWalletBalance();
      if (!currentUser?.wallet?.includes(account.address.toString().slice(0, 8))) {
        setShowRoleSelector(true);
      }
    }
  }, [connected, account]);

  const loadWalletBalance = async () => {
    if (!account) return;
    setIsLoading(true);
    try {
      const balance = await getBalance();
      setWalletBalance(balance);
    } catch (error) {
      console.error('Error loading wallet balance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSelection = (role: 'farmer' | 'investor') => {
    if (!account) return;
    
    setSelectedRole(role);
    setShowRoleSelector(false);
    
    // Create a wallet user
    const walletUser: User = {
      id: `wallet_${account.address.toString().slice(0, 8)}`,
      name: `Wallet User (${role})`,
      role: role,
      wallet: account.address.toString(),
      balance: walletBalance,
      landOwned: role === 'farmer' ? [] : undefined,
      tokensOwned: role === 'investor' ? {} : undefined,
      totalInvestment: role === 'investor' ? 0 : undefined,
      totalEarnings: role === 'investor' ? 0 : undefined,
    };
    
    onUserSelect(walletUser);
    
    toast({
      title: "🔗 Wallet Connected",
      description: `Connected as ${role} with ${walletBalance.toFixed(4)} APT`,
    });
  };

  const farmers = users.filter(u => u.role === "farmer");
  const investors = users.filter(u => u.role === "investor");

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Select User</h2>
        <p className="text-gray-600">Choose a demo user or connect your real Petra wallet</p>
      </div>

      {/* Real Wallet Section */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="text-center">
            <h3 className="font-bold text-green-800 mb-2">🔗 Real Petra Wallet</h3>
            {!connected ? (
              <div className="space-y-2">
                <p className="text-sm text-green-700">Connect your Petra wallet for real transactions</p>
                <WalletSelector />
              </div>
            ) : showRoleSelector ? (
              <div className="space-y-3">
                <p className="text-sm text-green-700">
                  Wallet: {account?.address.toString().slice(0, 8)}... 
                  • Balance: {isLoading ? "Loading..." : `${walletBalance.toFixed(4)} APT`}
                </p>
                <p className="text-sm font-medium">Select your role:</p>
                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={() => handleRoleSelection('farmer')}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    🌾 Farmer
                  </Button>
                  <Button
                    onClick={() => handleRoleSelection('investor')}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    💰 Investor
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-sm text-green-700">
                  ✅ Connected: {account?.address.toString().slice(0, 8)}... ({selectedRole})
                </div>
                <div className="text-sm font-medium">
                  Balance: {isLoading ? "Loading..." : `${walletBalance.toFixed(4)} APT`}
                </div>
                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={() => setShowRoleSelector(true)}
                    size="sm"
                    variant="outline"
                  >
                    Change Role
                  </Button>
                  <Button
                    onClick={disconnect}
                    size="sm"
                    variant="outline"
                  >
                    Disconnect
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {currentUser && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold">{currentUser.name}</div>
                <div className="text-sm text-gray-600">
                  {currentUser.role} • Balance: {
                    currentUser.wallet === account?.address.toString() 
                      ? `${walletBalance.toFixed(4)} APT (real)` 
                      : `${currentUser.balance} APT (demo)`
                  }
                </div>
              </div>
              <div className="text-right text-sm">
                {currentUser.role === "farmer" && (
                  <div>Lands: {currentUser.landOwned?.length || 0}</div>
                )}
                {currentUser.role === "investor" && (
                  <div>
                    <div>Investment: {currentUser.totalInvestment || 0} APT</div>
                    <div>Earnings: {currentUser.totalEarnings || 0} APT</div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Demo Users Section */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-3 text-center">🌾 Demo Farmers</h3>
          <div className="space-y-2">
            {farmers.map((user) => (
              <Card 
                key={user.id}
                className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                  currentUser?.id === user.id && currentUser.wallet !== account?.address.toString()
                    ? "bg-blue-100 border-blue-300" 
                    : ""
                }`}
                onClick={() => onUserSelect(user)}
              >
                <CardContent className="p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-600">
                        {user.balance} APT • {user.landOwned?.length || 0} lands
                      </div>
                    </div>
                    <div className="text-xs bg-gray-100 px-2 py-1 rounded">Demo</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3 text-center">💰 Demo Investors</h3>
          <div className="space-y-2">
            {investors.map((user) => (
              <Card 
                key={user.id}
                className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                  currentUser?.id === user.id && currentUser.wallet !== account?.address.toString()
                    ? "bg-blue-100 border-blue-300" 
                    : ""
                }`}
                onClick={() => onUserSelect(user)}
              >
                <CardContent className="p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-600">
                        {user.balance} APT • ${user.totalInvestment || 0} invested
                      </div>
                    </div>
                    <div className="text-xs bg-gray-100 px-2 py-1 rounded">Demo</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
