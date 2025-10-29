import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { gameService, GameState } from '@/services/gameService';
import { useWallet } from './WalletContext';
import { useToast } from '@/hooks/use-toast';

interface GameContextType {
  currentGame: GameState | null;
  isLoading: boolean;
  createGame: (opponentAddress?: string) => Promise<void>;
  joinGame: (gameId: string) => Promise<void>;
  submitMove: (from: string, to: string, promotion?: string) => Promise<void>;
  loadGame: (gameId: string) => Promise<void>;
  resetGame: () => void;
  error: string | null;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentGame, setCurrentGame] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { wallet } = useWallet();
  const { toast } = useToast();

  const createGame = async (opponentAddress?: string) => {
    if (!wallet) {
      setError('Wallet not connected');
      toast({
        title: 'Error',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const game = await gameService.createGame({ opponentAddress });
      setCurrentGame(game);
      toast({
        title: 'Game Created',
        description: opponentAddress ? 'Game started!' : 'Waiting for opponent...',
      });
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to create game';
      setError(errorMsg);
      console.error('Game creation error:', err);
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const joinGame = async (gameId: string) => {
    if (!wallet) {
      setError('Wallet not connected');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const game = await gameService.joinGame(gameId);
      setCurrentGame(game);
      toast({
        title: 'Joined Game',
        description: 'You have joined the game!',
      });
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to join game';
      setError(errorMsg);
      console.error('Join game error:', err);
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadGame = async (gameId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const game = await gameService.getGame(gameId);
      if (game) {
        setCurrentGame(game);
      } else {
        setError('Game not found');
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to load game';
      setError(errorMsg);
      console.error('Load game error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const submitMove = async (from: string, to: string, promotion?: string) => {
    if (!wallet) {
      setError('Wallet not connected');
      return;
    }

    if (!currentGame) {
      setError('No active game');
      return;
    }

    // Check if it's the player's turn
    const isWhite = wallet.address === currentGame.player1;
    const isBlack = wallet.address === currentGame.player2;
    const isPlayerTurn = 
      (isWhite && currentGame.currentPlayer === 'white') ||
      (isBlack && currentGame.currentPlayer === 'black');

    if (!isPlayerTurn) {
      toast({
        title: 'Not Your Turn',
        description: 'Please wait for your opponent to move',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const updatedGame = await gameService.submitMove(currentGame.id, {
        from,
        to,
        promotion,
      });
      setCurrentGame(updatedGame);
      toast({
        title: 'Move Submitted',
        description: 'Move broadcast to Linera network',
      });
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to submit move';
      setError(errorMsg);
      console.error('Submit move error:', err);
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetGame = () => {
    setCurrentGame(null);
    setError(null);
  };

  return (
    <GameContext.Provider
      value={{
        currentGame,
        isLoading,
        createGame,
        joinGame,
        submitMove,
        loadGame,
        resetGame,
        error,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
