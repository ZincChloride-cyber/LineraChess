import { ChessBoard } from "@/components/ChessBoard";
import { WalletConnect } from "@/components/WalletConnect";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Gamepad2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGame } from "@/contexts/GameContext";
import { useWallet } from "@/contexts/WalletContext";

const Game = () => {
  const navigate = useNavigate();
  const { currentGame, createGame, isLoading } = useGame();
  const { wallet, isConnected } = useWallet();

  const handleCreateGame = async () => {
    if (!isConnected) {
      return;
    }
    await createGame();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-background/80">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <Logo size="md" />
            </div>
            <WalletConnect />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {!isConnected ? (
          <Card className="glass-card p-12 text-center max-w-2xl mx-auto">
            <Gamepad2 className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-6">
              Please connect your Linera wallet to start playing chess on the blockchain.
            </p>
            <Button variant="glow" size="lg" onClick={() => {}}>
              Connect Wallet
            </Button>
          </Card>
        ) : !currentGame ? (
          <Card className="glass-card p-12 text-center max-w-2xl mx-auto">
            <Gamepad2 className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-4">Start a New Game</h2>
            <p className="text-muted-foreground mb-6">
              Create a new chess game on Linera blockchain. Wait for an opponent or invite a friend!
            </p>
            <Button 
              variant="glow" 
              size="lg" 
              onClick={handleCreateGame}
              disabled={isLoading}
            >
              {isLoading ? "Creating Game..." : "Create New Game"}
            </Button>
          </Card>
        ) : (
          <ChessBoard />
        )}
      </main>
    </div>
  );
};

export default Game;
