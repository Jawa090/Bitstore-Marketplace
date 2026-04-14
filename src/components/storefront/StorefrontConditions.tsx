import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ThumbsUp, RefreshCw, ShieldCheck, ArrowRight } from "lucide-react";
import { useStorefrontContent } from "@/hooks/useStorefrontContent";

interface ConditionCard {
  title: string;
  description: string;
  icon: string;
  link: string;
  color: string;
}

interface ConditionsData {
  title: string;
  subtitle: string;
  cards: ConditionCard[];
}

const fallback: ConditionsData = {
  title: "Shop by Condition",
  subtitle: "Every device is verified & graded by experts",
  cards: [
    { title: "Brand New", description: "Factory sealed, full warranty", icon: "sparkles", link: "/search?condition=new", color: "success" },
    { title: "Like New", description: "Flawless, no visible marks", icon: "thumbs-up", link: "/search?condition=used_like_new", color: "info" },
    { title: "Refurbished", description: "Professionally restored", icon: "refresh", link: "/search?condition=refurbished", color: "warning" },
    { title: "Certified Pre-Owned", description: "Tested & quality assured", icon: "shield", link: "/search?condition=used_good", color: "purple" },
  ],
};

const iconMap: Record<string, typeof Sparkles> = {
  sparkles: Sparkles,
  "thumbs-up": ThumbsUp,
  refresh: RefreshCw,
  shield: ShieldCheck,
};

const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
  success: { bg: "bg-success/10", text: "text-success", border: "border-success/20 hover:border-success/40" },
  info: { bg: "bg-info/10", text: "text-info", border: "border-info/20 hover:border-info/40" },
  warning: { bg: "bg-warning/10", text: "text-warning", border: "border-warning/20 hover:border-warning/40" },
  purple: { bg: "bg-purple/10", text: "text-purple", border: "border-purple/20 hover:border-purple/40" },
  accent: { bg: "bg-accent/10", text: "text-accent", border: "border-accent/20 hover:border-accent/40" },
  primary: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/20 hover:border-primary/40" },
};

const StorefrontConditions = () => {
  const { data } = useStorefrontContent<ConditionsData>("condition_showcase", fallback);
  if (!data?.is_active) return null;
  const content = data.content;

  return (
    <section className="py-8 lg:py-12 section-mint">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl lg:text-3xl font-bold mb-2">{content.title}</h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">{content.subtitle}</p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {content.cards.map((card, i) => {
            const Icon = iconMap[card.icon] || ShieldCheck;
            const colors = colorClasses[card.color] || colorClasses.primary;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <Link
                  to={card.link}
                  className={`group block p-6 rounded-2xl border bg-card transition-all duration-300 hover:-translate-y-1.5 card-elevated text-center ${colors.border}`}
                >
                  <div className={`inline-flex p-4 rounded-2xl mb-4 transition-transform duration-300 group-hover:scale-110 ${colors.bg}`}>
                    <Icon className={`h-8 w-8 ${colors.text}`} />
                  </div>
                  <h3 className="font-bold text-base mb-1.5">{card.title}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{card.description}</p>
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 ${colors.text}`}>
                    Shop Now <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StorefrontConditions;
