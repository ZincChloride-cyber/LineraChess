import { Button } from "@/components/ui/button";
import { Wallet, Loader2, AlertCircle } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export const WalletConnect = () => {
  const { 
    wallet, 
    isConnected, 
    isLoading, 
    connect, 
    disconnect, 
    error, 
  } = useWallet();

  const handleConnect = async () => {
    await connect();
  };

  const handleDisconnect = async () => {
    await disconnect();
  };

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <Alert variant="destructive" className="mr-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}
      
      {!isConnected ? (
        <Button 
          variant="glow" 
          className="font-semibold"
          size="sm"
          onClick={handleConnect}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Wallet className="w-4 h-4 mr-2" />
              Connect MetaMask
            </>
          )}
        </Button>
      ) : (
        <div className="flex items-center gap-3">
          <div className="glass-card px-4 py-2 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm text-muted-foreground">Connected</p>
              {wallet?.type && (
                <Badge variant="outline" className="text-xs font-medium uppercase">
                  {wallet.name}
                </Badge>
              )}
            </div>
            <p className="text-xs font-mono text-primary">{wallet?.address}</p>
            <p className="text-xs text-muted-foreground font-mono">Chain: {wallet?.chainId}</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleDisconnect}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Disconnect"
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
