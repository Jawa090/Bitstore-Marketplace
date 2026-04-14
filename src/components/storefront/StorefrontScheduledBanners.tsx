import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { mockPromoBanners } from "@/data/mockData";

function useCountdown(endDate: string) {
  const calcRemaining = useCallback(() => {
    const diff = new Date(endDate).getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days: Math.floor(diff / 86400000), hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000), seconds: Math.floor((diff % 60000) / 1000),
    };
  }, [endDate]);
  const [remaining, setRemaining] = useState(calcRemaining);
  useEffect(() => { const t = setInterval(() => setRemaining(calcRemaining()), 1000); return () => clearInterval(t); }, [calcRemaining]);
  return remaining;
}

function CountdownOverlay({ endDate, textColor }: { endDate: string; textColor: string }) {
  const { days, hours, minutes, seconds } = useCountdown(endDate);
  const isExpired = days === 0 && hours === 0 && minutes === 0 && seconds === 0;
  if (isExpired) return null;
  const units = [{ value: days, label: "D" }, { value: hours, label: "H" }, { value: minutes, label: "M" }, { value: seconds, label: "S" }];
  return (
    <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm">
      <Clock className="h-3.5 w-3.5" style={{ color: textColor }} />
      <div className="flex items-center gap-1">
        {units.map(({ value, label }) => (
          <span key={label} className="text-xs font-mono font-bold" style={{ color: textColor }}>
            {String(value).padStart(2, "0")}<span className="opacity-60 text-[10px]">{label}</span>{label !== "S" && <span className="opacity-40 mx-0.5">:</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

const StorefrontScheduledBanners = () => {
  const banners = mockPromoBanners;
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => setCurrent((c) => (c + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, [banners.length]);

  if (banners.length === 0) return null;

  const banner = banners[current];
  const Wrapper = banner.link_url ? Link : "div";
  const wrapperProps = banner.link_url ? { to: banner.link_url } : {};

  return (
    <section className="py-6 lg:py-10">
      <div className="container">
        <div className="relative rounded-2xl overflow-hidden" style={{ backgroundColor: banner.bg_color }}>
          <CountdownOverlay endDate={banner.end_date} textColor={banner.text_color} />
          <AnimatePresence mode="wait">
            <motion.div key={banner.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
              {/* @ts-ignore */}
              <Wrapper {...wrapperProps} className="block">
                {banner.image_url ? (
                  <div className="relative h-40 sm:h-56 lg:h-72">
                    <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex items-center">
                      <div className="p-6 lg:p-12 max-w-lg" style={{ color: banner.text_color }}>
                        <h3 className="text-2xl lg:text-4xl font-bold mb-2">{banner.title}</h3>
                        {banner.subtitle && <p className="text-sm lg:text-lg opacity-90">{banner.subtitle}</p>}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-40 sm:h-56 lg:h-72 flex items-center justify-center p-6 lg:p-12" style={{ color: banner.text_color }}>
                    <div className="text-center">
                      <h3 className="text-2xl lg:text-4xl font-bold mb-2">{banner.title}</h3>
                      {banner.subtitle && <p className="text-sm lg:text-lg opacity-90">{banner.subtitle}</p>}
                    </div>
                  </div>
                )}
              </Wrapper>
            </motion.div>
          </AnimatePresence>
          {banners.length > 1 && (
            <>
              <button onClick={() => setCurrent((c) => (c - 1 + banners.length) % banners.length)} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors z-10"><ChevronLeft className="h-5 w-5" /></button>
              <button onClick={() => setCurrent((c) => (c + 1) % banners.length)} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors z-10"><ChevronRight className="h-5 w-5" /></button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {banners.map((_, i) => (
                  <button key={i} onClick={() => setCurrent(i)} className={`h-2 rounded-full transition-all ${i === current ? "w-6 bg-white" : "w-2 bg-white/50"}`} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default StorefrontScheduledBanners;
