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

  useEffect(() => {
    if (open && trick) {
      checkAccess();
    }
  }, [open, trick]);

  const checkAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Check if user is the seller
    if (user.id === trick.seller_id) {
      setIsOwner(true);
      await loadContent();
      return;
    }

    // Check if user purchased this trick
    const { data: purchase } = await supabase
      .from("trick_purchases")
      .select("*")
      .eq("trick_id", trick.id)
      .eq("buyer_id", user.id)
      .single();

    if (purchase) {
      setPurchased(true);
      await loadContent();
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
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("trick_purchases")
        .insert({
          trick_id: trick.id,
          buyer_id: user.id,
        });

      if (error) throw error;

      toast.success("Strategy purchased successfully!");
      setPurchased(true);
      await loadContent();
      onPurchaseComplete();
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
            <div className="flex items-center gap-2 text-green-500">
              <TrendingUp className="h-5 w-5" />
              <span className="text-xl font-bold">{trick.winning_rate}% Win Rate</span>
            </div>
          </div>
          <DialogTitle className="text-2xl">{trick.title}</DialogTitle>
          <DialogDescription className="text-base">
            by @{trick.profiles.username}
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
                <pre className="whitespace-pre-wrap font-mono text-sm">{content}</pre>
              </div>
            ) : (
              <div className="bg-card/30 border border-primary/20 rounded-lg p-6 text-center">
                <Lock className="h-12 w-12 mx-auto mb-3 text-primary/50" />
                <p className="text-muted-foreground mb-4">
                  Purchase this strategy to reveal the full content
                </p>
                <div className="flex flex-col items-center gap-3">
                  <p className="text-3xl font-bold text-primary">${trick.price}</p>
                  <Button
                    variant="hero"
                    size="lg"
                    onClick={handlePurchase}
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "Purchase Now"}
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
