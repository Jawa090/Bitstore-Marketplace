import type { Product } from "./BitBotChat";

interface Props {
  products: Product[];
}

const rows = [
  { label: "Price", key: "price", format: (p: Product) => `${p.currency} ${p.price.toLocaleString()}` },
  { label: "Brand", key: "brand", format: (p: Product) => p.brand },
  { label: "Storage", key: "storage", format: (p: Product) => p.storage || "—" },
  { label: "RAM", key: "ram", format: (p: Product) => p.ram || "—" },
  { label: "Camera", key: "camera", format: (p: Product) => p.camera || "—" },
  { label: "Battery", key: "battery", format: (p: Product) => p.battery || "—" },
  { label: "Display", key: "display_size", format: (p: Product) => p.display_size || "—" },
  { label: "Processor", key: "processor", format: (p: Product) => p.processor || "—" },
] as const;

const BitBotCompareTable = ({ products }: Props) => {
  const [a, b] = products;

  return (
    <div className="rounded-xl border border-border overflow-hidden text-[11px]">
      {/* Header */}
      <div className="grid grid-cols-3 bg-secondary/50">
        <div className="px-2 py-2 font-medium text-muted-foreground">Spec</div>
        <div className="px-2 py-2 font-semibold truncate">{a.name}</div>
        <div className="px-2 py-2 font-semibold truncate">{b.name}</div>
      </div>
      {/* Rows */}
      {rows.map((row) => (
        <div key={row.label} className="grid grid-cols-3 border-t border-border/50">
          <div className="px-2 py-1.5 text-muted-foreground">{row.label}</div>
          <div className="px-2 py-1.5">{row.format(a)}</div>
          <div className="px-2 py-1.5">{row.format(b)}</div>
        </div>
      ))}
    </div>
  );
};

export default BitBotCompareTable;
