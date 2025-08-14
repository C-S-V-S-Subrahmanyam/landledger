import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { authStore } from "@/utils/authStore";

interface SignupProps {
  onSignupSuccess: (userId: string) => void;
  onSwitchToLogin: () => void;
}

export function Signup({ onSignupSuccess, onSwitchToLogin }: SignupProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    name: "",
    role: "investor" as "farmer" | "investor",
    email: "",
    location: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    // Validation
    if (!formData.username || !formData.password || !formData.name) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 5) {
      toast({
        title: "Error",
        description: "Password must be at least 5 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Check if username already exists
    const existingUsers = authStore.getAllUsers?.() || [];
    if (existingUsers.some(user => user.username === formData.username)) {
      toast({
        title: "Error",
        description: "Username already exists",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Create new user
    setTimeout(() => {
      const success = authStore.createUser({
        username: formData.username,
        password: formData.password,
        name: formData.name,
        role: formData.role,
        email: formData.email,
        location: formData.location,
      });

      if (success) {
        // Get the current user (which was auto-logged in during createUser)
        const currentUser = authStore.getCurrentUser();
        
        toast({
          title: "Account Created",
          description: `Welcome to LandLedger, ${formData.name}! You've been given 50,000 test APT tokens.`,
        });
        
        if (currentUser) {
          onSignupSuccess(currentUser.id);
        } else {
          onSignupSuccess("");
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to create account",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Join LandLedger</CardTitle>
          <p className="text-gray-600">Create your account</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              placeholder="Choose a username"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="your.email@example.com"
            />
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="City, State/Province"
            />
          </div>

          <div>
            <Label htmlFor="role">Role *</Label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as "farmer" | "investor" }))}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="investor">Investor</option>
              <option value="farmer">Farmer</option>
            </select>
          </div>

          <div>
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Create a password"
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm Password *</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              placeholder="Confirm your password"
            />
          </div>

          <Button 
            onClick={handleSignup} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <button
                onClick={onSwitchToLogin}
                className="text-blue-600 hover:underline"
              >
                Login here
              </button>
            </p>
          </div>

          <div className="text-xs text-gray-500 text-center border-t pt-4">
            <p>New users receive 50,000 test APT tokens automatically</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
