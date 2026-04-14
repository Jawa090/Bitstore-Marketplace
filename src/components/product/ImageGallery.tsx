import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

interface ImageGalleryProps {
  images: string[];
  productName: string;
}

const ImageGallery = ({ images, productName }: ImageGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const imgRef = useRef<HTMLDivElement>(null);

  const goNext = () => setSelectedIndex((prev) => (prev + 1) % images.length);
  const goPrev = () => setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  return (
    <div className="flex gap-3">
      {/* Vertical thumbnails */}
      {images.length > 1 && (
        <div className="hidden sm:flex flex-col gap-2 w-[60px] shrink-0">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedIndex(i)}
              onMouseEnter={() => setSelectedIndex(i)}
              className={`w-[60px] h-[60px] rounded-lg border-2 overflow-hidden transition-all bg-secondary/20 ${
                i === selectedIndex
                  ? "border-primary ring-1 ring-primary/20"
                  : "border-border/50 hover:border-muted-foreground"
              }`}
            >
              <img src={img} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-contain p-1" loading="lazy" />
            </button>
          ))}
        </div>
      )}

      {/* Main image */}
      <div className="flex-1 min-w-0">
        <div
          ref={imgRef}
          className="relative aspect-square rounded-xl overflow-hidden bg-secondary/10 border border-border/50 group cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setZoomed(true)}
          onMouseLeave={() => setZoomed(false)}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={selectedIndex}
              src={images[selectedIndex]}
              alt={`${productName} - Image ${selectedIndex + 1}`}
              className="w-full h-full object-contain p-6"
              style={zoomed ? {
                transform: `scale(2)`,
                transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
              } : undefined}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            />
          </AnimatePresence>

          {images.length > 1 && !zoomed && (
            <>
              <button
                onClick={goPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-background/80 backdrop-blur-sm border border-border text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={goNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-background/80 backdrop-blur-sm border border-border text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}

          {/* Zoom hint */}
          <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-background/70 backdrop-blur-sm text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            <ZoomIn className="h-3 w-3" /> Hover to zoom
          </div>
        </div>

        {/* Mobile thumbnails (horizontal) */}
        {images.length > 1 && (
          <div className="flex sm:hidden gap-2 mt-3 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedIndex(i)}
                className={`shrink-0 w-14 h-14 rounded-lg border-2 overflow-hidden transition-all ${
                  i === selectedIndex
                    ? "border-primary ring-1 ring-primary/30"
                    : "border-border hover:border-muted-foreground"
                }`}
              >
                <img src={img} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGallery;
