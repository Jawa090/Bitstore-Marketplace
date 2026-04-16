import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight, Gift, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStorefrontContent } from "@/hooks/useStorefrontContent";
import { toast } from "sonner";

interface NewsletterData {
  title: string;
  subtitle: string;
  cta_text: string;
}

const fallback: NewsletterData = {
  title: "Get 10% OFF Your First Order",
  subtitle: "Subscribe for exclusive deals, new arrivals & price drop alerts. No spam, unsubscribe anytime.",
  cta_text: "Subscribe",
};

const StorefrontNewsletter = () => {
  const { data } = useStorefrontContent<NewsletterData>("newsletter", fallback);
  const [email, setEmail] = useState("");

  if (!data?.is_active) return null;
  const content = data.content;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success("Thanks for subscribing! Check your email for your 10% discount code 🎉");
    setEmail("");
  };

  return (
    <section className="py-10 lg:py-14">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden p-8 lg:p-16"
          style={{ background: "linear-gradient(135deg, hsl(222 47% 11%) 0%, hsl(217 50% 18%) 50%, hsl(265 40% 20%) 100%)" }}
        >
          {/* Background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" style={{ background: "hsl(217 91% 60% / 0.15)" }} />
            <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" style={{ background: "hsl(265 70% 58% / 0.1)" }} />
          </div>

          <div className="relative z-10 max-w-xl mx-auto text-center">
            <div className="inline-flex p-3 rounded-2xl mb-5" style={{ background: "hsl(var(--warning) / 0.2)" }}>
              <Gift className="h-7 w-7 text-warning" />
            </div>
            <h2 className="text-2xl lg:text-4xl font-bold text-white mb-3">{content.title}</h2>
            <p className="text-white/60 text-sm mb-8 max-w-md mx-auto">{content.subtitle}</p>

            <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
              <div className="relative flex-1">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 rounded-xl bg-white text-foreground border-0 shadow-lg placeholder:text-muted-foreground"
                  required
                />
              </div>
              <Button type="submit" className="h-12 px-6 rounded-xl font-semibold shadow-lg shrink-0" style={{ background: "var(--gradient-warm)", color: "white" }}>
                {content.cta_text || "Subscribe"}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </form>

            <p className="text-white/30 text-xs mt-4 flex items-center justify-center gap-1">
              <Sparkles className="h-3 w-3" />
              Join 25,000+ subscribers · No spam ever
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default StorefrontNewsletter;
