import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStorefrontContent } from "@/hooks/useStorefrontContent";

interface PromoData {
  title: string;
  subtitle: string;
  cta_text: string;
  cta_link: string;
  suggestions: string[];
}

const fallback: PromoData = {
  title: "Not sure which device is right for you?",
  subtitle: "Our AI assistant helps you find the perfect device",
  cta_text: "Try BitBot AI",
  cta_link: "#bitbot",
  suggestions: ["Best for photography", "Gaming phones under 2000 AED", "Long battery life"],
};

const StorefrontPromoBanner = () => {
  const { data } = useStorefrontContent<PromoData>("promo_banner", fallback);
  if (!data?.is_active) return null;
  const content = data.content;

  return (
    <section className="py-6 lg:py-10">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-2xl overflow-hidden p-8 lg:p-16"
          style={{ background: "var(--gradient-card)" }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5" />
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent" />

          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-6">
              <Sparkles className="h-4 w-4" />
              AI Tech Assistant
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              {content.title}
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">{content.subtitle}</p>

            {content.suggestions?.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-8">
                {content.suggestions.map((q) => (
                  <span key={q} className="px-4 py-2 rounded-full bg-secondary border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 cursor-pointer transition-colors">
                    "{q}"
                  </span>
                ))}
              </div>
            )}

            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground glow">
              {content.cta_text || "Try AI Assistant"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default StorefrontPromoBanner;
