import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, Eye } from "lucide-react";
import { TrickDetailDialog } from "@/components/TrickDetailDialog";
import { toast } from "sonner";

const MyPurchases = () => {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState<any[]>([]);
  const [selectedTrick, setSelectedTrick] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("trick_purchases")
        .select(`
          *,
          tricks:trick_id (
            *,
            profiles:seller_id (username)
          )
        `)
        .eq("buyer_id", user.id)
        .order("purchased_at", { ascending: false });

      if (error) throw error;
      setPurchases(data || []);
    } catch (error: any) {
      toast.error("Failed to load your purchases");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="border-b border-primary/20 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/marketplace")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Marketplace
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-glow">My Purchases</h1>

        {loading ? (
          <p>Loading...</p>
        ) : purchases.length === 0 ? (
          <Card className="glass-card text-center py-12">
            <CardContent>
              <p className="text-muted-foreground mb-4">You haven't purchased any strategies yet</p>
              <Button variant="hero" onClick={() => navigate("/marketplace")}>
                Browse Marketplace
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {purchases.map((purchase) => (
              <Card key={purchase.id} className="glass-card">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge className="bg-primary/20 text-primary border-primary/50">
                      {purchase.tricks.category}
                    </Badge>
                    <div className="flex items-center gap-1 text-green-500">
                      <TrendingUp className="h-4 w-4" />
                      <span className="font-bold">{purchase.tricks.winning_rate}%</span>
                    </div>
                  </div>
                  <CardTitle className="text-xl">{purchase.tricks.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    by @{purchase.tricks.profiles.username}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      Purchased {new Date(purchase.purchased_at).toLocaleDateString()}
                    </span>
                    <Button
                      variant="glow"
                      size="sm"
                      onClick={() => setSelectedTrick(purchase.tricks)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {selectedTrick && (
        <TrickDetailDialog
          trick={selectedTrick}
          open={!!selectedTrick}
          onClose={() => setSelectedTrick(null)}
          onPurchaseComplete={fetchPurchases}
        />
      )}
    </div>
  );
};

export default MyPurchases;
