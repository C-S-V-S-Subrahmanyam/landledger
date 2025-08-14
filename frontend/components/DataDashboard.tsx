import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dataStore } from "@/utils/dataStore";

export function DataDashboard() {
  const users = dataStore.getUsers();
  const lands = dataStore.getLands();
  const purchases = dataStore.getPurchases();
  const distributions = dataStore.getDistributions();

  const farmers = users.filter(u => u.role === "farmer");
  const investors = users.filter(u => u.role === "investor");
  
  const totalLandsMinted = lands.length;
//   const fractionalizedLands = lands.filter(l => l.isFramentalized).length;
  const totalTokensSold = lands.reduce((sum, land) => sum + (land.tokensSold || 0), 0);
  const totalVolume = purchases.reduce((sum, p) => sum + (p.tokens * p.pricePerToken), 0);
//   const totalDistributed = distributions.reduce((sum, d) => sum + d.totalAmount, 0);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Platform Dashboard</h2>
        <p className="text-gray-600">Real-time data from all user activities</p>
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{users.length}</div>
            <div className="text-sm text-gray-600">Total Users</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{totalLandsMinted}</div>
            <div className="text-sm text-gray-600">Lands Minted</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{totalTokensSold}</div>
            <div className="text-sm text-gray-600">Tokens Sold</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{totalVolume.toFixed(0)}</div>
            <div className="text-sm text-gray-600">Volume (APT)</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Farmers Activity */}
        <Card>
          <CardHeader>
            <CardTitle>🌾 Farmers Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {farmers.map((farmer) => {
                const farmerLands = lands.filter(l => l.ownerId === farmer.id);
                const fractionalizedCount = farmerLands.filter(l => l.isFramentalized).length;
                
                return (
                  <div key={farmer.id} className="border rounded p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{farmer.name}</div>
                        <div className="text-sm text-gray-600">
                          Balance: {farmer.balance} APT
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div>Lands: {farmerLands.length}</div>
                        <div>Fractionalized: {fractionalizedCount}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Investors Activity */}
        <Card>
          <CardHeader>
            <CardTitle>💼 Investors Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {investors.map((investor) => {
                const investorPurchases = purchases.filter(p => p.investorId === investor.id);
                const totalInvested = investorPurchases.reduce((sum, p) => sum + (p.tokens * p.pricePerToken), 0);
                const totalTokens = investorPurchases.reduce((sum, p) => sum + p.tokens, 0);
                
                return (
                  <div key={investor.id} className="border rounded p-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-sm">{investor.name}</div>
                        <div className="text-xs text-gray-600">
                          Balance: {investor.balance} APT
                        </div>
                      </div>
                      <div className="text-right text-xs">
                        <div>Invested: {totalInvested.toFixed(0)} APT</div>
                        <div>Tokens: {totalTokens}</div>
                        <div>Earnings: {investor.totalEarnings?.toFixed(2) || 0} APT</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Purchases */}
        <Card>
          <CardHeader>
            <CardTitle>🛒 Recent Purchases</CardTitle>
          </CardHeader>
          <CardContent>
            {purchases.length === 0 ? (
              <p className="text-gray-600 text-center py-4">No purchases yet</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {purchases.slice(-5).reverse().map((purchase) => {
                  const investor = users.find(u => u.id === purchase.investorId);
                  const land = lands.find(l => l.id === purchase.landId);
                  
                  return (
                    <div key={purchase.id} className="border rounded p-2 text-sm">
                      <div className="flex justify-between">
                        <div>
                          <div className="font-medium">{investor?.name}</div>
                          <div className="text-xs text-gray-600">{land?.location}</div>
                          {purchase.tokenId && (
                            <div className="text-xs text-blue-600 font-mono">
                              Token: {purchase.tokenId.substring(0, 20)}...
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div>{purchase.tokens} tokens</div>
                          <div className="text-xs text-gray-600">
                            {(purchase.tokens * purchase.pricePerToken).toFixed(0)} APT
                          </div>
                          {purchase.transactionHash && (
                            <div className="text-xs text-green-600 font-mono">
                              TX: {purchase.transactionHash.substring(0, 8)}...
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Distributions */}
        <Card>
          <CardHeader>
            <CardTitle>💰 Income Distributions</CardTitle>
          </CardHeader>
          <CardContent>
            {distributions.length === 0 ? (
              <p className="text-gray-600 text-center py-4">No distributions yet</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {distributions.slice(-5).reverse().map((distribution) => {
                  const land = lands.find(l => l.id === distribution.landId);
                  const claimedCount = Object.values(distribution.claimed).filter(Boolean).length;
                  
                  return (
                    <div key={distribution.id} className="border rounded p-2 text-sm">
                      <div className="flex justify-between">
                        <div>
                          <div className="font-medium">{land?.location}</div>
                          <div className="text-xs text-gray-600">
                            {distribution.totalAmount} APT distributed
                          </div>
                          {distribution.distributionId && (
                            <div className="text-xs text-purple-600 font-mono">
                              Dist ID: {distribution.distributionId.substring(0, 20)}...
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div>{claimedCount} claims</div>
                          <div className="text-xs text-gray-600">
                            {distribution.perToken.toFixed(3)} APT/token
                          </div>
                          {distribution.transactionHash && (
                            <div className="text-xs text-green-600 font-mono">
                              TX: {distribution.transactionHash.substring(0, 8)}...
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* All Lands Overview */}
      <Card>
        <CardHeader>
          <CardTitle>🏞️ All Lands Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {lands.length === 0 ? (
            <p className="text-gray-600 text-center py-4">No lands minted yet</p>
          ) : (
            <div className="space-y-3">
              {lands.map((land) => {
                const owner = users.find(u => u.id === land.ownerId);
                
                return (
                  <div key={land.id} className="border rounded p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{land.location}</div>
                        <div className="text-sm text-gray-600">
                          {land.acres} acres • {land.cropType}
                        </div>
                        <div className="text-xs text-gray-500">
                          Owner: {owner?.name}
                        </div>
                        {land.tokenId && (
                          <div className="text-xs text-blue-600 font-mono mt-1">
                            Token ID: {land.tokenId.substring(0, 25)}...
                          </div>
                        )}
                        {land.transactionHash && (
                          <div className="text-xs text-green-600 font-mono">
                            TX: {land.transactionHash.substring(0, 12)}...
                          </div>
                        )}
                      </div>
                      <div className="text-right text-sm">
                        {land.isFramentalized ? (
                          <div>
                            <div className="text-green-600">Fractionalized</div>
                            <div>{land.tokensSold}/{land.totalTokens} sold</div>
                            <div className="text-xs">{land.tokenPrice} APT/token</div>
                          </div>
                        ) : (
                          <div className="text-blue-600">Not Fractionalized</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
