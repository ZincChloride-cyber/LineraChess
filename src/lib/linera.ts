/**
 * MetaMask SDK Integration
 * Provides wallet connection and transaction helpers tailored for MetaMask.
 */

import MetaMaskSDK from '@metamask/sdk';
import type { MetaMaskInpageProvider } from '@metamask/providers';

const CONTRACT_ADDRESS = (import.meta.env.VITE_CHESS_CONTRACT_ADDRESS || '').trim();
const CONTRACT_CHAIN_ID = (import.meta.env.VITE_CHESS_CONTRACT_CHAIN_ID || '').trim().toLowerCase();
const CONTRACT_NETWORK_NAME = (import.meta.env.VITE_CHESS_CONTRACT_NETWORK_NAME || '').trim();

export type WalletProviderType = 'metamask';

export interface LineraWallet {
  address: string;
  chainId: string;
  isConnected: boolean;
  type: WalletProviderType;
  name: string;
}

export interface LineraTransaction {
  id: string;
  from: string;
  to: string;
  data: any;
  timestamp: number;
}

export interface GameMove {
  from: string;
  to: string;
  promotion?: string;
  gameId: string;
  playerAddress: string;
  timestamp: number;
}

class LineraService {
  private wallet: LineraWallet | null = null;
  private listeners: Set<(wallet: LineraWallet | null) => void> = new Set();
  private metamaskSDK: MetaMaskSDK | null = null;
  private provider: MetaMaskInpageProvider | null = null;

  /**
   * Initialize Linera connection
   * Checks for existing wallet connection and sets up event listeners
   */
  async initialize(): Promise<void> {
    try {
      // Initialize MetaMask SDK and provider
      const provider = this.ensureProvider();
      if (provider) {
        this.provider = provider;
        this.attachProviderListeners(provider);
      }

      // Fallback: Check if wallet is stored in localStorage
      const stored = localStorage.getItem('linera_wallet');
      if (stored) {
        try {
          const parsedWallet = JSON.parse(stored);
          const walletType: WalletProviderType = 'metamask';
          this.wallet = {
            ...parsedWallet,
            type: walletType,
            name: 'MetaMask',
          };
          const restoredProvider = this.ensureProvider();
          if (restoredProvider) {
            this.provider = restoredProvider;
            this.attachProviderListeners(restoredProvider);
          }
          this.notifyListeners();
        } catch (error) {
          // Invalid stored wallet, remove it
          localStorage.removeItem('linera_wallet');
        }
      }
    } catch (error) {
      console.error('Failed to initialize Linera:', error);
    }
  }

  /**
   * Connect to Linera wallet
   * Connects to Linera wallet extension or SDK
   */
  async connectWallet(): Promise<LineraWallet> {
    if (typeof window === 'undefined') {
      throw new Error('Window object not available');
    }

    const provider = this.ensureProvider();

    if (!provider) {
      throw new Error('MetaMask provider not available. Please install or enable MetaMask.');
    }

    try {
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      const address = accounts && accounts.length > 0 ? accounts[0] : undefined;
      const chainId = await this.getEvmChainId(provider);
      this.ensureCorrectNetwork(chainId);
      await this.verifyContractDeployment(provider);

      if (!address) {
        throw new Error('Failed to retrieve wallet address.');
      }

      this.wallet = {
        address,
        chainId: chainId || 'unknown',
        isConnected: true,
        type: 'metamask',
        name: 'MetaMask',
      };

      this.provider = provider;

      this.attachProviderListeners(provider);
      this.saveWallet();
      this.notifyListeners();

      return this.wallet;
    } catch (error: any) {
      if (error.code === 4001 || error.code === -32002) {
        throw new Error('User rejected the connection request');
      }
      throw new Error(error.message || 'Failed to connect to MetaMask');
    }
  }

  private ensureSDK(): MetaMaskSDK | null {
    if (typeof window === 'undefined') {
      return null;
    }

    if (!this.metamaskSDK) {
      this.metamaskSDK = new MetaMaskSDK({
        dappMetadata: {
          name: 'LineraChess',
          url: typeof window !== 'undefined' ? window.location.origin : '',
        },
        logging: {
          developerMode: process.env.NODE_ENV !== 'production',
        },
      });
    }

    return this.metamaskSDK;
  }

  private ensureProvider(): MetaMaskInpageProvider | null {
    const sdk = this.ensureSDK();
    if (!sdk) {
      return null;
    }

    if (!this.provider) {
      const sdkProvider = sdk.getProvider();
      if (sdkProvider && typeof sdkProvider.request === 'function') {
        this.provider = sdkProvider as MetaMaskInpageProvider;
      } else if (sdkProvider?.providers && sdkProvider.providers.length > 0) {
        const metaMaskProvider = sdkProvider.providers.find((candidate: MetaMaskInpageProvider) => candidate?.isMetaMask);
        if (metaMaskProvider) {
          this.provider = metaMaskProvider;
        }
      }
    }

    return this.provider;
  }

  /**
   * Get chain ID from wallet or default
   */
  private async getEvmChainId(provider: any): Promise<string> {
    try {
      if (provider?.request) {
        const chainId = await provider.request({ method: 'eth_chainId' });
        if (chainId) {
          return chainId;
        }
      }
      return '0x1';
    } catch {
      return '0x1';
    }
  }

  private ensureCorrectNetwork(chainId: string): void {
    if (!CONTRACT_CHAIN_ID) {
      return;
    }

    if (chainId.toLowerCase() !== CONTRACT_CHAIN_ID) {
      const expectedNetwork = CONTRACT_NETWORK_NAME || CONTRACT_CHAIN_ID;
      throw new Error(`Please switch MetaMask to the ${expectedNetwork} network before continuing.`);
    }
  }

  private async verifyContractDeployment(provider: MetaMaskInpageProvider | null): Promise<void> {
    if (!provider) {
      throw new Error('MetaMask provider not available.');
    }

    if (!CONTRACT_ADDRESS) {
      console.warn('VITE_CHESS_CONTRACT_ADDRESS not set; running without on-chain contract verification.');
      return;
    }

    try {
      const code = await provider.request({
        method: 'eth_getCode',
        params: [CONTRACT_ADDRESS, 'latest'],
      }) as string;

      if (!code || code === '0x') {
        throw new Error(`No smart contract detected at ${CONTRACT_ADDRESS}. Please deploy the chess contract first.`);
      }
    } catch (error: any) {
      if (error?.message) {
        throw error;
      }
      throw new Error('Failed to verify chess contract deployment.');
    }
  }

  /**
   * Disconnect wallet
   */
  async disconnectWallet(): Promise<void> {
    this.wallet = null;
    this.provider = null;
    localStorage.removeItem('linera_wallet');
    this.notifyListeners();
  }

  /**
   * Get current wallet
   */
  getWallet(): LineraWallet | null {
    return this.wallet;
  }

  /**
   * Check if wallet is connected
   */
  isConnected(): boolean {
    return this.wallet?.isConnected || false;
  }

  /**
   * Submit a chess move to Linera blockchain
   */
  async submitMove(move: GameMove): Promise<LineraTransaction> {
    if (!this.wallet) {
      throw new Error('Wallet not connected');
    }

    if (typeof window === 'undefined') {
      throw new Error('Window object not available');
    }

    if (!this.provider) {
      throw new Error('Wallet provider not initialized');
    }

    await this.verifyContractDeployment(this.provider);

    // For MetaMask, operate in optimistic/off-chain mode
    const transaction: LineraTransaction = {
      id: this.generateTxId(),
      from: this.wallet.address,
      to: move.gameId,
      data: move,
      timestamp: Date.now(),
    };
    console.info('Simulated transaction for MetaMask wallet', transaction);
    return transaction;
  }

  /**
   * Create a new game on Linera blockchain
   */
  async createGame(opponentAddress?: string): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet not connected');
    }

    if (typeof window === 'undefined') {
      throw new Error('Window object not available');
    }

    const provider = this.ensureProvider();
    if (!provider) {
      throw new Error('MetaMask provider not available.');
    }

    await this.verifyContractDeployment(provider);

    const fallbackId = this.generateGameId();
    console.info('Generated local game ID for MetaMask wallet:', fallbackId);
    return fallbackId;
  }

  /**
   * Subscribe to wallet changes
   */
  subscribe(listener: (wallet: LineraWallet | null) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      listener(this.wallet);
    });
  }

  private saveWallet(): void {
    if (this.wallet) {
      localStorage.setItem('linera_wallet', JSON.stringify(this.wallet));
    }
  }

  private attachProviderListeners(provider: MetaMaskInpageProvider) {
    if (!provider?.on) {
      return;
    }

    provider.removeListener?.('accountsChanged', this.handleAccountsChanged);
    provider.removeListener?.('disconnect', this.handleDisconnect);
    provider.removeListener?.('chainChanged', this.handleChainChanged);

    provider.on('accountsChanged', this.handleAccountsChanged);
    provider.on('disconnect', this.handleDisconnect);
    provider.on('chainChanged', this.handleChainChanged);
  }

  private handleAccountsChanged = (accounts: string[]) => {
    if (!accounts || accounts.length === 0) {
      this.wallet = null;
      localStorage.removeItem('linera_wallet');
      this.notifyListeners();
      return;
    }

    if (this.wallet) {
      this.wallet.address = accounts[0];
      this.saveWallet();
      this.notifyListeners();
    }
  };

  private handleDisconnect = () => {
    this.wallet = null;
    this.provider = null;
    localStorage.removeItem('linera_wallet');
    this.notifyListeners();
  };

  private handleChainChanged = async () => {
    if (this.wallet && this.provider) {
      try {
        const chainId = await this.getEvmChainId(this.provider);
        this.ensureCorrectNetwork(chainId);
        await this.verifyContractDeployment(this.provider);
        this.wallet.chainId = chainId;
        this.saveWallet();
        this.notifyListeners();
      } catch (error) {
        console.error('Network change error:', error);
        this.handleDisconnect();
      }
    }
  };


  private generateTxId(): string {
    return 'tx_' + Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  private generateGameId(): string {
    return 'game_' + Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}

// Export singleton instance
export const lineraService = new LineraService();

// Initialize on module load
if (typeof window !== 'undefined') {
  lineraService.initialize();
}

