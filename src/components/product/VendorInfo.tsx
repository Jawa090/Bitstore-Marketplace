import { MapPin, Star, ShieldCheck } from "lucide-react";

interface VendorInfoProps {
  vendor: {
    store_name: string;
    logo_url?: string | null;
    emirate: string;
    is_bitstores: boolean;
  };
  rating?: number;
  reviewCount?: number;
}

const VendorInfo = ({ vendor, rating = 4.8, reviewCount = 124 }: VendorInfoProps) => {
  return (
    <div className="rounded-xl border border-border p-5">
      <div className="flex items-center gap-3 mb-3">
        {vendor.logo_url ? (
          <img src={vendor.logo_url} alt={vendor.store_name} className="h-10 w-10 rounded-lg object-cover" />
        ) : (
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
            {vendor.store_name[0]}
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm">{vendor.store_name}</h4>
            {vendor.is_bitstores && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">
                <ShieldCheck className="h-3 w-3" />
                Official
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
            <MapPin className="h-3 w-3" />
            {vendor.emirate}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          <span className="font-medium">{rating}</span>
          <span className="text-muted-foreground">({reviewCount} reviews)</span>
        </div>
      </div>
    </div>
  );
};

export default VendorInfo;
