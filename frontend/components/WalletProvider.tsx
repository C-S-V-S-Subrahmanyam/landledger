import { PropsWithChildren } from "react";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
// Internal components
import { useToast } from "@/components/ui/use-toast";
// Internal constants
import { APTOS_API_KEY, NETWORK } from "@/constants";

export function WalletProvider({ children }: PropsWithChildren) {
  const { toast } = useToast();

  // Configuration without API key for testnet development
  const dappConfig = APTOS_API_KEY 
    ? { network: NETWORK, aptosApiKeys: {[NETWORK]: APTOS_API_KEY} }
    : { network: NETWORK };

  return (
    <AptosWalletAdapterProvider
      autoConnect={true}
      dappConfig={dappConfig}
      onError={(error) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: error || "Unknown wallet error",
        });
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
}
