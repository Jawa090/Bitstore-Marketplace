import { Link } from "react-router-dom";
import { useStorefrontContent } from "@/hooks/useStorefrontContent";

interface Brand {
  name: string;
  link: string;
  svg: string;
  hoverColor?: string;
}

interface BrandsData {
  title: string;
  brands: Brand[];
}

const fallback: BrandsData = {
  title: "Shop by Brand",
  brands: [
    {
      name: "Apple",
      link: "/search?brand=Apple",
      hoverColor: "group-hover:fill-gray-800 dark:group-hover:fill-white",
      svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>`
    },
    {
      name: "Samsung",
      link: "/search?brand=Samsung",
      hoverColor: "group-hover:fill-blue-600",
      svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22.27 12.357c0 .837-.728 1.516-1.625 1.516-.897 0-1.625-.679-1.625-1.516s.728-1.516 1.625-1.516c.897 0 1.625.679 1.625 1.516zM7.654 14.615c-.897 0-1.625-.679-1.625-1.516s.728-1.516 1.625-1.516c.897 0 1.625.679 1.625 1.516s-.728 1.516-1.625 1.516zm6.491-3.032c-.897 0-1.625-.679-1.625-1.516s.728-1.516 1.625-1.516c.897 0 1.625.679 1.625 1.516s-.728 1.516-1.625 1.516z"/></svg>`
    },
    {
      name: "Google",
      link: "/search?brand=Google",
      hoverColor: "group-hover:fill-blue-500",
      svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>`
    },
    {
      name: "Sony",
      link: "/search?brand=Sony",
      hoverColor: "group-hover:fill-black dark:group-hover:fill-white",
      svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8.5 8.64c-1.28 0-2.32 1.04-2.32 2.32v2.08c0 1.28 1.04 2.32 2.32 2.32s2.32-1.04 2.32-2.32v-2.08c0-1.28-1.04-2.32-2.32-2.32zm7 0c-1.28 0-2.32 1.04-2.32 2.32v2.08c0 1.28 1.04 2.32 2.32 2.32s2.32-1.04 2.32-2.32v-2.08c0-1.28-1.04-2.32-2.32-2.32z"/></svg>`
    },
    {
      name: "OnePlus",
      link: "/search?brand=OnePlus",
      hoverColor: "group-hover:fill-red-500",
      svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`
    },
    {
      name: "Xiaomi",
      link: "/search?brand=Xiaomi",
      hoverColor: "group-hover:fill-orange-500",
      svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`
    },
    {
      name: "Huawei",
      link: "/search?brand=Huawei",
      hoverColor: "group-hover:fill-red-600",
      svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>`
    },
    {
      name: "Nothing",
      link: "/search?brand=Nothing",
      hoverColor: "group-hover:fill-gray-900 dark:group-hover:fill-white",
      svg: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>`
    },
    {
      name: "Lenovo",
      link: "/search?brand=Lenovo",
      hoverColor: "group-hover:fill-red-600",
      svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`
    },
    {
      name: "HP",
      link: "/search?brand=HP",
      hoverColor: "group-hover:fill-blue-600",
      svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`
    },
    {
      name: "Dell",
      link: "/search?brand=Dell",
      hoverColor: "group-hover:fill-blue-700",
      svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`
    },
    {
      name: "JBL",
      link: "/search?brand=JBL",
      hoverColor: "group-hover:fill-orange-500",
      svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`
    },
    {
      name: "Asus",
      link: "/search?brand=Asus",
      hoverColor: "group-hover:fill-blue-600",
      svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`
    },
    {
      name: "Acer",
      link: "/search?brand=Acer",
      hoverColor: "group-hover:fill-green-600",
      svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`
    },
    {
      name: "LG",
      link: "/search?brand=LG",
      hoverColor: "group-hover:fill-red-600",
      svg: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>`
    },
    {
      name: "Microsoft",
      link: "/search?brand=Microsoft",
      hoverColor: "group-hover:fill-blue-600",
      svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"/></svg>`
    },
    {
      name: "Bose",
      link: "/search?brand=Bose",
      hoverColor: "group-hover:fill-black dark:group-hover:fill-white",
      svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`
    },
    {
      name: "Marshall",
      link: "/search?brand=Marshall",
      hoverColor: "group-hover:fill-black dark:group-hover:fill-white",
      svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`
    },
    {
      name: "Canon",
      link: "/search?brand=Canon",
      hoverColor: "group-hover:fill-red-600",
      svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 12c0 1.66 1.34 3 3 3s3-1.34 3-3-1.34-3-3-3-3 1.34-3 3zm3-8c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/></svg>`
    },
    {
      name: "DJI",
      link: "/search?brand=DJI",
      hoverColor: "group-hover:fill-black dark:group-hover:fill-white",
      svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`
    },
    {
      name: "Oppo",
      link: "/search?brand=Oppo",
      hoverColor: "group-hover:fill-green-500",
      svg: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>`
    },
    {
      name: "Vivo",
      link: "/search?brand=Vivo",
      hoverColor: "group-hover:fill-blue-600",
      svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`
    },
    {
      name: "Realme",
      link: "/search?brand=Realme",
      hoverColor: "group-hover:fill-yellow-500",
      svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`
    },
    {
      name: "Nokia",
      link: "/search?brand=Nokia",
      hoverColor: "group-hover:fill-blue-700",
      svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`
    },
    {
      name: "Motorola",
      link: "/search?brand=Motorola",
      hoverColor: "group-hover:fill-blue-600",
      svg: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>`
    },
    {
      name: "Anker",
      link: "/search?brand=Anker",
      hoverColor: "group-hover:fill-blue-600",
      svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`
    },
    {
      name: "Logitech",
      link: "/search?brand=Logitech",
      hoverColor: "group-hover:fill-blue-600",
      svg: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>`
    },
    {
      name: "Razer",
      link: "/search?brand=Razer",
      hoverColor: "group-hover:fill-green-500",
      svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`
    },
    {
      name: "MSI",
      link: "/search?brand=MSI",
      hoverColor: "group-hover:fill-red-600",
      svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`
    },
    {
      name: "Corsair",
      link: "/search?brand=Corsair",
      hoverColor: "group-hover:fill-yellow-500",
      svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`
    },
    {
      name: "Dyson",
      link: "/search?brand=Dyson",
      hoverColor: "group-hover:fill-purple-600",
      svg: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>`
    },
    {
      name: "GoPro",
      link: "/search?brand=GoPro",
      hoverColor: "group-hover:fill-blue-600",
      svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 12c0 1.66 1.34 3 3 3s3-1.34 3-3-1.34-3-3-3-3 1.34-3 3zm3-8c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/></svg>`
    },
  ],
};

const StorefrontBrands = () => {
  const { data } = useStorefrontContent<BrandsData>("brand_showcase", fallback);
  if (!data?.is_active) return null;
  const content = data.content;

  return (
    <section className="py-5 lg:py-8 border-y border-border/20">
      <div className="container">
        <div className="flex items-center gap-4 mb-6">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider shrink-0">
            {content.title}
          </span>
          <div className="h-px flex-1 bg-border/30" />
        </div>
        
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-4">
          {content.brands.map((brand) => (
            <Link
              key={brand.name}
              to={brand.link}
              className="group flex flex-col items-center justify-center p-4 rounded-xl border border-border/50 bg-card hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm transition-all duration-300"
              title={`Shop ${brand.name} products`}
            >
              <div 
                className={`w-12 h-12 flex items-center justify-center fill-muted-foreground group-hover:scale-110 transition-all duration-300 ${brand.hoverColor || 'group-hover:fill-primary'}`}
                dangerouslySetInnerHTML={{ __html: brand.svg }}
              />
              <span className="text-[10px] font-medium text-muted-foreground group-hover:text-primary transition-colors mt-2 text-center">
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