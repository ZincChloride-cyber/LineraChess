/**
 * MetaMask SDK Integration
 * Provides wallet connection and transaction helpers tailored for MetaMask.
 */

import MetaMaskSDK from '@metamask/sdk';
import type { MetaMaskInpageProvider } from '@metamask/providers';
import { ethers } from 'ethers';

const CONTRACT_ADDRESS = (import.meta.env.VITE_CHESS_CONTRACT_ADDRESS || '').trim();
const CONTRACT_CHAIN_ID = (import.meta.env.VITE_CHESS_CONTRACT_CHAIN_ID || '').trim().toLowerCase();
const CONTRACT_NETWORK_NAME = (import.meta.env.VITE_CHESS_CONTRACT_NETWORK_NAME || '').trim();

// Contract ABI (simplified - only functions we need)
const CHESS_GAME_ABI = [
  "function createGame(address opponentAddress) external returns (bytes32)",
  "function joinGame(bytes32 gameId) external",
  "function submitMove(bytes32 gameId, uint8 fromSquare, uint8 toSquare, uint8 promotion, string calldata newFen) external",
  "function finishGame(bytes32 gameId, address winner) external",
  "function resign(bytes32 gameId) external",
  "function getGame(bytes32 gameId) external view returns (tuple(address player1, address player2, string fen, bool isWhiteTurn, uint8 status, address winner, uint256 createdAt, uint256 lastMoveAt, uint256 moveCount))",
  "event GameCreated(bytes32 indexed gameId, address indexed player1, address indexed player2)",
  "event MoveSubmitted(bytes32 indexed gameId, address indexed player, uint8 fromSquare, uint8 toSquare, uint8 promotion)",
  "event GameFinished(bytes32 indexed gameId, address indexed winner)",
];

// Helper function to convert square notation (e.g., "e2") to square number (0-63)
function squareToNumber(square: string): number {
  const file = square.charCodeAt(0) - 97; // a=0, h=7
  const rank = parseInt(square.charAt(1)) - 1; // 1=0, 8=7
  return rank * 8 + file;
}

// Helper function to convert promotion string to number
function promotionToNumber(promotion?: string): number {
  if (!promotion) return 0;
  switch (promotion.toLowerCase()) {
    case 'q': return 1; // Queen
    case 'r': return 2; // Rook
    case 'b': return 3; // Bishop
    case 'n': return 4; // Knight
    default: return 0;
  }
}

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
  newFen?: string; // New FEN after the move (calculated by frontend)
}

class LineraService {
  private wallet: LineraWallet | null = null;
  private listeners: Set<(wallet: LineraWallet | null) => void> = new Set();
  private metamaskSDK: MetaMaskSDK | null = null;
  private provider: MetaMaskInpageProvider | null = null;
  private ethersProvider: ethers.BrowserProvider | null = null;

  /**
   * Initialize Linera connection
   * Sets up event listeners but does NOT auto-connect wallet
   * User must explicitly connect via connectWallet() by clicking the connect button
   */
  async initialize(): Promise<void> {
    try {
      // Initialize MetaMask SDK and provider
      const provider = this.ensureProvider();
      if (provider) {
        this.provider = provider;
        this.attachProviderListeners(provider);
      }
      
      // Clear any stored wallet data - user must explicitly connect each time
      localStorage.removeItem('linera_wallet');
    } catch (error) {
      console.error('Failed to initialize Linera:', error);
      // Clear invalid stored wallet on initialization error
      localStorage.removeItem('linera_wallet');
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

    let provider = this.ensureProvider();

    // Verify we got MetaMask, not another wallet
    if (provider && !(provider as any).isMetaMask) {
      console.warn('Warning: Provider is not MetaMask. Clearing and retrying...');
      this.provider = null;
      provider = this.ensureProvider();
      if (provider && (provider as any).isMetaMask) {
        console.log('Successfully found MetaMask on retry');
      }
    }

    if (provider) {
      console.log('Using MetaMask provider:', {
        isMetaMask: (provider as any).isMetaMask,
        isExodus: (provider as any).isExodus,
        hasRequest: typeof (provider as any).request === 'function'
      });
    }

    if (!provider) {
      // Check if other wallets are installed that might be interfering
      let errorMessage = 'MetaMask not found. Please install MetaMask extension.';
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const ethereum = (window as any).ethereum;
        const providers = Array.isArray(ethereum.providers) ? ethereum.providers : 
                         (ethereum.providers ? [ethereum.providers] : [ethereum]);
        
        const installedWallets = providers
          .map((p: any) => {
            if (p.isMetaMask) return 'MetaMask';
            if (p.isExodus) return 'Exodus';
            if (p.isCoinbaseWallet) return 'Coinbase Wallet';
            return null;
          })
          .filter(Boolean);
        
        if (installedWallets.length > 0 && !installedWallets.includes('MetaMask')) {
          errorMessage = `MetaMask not detected. Found: ${installedWallets.join(', ')}. Please install or enable MetaMask extension.`;
        }
      }
      throw new Error(errorMessage);
    }

    try {
      // Step 1: Request account connection (user approval)
      console.log('Requesting MetaMask account connection...');
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      const address = accounts && accounts.length > 0 ? accounts[0] : undefined;

      if (!address) {
        throw new Error('Failed to retrieve wallet address.');
      }

      console.log('MetaMask account connected:', address);

      // Step 2: Get chain ID (non-blocking, use default if fails)
      let chainId: string = 'unknown';
      try {
        chainId = await this.getEvmChainId(provider) || 'unknown';
      } catch (error) {
        console.warn('Failed to get chain ID:', error);
      }

      // Step 3: Verify network (warn but don't block connection)
      let networkWarning: string | null = null;
      try {
        this.ensureCorrectNetwork(chainId);
      } catch (error: any) {
        networkWarning = error.message || 'Network mismatch detected';
        console.warn('Network verification failed:', networkWarning);
      }

      // Step 4: Verify contract (warn but don't block connection)
      try {
        await this.verifyContractDeployment(provider);
      } catch (error: any) {
        console.warn('Contract verification failed:', error.message);
        // Don't block connection if contract verification fails
      }

      // Step 5: Create wallet object and save
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

      // If there was a network warning, log it but don't throw
      if (networkWarning) {
        console.warn('Wallet connected with network warning:', networkWarning);
      }

      console.log('Wallet successfully connected:', {
        address: this.wallet.address,
        chainId: this.wallet.chainId,
        type: this.wallet.type
      });

      return this.wallet;
    } catch (error: any) {
      console.error('Wallet connection error:', {
        code: error.code,
        message: error.message,
        error: error
      });

      // Handle user rejection specifically
      if (error.code === 4001 || error.code === -32002 || error.message?.includes('rejected')) {
        throw new Error('User rejected the connection request');
      }
      // Preserve original error message for better debugging
      const errorMessage = error.message || 'Failed to connect to MetaMask';
      throw new Error(errorMessage);
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
    // First, try to use cached provider (only if it's MetaMask)
    if (this.provider && (this.provider as any).isMetaMask) {
      return this.provider;
    }

    // Try to get provider from SDK
    const sdk = this.ensureSDK();
    if (sdk) {
      const sdkProvider = sdk.getProvider();
      if (sdkProvider && typeof sdkProvider.request === 'function') {
        // Verify it's MetaMask
        if ((sdkProvider as any).isMetaMask) {
          this.provider = sdkProvider as MetaMaskInpageProvider;
          return this.provider;
        }
      } else if (sdkProvider?.providers && sdkProvider.providers.length > 0) {
        // Find MetaMask specifically, ignore other wallets
        const metaMaskProvider = sdkProvider.providers.find((candidate: any) => 
          candidate?.isMetaMask && !candidate.isExodus && !candidate.isCoinbaseWallet
        );
        if (metaMaskProvider) {
          this.provider = metaMaskProvider as MetaMaskInpageProvider;
          return this.provider;
        }
      }
    }

    // Fallback: Check for window.ethereum directly (common MetaMask injection)
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const ethereum = (window as any).ethereum;
      
      // Handle case where ethereum is an array of providers (EIP-6963)
      if (Array.isArray(ethereum.providers)) {
        // Find MetaMask specifically, filter out other wallets
        const metaMaskProvider = ethereum.providers.find((p: any) => 
          p?.isMetaMask && !p.isExodus && !p.isCoinbaseWallet
        );
        if (metaMaskProvider && typeof metaMaskProvider.request === 'function') {
          this.provider = metaMaskProvider as MetaMaskInpageProvider;
          return this.provider;
        }
      }
      
      // Check if ethereum itself is MetaMask
      if (ethereum.isMetaMask && !ethereum.isExodus && !ethereum.isCoinbaseWallet) {
        if (typeof ethereum.request === 'function') {
          this.provider = ethereum as MetaMaskInpageProvider;
          return this.provider;
        }
      }
    }

    // Additional check: Look for MetaMask specifically by checking for MetaMask-specific properties
    if (typeof window !== 'undefined') {
      // Check for MetaMask's specific injection
      const ethereum = (window as any).ethereum;
      if (ethereum) {
        // If it's an array, find MetaMask
        if (Array.isArray(ethereum)) {
          const metaMask = ethereum.find((p: any) => p?.isMetaMask);
          if (metaMask && typeof metaMask.request === 'function') {
            this.provider = metaMask as MetaMaskInpageProvider;
            return this.provider;
          }
        }
      }
    }

    return null;
  }

  /**
   * Get or create ethers provider with error handling
   */
  private async getEthersProvider(): Promise<ethers.BrowserProvider> {
    if (!this.provider) {
      throw new Error('MetaMask provider not available');
    }

    // Reuse cached provider if available
    if (this.ethersProvider) {
      return this.ethersProvider;
    }

    // Create new provider
    try {
      this.ethersProvider = new ethers.BrowserProvider(this.provider as any);
      return this.ethersProvider;
    } catch (error: any) {
      console.error('Failed to create ethers provider:', error);
      throw new Error('Failed to initialize blockchain provider. Please check your network connection.');
    }
  }

  /**
   * Execute a contract call with retry logic
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;
        
        // Don't retry on user rejection
        if (error.code === 4001 || error.code === -32002 || error.message?.includes('rejected')) {
          throw error;
        }

        // Check for RPC errors
        const isRpcError = error.message?.includes('RPC') || 
                          error.message?.includes('endpoint') ||
                          error.message?.includes('network') ||
                          error.code === 'NETWORK_ERROR' ||
                          error.code === 'TIMEOUT';

        if (isRpcError && attempt < maxRetries) {
          const waitTime = delay * Math.pow(2, attempt - 1); // Exponential backoff
          console.warn(`RPC error on attempt ${attempt}/${maxRetries}. Retrying in ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          
          // Clear cached provider to force recreation
          this.ethersProvider = null;
          continue;
        }

        throw error;
      }
    }

    throw lastError;
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
    this.ethersProvider = null; // Clear cached ethers provider
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
   * Submit a chess move to blockchain
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

    if (!CONTRACT_ADDRESS) {
      throw new Error('Contract address not configured. Please set VITE_CHESS_CONTRACT_ADDRESS in .env');
    }

    try {
      return await this.executeWithRetry(async () => {
        // Get ethers provider with retry logic
        const ethersProvider = await this.getEthersProvider();
        const signer = await ethersProvider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CHESS_GAME_ABI, signer);

        // Convert move notation to contract format
        // gameId should be bytes32 - if it's already hex, use it; otherwise convert
        let gameIdBytes: string;
        if (move.gameId.startsWith('0x') && move.gameId.length === 66) {
          gameIdBytes = move.gameId;
        } else {
          gameIdBytes = ethers.keccak256(ethers.toUtf8Bytes(move.gameId));
        }

        const fromSquare = squareToNumber(move.from);
        const toSquare = squareToNumber(move.to);
        const promotion = promotionToNumber(move.promotion);

        // Get new FEN - must be provided by the caller
        if (!move.newFen) {
          throw new Error('New FEN must be calculated and provided before submitting move');
        }

        // Call contract
        const tx = await contract.submitMove(gameIdBytes, fromSquare, toSquare, promotion, move.newFen);
        const receipt = await tx.wait();

        const transaction: LineraTransaction = {
          id: receipt.hash,
          from: this.wallet.address,
          to: CONTRACT_ADDRESS,
          data: move,
          timestamp: Date.now(),
        };

        console.info('Move submitted to blockchain:', transaction);
        return transaction;
      });
    } catch (error: any) {
      if (error.code === 4001 || error.code === -32002) {
        throw new Error('User rejected the transaction');
      }
      
      // Provide helpful error messages for RPC issues
      if (error.message?.includes('RPC') || error.message?.includes('endpoint')) {
        const chainId = this.wallet?.chainId;
        if (chainId === '0x539' || chainId === '1337') {
          throw new Error('Local blockchain node is not responding. Please ensure Hardhat node is running: `npx hardhat node`');
        }
        throw new Error('RPC endpoint error. Please check your network connection or try switching networks in MetaMask.');
      }
      
      throw new Error(error.message || 'Failed to submit move to blockchain');
    }
  }

  /**
   * Create a new game on blockchain
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

    if (!CONTRACT_ADDRESS) {
      // Fallback to local game ID if contract not configured
      const fallbackId = this.generateGameId();
      console.warn('Contract address not configured. Using local game ID:', fallbackId);
      return fallbackId;
    }

    try {
      return await this.executeWithRetry(async () => {
        // Get ethers provider with retry logic
        const ethersProvider = await this.getEthersProvider();
        const signer = await ethersProvider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CHESS_GAME_ABI, signer);

        // Convert opponent address to proper format (or zero address if not provided)
        const opponentAddr = opponentAddress && ethers.isAddress(opponentAddress) 
          ? opponentAddress 
          : ethers.ZeroAddress;

        // Call contract to create game
        const tx = await contract.createGame(opponentAddr);
        const receipt = await tx.wait();

        // Get gameId from event
        const gameCreatedEvent = receipt.logs.find((log: any) => {
          try {
            const parsed = contract.interface.parseLog(log);
            return parsed && parsed.name === 'GameCreated';
          } catch {
            return false;
          }
        });

        let gameId: string;
        if (gameCreatedEvent) {
          const parsed = contract.interface.parseLog(gameCreatedEvent);
          gameId = parsed?.args[0] || receipt.hash;
        } else {
          // Fallback: use transaction hash as game ID
          gameId = receipt.hash;
        }

        console.info('Game created on blockchain:', gameId);
        return gameId;
      });
    } catch (error: any) {
      if (error.code === 4001 || error.code === -32002) {
        throw new Error('User rejected the transaction');
      }
      
      // Provide helpful error messages for RPC issues
      if (error.message?.includes('RPC') || error.message?.includes('endpoint')) {
        const chainId = this.wallet?.chainId;
        if (chainId === '0x539' || chainId === '1337') {
          throw new Error('Local blockchain node is not responding. Please ensure Hardhat node is running: `npx hardhat node`');
        }
        throw new Error('RPC endpoint error. Please check your network connection or try switching networks in MetaMask.');
      }
      
      console.error('Failed to create game on blockchain:', error);
      // Fallback to local game ID only for non-critical errors
      if (!error.message?.includes('RPC') && !error.message?.includes('endpoint')) {
        const fallbackId = this.generateGameId();
        console.warn('Falling back to local game ID:', fallbackId);
        return fallbackId;
      }
      throw error;
    }
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
    this.ethersProvider = null; // Clear cached ethers provider
    localStorage.removeItem('linera_wallet');
    this.notifyListeners();
  };

  private handleChainChanged = async () => {
    if (this.wallet && this.provider) {
      try {
        // Clear cached provider when chain changes
        this.ethersProvider = null;
        
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

