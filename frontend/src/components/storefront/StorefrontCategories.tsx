import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Smartphone, Laptop, Tablet, Headphones, Watch, Package, Flame,
  Gamepad2, Monitor, Camera, Speaker, Cpu, Cable, BatteryCharging,
  Printer, Router, Tv, HardDrive, Mouse,
  Keyboard, Mic, Projector, Usb, CircuitBoard,
} from "lucide-react";
import { useStorefrontContent } from "@/hooks/useStorefrontContent";
import { categoryService } from "@/services/api/category.service";
import { brandService } from "@/services/api/brand.service";

interface Category {
  name: string;
  icon: string;
  link: string;
  image_url?: string;
  tag?: string;
  color?: string;
}

interface CategoryData {
  title: string;
  subtitle: string;
  categories: Category[];
}

const fallback: CategoryData = {
  title: "Shop by Category",
  subtitle: "Explore our wide range of certified renewed electronics",
  categories: [
    { name: "iPhones", icon: "smartphone", link: "/search?brand=Apple", color: "from-blue-500 to-blue-600" },
    { name: "Samsung", icon: "smartphone", link: "/search?brand=Samsung", color: "from-violet-500 to-violet-600" },
    { name: "Laptops", icon: "laptop", link: "/search?category=laptops", color: "from-emerald-500 to-emerald-600" },
    { name: "iPads", icon: "tablet", link: "/search?category=ipads", color: "from-orange-500 to-orange-600" },
    { name: "Watches", icon: "watch", link: "/search?category=watches", color: "from-rose-500 to-rose-600" },
    { name: "Headphones", icon: "headphones", link: "/accessories", color: "from-cyan-500 to-cyan-600" },
    { name: "Gaming", icon: "gamepad", link: "/search?category=gaming", color: "from-red-500 to-red-600" },
    { name: "Monitors", icon: "monitor", link: "/search?category=monitors", color: "from-indigo-500 to-indigo-600" },
    { name: "Cameras", icon: "camera", link: "/search?category=cameras", color: "from-amber-500 to-amber-600" },
    { name: "Speakers", icon: "speaker", link: "/search?category=speakers", color: "from-teal-500 to-teal-600" },
    { name: "Networking", icon: "router", link: "/search?category=networking", color: "from-sky-500 to-sky-600" },
    { name: "Power Banks", icon: "battery", link: "/search?category=power", color: "from-lime-500 to-lime-600" },
    { name: "Printers", icon: "printer", link: "/search?category=printers", color: "from-gray-400 to-gray-500" },
    { name: "Cables", icon: "cable", link: "/search?category=cables", color: "from-zinc-400 to-zinc-500" },
    { name: "Components", icon: "cpu", link: "/search?category=components", color: "from-purple-500 to-purple-600" },
    { name: "TVs", icon: "tv", link: "/search?category=tvs", color: "from-blue-600 to-blue-700" },
    { name: "Storage", icon: "harddrive", link: "/search?category=storage", color: "from-slate-500 to-slate-600" },
    { name: "Mice", icon: "mouse", link: "/search?category=mice", color: "from-pink-500 to-pink-600" },
    { name: "Keyboards", icon: "keyboard", link: "/search?category=keyboards", color: "from-fuchsia-500 to-fuchsia-600" },
    { name: "Microphones", icon: "mic", link: "/search?category=microphones", color: "from-yellow-500 to-yellow-600" },
    { name: "Projectors", icon: "projector", link: "/search?category=projectors", color: "from-stone-500 to-stone-600" },
    { name: "Accessories", icon: "usb", link: "/accessories", color: "from-neutral-500 to-neutral-600" },
    { name: "Motherboards", icon: "circuitboard", link: "/search?category=motherboards", color: "from-green-500 to-green-600" },
    { name: "Hot Deals", icon: "flame", link: "/search?deals=true", color: "from-red-500 to-orange-500", tag: "🔥" },
  ],
};

const iconLookup: Record<string, typeof Smartphone> = {
  smartphone: Smartphone, laptop: Laptop, tablet: Tablet, headphones: Headphones,
  watch: Watch, flame: Flame, gamepad: Gamepad2, monitor: Monitor, camera: Camera,
  speaker: Speaker, cpu: Cpu, cable: Cable, battery: BatteryCharging, printer: Printer,
  router: Router, tv: Tv, harddrive: HardDrive, mouse: Mouse, keyboard: Keyboard,
  mic: Mic, projector: Projector, usb: Usb, circuitboard: CircuitBoard,
};

// Helper function to get icon for category
const getIconForCategory = (categoryName: string): string => {
  const name = categoryName.toLowerCase();
  if (name.includes('phone') || name.includes('mobile')) return 'smartphone';
  if (name.includes('laptop') || name.includes('computer')) return 'laptop';
  if (name.includes('tablet') || name.includes('ipad')) return 'tablet';
  if (name.includes('headphone') || name.includes('audio') || name.includes('earphone')) return 'headphones';
  if (name.includes('watch')) return 'watch';
  if (name.includes('gaming') || name.includes('game')) return 'gamepad';
  if (name.includes('monitor') || name.includes('display')) return 'monitor';
  if (name.includes('camera')) return 'camera';
  if (name.includes('speaker')) return 'speaker';
  if (name.includes('network') || name.includes('router') || name.includes('wifi')) return 'router';
  if (name.includes('power') || name.includes('battery') || name.includes('charger')) return 'battery';
  if (name.includes('printer')) return 'printer';
  if (name.includes('cable') || name.includes('wire')) return 'cable';
  if (name.includes('component') || name.includes('cpu') || name.includes('processor')) return 'cpu';
  if (name.includes('tv') || name.includes('television')) return 'tv';
  if (name.includes('storage') || name.includes('drive') || name.includes('ssd') || name.includes('hdd')) return 'harddrive';
  if (name.includes('mouse') || name.includes('mice')) return 'mouse';
  if (name.includes('keyboard')) return 'keyboard';
  if (name.includes('mic') || name.includes('microphone')) return 'mic';
  if (name.includes('projector')) return 'projector';
  if (name.includes('motherboard') || name.includes('mainboard')) return 'circuitboard';
  if (name.includes('accessory') || name.includes('accessories')) return 'usb';
  return 'smartphone'; // default
};

// Helper function to get color for category
const getColorForCategory = (categoryName: string): string => {
  const name = categoryName.toLowerCase();
  if (name.includes('phone') || name.includes('mobile')) return 'from-blue-500 to-blue-600';
  if (name.includes('laptop') || name.includes('computer')) return 'from-emerald-500 to-emerald-600';
  if (name.includes('tablet') || name.includes('ipad')) return 'from-orange-500 to-orange-600';
  if (name.includes('headphone') || name.includes('audio')) return 'from-cyan-500 to-cyan-600';
  if (name.includes('watch')) return 'from-rose-500 to-rose-600';
  if (name.includes('gaming') || name.includes('game')) return 'from-red-500 to-red-600';
  if (name.includes('monitor') || name.includes('display')) return 'from-indigo-500 to-indigo-600';
  if (name.includes('camera')) return 'from-amber-500 to-amber-600';
  if (name.includes('speaker')) return 'from-teal-500 to-teal-600';
  if (name.includes('network') || name.includes('router')) return 'from-sky-500 to-sky-600';
  if (name.includes('power') || name.includes('battery')) return 'from-lime-500 to-lime-600';
  if (name.includes('printer')) return 'from-gray-400 to-gray-500';
  if (name.includes('cable') || name.includes('wire')) return 'from-zinc-400 to-zinc-500';
  if (name.includes('component') || name.includes('cpu')) return 'from-purple-500 to-purple-600';
  if (name.includes('tv') || name.includes('television')) return 'from-blue-600 to-blue-700';
  if (name.includes('storage') || name.includes('drive')) return 'from-slate-500 to-slate-600';
  if (name.includes('mouse') || name.includes('mice')) return 'from-pink-500 to-pink-600';
  if (name.includes('keyboard')) return 'from-fuchsia-500 to-fuchsia-600';
  if (name.includes('mic') || name.includes('microphone')) return 'from-yellow-500 to-yellow-600';
  if (name.includes('projector')) return 'from-stone-500 to-stone-600';
  if (name.includes('motherboard')) return 'from-green-500 to-green-600';
  if (name.includes('accessory') || name.includes('accessories')) return 'from-neutral-500 to-neutral-600';
  return 'from-primary to-primary'; // default
};

const StorefrontCategories = () => {
  const { data } = useStorefrontContent<CategoryData>("category_showcase", fallback);

  // Fetch categories from backend
  const { data: backendCategories = [] } = useQuery({
    queryKey: ['storefront-categories'],
    queryFn: categoryService.getCategories,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch top brands from backend
  const { data: backendBrands = [] } = useQuery({
    queryKey: ['storefront-brands'],
    queryFn: brandService.getBrands,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  if (!data?.is_active) return null;
  const content = data.content;

  // Create categories from backend data
  const dynamicCategories: Category[] = [];

  // Add top brands first (Apple, Samsung, etc.)
  const topBrands = backendBrands
    .filter(brand => brand.is_active)
    .sort((a, b) => a.display_order - b.display_order)
    .slice(0, 3); // Top 3 brands

  topBrands.forEach(brand => {
    const brandName = brand.name;
    dynamicCategories.push({
      name: brandName === 'Apple' ? 'iPhones' : brandName,
      icon: 'smartphone',
      link: `/search?brand=${brand.id}`,
      color: brandName === 'Apple' ? 'from-blue-500 to-blue-600' : 
             brandName === 'Samsung' ? 'from-violet-500 to-violet-600' : 
             'from-gray-500 to-gray-600'
    });
  });

  // Add categories from backend
  const activeCategories = backendCategories
    .filter(cat => cat.is_active)
    .sort((a, b) => a.display_order - b.display_order)
    .slice(0, 15); // Limit to 15 categories

  activeCategories.forEach(category => {
    dynamicCategories.push({
      name: category.name,
      icon: getIconForCategory(category.name),
      link: `/search?category=${category.id}`,
      color: getColorForCategory(category.name)
    });
  });

  // Add special deals at the end
  dynamicCategories.push({
    name: "Hot Deals",
    icon: "flame",
    link: "/search?deals=true",
    color: "from-red-500 to-orange-500",
    tag: "🔥"
  });

  // Use dynamic categories if available, otherwise fallback
  const cats = dynamicCategories.length > 0 ? dynamicCategories : content.categories;

  return (
    <section className="py-5 lg:py-8 bg-background">
      <div className="container">
        <div className="px-3 lg:px-6 mb-4">
          <h2 className="text-base lg:text-lg font-bold text-foreground tracking-tight">{content.title}</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">{content.subtitle}</p>
        </div>

        <div className="relative overflow-hidden">
          <div className="flex animate-marquee-categories gap-3 w-max">
            {[...cats, ...cats].map((cat, i) => {
              const Icon = iconLookup[cat.icon] || Package;
              return (
                <Link
                  key={`${cat.name}-${i}`}
                  to={cat.link}
                  className="group relative overflow-hidden rounded-xl w-[140px] h-[100px] shrink-0 border border-border/50 bg-card hover:border-primary/40 transition-all"
                >
                  {cat.image_url ? (
                    <img
                      src={cat.image_url}
                      alt={cat.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                  ) : (
                    <div className={`absolute inset-0 bg-gradient-to-br ${cat.color || "from-primary to-primary"} flex items-center justify-center`}>
                      <Icon className="h-8 w-8 text-white/70" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <span className="text-[11px] font-semibold text-white drop-shadow-md">{cat.name}</span>
                  </div>
                  {cat.tag && (
                    <span className="absolute top-1.5 right-1.5 text-xs leading-none drop-shadow-md">{cat.tag}</span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StorefrontCategories;
