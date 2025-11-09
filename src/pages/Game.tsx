import { useState } from "react";
import { ChessBoard } from "@/components/ChessBoard";
import { WalletConnect } from "@/components/WalletConnect";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Gamepad2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGame } from "@/contexts/GameContext";
import { useWallet } from "@/contexts/WalletContext";

const Game = () => {
  const navigate = useNavigate();
  const { currentGame, createGame, isLoading } = useGame();
  const { wallet, isConnected, connect } = useWallet();
  const [opponentAddress, setOpponentAddress] = useState("");

  const handleCreateGame = async () => {
    if (!isConnected) {
      return;
    }
    const challengeAddress = opponentAddress.trim();
    await createGame(challengeAddress || undefined);
    if (challengeAddress) {
      setOpponentAddress("");
    }
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
              Please connect your MetaMask wallet to start playing chess on the blockchain.
            </p>
            <Button 
              variant="glow" 
              size="lg" 
              onClick={() => connect()}
            >
              Connect MetaMask
            </Button>
          </Card>
        ) : !currentGame ? (
          <Card className="glass-card p-12 text-center max-w-2xl mx-auto">
            <Gamepad2 className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-4">Start a New Game</h2>
            <p className="text-muted-foreground mb-6">
              Create a new chess game on Linera blockchain. Wait for an opponent or invite a friend!
            </p>
            <div className="space-y-4">
              <div className="text-left space-y-2">
                <label className="text-sm font-semibold text-muted-foreground">
                  Challenge an opponent (optional)
                </label>
                <Input
                  placeholder="Enter opponent wallet address"
                  value={opponentAddress}
                  onChange={(event) => setOpponentAddress(event.target.value)}
                  disabled={isLoading}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank to create an open challenge. Provide an address to directly invite that player.
                </p>
              </div>
              <Button 
              variant="glow" 
              size="lg" 
              onClick={handleCreateGame}
              disabled={isLoading}
            >
              {isLoading ? "Creating Game..." : "Create New Game"}
            </Button>
            </div>
          </Card>
        ) : (
          <ChessBoard />
        )}
      </main>
    </div>
  );
};

export default Game;
