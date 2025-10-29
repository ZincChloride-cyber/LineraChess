import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WalletConnect } from "@/components/WalletConnect";
import { Trophy, Calendar, Clock, ArrowLeft, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Match {
  id: string;
  opponent: string;
  result: "win" | "loss" | "draw";
  date: string;
  moves: number;
  duration: string;
  chainId: string;
}

const mockMatches: Match[] = [
  {
    id: "1",
    opponent: "Player_0x742",
    result: "win",
    date: "2025-10-28",
    moves: 42,
    duration: "18:32",
    chainId: "chain_001",
  },
  {
    id: "2",
    opponent: "ChessMaster99",
    result: "loss",
    date: "2025-10-27",
    moves: 56,
    duration: "24:15",
    chainId: "chain_002",
  },
  {
    id: "3",
    opponent: "Queen_0x891",
    result: "draw",
    date: "2025-10-26",
    moves: 68,
    duration: "31:42",
    chainId: "chain_003",
  },
];

const MatchHistory = () => {
  const navigate = useNavigate();

  const getResultColor = (result: Match["result"]) => {
    switch (result) {
      case "win":
        return "bg-primary text-primary-foreground";
      case "loss":
        return "bg-destructive text-destructive-foreground";
      case "draw":
        return "bg-muted text-muted-foreground";
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
              <h1 className="text-2xl font-bold">
                <span className="text-primary">Match</span> History
              </h1>
            </div>
            <WalletConnect />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="glass-card p-6 text-center">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-3xl font-bold">12</p>
              <p className="text-sm text-muted-foreground">Total Wins</p>
            </Card>
            <Card className="glass-card p-6 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-secondary" />
              <p className="text-3xl font-bold">24h</p>
              <p className="text-sm text-muted-foreground">Play Time</p>
            </Card>
            <Card className="glass-card p-6 text-center">
              <Award className="w-8 h-8 mx-auto mb-2 text-accent" />
              <p className="text-3xl font-bold">1450</p>
              <p className="text-sm text-muted-foreground">Rating</p>
            </Card>
          </div>

          {/* Match List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Recent Matches</h2>
            {mockMatches.map((match) => (
              <Card key={match.id} className="glass-card p-6 hover:border-primary/50 transition-all cursor-pointer group">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                        vs {match.opponent}
                      </h3>
                      <Badge className={getResultColor(match.result)}>
                        {match.result.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {match.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {match.duration}
                      </div>
                      <div>
                        {match.moves} moves
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 font-mono">
                      Chain: {match.chainId}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Mint NFT
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MatchHistory;
