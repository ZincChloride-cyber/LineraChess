import { Button } from "@/components/ui/button";
import { Wallet, Loader2, AlertCircle, X } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

export const WalletConnect = () => {
  const { 
    wallet, 
    isConnected, 
    isLoading, 
    connect, 
    disconnect, 
    error, 
  } = useWallet();
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (error) {
      setShowError(true);
      // Auto-hide error after 5 seconds
      const timer = setTimeout(() => {
        setShowError(false);
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setShowError(false);
    }
  }, [error]);

  const handleConnect = async () => {
    setShowError(false);
    await connect();
  };

  const handleDisconnect = async () => {
    await disconnect();
  };

  const getErrorMessage = (error: string) => {
    if (error.includes("rejected") || error.includes("cancelled")) {
      return "Connection was cancelled. Please try again and approve the connection in MetaMask.";
    }
    if (error.includes("Exodus")) {
      return "Exodus wallet detected. This app requires MetaMask. Please install MetaMask extension or disable Exodus wallet extension.";
    }
    if (error.includes("not available") || error.includes("install") || error.includes("not found") || error.includes("not detected")) {
      return error; // Use the detailed error message from the service
    }
    if (error.includes("network") || error.includes("Network")) {
      return `Network issue: ${error}. Please check your MetaMask network settings.`;
    }
    if (error.includes("contract") || error.includes("Contract")) {
      return `Contract issue: ${error}. The wallet is connected but contract verification failed.`;
    }
    return error;
  };

  return (
    <div className="flex flex-col gap-3">
      {error && showError && (
        <Alert variant="destructive" className="mr-2 relative">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs pr-6">
            {getErrorMessage(error)}
          </AlertDescription>
          <button
            onClick={() => setShowError(false)}
            className="absolute top-2 right-2 text-destructive hover:text-destructive/80"
          >
            <X className="h-4 w-4" />
          </button>
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
