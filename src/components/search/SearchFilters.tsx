import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockFilterConfig } from "@/data/mockData";

interface SearchFiltersProps {
  filterValues: Record<string, any>;
  onFilterChange: (filterId: string, value: any) => void;
}

interface FilterConfig {
  id: string; label: string; filter_type: string; is_enabled: boolean; display_order: number; options: any; config: any;
}

const SearchFilters = ({ filterValues, onFilterChange }: SearchFiltersProps) => {
  const filters = mockFilterConfig as FilterConfig[];

  return (
    <div className="space-y-1">
      {filters.map((filter) => (
        <CollapsibleFilter key={filter.id} filter={filter} value={filterValues[filter.id]} onChange={(value) => onFilterChange(filter.id, value)} />
      ))}
    </div>
  );
};

function CollapsibleFilter({ filter, value, onChange }: { filter: FilterConfig; value: any; onChange: (value: any) => void }) {
  const [open, setOpen] = useState(true);
  const hasValue = Array.isArray(value) ? (typeof value[0] === "number" ? false : value.length > 0) : !!value;

  return (
    <div className="border-b border-border/30 last:border-0">
      <button onClick={() => setOpen(!open)} className="flex items-center justify-between w-full py-3 text-left group">
        <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          {filter.label}{hasValue && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
        </span>
        <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform duration-200", open && "rotate-180")} />
      </button>
      {open && <div className="pb-3"><FilterContent filter={filter} value={value} onChange={onChange} /></div>}
    </div>
  );
}

function FilterContent({ filter, value, onChange }: { filter: FilterConfig; value: any; onChange: (value: any) => void }) {
  const [showAll, setShowAll] = useState(false);
  const options = Array.isArray(filter.options) ? filter.options : [];
  const INITIAL_SHOW = 6;

  if (filter.filter_type === "range") {
    const config = filter.config || {};
    const min = config.min ?? 0;
    const max = config.max ?? 20000;
    const step = config.step ?? 100;
    const rangeValue = value || [min, max];
    return (
      <div>
        <Slider min={min} max={max} step={step} value={rangeValue} onValueChange={(v) => onChange(v as [number, number])} className="mb-2" />
        <div className="flex justify-between text-[11px] text-muted-foreground font-medium">
          <span className="bg-muted/60 px-2 py-0.5 rounded">AED {rangeValue[0].toLocaleString()}</span>
          <span className="bg-muted/60 px-2 py-0.5 rounded">AED {rangeValue[1].toLocaleString()}</span>
        </div>
      </div>
    );
  }

  if (filter.filter_type === "badge") {
    const selected: string[] = value || [];
    const toggle = (opt: string) => {
      onChange(selected.includes(opt) ? selected.filter((s: string) => s !== opt) : [...selected, opt]);
    };
    return (
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt: string) => (
          <Badge key={opt} variant={selected.includes(opt) ? "default" : "outline"}
            className={cn("cursor-pointer text-[11px] font-medium transition-all", selected.includes(opt) ? "bg-primary text-primary-foreground" : "hover:border-primary/50 hover:text-foreground")}
            onClick={() => toggle(opt)}>{opt}</Badge>
        ))}
      </div>
    );
  }

  const selected: string[] = value || [];
  const toggle = (optValue: string) => {
    onChange(selected.includes(optValue) ? selected.filter((s: string) => s !== optValue) : [...selected, optValue]);
  };
  const visibleOptions = showAll ? options : options.slice(0, INITIAL_SHOW);
  const hasMore = options.length > INITIAL_SHOW;

  return (
    <div className="space-y-0.5">
      {visibleOptions.map((opt: any) => {
        const optValue = typeof opt === "object" ? opt.value : opt;
        const optLabel = typeof opt === "object" ? opt.label : opt;
        const isChecked = selected.includes(optValue);
        return (
          <label key={optValue} className={cn("flex items-center gap-2.5 cursor-pointer text-[13px] py-1.5 px-2 rounded-md transition-colors -mx-2", isChecked ? "bg-primary/5 text-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted/40")}>
            <Checkbox checked={isChecked} onCheckedChange={() => toggle(optValue)} className="h-3.5 w-3.5" />
            {optLabel}
          </label>
        );
      })}
      {hasMore && (
        <button onClick={() => setShowAll(!showAll)} className="text-[11px] text-primary font-medium hover:underline mt-1 px-2">
          {showAll ? "Show less" : `+${options.length - INITIAL_SHOW} more`}
        </button>
      )}
    </div>
  );
}

export default SearchFilters;
