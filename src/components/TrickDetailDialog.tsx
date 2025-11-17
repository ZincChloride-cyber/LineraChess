import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Lock, TrendingUp, Crown } from "lucide-react";
import { toast } from "sonner";
import { useWallet } from "@/contexts/WalletContext";

interface TrickDetailDialogProps {
  trick: any;
  open: boolean;
  onClose: () => void;
  onPurchaseComplete: () => void;
}

export const TrickDetailDialog = ({
  trick,
  open,
  onClose,
  onPurchaseComplete,
}: TrickDetailDialogProps) => {
  const [content, setContent] = useState<string | null>(null);
  const [purchased, setPurchased] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const { wallet, isConnected } = useWallet();
  const isDummy = trick?.id?.startsWith("dummy-");

  useEffect(() => {
    if (open && trick) {
      if (isDummy) {
        // For dummy tricks, show content immediately
        setPurchased(true);
        loadDummyContent();
      } else {
        checkAccess();
      }
    }
  }, [open, trick]);

  const loadDummyContent = () => {
    // Generate dummy content based on the trick
    const dummyContents: Record<string, string> = {
      "dummy-course-1": `SICILIAN DEFENSE - COMPLETE COURSE

Module 1: Introduction to Sicilian Defense
- Understanding the basic principles
- When to play the Sicilian
- Common responses and variations

Module 2: Najdorf Variation
- Main line: 1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 a6
- Key ideas and plans
- Tactical patterns and traps

Module 3: Dragon Variation
- Setup and development
- Yugoslav Attack
- Endgame considerations

Module 4: Scheveningen Variation
- Positional understanding
- Typical pawn structures
- Piece placement

Module 5: Advanced Tactics
- Complex combinations
- Calculation techniques
- Time management

This course includes 50+ annotated games and 200+ practice positions.`,
      "dummy-course-2": `ENDGAME MASTERY COURSE

Part 1: Basic Endgames
- King and Pawn vs King
- Opposition and triangulation
- Key squares and critical squares

Part 2: Rook Endgames
- Lucena position
- Philidor position
- Rook and pawn vs rook

Part 3: Complex Endgames
- Bishop vs Knight
- Queen endgames
- Multiple piece endgames

Part 4: Practical Endgames
- Converting advantages
- Defensive techniques
- Time trouble management

Includes 50+ interactive positions with solutions.`,
      "dummy-course-3": `TACTICAL PATTERNS - 1000+ PUZZLES

Theme 1: Pins (150 puzzles)
- Absolute pins
- Relative pins
- Breaking pins

Theme 2: Forks (200 puzzles)
- Knight forks
- Pawn forks
- Queen forks

Theme 3: Skewers (150 puzzles)
- Rook skewers
- Bishop skewers
- Queen skewers

Theme 4: Discovered Attacks (200 puzzles)
- Discovered checks
- Discovered attacks
- Double attacks

Theme 5: Deflection & Decoy (150 puzzles)
Theme 6: Overloading (100 puzzles)
Theme 7: Back Rank (50 puzzles)

All puzzles are rated by difficulty with detailed solutions.`,
      "dummy-playlist-1": `WORLD CHAMPIONSHIP WINNING MOVES

Move 1: Kasparov's Immortal (1985)
- Position: Kasparov vs Karpov
- Move: 25. Rxf7!
- Analysis: Sacrificing the rook to expose the king

Move 2: Fischer's Brilliancy (1972)
- Position: Fischer vs Spassky
- Move: 17. Bxh7+
- Analysis: Classic bishop sacrifice

Move 3: Carlsen's Endgame Masterpiece (2013)
- Position: Carlsen vs Anand
- Move: 45. h4!
- Analysis: Creating a passed pawn

...and 97 more brilliant moves from World Championship history.

Each move includes:
- Full game context
- Alternative options
- Why this move is best
- Learning points`,
      "dummy-playlist-2": `KILLER OPENING TRAPS

Trap 1: Legal's Mate
- Setup: 1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6 4.Ng5 d5 5.exd5 Na5 6.Bb5+ c6 7.dxc6 bxc6 8.Be2 h6 9.Nf3 e4 10.Ne5 Qd4 11.Nxf7 Qxf2#
- When to use: Against inexperienced players
- How to avoid: Develop pieces safely

Trap 2: Scholar's Mate
- Setup: 1.e4 e5 2.Qf3 Nc6 3.Bc4 Bc5 4.Qxf7#
- When to use: Rapid games
- How to avoid: Defend f7 square

...and 48 more devastating traps.

Each trap includes:
- Full move sequence
- Setup requirements
- Counter-traps
- When to use it`,
      "dummy-playlist-3": `MAGNUS CARLSEN'S BEST MOVES

Move 1: The Immortal Endgame (2019)
- Game: Carlsen vs Caruana
- Move: 36. Rc8!
- Why it's brilliant: Forcing zugzwang

Move 2: Tactical Masterpiece (2016)
- Game: Carlsen vs Karjakin
- Move: 23. Nxf7!
- Why it's brilliant: Multiple threats

Move 3: Positional Genius (2020)
- Game: Carlsen vs Nepomniachtchi
- Move: 18. b4!
- Why it's brilliant: Long-term advantage

...and 97 more moves from the World Champion.

Each move includes:
- Full game analysis
- Thought process
- Alternative moves
- Learning insights`,
      "dummy-course-4": `POSITIONAL CHESS COURSE

Chapter 1: Understanding Positional Play
- What is positional chess?
- Key concepts: space, time, structure
- When to play positionally vs tactically

Chapter 2: Pawn Structures
- Isolated pawns
- Doubled pawns
- Passed pawns
- Pawn chains

Chapter 3: Piece Placement
- Good vs bad bishops
- Knight outposts
- Rook placement
- Queen activity

Chapter 4: Planning
- How to create plans
- Long-term vs short-term
- Adapting to opponent's plans

Chapter 5: Evaluation
- Assessing positions
- Converting advantages
- Defending difficult positions

Includes 30+ annotated games and 100+ exercises.`,
      "dummy-playlist-4": `BLITZ CHESS SPEED TACTICS

Tactic 1: Quick Checkmate Patterns
- Pattern recognition in 2 seconds
- Common mating nets
- When to look for mate

Tactic 2: Time-Pressure Tactics
- Simplifying when ahead
- Complicating when behind
- Flag management

Tactic 3: Rapid Calculation
- Candidate moves
- Quick evaluation
- Pattern matching

...and 47 more time-pressure tactics.

Each tactic includes:
- Time to spot
- Success rate
- When to use
- Practice positions`,
    };
    setContent(dummyContents[trick.id] || "This is a demo course/playlist. Content would be available after purchase.");
  };

  const checkAccess = async () => {
    if (!wallet || !isConnected) return;

    // For dummy tricks, check if wallet address matches seller (using wallet address as identifier)
    if (isDummy) {
      // Dummy tricks don't have real ownership, so we'll just show content
      return;
    }

    // For real tricks, try to check ownership using wallet address
    // Note: This assumes seller_id might be a wallet address or we need to map it
    // For now, we'll try to check purchases using wallet address
    try {
      // Check if user purchased this trick (using wallet address)
      // Note: This requires database schema changes to use wallet addresses
      // For now, we'll try to use Supabase if available, otherwise skip
      const { data: purchase } = await supabase
        .from("trick_purchases")
        .select("*")
        .eq("trick_id", trick.id)
        .single();

      if (purchase) {
        setPurchased(true);
        await loadContent();
      }
    } catch (error) {
      // If Supabase is not available or schema doesn't match, continue without purchase check
      console.warn("Could not check purchase status:", error);
    }
  };

  const loadContent = async () => {
    const { data, error } = await supabase
      .from("trick_content")
      .select("content")
      .eq("trick_id", trick.id)
      .single();

    if (error) {
      console.error("Error loading content:", error);
    } else if (data) {
      setContent(data.content);
    }
  };

  const handlePurchase = async () => {
    if (isDummy) {
      toast.info("This is a demo item. Real purchases will be available for actual listings.");
      return;
    }

    if (!wallet || !isConnected) {
      toast.error("Please connect your wallet to make a purchase");
      return;
    }

    setLoading(true);
    try {
      // For real purchases, we would need to:
      // 1. Process payment via blockchain
      // 2. Record purchase in database using wallet address
      // For now, show a message that this feature requires database updates
      toast.info("Purchase functionality requires database integration with wallet addresses. This is a demo marketplace.");
      
      // Uncomment below when database is updated to use wallet addresses:
      /*
      const { error } = await supabase
        .from("trick_purchases")
        .insert({
          trick_id: trick.id,
          buyer_address: wallet.address, // Assuming column name is buyer_address
        });

      if (error) throw error;

      toast.success("Strategy purchased successfully!");
      setPurchased(true);
      await loadContent();
      onPurchaseComplete();
      */
    } catch (error: any) {
      toast.error(error.message || "Failed to purchase strategy");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl glass-card">
        <DialogHeader>
          <div className="flex items-start justify-between mb-2">
            <Badge className="bg-primary/20 text-primary border-primary/50">
              {trick.category}
            </Badge>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2 text-green-500">
                <TrendingUp className="h-5 w-5" />
                <span className="text-xl font-bold">{trick.winning_rate}% Win Rate</span>
              </div>
              {trick.chance_of_success !== undefined && (
                <div className="flex items-center gap-2 text-blue-400">
                  <span className="text-sm font-semibold">Success Rate:</span>
                  <span className="text-lg font-bold">{trick.chance_of_success}%</span>
                </div>
              )}
            </div>
          </div>
          <DialogTitle className="text-2xl">{trick.title}</DialogTitle>
          <DialogDescription className="text-base">
            by @{trick.profiles.username}
            {isDummy && <span className="ml-2 text-xs text-muted-foreground">(Demo)</span>}
          </DialogDescription>
        </DialogHeader>

        <Separator className="my-4" />

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground">{trick.description}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              Strategy Content
              {!purchased && !isOwner && <Lock className="h-4 w-4" />}
            </h3>
            {purchased || isOwner ? (
              <div className="bg-card/50 border border-primary/30 rounded-lg p-4">
                {isDummy && (
                  <div className="mb-3 p-2 bg-blue-500/10 border border-blue-500/30 rounded text-xs text-blue-400">
                    This is a demo preview. Full content would be available after purchase.
                  </div>
                )}
                <pre className="whitespace-pre-wrap font-mono text-sm">{content}</pre>
              </div>
            ) : (
              <div className="bg-card/30 border border-primary/20 rounded-lg p-6 text-center">
                <Lock className="h-12 w-12 mx-auto mb-3 text-primary/50" />
                <p className="text-muted-foreground mb-4">
                  Purchase this strategy to reveal the full content
                </p>
                {trick.chance_of_success !== undefined && (
                  <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Chance of Success:</span>
                      <span className="text-lg font-bold text-blue-400">{trick.chance_of_success}%</span>
                    </div>
                    <div className="w-full h-2 bg-primary/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all"
                        style={{ width: `${trick.chance_of_success}%` }}
                      />
                    </div>
                  </div>
                )}
                <div className="flex flex-col items-center gap-3">
                  <p className="text-3xl font-bold text-primary">${trick.price}</p>
                  <Button
                    variant="hero"
                    size="lg"
                    onClick={handlePurchase}
                    disabled={loading || isDummy}
                  >
                    {isDummy ? "Demo Item" : loading ? "Processing..." : "Purchase Now"}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {isOwner && (
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              <p className="text-sm">You own this strategy</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
