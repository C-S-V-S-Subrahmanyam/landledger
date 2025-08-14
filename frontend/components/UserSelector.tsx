import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

interface UserSelectorProps {
  onUserSelect: (user: User) => void;
  currentUser: User | null;
  users: User[];
}

export function UserSelector({ onUserSelect, currentUser, users }: UserSelectorProps) {
  const farmers = users.filter(u => u.role === "farmer");
  const investors = users.filter(u => u.role === "investor");

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Select User</h2>
        <p className="text-gray-600">Choose a user to interact with the platform</p>
      </div>

      {currentUser && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold">{currentUser.name}</div>
                <div className="text-sm text-gray-600">
                  {currentUser.role} • Balance: {currentUser.balance} APT
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Farmers */}
        <div>
          <h3 className="text-lg font-bold mb-3">🌾 Farmers</h3>
          <div className="space-y-2">
            {farmers.map((user) => (
              <Card key={user.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-600">
                        Balance: {user.balance} APT
                      </div>
                      <div className="text-sm text-gray-600">
                        Lands: {user.landOwned?.length || 0}
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => onUserSelect(user)}
                      variant={currentUser?.id === user.id ? "default" : "outline"}
                    >
                      Select
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Investors */}
        <div>
          <h3 className="text-lg font-bold mb-3">💼 Investors</h3>
          <div className="space-y-2">
            {investors.map((user) => (
              <Card key={user.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-600">
                        Balance: {user.balance} APT
                      </div>
                      <div className="text-sm text-gray-600">
                        Investment: {user.totalInvestment || 0} APT
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => onUserSelect(user)}
                      variant={currentUser?.id === user.id ? "default" : "outline"}
                    >
                      Select
                    </Button>
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
