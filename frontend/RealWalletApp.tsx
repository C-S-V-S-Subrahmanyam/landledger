import { useState, useEffect } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Toaster } from "@/components/ui/toaster";
import { LandMinting } from "@/components/LandMinting";
import { PetraWalletIntegration } from "@/components/PetraWalletIntegration";
import { useLandLedgerContract } from "@/utils/landLedgerContractNew";

function RealWalletApp() {
  const { connected, account } = useWallet();
  const { getBalance } = useLandLedgerContract();
  const [activeTab, setActiveTab] = useState("wallet");
  const [userRole, setUserRole] = useState<'farmer' | 'investor'>('farmer');
  const [walletBalance, setWalletBalance] = useState<number>(0);

  // Update wallet balance when connected
  useEffect(() => {
    if (connected && account) {
      loadBalance();
    }
  }, [connected, account]);

  const loadBalance = async () => {
    try {
      const balance = await getBalance();
      setWalletBalance(balance);
    } catch (error) {
      console.error('Error loading balance:', error);
    }
  };

  const handleWalletConnected = (_address: string, balance: number) => {
    setWalletBalance(balance);
    setActiveTab("dashboard");
  };

  const handleRoleSelection = (_address: string, role: 'farmer' | 'investor') => {
    setUserRole(role);
  };

  const tabs = [
    { id: "wallet", label: "💳 Wallet", icon: "💳" },
    { id: "dashboard", label: "📊 Dashboard", icon: "📊" },
  ];

  // Add role-specific tabs
  if (connected && userRole === 'farmer') {
    tabs.push({ id: "mint", label: "🌾 Land NFT", icon: "🌾" });
  }

  const renderContent = () => {
    switch (activeTab) {
      case "wallet":
        return (
          <PetraWalletIntegration 
            onWalletConnected={handleWalletConnected}
            onLogin={handleRoleSelection}
          />
        );
      case "dashboard":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Welcome to LandLedger
              </h2>
              <p className="text-gray-600">
                {connected ? (
                  <>
                    Connected as <strong>{userRole}</strong> • Balance: <strong>{walletBalance.toFixed(4)} APT</strong>
                  </>
                ) : (
                  "Connect your Petra wallet to get started"
                )}
              </p>
            </div>
            
            {connected && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">💰 Real Balance</h3>
                  <p className="text-sm text-blue-700">
                    Your current balance of <strong>{walletBalance.toFixed(4)} APT</strong> is fetched directly from your Petra wallet on Aptos testnet.
                  </p>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 mb-2">🔗 Real Transactions</h3>
                  <p className="text-sm text-green-700">
                    All transactions require Petra wallet approval and deduct real APT from your balance.
                  </p>
                </div>
                
                {userRole === 'farmer' && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h3 className="font-semibold text-orange-800 mb-2">🌾 Land Minting</h3>
                    <p className="text-sm text-orange-700">
                      Mint land NFTs for 0.5 APT each. Balance requirement: {walletBalance >= 0.51 ? "✅ Sufficient" : "❌ Insufficient"}
                    </p>
                  </div>
                )}
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-800 mb-2">🎯 Role: {userRole}</h3>
                  <p className="text-sm text-purple-700">
                    {userRole === 'farmer' 
                      ? "You can mint land NFTs and fractionalize them for investment"
                      : "You can invest in fractionalized land tokens and earn income"
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      case "mint":
        return userRole === 'farmer' ? (
          <LandMinting currentUser={null} />
        ) : (
          <div className="text-center text-gray-600">
            <p>Land minting is only available for farmers.</p>
          </div>
        );
      default:
        return <div>Select a tab to get started</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">🌾 LandLedger</h1>
            <div className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
              Real Wallet Mode
            </div>
            {connected && account && (
              <div className="text-sm text-gray-600">
                {account.address.toString().slice(0, 8)}...{account.address.toString().slice(-6)} ({userRole})
              </div>
            )}
          </div>
          {connected && (
            <div className="text-sm font-medium text-blue-600">
              💰 {walletBalance.toFixed(4)} APT
            </div>
          )}
        </div>
      </header>
    
      <main className="container mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 bg-white rounded-lg p-2 border">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg border p-6">
          {renderContent()}
        </div>
      </main>

      <Toaster />
    </div>
  );
}

export default RealWalletApp;
