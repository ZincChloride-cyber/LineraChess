import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrickDetailDialog } from "@/components/TrickDetailDialog";
import { CreateTrickDialog } from "@/components/CreateTrickDialog";
import { Crown, LogOut, ShoppingCart, TrendingUp } from "lucide-react";
import { toast } from "sonner";

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
}

const Marketplace = () => {
  const navigate = useNavigate();
  const [tricks, setTricks] = useState<Trick[]>([]);
  const [selectedTrick, setSelectedTrick] = useState<Trick | null>(null);
  const [user, setUser] = useState<any>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    fetchTricks();
  }, []);

  const fetchTricks = async () => {
    const { data, error } = await supabase
      .from("tricks")
      .select(`
        *,
        profiles:seller_id (username)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load tricks");
      console.error(error);
    } else {
      setTricks(data || []);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="border-b border-primary/20 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-glow">Strategy Marketplace</h1>
          <div className="flex gap-2">
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
            <Button variant="ghost" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
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
                  <div className="flex items-center gap-1 text-green-500">
                    <TrendingUp className="h-4 w-4" />
                    <span className="font-bold">{trick.winning_rate}%</span>
                  </div>
                </div>
                <CardTitle className="text-xl">{trick.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {trick.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">by @{trick.profiles.username}</p>
                  </div>
                  <p className="text-2xl font-bold text-primary">${trick.price}</p>
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
