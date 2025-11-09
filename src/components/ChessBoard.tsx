import { useState, useEffect } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw, Flag, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useGame } from "@/contexts/GameContext";
import { useWallet } from "@/contexts/WalletContext";

// react-chessboard v4 compatible wrapper

interface ChessBoardProps {
  gameId?: string;
}

export const ChessBoard = ({ gameId }: ChessBoardProps) => {
  const [game, setGame] = useState(new Chess());
  const { toast } = useToast();
  const { currentGame, submitMove, isLoading, createGame } = useGame();
  const { wallet } = useWallet();

  // Sync game state with blockchain
  useEffect(() => {
    if (currentGame) {
      try {
        const chessGame = new Chess(currentGame.fen);
        setGame(chessGame);
      } catch (error) {
        console.error('Failed to load game state:', error);
      }
    } else if (gameId) {
      // Load game if gameId provided
      // This would be handled by GameContext
    }
  }, [currentGame, gameId]);

  const makeMove = async (move: { from: string; to: string; promotion?: string }) => {
    if (!wallet) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to make moves",
        variant: "destructive",
      });
      return false;
    }

    if (!currentGame) {
      toast({
        title: "No Active Game",
        description: "Please create or join a game first",
        variant: "destructive",
      });
      return false;
    }

    // Validate move locally first
    try {
      const gameCopy = new Chess(game.fen());
      const result = gameCopy.move(move);
      
      if (!result) {
        toast({
          title: "Invalid Move",
          description: "That move is not allowed",
          variant: "destructive",
        });
        return false;
      }

      // Submit move to Linera blockchain
      await submitMove(move.from, move.to, move.promotion);
      
      // Update local game state
      setGame(gameCopy);
      
      return true;
    } catch (error: any) {
      toast({
        title: "Invalid Move",
        description: error.message || "That move is not allowed",
        variant: "destructive",
      });
      return false;
    }
  };

  const onDrop = async (sourceSquare: string, targetSquare: string) => {
    if (isLoading || !isPlayerTurn) return false;
    
    const result = await makeMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    });
    return result;
  };

  const resetGame = async () => {
    if (!wallet) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet",
        variant: "destructive",
      });
      return;
    }

    try {
      await createGame();
      setGame(new Chess());
      toast({
        title: "New Game Started",
        description: "A new game has been created on Linera",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create new game",
        variant: "destructive",
      });
    }
  };

  const resign = () => {
    if (!currentGame) return;
    
    const winner = wallet?.address === currentGame.player1 
      ? currentGame.player2 
      : currentGame.player1;
    
    toast({
      title: "Game Over",
      description: `You resigned. ${winner ? 'Opponent wins!' : 'Game ended.'}`,
    });
  };

  // Determine if it's current player's turn
  // If player2 is null, allow the same player to play both sides (for testing/single player mode)
  const isPlayerTurn = currentGame && wallet && (
    (wallet.address === currentGame.player1 && currentGame.currentPlayer === 'white') ||
    (wallet.address === currentGame.player2 && currentGame.currentPlayer === 'black') ||
    (!currentGame.player2 && wallet.address === currentGame.player1) // Allow single player mode
  );

  const playerName = wallet?.address 
    ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`
    : "Not Connected";
  
  const opponentName = currentGame 
    ? (wallet?.address === currentGame.player1 
        ? (currentGame.player2 ? `${currentGame.player2.slice(0, 6)}...${currentGame.player2.slice(-4)}` : "Waiting...")
        : `${currentGame.player1.slice(0, 6)}...${currentGame.player1.slice(-4)}`)
    : "No Opponent";

  const playerChainId = wallet?.chainId || "N/A";
  const opponentChainId = currentGame?.player2 || "N/A";

  const moveHistory = currentGame?.moveHistory || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chess Board */}
      <div className="lg:col-span-2 space-y-4">
        {/* Player Info Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">{opponentName}</p>
                <p className="text-xs text-muted-foreground font-mono">Chain: {opponentChainId}</p>
              </div>
              <div className={`w-3 h-3 rounded-full ${game.turn() === 'b' ? 'bg-primary animate-pulse' : 'bg-muted'}`} />
            </div>
          </Card>
          
          <Card className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">{playerName}</p>
                <p className="text-xs text-muted-foreground font-mono">Chain: {playerChainId}</p>
              </div>
              <div className={`w-3 h-3 rounded-full ${game.turn() === 'w' ? 'bg-primary animate-pulse' : 'bg-muted'}`} />
            </div>
          </Card>
        </div>

        {/* Board */}
        <Card className="glass-card p-6 overflow-hidden">
          <div className="aspect-square w-full max-w-2xl mx-auto relative">
            {isLoading && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}
            <Chessboard
              position={game.fen()}
              onPieceDrop={isPlayerTurn ? onDrop : undefined}
              areArrowsAllowed={true}
              boardOrientation={wallet?.address === currentGame?.player2 ? "black" : "white"}
              customBoardStyle={{
                borderRadius: '4px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
            />
          </div>
        </Card>

        {/* Controls */}
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={resetGame} 
            className="flex-1"
            disabled={isLoading}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            New Game
          </Button>
          <Button 
            variant="destructive" 
            onClick={resign} 
            className="flex-1"
            disabled={!currentGame || isLoading}
          >
            <Flag className="w-4 h-4 mr-2" />
            Resign
          </Button>
          {!isPlayerTurn && currentGame && (
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
              Waiting for opponent...
            </div>
          )}
        </div>
      </div>

      {/* Move History Sidebar */}
      <Card className="glass-card p-6 h-fit lg:sticky lg:top-6">
        <h3 className="text-lg font-semibold mb-4 text-primary">Move History</h3>
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {moveHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">No moves yet</p>
          ) : (
            moveHistory.map((move, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground w-8">{Math.floor(index / 2) + 1}.</span>
                <span className={index % 2 === 0 ? "text-foreground font-semibold" : "text-muted-foreground"}>
                  {move}
                </span>
              </div>
            ))
          )}
        </div>
        
        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2">Game Status</p>
          <p className="text-sm font-semibold">
            {!currentGame 
              ? "No active game"
              : game.isCheckmate() 
              ? "Checkmate!" 
              : game.isCheck() 
              ? "Check!" 
              : isPlayerTurn
              ? "Your turn" 
              : "Opponent's turn"}
          </p>
          {currentGame && (
            <p className="text-xs text-muted-foreground mt-1">
              Status: {currentGame.status}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};
