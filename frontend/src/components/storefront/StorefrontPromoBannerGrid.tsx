import { Link } from "react-router-dom";
import { mockPromoBanners } from "@/data/mockData";
import { ArrowRight } from "lucide-react";

const StorefrontPromoBannerGrid = () => {
  const banners = mockPromoBanners.slice(0, 3);
  if (banners.length === 0) return null;

  return (
    <section className="py-5 lg:py-8">
      <div className="container">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {banners.map((banner) => (
            <Link key={banner.id} to={banner.link_url || "/search"}
              className="group relative overflow-hidden rounded-xl h-36 sm:h-40 lg:h-44 transition-all hover:shadow-lg"
              style={{ backgroundColor: banner.bg_color || "hsl(var(--primary))" }}
            >
              {banner.image_url && (
                <img src={banner.image_url} alt={banner.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
              <div className="relative z-10 h-full flex flex-col justify-end p-4 lg:p-5">
                <h3 className="font-bold text-sm lg:text-base leading-tight mb-1 line-clamp-2" style={{ color: banner.text_color || "#ffffff" }}>
                  {banner.title}
                </h3>
                {banner.subtitle && (
                  <p className="text-[11px] opacity-80 line-clamp-1 mb-2" style={{ color: banner.text_color || "#ffffff" }}>{banner.subtitle}</p>
                )}
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold group-hover:gap-1.5 transition-all" style={{ color: banner.text_color || "#ffffff" }}>
                  Shop Now <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StorefrontPromoBannerGrid;
