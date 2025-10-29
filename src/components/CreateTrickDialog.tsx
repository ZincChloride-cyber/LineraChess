import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface CreateTrickDialogProps {
  open: boolean;
  onClose: () => void;
  onCreateComplete: () => void;
}

export const CreateTrickDialog = ({
  open,
  onClose,
  onCreateComplete,
}: CreateTrickDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    winning_rate: "",
    content: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create trick
      const { data: trick, error: trickError } = await supabase
        .from("tricks")
        .insert({
          seller_id: user.id,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          price: parseFloat(formData.price),
          winning_rate: parseFloat(formData.winning_rate),
        })
        .select()
        .single();

      if (trickError) throw trickError;

      // Create trick content
      const { error: contentError } = await supabase
        .from("trick_content")
        .insert({
          trick_id: trick.id,
          content: formData.content,
        });

      if (contentError) throw contentError;

      toast.success("Strategy listed successfully!");
      setFormData({
        title: "",
        description: "",
        category: "",
        price: "",
        winning_rate: "",
        content: "",
      });
      onClose();
      onCreateComplete();
    } catch (error: any) {
      toast.error(error.message || "Failed to create strategy");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl glass-card max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Sell Your Strategy</DialogTitle>
          <DialogDescription>
            Share your winning chess strategies with the community
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Aggressive King's Gambit Opening"
              required
              className="bg-background/50 border-primary/30"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief overview of your strategy..."
              required
              rows={3}
              className="bg-background/50 border-primary/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Opening, Middlegame"
                required
                className="bg-background/50 border-primary/30"
              />
            </div>

            <div>
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="9.99"
                required
                className="bg-background/50 border-primary/30"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="winning_rate">Winning Rate (%)</Label>
            <Input
              id="winning_rate"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={formData.winning_rate}
              onChange={(e) => setFormData({ ...formData, winning_rate: e.target.value })}
              placeholder="75.5"
              required
              className="bg-background/50 border-primary/30"
            />
          </div>

          <div>
            <Label htmlFor="content">Strategy Content (Confidential)</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Detailed strategy explanation, moves, variations..."
              required
              rows={8}
              className="bg-background/50 border-primary/30 font-mono"
            />
            <p className="text-xs text-muted-foreground mt-1">
              This content will only be visible after purchase
            </p>
          </div>

          <div className="flex gap-3">
            <Button type="submit" variant="hero" disabled={loading} className="flex-1">
              {loading ? "Creating..." : "List Strategy"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
