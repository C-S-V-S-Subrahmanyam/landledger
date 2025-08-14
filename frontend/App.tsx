import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { AuthWrapper } from "@/components/AuthWrapper";
import { WalletUserSelector, User } from "@/components/WalletUserSelector";
import { SimpleLandMinting } from "@/components/SimpleLandMinting";
import { SimpleFractionalizeLand } from "@/components/SimpleFractionalizeLand";
import { SimpleMarketplace } from "@/components/SimpleMarketplace";
import { SimpleIncomeDistribution } from "@/components/SimpleIncomeDistribution";
import { DataDashboard } from "@/components/DataDashboard";
import { dataStore } from "@/utils/dataStore";
import { authStore } from "@/utils/authStore";

function App() {
  const [activeTab, setActiveTab] = useState("users");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Refresh users list from dataStore
    setUsers(dataStore.getUsers());
    
    // Check if there's an authenticated user and set as current
    const authUser = authStore.getCurrentUser();
    if (authUser) {
      const dataStoreUser = dataStore.getUser(authUser.id);
      if (dataStoreUser) {
        setCurrentUser(dataStoreUser);
      }
    }
  }, []);

  // Auto-update current user when auth changes (including after login/signup)
  useEffect(() => {
    const interval = setInterval(() => {
      const authUser = authStore.getCurrentUser();
      if (authUser) {
        // Refresh users list in case there are new signups
        const updatedUsers = dataStore.getUsers();
        setUsers(updatedUsers);
        
        const dataStoreUser = dataStore.getUser(authUser.id);
        if (dataStoreUser && (!currentUser || currentUser.id !== authUser.id)) {
          setCurrentUser(dataStoreUser);
          // When a user logs in/signs up, show them in the users tab for easy switching
          console.log(`Auto-selected user: ${dataStoreUser.name} (${dataStoreUser.role})`);
        }
      } else if (currentUser) {
        // User logged out
        setCurrentUser(null);
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, [currentUser]);

  // Define tabs based on user role
  const getTabsForUser = () => {
    const commonTabs = [
      { id: "users", label: "👥 Users", icon: "👥" },
      { id: "dashboard", label: "📊 Dashboard", icon: "📊" },
      { id: "income", label: "💰 Income", icon: "💰" },
    ];

    if (!currentUser) return commonTabs;

    if (currentUser.role === "farmer") {
      return [
        ...commonTabs,
        { id: "mint", label: "🌾 Land NFT", icon: "🌾" },
        { id: "fractionalize", label: "🔀 Fractionalize", icon: "🔀" },
      ];
    } else if (currentUser.role === "investor") {
      return [
        ...commonTabs,
        { id: "marketplace", label: "🏪 Marketplace", icon: "🏪" },
      ];
    }

    return commonTabs;
  };

  // Handle tab switching when user role changes
  useEffect(() => {
    if (currentUser) {
      const availableTabs = getTabsForUser();
      const currentTabExists = availableTabs.some(tab => tab.id === activeTab);
      
      // If current tab is not available for this user role, switch to dashboard
      if (!currentTabExists) {
        setActiveTab("dashboard");
      }
    }
  }, [currentUser, activeTab]);

  const refreshUserData = () => {
    const updatedUsers = dataStore.getUsers();
    setUsers(updatedUsers);
    if (currentUser) {
      const updatedCurrentUser = updatedUsers.find(u => u.id === currentUser.id);
      if (updatedCurrentUser) {
        setCurrentUser(updatedCurrentUser);
      }
    }
  };

  const handleUserSelect = (user: User) => {
    setCurrentUser(user);
    // Set appropriate default tab based on user role
    if (user.role === "farmer") {
      setActiveTab("dashboard");
    } else {
      setActiveTab("dashboard");
    }
  };

  const tabs = getTabsForUser();

  const renderContent = () => {
    switch (activeTab) {
      case "users":
        return <WalletUserSelector onUserSelect={handleUserSelect} currentUser={currentUser} users={users} />;
      case "dashboard":
        return <DataDashboard />;
      case "mint":
        return <SimpleLandMinting currentUser={currentUser} onDataChange={refreshUserData} />;
      case "fractionalize":
        return <SimpleFractionalizeLand currentUser={currentUser} onDataChange={refreshUserData} />;
      case "marketplace":
        return <SimpleMarketplace currentUser={currentUser} onDataChange={refreshUserData} />;
      case "income":
        return <SimpleIncomeDistribution currentUser={currentUser} onDataChange={refreshUserData} />;
      default:
        return <WalletUserSelector onUserSelect={handleUserSelect} currentUser={currentUser} users={users} />;
    }
  };

  return (
    <AuthWrapper>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">LandLedger</h1>
              {currentUser && (
                <div className="text-sm text-gray-600">
                  Logged in as: <span className="font-medium">{currentUser.name}</span> ({currentUser.role})
                </div>
              )}
            </div>
            {/* Space reserved for logout button */}
            <div className="w-20"></div>
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
    </AuthWrapper>
  );
}

export default App;
