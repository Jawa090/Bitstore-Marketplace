import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { AlertTriangle, Clock, Shield } from "lucide-react";

const LicenseAlertBanner = () => {
  const { data } = useQuery({
    queryKey: ["license-alerts"],
    queryFn: async () => {
      // TODO: Implement backend API for trade licenses
      // For now, return empty array
      // Future: Call /api/v1/admin/trade-licenses?status=expiring
      return [];
      
      // Future implementation:
      // const response = await api.get('/api/v1/admin/trade-licenses?status=expiring');
      // return response.data.licenses;
    },
    refetchInterval: 5 * 60 * 1000, // refresh every 5 min
  });

  if (!data || data.length === 0) return null;

  const today = new Date();
  const thirtyDays = new Date(today.getTime() + 30 * 86400000);

  const expired = data.filter((l) => new Date(l.expiry_date) < today);
  const expiringSoon = data.filter((l) => {
    const exp = new Date(l.expiry_date);
    return exp >= today && exp < thirtyDays;
  });

  if (expired.length === 0 && expiringSoon.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      {expired.length > 0 && (
        <Link to="/admin/trade-licenses?filter=expired">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 hover:bg-red-500/15 transition-colors cursor-pointer">
            <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
            <p className="text-sm text-red-300">
              <span className="font-semibold">{expired.length} trade license{expired.length > 1 ? "s" : ""} expired</span>
              {" — "}
              {expired.slice(0, 2).map((l) => (l.vendors as any)?.store_name).filter(Boolean).join(", ")}
              {expired.length > 2 && ` +${expired.length - 2} more`}
            </p>
            <Shield className="h-4 w-4 text-red-400/50 ml-auto shrink-0" />
          </div>
        </Link>
      )}
      {expiringSoon.length > 0 && (
        <Link to="/admin/trade-licenses?filter=expiring_soon">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/15 transition-colors cursor-pointer">
            <Clock className="h-4 w-4 text-amber-400 shrink-0" />
            <p className="text-sm text-amber-300">
              <span className="font-semibold">{expiringSoon.length} trade license{expiringSoon.length > 1 ? "s" : ""} expiring within 30 days</span>
              {" — "}
              {expiringSoon.slice(0, 2).map((l) => (l.vendors as any)?.store_name).filter(Boolean).join(", ")}
              {expiringSoon.length > 2 && ` +${expiringSoon.length - 2} more`}
            </p>
            <Shield className="h-4 w-4 text-amber-400/50 ml-auto shrink-0" />
          </div>
        </Link>
      )}
    </div>
  );
};

export default LicenseAlertBanner;
