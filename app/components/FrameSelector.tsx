"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Check, ChevronLeft, ChevronRight, Grid3x3 } from "lucide-react";

interface Frame {
  id: string;
  name: string;
  url: string;
  thumbnail: string;
}

interface FrameSelectorProps {
  selectedFrameId: string;
  onFrameSelect: (frameId: string) => void;
}

const FRAME_DATA: Frame[] = Array.from({ length: 7 }, (_, i) => ({
  id: `frame${i + 1}`,
  name: `Frame ${i + 1}`,
  url: `/frames/frame${i + 1}.png`,
  thumbnail: `/frames/frame${i + 1}.png`,
}));

export const FrameSelector = memo<FrameSelectorProps>(function FrameSelector({
  selectedFrameId,
  onFrameSelect,
}) {
  const frames = useMemo(() => FRAME_DATA, []);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(
    new Set(),
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Preload first 3 frames for faster initial loading
  useEffect(() => {
    const preloadFrames = async () => {
      const framesToPreload = frames.slice(0, 3);

      framesToPreload.forEach((frame) => {
        const img = new window.Image();
        img.onload = () => {
          setPreloadedImages((prev) => new Set(prev).add(frame.id));
        };
        img.src = frame.url;
      });
    };

    preloadFrames();
  }, [frames]);

  const handleImageLoad = useCallback((frameId: string) => {
    setLoadedImages((prev) => new Set(prev).add(frameId));
  }, []);

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [checkScroll]);

  const scroll = useCallback(
    (direction: "left" | "right") => {
      if (scrollRef.current) {
        const scrollAmount = 200;
        scrollRef.current.scrollBy({
          left: direction === "left" ? -scrollAmount : scrollAmount,
          behavior: "smooth",
        });
        setTimeout(checkScroll, 300);
      }
    },
    [checkScroll],
  );

  return (
    <Card className="w-full border ">
      <CardContent className="p-3">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2 mb-6">
            <Grid3x3 className="w-5 h-5 text-primary" />
            <h3 className="text-base font-semibold text-foreground">
              উপলব্ধ ফ্রেম
            </h3>
            <span className="ml-auto text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
              {frames.length} ফ্রেম
            </span>
          </div>

          {/* Scroll Container */}
          <div className="relative group">
            {/* Scroll Buttons */}
            {canScrollLeft && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => scroll("left")}
                className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 bg-primary rounded-full shadow-lg border-border/40  backdrop-blur-sm hover:bg-primary hover:text-primary-foreground transition-all opacity-0 group-hover:opacity-100"
                aria-label="Scroll left"
              >
                <ChevronLeft className="h-5 w-5 text-white" />
              </Button>
            )}
            {canScrollRight && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => scroll("right")}
                className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 bg-primary rounded-full shadow-lg border-border/40  backdrop-blur-sm hover:bg-primary hover:text-primary-foreground transition-all opacity-0 group-hover:opacity-100"
                aria-label="Scroll right"
              >
                <ChevronRight className="h-5 w-5 text-white" />
              </Button>
            )}

            {/* Frames Grid */}
            <div
              ref={scrollRef}
              onScroll={checkScroll}
              className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide scroll-smooth px-0.5"
            >
              {frames.map((frame) => (
                <div key={frame.id} className="flex-shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onFrameSelect(frame.id)}
                    className={cn(
                      "relative h-24 w-24 sm:h-28 sm:w-28 p-1.5 transition-all duration-300 group overflow-hidden rounded-lg border-2",
                      selectedFrameId === frame.id
                        ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                        : "border-border/40 hover:border-primary/50 hover:bg-accent/50 ",
                    )}
                    aria-label={`Select ${frame.name}`}
                    aria-pressed={selectedFrameId === frame.id}
                  >
                    <div className="w-full h-full flex items-center justify-center relative">
                      {!loadedImages.has(frame.id) &&
                        !preloadedImages.has(frame.id) && (
                          <div className="absolute inset-0 bg-muted/50 animate-pulse flex items-center justify-center z-10 rounded-md">
                            <div className="h-5 w-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                          </div>
                        )}
                      <Image
                        src={frame.thumbnail || "/placeholder.svg"}
                        alt={frame.name}
                        width={96}
                        height={96}
                        sizes="(max-width: 640px) 96px, 112px"
                        className={cn(
                          "h-full w-full object-contain transition-all duration-300",
                          loadedImages.has(frame.id) ||
                            preloadedImages.has(frame.id)
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                        onLoad={() => handleImageLoad(frame.id)}
                        onError={() => handleImageLoad(frame.id)}
                        priority={parseInt(frame.id.replace("frame", "")) <= 3}
                        quality={85}
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                      />
                    </div>

                    {selectedFrameId === frame.id && (
                      <div className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg border border-primary-foreground/20 animate-in zoom-in duration-300">
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </div>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Info Text */}
          <p className="text-xs text-muted-foreground text-center mt-4">
            আপনার পছন্দের ফ্রেমটি নির্বাচন করুন এবং আপনার ছবি যোগ করুন
          </p>
        </div>
      </CardContent>
    </Card>
  );
});
