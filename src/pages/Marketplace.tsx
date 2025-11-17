import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrickDetailDialog } from "@/components/TrickDetailDialog";
import { CreateTrickDialog } from "@/components/CreateTrickDialog";
import { Crown, ShoppingCart, TrendingUp, Wallet } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { WalletConnect } from "@/components/WalletConnect";

interface Trick {
  id: string;
  title: string;
  description: string;
  price: number;
  winning_rate: number;
  category: string;
  seller_id: string;
  profiles: {
    username: string;
  };
  chance_of_success?: number; // Dummy field for chance of success
}

const Marketplace = () => {
  const navigate = useNavigate();
  const [tricks, setTricks] = useState<Trick[]>([]);
  const [selectedTrick, setSelectedTrick] = useState<Trick | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { wallet, isConnected, isLoading: walletLoading } = useWallet();

  // Removed toast notification - the wallet connect screen is sufficient

  useEffect(() => {
    fetchTricks();
  }, []);

  const fetchTricks = async () => {
    // Try to fetch real tricks from Supabase (optional, won't break if it fails)
    let realTricks: Trick[] = [];
    try {
      const { data, error } = await supabase
        .from("tricks")
        .select(`
          *,
          profiles:seller_id (username)
        `)
        .order("created_at", { ascending: false });

      if (!error && data) {
        realTricks = data;
      }
    } catch (error) {
      console.warn("Could not fetch tricks from database:", error);
      // Continue with dummy tricks only
    }

    // Add dummy courses and moves playlists
    const dummyTricks: Trick[] = [
        {
          id: "dummy-course-1",
          title: "Master the Sicilian Defense - Complete Course",
          description: "Learn the most aggressive opening in chess. This comprehensive course covers all major variations, traps, and tactical patterns. Perfect for intermediate to advanced players.",
          price: 49.99,
          winning_rate: 78.5,
          category: "Course",
          seller_id: "dummy-seller-1",
          profiles: { username: "GrandmasterPro" },
          chance_of_success: 85,
        },
        {
          id: "dummy-course-2",
          title: "Endgame Mastery: From Basics to Advanced",
          description: "Master the art of endgames with this step-by-step course. Learn king and pawn endgames, rook endgames, and complex positions. Includes 50+ practice positions.",
          price: 39.99,
          winning_rate: 82.3,
          category: "Course",
          seller_id: "dummy-seller-2",
          profiles: { username: "ChessAcademy" },
          chance_of_success: 88,
        },
        {
          id: "dummy-course-3",
          title: "Tactical Patterns: 1000+ Puzzles Collection",
          description: "Sharpen your tactical vision with this massive collection of puzzles. Organized by theme: pins, forks, skewers, discovered attacks, and more. Progress tracking included.",
          price: 29.99,
          winning_rate: 75.8,
          category: "Course",
          seller_id: "dummy-seller-3",
          profiles: { username: "TacticsMaster" },
          chance_of_success: 80,
        },
        {
          id: "dummy-playlist-1",
          title: "World Championship Winning Moves",
          description: "A curated playlist of the most brilliant moves from World Championship matches. Study how the greatest players think and execute winning combinations.",
          price: 19.99,
          winning_rate: 90.2,
          category: "Moves Playlist",
          seller_id: "dummy-seller-4",
          profiles: { username: "ChampionsArchive" },
          chance_of_success: 92,
        },
        {
          id: "dummy-playlist-2",
          title: "Killer Opening Traps - 50 Devastating Lines",
          description: "Learn 50 opening traps that can win games in under 20 moves. Each trap includes setup, execution, and how to avoid falling into it. Perfect for rapid chess.",
          price: 24.99,
          winning_rate: 68.7,
          category: "Moves Playlist",
          seller_id: "dummy-seller-5",
          profiles: { username: "TrapMaster" },
          chance_of_success: 72,
        },
        {
          id: "dummy-playlist-3",
          title: "Magnus Carlsen's Best Moves Collection",
          description: "Study 100 of Magnus Carlsen's most brilliant moves. Each move is annotated with explanations of the thought process and alternative options.",
          price: 34.99,
          winning_rate: 88.9,
          category: "Moves Playlist",
          seller_id: "dummy-seller-6",
          profiles: { username: "CarlsenFan" },
          chance_of_success: 90,
        },
        {
          id: "dummy-course-4",
          title: "Positional Chess: Understanding the Game",
          description: "Learn to evaluate positions, plan long-term strategies, and understand when to attack or defend. This course transforms how you think about chess.",
          price: 44.99,
          winning_rate: 81.4,
          category: "Course",
          seller_id: "dummy-seller-7",
          profiles: { username: "PositionalGuru" },
          chance_of_success: 86,
        },
        {
          id: "dummy-playlist-4",
          title: "Blitz Chess Speed Tactics",
          description: "Master rapid decision-making with this playlist of time-pressure tactics. Learn to spot winning moves quickly and avoid blunders under time pressure.",
          price: 17.99,
          winning_rate: 73.6,
          category: "Moves Playlist",
          seller_id: "dummy-seller-8",
          profiles: { username: "BlitzKing" },
          chance_of_success: 76,
        },
      ];

      // Combine real tricks with dummy tricks
      const allTricks = [...realTricks, ...dummyTricks];
      setTricks(allTricks);
  };

  // Allow browsing marketplace without wallet, but show wallet connect prompt
  // Wallet is only required for purchases

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="border-b border-primary/20 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-glow">Strategy Marketplace</h1>
          <div className="flex gap-2 items-center">
            {!isConnected && (
              <div className="mr-4">
                <WalletConnect />
              </div>
            )}
            {wallet && (
              <div className="mr-4 text-sm text-muted-foreground">
                {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
              </div>
            )}
            {isConnected && (
              <>
                <Button variant="outline" onClick={() => navigate("/my-tricks")}>
                  <Crown className="mr-2 h-4 w-4" />
                  My Tricks
                </Button>
                <Button variant="outline" onClick={() => navigate("/my-purchases")}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Purchases
                </Button>
                <Button variant="glow" onClick={() => setCreateDialogOpen(true)}>
                  Sell Strategy
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => navigate("/")}>
              Home
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-2 text-glow">Chess Strategies for Sale</h2>
          <p className="text-muted-foreground">
            Discover winning strategies from top players. Content is revealed only after purchase.
          </p>
          {!isConnected && (
            <div className="mt-4 p-4 bg-primary/10 border border-primary/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Wallet className="h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">
                  Connect your wallet to purchase strategies and create your own listings.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tricks.map((trick) => (
            <Card
              key={trick.id}
              className="glass-card hover:shadow-[0_0_30px_hsl(var(--primary)/0.3)] transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedTrick(trick)}
            >
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge className="bg-primary/20 text-primary border-primary/50">
                    {trick.category}
                  </Badge>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1 text-green-500">
                      <TrendingUp className="h-4 w-4" />
                      <span className="font-bold">{trick.winning_rate}%</span>
                    </div>
                    {trick.chance_of_success !== undefined && (
                      <div className="flex items-center gap-1 text-blue-400">
                        <span className="text-xs font-semibold">Success Rate:</span>
                        <span className="text-sm font-bold">{trick.chance_of_success}%</span>
                      </div>
                    )}
                  </div>
                </div>
                <CardTitle className="text-xl">{trick.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {trick.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">by @{trick.profiles.username}</p>
                    </div>
                    <p className="text-2xl font-bold text-primary">${trick.price}</p>
                  </div>
                  {trick.chance_of_success !== undefined && (
                    <div className="mt-2 pt-2 border-t border-primary/20">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Chance of Success:</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-primary/20 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all"
                              style={{ width: `${trick.chance_of_success}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold text-blue-400">{trick.chance_of_success}%</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {selectedTrick && (
        <TrickDetailDialog
          trick={selectedTrick}
          open={!!selectedTrick}
          onClose={() => setSelectedTrick(null)}
          onPurchaseComplete={fetchTricks}
        />
      )}

      <CreateTrickDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreateComplete={fetchTricks}
      />
    </div>
  );
};

export default Marketplace;
