import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCollections } from "@/services/api/collection.service";
import { Skeleton } from "@/components/ui/skeleton";

const StorefrontCollections = () => {
  const { data: collections, isLoading } = useQuery({
    queryKey: ["collections"],
    queryFn: getCollections,
  });

  if (isLoading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container">
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!collections || collections.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Shop by Collection</h2>
            <p className="text-muted-foreground">
              Curated selections for every need
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {collections.map((collection, index) => (
            <motion.div
              key={collection.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={`/collection/${collection.slug}`}
                className="group block relative overflow-hidden rounded-xl border border-border bg-card hover:shadow-lg transition-all duration-300"
              >
                {/* Banner Image */}
                {collection.banner_url ? (
                  <div className="aspect-[16/9] overflow-hidden">
                    <img
                      src={collection.banner_url}
                      alt={collection.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="aspect-[16/9] bg-gradient-to-br from-primary/20 to-primary/5" />
                )}

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                    {collection.name}
                  </h3>
                  {collection.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {collection.description}
                    </p>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="group-hover:translate-x-1 transition-transform"
                  >
                    Explore
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StorefrontCollections;
