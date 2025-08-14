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

interface HeaderProps {
  currentUser?: DemoUser | null;
}

export function Header({ currentUser }: HeaderProps) {
  return (
    <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
              <span className="text-xl">🌾</span>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                LandLedger
              </h1>
              <p className="text-xs text-gray-600">Micro-Ownership of Agricultural Land</p>
            </div>
          </div>
          
          {currentUser && (
            <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
              <span className="text-lg">{currentUser.avatar}</span>
              <div className="text-sm">
                <div className="font-medium">{currentUser.name}</div>
                <div className="text-green-600 capitalize">{currentUser.role}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
