import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { lineraService, LineraWallet } from '@/lib/linera';

interface WalletContextType {
  wallet: LineraWallet | null;
  isConnected: boolean;
  isLoading: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  error: string | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [wallet, setWallet] = useState<LineraWallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize wallet state
    const currentWallet = lineraService.getWallet();
    setWallet(currentWallet);
    setIsLoading(false);

    // Subscribe to wallet changes
    const unsubscribe = lineraService.subscribe((newWallet) => {
      setWallet(newWallet);
      setError(null);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const connect = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await lineraService.connectWallet();
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
      console.error('Wallet connection error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await lineraService.disconnectWallet();
    } catch (err: any) {
      setError(err.message || 'Failed to disconnect wallet');
      console.error('Wallet disconnection error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        wallet,
        isConnected: !!wallet,
        isLoading,
        connect,
        disconnect,
        error,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

