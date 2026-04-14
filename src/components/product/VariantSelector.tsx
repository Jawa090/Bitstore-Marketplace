import { useNavigate } from "react-router-dom";
import { getVariants } from "@/data/mockData";
import { cn } from "@/lib/utils";

interface VariantSelectorProps {
  currentProductId: string; brand: string; name: string;
  currentStorage?: string | null; currentColor?: string | null; currentCondition?: string | null;
}

const conditionLabels: Record<string, string> = { new: "New", used_like_new: "Like New", used_good: "Good", used_fair: "Fair", refurbished: "Refurbished" };

const VariantSelector = ({ currentProductId, brand, name, currentStorage, currentColor, currentCondition }: VariantSelectorProps) => {
  const navigate = useNavigate();

  const baseModel = name.replace(/\d+\s*(GB|TB)/gi, "")
    .replace(/(midnight|starlight|natural|black|white|blue|red|green|yellow|pink|purple|gold|silver|graphite|sierra|alpine|deep|titanium|space\s*gray|space\s*grey|pacific|desert|product|flowy|emerald|obsidian|phantom)/gi, "")
    .replace(/\s+/g, " ").trim();

  const variants = getVariants(brand, baseModel);

  if (variants.length <= 1) return null;

  const storageOptions = [...new Set(variants.map(v => v.storage).filter(Boolean))] as string[];
  const colorOptions = [...new Set(variants.map(v => v.color).filter(Boolean))] as string[];
  const conditionOptions = [...new Set(variants.map(v => v.condition).filter(Boolean))] as string[];

  const handleVariantClick = (storage?: string | null, color?: string | null, condition?: string | null) => {
    const ts = storage ?? currentStorage; const tc = color ?? currentColor; const tco = condition ?? currentCondition;
    const match = variants.find(v => {
      const sM = !ts || v.storage === ts; const cM = !tc || v.color === tc; const coM = !tco || v.condition === tco;
      return sM && cM && coM && v.id !== currentProductId;
    }) || variants.find(v => {
      if (storage !== undefined) return v.storage === storage;
      if (color !== undefined) return v.color === color;
      if (condition !== undefined) return v.condition === condition;
      return false;
    });
    if (match) navigate(`/product/${match.slug}`);
  };

  return (
    <div className="space-y-4">
      {storageOptions.length > 1 && (
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">Storage</p>
          <div className="flex flex-wrap gap-2">
            {storageOptions.map(opt => {
              const isActive = opt === currentStorage;
              const variant = variants.find(v => v.storage === opt && (!currentColor || v.color === currentColor));
              return (
                <button key={opt} onClick={() => !isActive && handleVariantClick(opt, undefined, undefined)}
                  className={cn("px-4 py-2 rounded-lg border text-sm font-medium transition-all", isActive ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50 text-foreground", !variant && "opacity-40 cursor-not-allowed")} disabled={!variant}>
                  <span>{opt}</span>
                  {variant && <span className="block text-xs text-muted-foreground mt-0.5">{variant.currency} {variant.price.toLocaleString()}</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {colorOptions.length > 1 && (
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">Color — <span className="text-foreground">{currentColor || "—"}</span></p>
          <div className="flex flex-wrap gap-2">
            {colorOptions.map(opt => {
              const isActive = opt === currentColor;
              const variant = variants.find(v => v.color === opt && (!currentStorage || v.storage === currentStorage));
              return (
                <button key={opt} onClick={() => !isActive && handleVariantClick(undefined, opt, undefined)}
                  className={cn("px-4 py-2 rounded-lg border text-sm font-medium transition-all", isActive ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50 text-foreground", !variant && "opacity-40 cursor-not-allowed")} disabled={!variant}>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {conditionOptions.length > 1 && (
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">Condition</p>
          <div className="flex flex-wrap gap-2">
            {conditionOptions.map(opt => {
              const isActive = opt === currentCondition;
              const variant = variants.find(v => v.condition === opt && (!currentStorage || v.storage === currentStorage) && (!currentColor || v.color === currentColor));
              return (
                <button key={opt} onClick={() => !isActive && handleVariantClick(undefined, undefined, opt)}
                  className={cn("px-4 py-2 rounded-lg border text-sm font-medium transition-all", isActive ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50 text-foreground", !variant && "opacity-40 cursor-not-allowed")} disabled={!variant}>
                  <span>{conditionLabels[opt] || opt}</span>
                  {variant && <span className="block text-xs text-muted-foreground mt-0.5">{variant.currency} {variant.price.toLocaleString()}</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default VariantSelector;
