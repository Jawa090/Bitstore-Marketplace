import { Gavel, Radio, ArrowRight, Timer, Users } from "lucide-react";
import { Link } from "react-router-dom";

const StorefrontAuctions = () => {
  // No live auctions in mock mode
  return (
    <section className="py-6 lg:py-10">
      <div className="container">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="relative h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Gavel className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <h2 className="text-base lg:text-lg font-bold">Live Auctions</h2>
              <p className="text-[11px] text-muted-foreground">Bid on premium devices at incredible prices</p>
            </div>
          </div>
          <Link to="/auctions" className="flex items-center gap-1 text-primary text-[11px] font-semibold group">
            View All <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="rounded-xl border border-dashed border-border bg-card/50 p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex-1 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 bg-destructive/10 rounded-full px-3 py-1 text-xs text-destructive font-medium mb-3">
                <Timer className="h-3 w-3" /> Coming Soon
              </div>
              <h3 className="text-sm font-bold mb-1">No live auctions right now</h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                Bid on premium phones and accessories at incredible prices. Check back soon!
              </p>
            </div>
            <div className="flex flex-col gap-2 shrink-0 w-full sm:w-auto sm:max-w-[240px]">
              {[
                { icon: Gavel, title: "Place Bids", desc: "Quick-bid +50, +100, +500" },
                { icon: Radio, title: "Real-time Updates", desc: "Live bid feed" },
                { icon: Users, title: "Anti-Snipe", desc: "Auto-extends timer" },
              ].map((step) => (
                <div key={step.title} className="flex items-center gap-2.5 rounded-lg border border-border bg-background p-2.5">
                  <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                    <step.icon className="h-3 w-3 text-primary" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold">{step.title}</p>
                    <p className="text-[9px] text-muted-foreground">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StorefrontAuctions;
