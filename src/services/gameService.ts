/**
 * Game Service - Manages chess game state and Linera blockchain integration
 */

import { lineraService, GameMove } from '@/lib/linera';
import { supabase } from '@/integrations/supabase/client';

export interface GameState {
  id: string;
  player1: string;
  player2: string | null;
  currentPlayer: 'white' | 'black';
  fen: string;
  moveHistory: string[];
  status: 'waiting' | 'active' | 'finished';
  winner: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGameParams {
  opponentAddress?: string;
  isPublic?: boolean;
}

class GameService {
  /**
   * Create a new game
   */
  async createGame(params: CreateGameParams = {}): Promise<GameState> {
    const wallet = lineraService.getWallet();
    if (!wallet) {
      throw new Error('Wallet not connected');
    }

    // Create game on Linera blockchain
    const gameId = await lineraService.createGame(params.opponentAddress);

    // Create game record in Supabase
    const { data, error } = await supabase
      .from('games')
      .insert({
        id: gameId,
        player1: wallet.address,
        player2: params.opponentAddress || null,
        current_player: 'white',
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        move_history: [],
        status: params.opponentAddress ? 'active' : 'waiting',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      // If table doesn't exist, create the game state locally
      console.warn('Supabase error (table may not exist):', error);
      return {
        id: gameId,
        player1: wallet.address,
        player2: params.opponentAddress || null,
        currentPlayer: 'white',
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        moveHistory: [],
        status: params.opponentAddress ? 'active' : 'waiting',
        winner: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    return this.mapDbGameToState(data);
  }

  /**
   * Get game by ID
   */
  async getGame(gameId: string): Promise<GameState | null> {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .single();

    if (error || !data) {
      return null;
    }

    return this.mapDbGameToState(data);
  }

  /**
   * Submit a move
   */
  async submitMove(gameId: string, move: { from: string; to: string; promotion?: string }): Promise<GameState> {
    const wallet = lineraService.getWallet();
    if (!wallet) {
      throw new Error('Wallet not connected');
    }

    // Get current game state
    const game = await this.getGame(gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    // Calculate new FEN from move (must be done before submitting to blockchain)
    const Chess = (await import('chess.js')).Chess;
    const chessGame = new Chess(game.fen);
    const result = chessGame.move({
      from: move.from,
      to: move.to,
      promotion: move.promotion as any,
    });
    
    if (!result) {
      throw new Error('Invalid move');
    }

    const updatedFen = chessGame.fen();

    // Submit move to blockchain (with calculated FEN)
    const gameMove: GameMove = {
      from: move.from,
      to: move.to,
      promotion: move.promotion,
      gameId,
      playerAddress: wallet.address,
      timestamp: Date.now(),
      newFen: updatedFen, // Include calculated FEN
    };

    const transaction = await lineraService.submitMove(gameMove);
    const updatedHistory = [...game.moveHistory, result.san];
    const updatedCurrentPlayer = game.currentPlayer === 'white' ? 'black' : 'white';
    
    // Check for game end conditions
    let updatedStatus = game.status;
    let updatedWinner = game.winner;
    
    if (chessGame.isCheckmate() || chessGame.isDraw()) {
      updatedStatus = 'finished';
      if (chessGame.isCheckmate()) {
        updatedWinner = wallet.address;
      }
    }

    const { data, error } = await supabase
      .from('games')
      .update({
        fen: updatedFen,
        move_history: updatedHistory,
        current_player: updatedCurrentPlayer,
        status: updatedStatus,
        winner: updatedWinner,
        updated_at: new Date().toISOString(),
      })
      .eq('id', gameId)
      .select()
      .single();

    if (error) {
      console.warn('Supabase update error:', error);
      // Return optimistic update with all state changes
      return {
        ...game,
        fen: updatedFen,
        moveHistory: updatedHistory,
        currentPlayer: updatedCurrentPlayer,
        status: updatedStatus,
        winner: updatedWinner,
        updatedAt: new Date().toISOString(),
      };
    }

    return this.mapDbGameToState(data);
  }

  /**
   * Get user's games
   */
  async getUserGames(): Promise<GameState[]> {
    const wallet = lineraService.getWallet();
    if (!wallet) {
      return [];
    }

    const { data, error } = await supabase
      .from('games')
      .select('*')
      .or(`player1.eq.${wallet.address},player2.eq.${wallet.address}`)
      .order('updated_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map(game => this.mapDbGameToState(game));
  }

  /**
   * Join a public game
   */
  async joinGame(gameId: string): Promise<GameState> {
    const wallet = lineraService.getWallet();
    if (!wallet) {
      throw new Error('Wallet not connected');
    }

    // First get the game
    const game = await this.getGame(gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    if (game.player2) {
      throw new Error('Game already has two players');
    }

    const { data, error } = await supabase
      .from('games')
      .update({
        player2: wallet.address,
        status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', gameId)
      .is('player2', null)
      .select()
      .single();

    if (error || !data) {
      // Return optimistic update if Supabase fails
      console.warn('Supabase update error, returning optimistic update:', error);
      return {
        ...game,
        player2: wallet.address,
        status: 'active',
        updatedAt: new Date().toISOString(),
      };
    }

    return this.mapDbGameToState(data);
  }

  private mapDbGameToState(dbGame: any): GameState {
    return {
      id: dbGame.id,
      player1: dbGame.player1,
      player2: dbGame.player2,
      currentPlayer: dbGame.current_player || 'white',
      fen: dbGame.fen,
      moveHistory: dbGame.move_history || [],
      status: dbGame.status || 'waiting',
      winner: dbGame.winner,
      createdAt: dbGame.created_at,
      updatedAt: dbGame.updated_at,
    };
  }
}

export const gameService = new GameService();

