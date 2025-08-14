import { useState, useEffect } from "react";
import { Login } from "./Login";
import { Signup } from "./Signup";
import { authStore } from "@/utils/authStore";

interface AuthWrapperProps {
  children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (simple session check)
    const currentUser = authStore.getCurrentUser();
    if (currentUser) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (_userId: string) => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    authStore.logout();
    setIsAuthenticated(false);
  };

  const handleSignupSuccess = (_userId: string) => {
    setShowSignup(false);
    // User is already logged in after signup, so authenticate them
    setIsAuthenticated(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading LandLedger...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (showSignup) {
      return (
        <Signup
          onSignupSuccess={handleSignupSuccess}
          onSwitchToLogin={() => setShowSignup(false)}
        />
      );
    }
    return (
      <Login
        onLogin={handleLogin}
        onSwitchToSignup={() => setShowSignup(true)}
      />
    );
  }

  return (
    <div>
      {/* Add logout button to the authenticated app */}
      <div className="fixed top-6 right-6 z-50">
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm shadow-lg"
        >
          Logout
        </button>
      </div>
      {children}
    </div>
  );
}
