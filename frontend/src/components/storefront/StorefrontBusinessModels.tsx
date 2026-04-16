import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, Package, Gavel, Boxes, ArrowRight } from "lucide-react";

const models = [
  {
    icon: ShoppingBag,
    title: "Retail",
    desc: "Shop phones, tablets & accessories at the best prices with fast delivery across UAE.",
    link: "/search",
    cta: "Shop Now",
    gradient: "from-primary to-[hsl(200,80%,50%)]",
    iconBg: "bg-primary/15",
  },
  {
    icon: Package,
    title: "Wholesale",
    desc: "Bulk orders with up to 40% discount. B2B invoicing, NET terms & dedicated account manager.",
    link: "/wholesale",
    cta: "Get Quote",
    gradient: "from-[hsl(var(--success))] to-[hsl(var(--teal))]",
    iconBg: "bg-[hsl(var(--success)/0.15)]",
  },
  {
    icon: Gavel,
    title: "Auctions",
    desc: "Bid on premium devices at incredible prices. Live bidding with anti-snipe protection.",
    link: "/auctions",
    cta: "View Auctions",
    gradient: "from-[hsl(var(--warning))] to-[hsl(var(--accent))]",
    iconBg: "bg-[hsl(var(--warning)/0.15)]",
  },
  {
    icon: Boxes,
    title: "Dropshipping",
    desc: "Sell without inventory. We handle storage, fulfillment & shipping — you keep the margin.",
    link: "/dropshipping",
    cta: "Apply Now",
    gradient: "from-[hsl(var(--purple))] to-primary",
    iconBg: "bg-[hsl(var(--purple)/0.15)]",
  },
];

const StorefrontBusinessModels = () => {
  return (
    <section className="py-8 lg:py-14 section-cool">
      <div className="container">
        <div className="text-center mb-8">
          <h2 className="text-lg lg:text-2xl font-bold text-foreground tracking-tight">
            How Would You Like to Buy?
          </h2>
          <p className="text-xs lg:text-sm text-muted-foreground mt-1.5 max-w-md mx-auto">
            Choose the model that fits your business
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {models.map((model, i) => (
            <motion.div
              key={model.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
            >
              <Link
                to={model.link}
                className="group relative flex flex-col h-full rounded-2xl border border-border/60 bg-card overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
              >
                {/* Top gradient accent bar */}
                <div className={`h-1 w-full bg-gradient-to-r ${model.gradient}`} />

                <div className="flex flex-col flex-1 p-5 lg:p-6">
                  {/* Icon */}
                  <div className={`h-11 w-11 rounded-xl ${model.iconBg} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}>
                    <model.icon className="h-5 w-5 text-primary" />
                  </div>

                  {/* Title */}
                  <h3 className="text-sm lg:text-base font-bold text-foreground mb-2">
                    {model.title}
                  </h3>

                  {/* Description */}
                  <p className="text-[11px] lg:text-xs text-muted-foreground leading-relaxed mb-5 flex-1">
                    {model.desc}
                  </p>

                  {/* CTA */}
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary group-hover:gap-2 transition-all duration-300">
                    {model.cta}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StorefrontBusinessModels;
