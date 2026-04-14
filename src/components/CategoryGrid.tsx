import { motion } from "framer-motion";
import { Smartphone, Headphones, Watch, Battery, Shield, Cable } from "lucide-react";

const categories = [
  { name: "Smartphones", icon: Smartphone, count: "2,400+" },
  { name: "Earbuds & Audio", icon: Headphones, count: "850+" },
  { name: "Smartwatches", icon: Watch, count: "620+" },
  { name: "Power Banks", icon: Battery, count: "340+" },
  { name: "Cases & Protection", icon: Shield, count: "1,200+" },
  { name: "Cables & Chargers", icon: Cable, count: "780+" },
];

const CategoryGrid = () => {
  return (
    <section className="py-16 lg:py-24">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl lg:text-4xl font-bold mb-3">Shop by Category</h2>
          <p className="text-muted-foreground">Find exactly what you need</p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, i) => (
            <motion.a
              key={cat.name}
              href="#"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className="flex flex-col items-center gap-3 p-6 rounded-xl border border-border bg-card hover:border-primary/40 transition-colors group"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <cat.icon className="h-6 w-6" />
              </div>
              <span className="font-semibold text-sm text-center">{cat.name}</span>
              <span className="text-xs text-muted-foreground">{cat.count} items</span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
