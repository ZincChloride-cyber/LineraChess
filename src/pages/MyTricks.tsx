import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { toast } from "sonner";

const MyTricks = () => {
  const navigate = useNavigate();
  const [tricks, setTricks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyTricks();
  }, []);

  const fetchMyTricks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("tricks")
        .select("*")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTricks(data || []);
    } catch (error: any) {
      toast.error("Failed to load your strategies");
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
        <h1 className="text-4xl font-bold mb-8 text-glow">My Strategies</h1>

        {loading ? (
          <p>Loading...</p>
        ) : tricks.length === 0 ? (
          <Card className="glass-card text-center py-12">
            <CardContent>
              <p className="text-muted-foreground mb-4">You haven't listed any strategies yet</p>
              <Button variant="hero" onClick={() => navigate("/marketplace")}>
                Create Your First Strategy
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tricks.map((trick) => (
              <Card key={trick.id} className="glass-card">
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
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {trick.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Listed {new Date(trick.created_at).toLocaleDateString()}
                    </span>
                    <p className="text-xl font-bold text-primary">${trick.price}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyTricks;
