import { Cpu, HardDrive, Camera, Battery, Monitor, Smartphone, Shield, Palette } from "lucide-react";

interface SpecsTableProps {
  specs: {
    ram?: string | null;
    storage?: string | null;
    camera?: string | null;
    battery?: string | null;
    display_size?: string | null;
    processor?: string | null;
    os?: string | null;
    warranty_months?: number | null;
    color?: string | null;
    condition?: string | null;
  };
}

const specRows = [
  { key: "processor", label: "Processor", icon: Cpu },
  { key: "ram", label: "RAM", icon: HardDrive },
  { key: "storage", label: "Storage", icon: HardDrive },
  { key: "camera", label: "Camera", icon: Camera },
  { key: "battery", label: "Battery", icon: Battery },
  { key: "display_size", label: "Display", icon: Monitor },
  { key: "os", label: "Operating System", icon: Smartphone },
  { key: "color", label: "Color", icon: Palette },
  { key: "warranty_months", label: "Warranty", icon: Shield },
  { key: "condition", label: "Condition", icon: Shield },
] as const;

const formatCondition = (c: string) =>
  c.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

const SpecsTable = ({ specs }: SpecsTableProps) => {
  const visibleSpecs = specRows.filter((row) => {
    const val = specs[row.key as keyof typeof specs];
    return val !== null && val !== undefined && val !== "";
  });

  if (visibleSpecs.length === 0) return null;

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="px-5 py-4 border-b border-border bg-secondary/30">
        <h3 className="font-semibold">Technical Specifications</h3>
      </div>
      <div className="divide-y divide-border">
        {visibleSpecs.map((row) => {
          const Icon = row.icon;
          let value = specs[row.key as keyof typeof specs];
          if (row.key === "warranty_months" && typeof value === "number") {
            value = `${value} months`;
          }
          if (row.key === "condition" && typeof value === "string") {
            value = formatCondition(value);
          }
          return (
            <div key={row.key} className="flex items-center px-5 py-3.5 gap-3">
              <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm text-muted-foreground w-36 shrink-0">{row.label}</span>
              <span className="text-sm font-medium">{String(value)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SpecsTable;
