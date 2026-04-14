import { Link } from "react-router-dom";
import { useStorefrontContent } from "@/hooks/useStorefrontContent";

interface Brand {
  name: string;
  logo_url: string;
  link: string;
}

interface BrandsData {
  title: string;
  brands: Brand[];
}

const fallback: BrandsData = {
  title: "Shop by Brand",
  brands: [
    { name: "Apple", logo_url: "https://cdn.worldvectorlogo.com/logos/apple-14.svg", link: "/search?brand=Apple" },
    { name: "Samsung", logo_url: "https://cdn.worldvectorlogo.com/logos/samsung-8.svg", link: "/search?brand=Samsung" },
    { name: "Google", logo_url: "https://cdn.worldvectorlogo.com/logos/google-2015.svg", link: "/search?brand=Google" },
    { name: "Sony", logo_url: "https://cdn.worldvectorlogo.com/logos/sony-2.svg", link: "/search?brand=Sony" },
    { name: "OnePlus", logo_url: "https://cdn.worldvectorlogo.com/logos/oneplus-2.svg", link: "/search?brand=OnePlus" },
    { name: "Xiaomi", logo_url: "https://cdn.worldvectorlogo.com/logos/xiaomi-2.svg", link: "/search?brand=Xiaomi" },
    { name: "Huawei", logo_url: "https://cdn.worldvectorlogo.com/logos/huawei-2.svg", link: "/search?brand=Huawei" },
    { name: "Nothing", logo_url: "https://cdn.worldvectorlogo.com/logos/nothing-2.svg", link: "/search?brand=Nothing" },
    { name: "Lenovo", logo_url: "https://cdn.worldvectorlogo.com/logos/lenovo-2.svg", link: "/search?brand=Lenovo" },
    { name: "HP", logo_url: "https://cdn.worldvectorlogo.com/logos/hp-2012.svg", link: "/search?brand=HP" },
    { name: "Dell", logo_url: "https://cdn.worldvectorlogo.com/logos/dell-2.svg", link: "/search?brand=Dell" },
    { name: "JBL", logo_url: "https://cdn.worldvectorlogo.com/logos/jbl.svg", link: "/search?brand=JBL" },
    { name: "Asus", logo_url: "https://cdn.worldvectorlogo.com/logos/asus-13.svg", link: "/search?brand=Asus" },
    { name: "Acer", logo_url: "https://cdn.worldvectorlogo.com/logos/acer-2.svg", link: "/search?brand=Acer" },
    { name: "LG", logo_url: "https://cdn.worldvectorlogo.com/logos/lg-electronics-1.svg", link: "/search?brand=LG" },
    { name: "Microsoft", logo_url: "https://cdn.worldvectorlogo.com/logos/microsoft-6.svg", link: "/search?brand=Microsoft" },
    { name: "Bose", logo_url: "https://cdn.worldvectorlogo.com/logos/bose-3.svg", link: "/search?brand=Bose" },
    { name: "Marshall", logo_url: "https://cdn.worldvectorlogo.com/logos/marshall-amplification.svg", link: "/search?brand=Marshall" },
    { name: "Canon", logo_url: "https://cdn.worldvectorlogo.com/logos/canon-3.svg", link: "/search?brand=Canon" },
    { name: "DJI", logo_url: "https://cdn.worldvectorlogo.com/logos/dji-4.svg", link: "/search?brand=DJI" },
    { name: "Oppo", logo_url: "https://cdn.worldvectorlogo.com/logos/oppo-2.svg", link: "/search?brand=Oppo" },
    { name: "Vivo", logo_url: "https://cdn.worldvectorlogo.com/logos/vivo-2.svg", link: "/search?brand=Vivo" },
    { name: "Realme", logo_url: "https://cdn.worldvectorlogo.com/logos/realme-2.svg", link: "/search?brand=Realme" },
    { name: "Nokia", logo_url: "https://cdn.worldvectorlogo.com/logos/nokia-3.svg", link: "/search?brand=Nokia" },
    { name: "Motorola", logo_url: "https://cdn.worldvectorlogo.com/logos/motorola-2.svg", link: "/search?brand=Motorola" },
    { name: "Anker", logo_url: "https://cdn.worldvectorlogo.com/logos/anker.svg", link: "/search?brand=Anker" },
    { name: "Logitech", logo_url: "https://cdn.worldvectorlogo.com/logos/logitech-2.svg", link: "/search?brand=Logitech" },
    { name: "Razer", logo_url: "https://cdn.worldvectorlogo.com/logos/razer-2.svg", link: "/search?brand=Razer" },
    { name: "MSI", logo_url: "https://cdn.worldvectorlogo.com/logos/msi-3.svg", link: "/search?brand=MSI" },
    { name: "Corsair", logo_url: "https://cdn.worldvectorlogo.com/logos/corsair-2.svg", link: "/search?brand=Corsair" },
    { name: "Dyson", logo_url: "https://cdn.worldvectorlogo.com/logos/dyson-1.svg", link: "/search?brand=Dyson" },
    { name: "GoPro", logo_url: "https://cdn.worldvectorlogo.com/logos/gopro-2.svg", link: "/search?brand=GoPro" },
  ],
};

const StorefrontBrands = () => {
  const { data } = useStorefrontContent<BrandsData>("brand_showcase", fallback);
  if (!data?.is_active) return null;
  const content = data.content;

  return (
    <section className="py-5 lg:py-8 border-y border-border/20">
      <div className="container">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider shrink-0">{content.title}</span>
          <div className="h-px flex-1 bg-border/30" />
        </div>
        <div className="flex flex-wrap gap-2">
          {content.brands.map((brand) => (
            <Link
              key={brand.name}
              to={brand.link}
              className="inline-flex items-center justify-center h-9 px-4 rounded-lg border border-border/50 bg-card hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm transition-all group"
            >
              <span className="font-semibold text-[11px] text-muted-foreground group-hover:text-primary transition-colors whitespace-nowrap">
                {brand.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StorefrontBrands;
