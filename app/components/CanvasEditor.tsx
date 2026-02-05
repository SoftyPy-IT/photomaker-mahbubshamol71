import type Konva from "konva";
import { Move } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Group, Image as KonvaImage, Layer, Stage } from "react-konva";
import { loadImageFromUrl } from "../lib/imageUtils";

interface CanvasEditorProps {
  userImage: HTMLImageElement | null;
  selectedFrameId: string;
  zoom: number;
  shape?: "square" | "circle";
  onExportReady: (exportFn: () => string) => void;
  onZoomChange?: (newZoom: number) => void;
  onImageUpload?: (file: File) => void;
}

// Fixed internal canvas size for high quality exports
const INTERNAL_SIZE = 800;
const DEFAULT_POSITION = { x: INTERNAL_SIZE / 2, y: INTERNAL_SIZE / 2 };

// Total number of frames available
const TOTAL_FRAMES = 10;

export const CanvasEditor = memo<CanvasEditorProps>(function CanvasEditor({
  userImage,
  selectedFrameId,
  zoom,
  shape = "square",
  onExportReady,
  onZoomChange,
  onImageUpload,
}) {
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevUserImageRef = useRef<HTMLImageElement | null>(null);
  const [frameImages, setFrameImages] = useState<Map<string, HTMLImageElement>>(
    new Map(),
  );
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [containerSize, setContainerSize] = useState(INTERNAL_SIZE);
  const [imagePosition, setImagePosition] = useState(DEFAULT_POSITION);
  const [isDragging, setIsDragging] = useState(false);

  // Mobile detection for logging purposes
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent,
        ) ||
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0;
      console.log("Mobile device detected:", isMobileDevice);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Responsive container sizing
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const parentWidth =
          containerRef.current.parentElement?.clientWidth || 400;
        // Limit max size and ensure minimum for usability
        const size = Math.min(Math.max(parentWidth - 16, 280), 560);
        setContainerSize(size);
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Reset image position when a NEW image is loaded
  useEffect(() => {
    if (userImage && userImage !== prevUserImageRef.current) {
      prevUserImageRef.current = userImage;
      requestAnimationFrame(() => {
        setImagePosition(DEFAULT_POSITION);
      });
    }
  }, [userImage]);

  // Scale factor for display (internal size to display size)
  const displayScale = useMemo(
    () => containerSize / INTERNAL_SIZE,
    [containerSize],
  );

  // Load assets
  useEffect(() => {
    let isMounted = true;

    const loadAssets = async () => {
      // Generate frame IDs dynamically based on TOTAL_FRAMES
      const frameIds = Array.from(
        { length: TOTAL_FRAMES },
        (_, i) => `frame${i + 1}`,
      );
      const newFrameImages = new Map<string, HTMLImageElement>();

      const frameImagePromises = frameIds.map(async (id) => {
        try {
          const img = await loadImageFromUrl(`/frames/${id}.png`);
          newFrameImages.set(id, img);
        } catch (error) {
          console.warn(`Failed to load frame ${id}:`, error);
        }
      });

      const bgPromise = loadImageFromUrl("/bg.png")
        .then((img) => {
          if (isMounted) setBgImage(img);
        })
        .catch(() => null);

      await Promise.allSettled([...frameImagePromises, bgPromise]);

      if (isMounted) {
        setFrameImages(newFrameImages);
        setIsReady(true);
      }
    };

    loadAssets();

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle image scale based on zoom
  const getImageScale = useCallback(() => {
    if (!userImage) return 1;
    const baseScale =
      INTERNAL_SIZE / Math.min(userImage.width, userImage.height);
    return baseScale * (zoom / 100);
  }, [userImage, zoom]);

  const currentFrame = frameImages.get(selectedFrameId);

  // Provide export function - always exports at high resolution with current zoom/position
  const handleExport = useCallback(() => {
    if (stageRef.current) {
      // Export the stage as-is (with current zoom and positioning) at high quality
      const exportScale = 2; // 2x for high quality

      const dataUrl = stageRef.current.toDataURL({
        pixelRatio: exportScale,
      });

      return dataUrl;
    }
    return "";
  }, []);

  // Force a small delay before calling onExportReady to ensure everything is rendered
  useEffect(() => {
    const timer = setTimeout(() => {
      onExportReady(handleExport);
    }, 100);
    return () => clearTimeout(timer);
  }, [handleExport, onExportReady]);

  // Handle scroll zoom - only when image exists
  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      if (!userImage || !onZoomChange) return;
      e.evt.preventDefault();
      e.evt.stopPropagation();
      const delta = e.evt.deltaY > 0 ? -5 : 5;
      const newZoom = Math.min(Math.max(zoom + delta, 50), 300);
      onZoomChange(newZoom);
    },
    [userImage, onZoomChange, zoom],
  );

  // Handle touch pinch zoom
  const lastDist = useRef<number | null>(null);
  const initialZoom = useRef<number>(100);

  const handleTouchStart = useCallback(
    (e: Konva.KonvaEventObject<TouchEvent>) => {
      const touch = e.evt.touches;
      if (touch.length === 2 && onZoomChange && userImage) {
        e.evt.preventDefault();
        e.evt.stopPropagation();
        const dist = Math.hypot(
          touch[0].clientX - touch[1].clientX,
          touch[0].clientY - touch[1].clientY,
        );
        lastDist.current = dist;
        initialZoom.current = zoom;
      }
    },
    [zoom, userImage, onZoomChange],
  );

  const handleTouchMove = useCallback(
    (e: Konva.KonvaEventObject<TouchEvent>) => {
      const touch = e.evt.touches;
      if (
        touch.length === 2 &&
        onZoomChange &&
        userImage &&
        lastDist.current !== null
      ) {
        e.evt.preventDefault();
        e.evt.stopPropagation();
        const dist = Math.hypot(
          touch[0].clientX - touch[1].clientX,
          touch[0].clientY - touch[1].clientY,
        );

        const scale = dist / lastDist.current;
        const newZoom = Math.min(
          Math.max(initialZoom.current * scale, 50),
          300,
        );
        if (Math.abs(newZoom - zoom) > 1) {
          onZoomChange(newZoom);
        }
      }
    },
    [onZoomChange, userImage, zoom],
  );

  const handleTouchEnd = useCallback(() => {
    lastDist.current = null;
  }, []);

  // Handle drag events for image position
  const handleDragMove = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target;
    setImagePosition({ x: node.x(), y: node.y() });
  }, []);

  // Handle drag end - ensure export function is updated
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    // Force a re-render of the export function to capture new position
    setTimeout(() => {
      onExportReady(handleExport);
    }, 50);
  }, [handleExport, onExportReady]);

  // Handle canvas click for image upload when no image present
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) return;
      if (!userImage && onImageUpload) {
        e.preventDefault();
        e.stopPropagation();
        fileInputRef.current?.click();
      }
    },
    [userImage, onImageUpload, isDragging],
  );

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file && onImageUpload) {
        onImageUpload(file);
        event.target.value = "";
      }
    },
    [onImageUpload],
  );

  if (typeof window === "undefined") return null;

  return (
    <div
      ref={containerRef}
      className={`flex justify-center items-center w-full select-none touch-none canvas-container ${isDragging ? "dragging" : ""}`}
      style={{ isolation: "isolate" }}
    >
      <div
        className={`relative rounded overflow-hidden transition-all duration-300 ${
          isDragging
            ? "cursor-grabbing"
            : userImage
              ? "cursor-grab "
              : onImageUpload
                ? "cursor-pointer "
                : ""
        } ${!userImage ? "bg-pattern" : ""}`}
        style={{
          width: containerSize,
          height: containerSize,
        }}
        onClick={handleCanvasClick}
      >
        <Stage
          width={containerSize}
          height={containerSize}
          ref={stageRef}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          scaleX={displayScale}
          scaleY={displayScale}
          style={{ touchAction: "none" }}
        >
          <Layer>
            {/* 1. Background - Clean gradient when no user image */}
            {!userImage && (
              <>
                {bgImage ? (
                  <KonvaImage
                    image={bgImage}
                    width={INTERNAL_SIZE}
                    height={INTERNAL_SIZE}
                  />
                ) : null}
              </>
            )}

            {/* 2. User Image with Clipping - MAKING THE GROUP DRAGGABLE */}
            <Group
              clipFunc={(ctx) => {
                if (shape === "circle") {
                  ctx.arc(
                    INTERNAL_SIZE / 2,
                    INTERNAL_SIZE / 2,
                    INTERNAL_SIZE / 2,
                    0,
                    Math.PI * 2,
                  );
                } else {
                  ctx.rect(0, 0, INTERNAL_SIZE, INTERNAL_SIZE);
                }
              }}
            >
              {userImage && (
                <Group
                  x={imagePosition.x}
                  y={imagePosition.y}
                  draggable
                  onDragStart={() => setIsDragging(true)}
                  onDragEnd={handleDragEnd}
                  onDragMove={handleDragMove}
                >
                  <KonvaImage
                    image={userImage}
                    offsetX={userImage.width / 2}
                    offsetY={userImage.height / 2}
                    scaleX={getImageScale()}
                    scaleY={getImageScale()}
                    shadowColor="black"
                    shadowBlur={20}
                    shadowOpacity={0.3}
                    shadowOffset={{ x: 5, y: 5 }}
                  />
                </Group>
              )}
            </Group>

            {/* 3. Frame Overlay (Always on top) */}
            {currentFrame && (
              <KonvaImage
                image={currentFrame}
                width={INTERNAL_SIZE}
                height={INTERNAL_SIZE}
                listening={false}
              />
            )}
          </Layer>
        </Stage>

        {/* Drag hint tooltip */}
        {userImage && isReady && (
          <div
            className={`absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-2 sm:px-5 py-2 sm:py-2.5 rounded-full text-[10px] sm:text-xs font-bold shadow-lg shadow-emerald-500/20 pointer-events-none transition-all duration-300 flex items-center gap-2 ${
              isDragging
                ? "opacity-0 scale-90 translate-y-2"
                : "opacity-100 scale-100 translate-y-0"
            }`}
          >
            <Move className="w-3.5 h-3.5 sm:w-4 sm:h-4 hidden md:block" />
            <span>ড্র্যাগ করে পজিশন ঠিক করুন</span>
          </div>
        )}
        {/* File input for canvas click upload */}
        {onImageUpload && (
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            aria-label="Upload image via canvas"
          />
        )}
      </div>
    </div>
  );
});
