import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WalletConnect } from "@/components/WalletConnect";
import { Logo } from "@/components/Logo";
import { Zap, Users, Shield, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-chess.jpg";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-background/80">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Logo size="md" />
            <nav className="hidden md:flex items-center gap-6">
              <Button variant="ghost" onClick={() => navigate("/history")}>
                History
              </Button>
              <Button variant="glow" onClick={() => navigate("/marketplace")}>
                Marketplace
              </Button>
              <WalletConnect />
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
        
        <div className="container mx-auto px-4 py-24 md:py-32 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-slide-up">
            <div className="inline-block mb-4">
              <Badge className="bg-primary/20 text-primary border-primary/50 px-4 py-2 text-sm font-semibold">
                <Sparkles className="w-4 h-4 inline mr-2" />
                Powered by Linera Microchains
              </Badge>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Onchain Chess
              <br />
              <span className="text-primary text-glow">Real-Time Web3 Gameplay</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              A million games. Zero lag. 100% onchain.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                variant="hero" 
                size="lg"
                onClick={() => navigate("/game")}
                className="text-lg px-8"
              >
                Play Now
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate("/game")}
                className="text-lg px-8"
              >
                Create Game
              </Button>
            </div>

            <p className="text-sm text-muted-foreground pt-2">
              No accounts. No delays. Just pure onchain chess.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="glass-card p-8 text-center group hover:border-primary/50 transition-all">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
            <p className="text-muted-foreground">
              Instant move verification with Linera's parallel execution
            </p>
          </Card>

          <Card className="glass-card p-8 text-center group hover:border-secondary/50 transition-all">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-8 h-8 text-secondary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Truly P2P</h3>
            <p className="text-muted-foreground">
              Direct player-to-player gameplay without servers
            </p>
          </Card>

          <Card className="glass-card p-8 text-center group hover:border-accent/50 transition-all">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Shield className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Fully Verifiable</h3>
            <p className="text-muted-foreground">
              Every move is cryptographically secured onchain
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="glass-card p-12 text-center max-w-3xl mx-auto border-primary/30">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to play the future of chess?
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Join thousands of players already experiencing real-time onchain gameplay
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="hero" 
              size="lg"
              onClick={() => navigate("/game")}
            >
              Start Playing
            </Button>
            <Button 
              variant="glow" 
              size="lg"
              onClick={() => navigate("/marketplace")}
            >
              Strategy Marketplace
            </Button>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Built on Linera • Fully decentralized • Open source
            </p>
            <div className="flex gap-4">
              <Button variant="ghost" size="sm">Docs</Button>
              <Button variant="ghost" size="sm">GitHub</Button>
              <Button variant="ghost" size="sm">Discord</Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
