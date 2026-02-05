"use client";

import { Sparkles } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useState } from "react";
import { DownloadButton } from "./components/DownloadButton";
import { UploadButton } from "./components/UploadButton";
import { downloadImage } from "./lib/canvasUtils";
import { loadImageFromFile } from "./lib/imageUtils";
import { WelcomeDialog } from "./components/WelcomeDialog";
import { FramePreloader } from "./components/FramePreloader";

const CanvasEditor = dynamic(
  () => import("./components/CanvasEditor").then((mod) => mod.CanvasEditor),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-slate-100 rounded-xl animate-pulse flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
      </div>
    ),
  },
);

const FrameSelector = dynamic(
  () => import("./components/FrameSelector").then((mod) => mod.FrameSelector),
  { ssr: false },
);

const ZoomSlider = dynamic(
  () => import("./components/ZoomSlider").then((mod) => mod.ZoomSlider),
  { ssr: false },
);


// Frame URLs for preloading
const FRAME_URLS = Array.from(
  { length: 10 },
  (_, i) => `/frames/frame${i + 1}.png`,
);

export default function PhotoFrameMaker() {
  const [userImage, setUserImage] = useState<HTMLImageElement | null>(null);
  const [selectedFrameId, setSelectedFrameId] = useState<string>("frame1");
  const [zoom, setZoom] = useState<number>(100);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [exportFunction, setExportFunction] = useState<(() => string) | null>(
    null,
  );

  const handleImageUpload = useCallback(async (file: File) => {
    setIsLoading(true);
    try {
      const image = await loadImageFromFile(file);
      console.log("Image Loaded:", image);
      setUserImage(image);
      setZoom(100);
    } catch (error) {
      console.error("Failed to load image:", error);
      alert("Failed to load the selected image. Please try a different file.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleFrameSelect = useCallback((frameId: string) => {
    setSelectedFrameId(frameId);
  }, []);

  const handleZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom);
  }, []);

  const handleExportReady = useCallback((exportFn: () => string) => {
    setExportFunction(() => exportFn);
  }, []);

  const handleDownload = useCallback(() => {
    if (exportFunction) {
      try {
        const dataUrl = exportFunction();
        downloadImage(dataUrl, "election-frame-photo.png");
      } catch (error) {
        console.error("Export error:", error);
        alert("ছবি ডাউনলোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
      }
    }
  }, [exportFunction]);

  const canDownload = userImage && exportFunction;

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-foreground flex flex-col">
      <FramePreloader frameUrls={FRAME_URLS} preloadCount={3} />
      <WelcomeDialog />
      {/* Header */}
      <header className="w-full sticky top-0 z-50 bg-gradient-to-r from-[#006a4e] via-[#007a5e] to-[#E41E3F] text-white backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col items-center gap-3">
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
              <Image
                src="/sobar_age_bd.png"
                alt="Sobar Age BD"
                width={200}
                height={100}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full py-10 flex-1">
        <div className="container mx-auto px-2 max-w-7xl space-y-10">
          {/* Mobile/Tablet Layout (below lg) */}
          <div className="block lg:hidden max-w-2xl mx-auto">
            <div className="space-y-4">
              {/* Step 1: Canvas Preview */}
              <section className="animate-in fade-in duration-500">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                      1
                    </div>
                    <h2 className="text-base font-semibold text-foreground">
                      প্রিভিউ
                    </h2>
                  </div>
                  <div className="bg-card rounded-lg border border-border/40 overflow-hidden py-3 px-3 flex justify-center">
                    <CanvasEditor
                      userImage={userImage}
                      selectedFrameId={selectedFrameId}
                      zoom={zoom}
                      onExportReady={handleExportReady}
                      onZoomChange={handleZoomChange}
                      onImageUpload={handleImageUpload}
                    />
                  </div>
                </div>
              </section>

              {/* Step 2: Zoom Control - Compact version, shows even without image */}
              <section className="animate-in fade-in duration-500 delay-75">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                      2
                    </div>
                    <label className="text-base font-semibold text-foreground flex items-center gap-2">
                      জুম সামঞ্জস্য করুন
                    </label>
                    <span className="ml-auto text-xs font-medium text-primary">
                      {Math.round(zoom)}%
                    </span>
                  </div>
                  <div className="bg-card rounded-lg border border-border/40 px-3 py-2">
                    <ZoomSlider
                      value={zoom}
                      onChange={handleZoomChange}
                      disabled={!userImage}
                    />
                  </div>
                </div>
              </section>

              {/* Step 3: Frame Selector - Compact version */}
              <section className="animate-in fade-in slide-in-from-top-4 duration-500 delay-100">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                      3
                    </div>
                    <h2 className="text-base font-semibold text-foreground">

                      ফ্রেম নির্বাচন করুন
                    </h2>
                  </div>
                  <div className="bg-card rounded-lg border border-border/40 p-2">
                    <FrameSelector
                      selectedFrameId={selectedFrameId}
                      onFrameSelect={handleFrameSelect}
                    />
                  </div>
                </div>
              </section>

              {/* Step 4: Upload Button */}
              <section className="animate-in fade-in duration-500 delay-150">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                      4
                    </div>
                    <h2 className="text-base font-semibold text-foreground">
                      {userImage ? "ছবি পরিবর্তন করুন" : "ছবি আপলোড করুন"}
                    </h2>
                  </div>
                  <UploadButton
                    onImageUpload={handleImageUpload}
                    disabled={isLoading}
                  />
                </div>
              </section>

              {/* Step 5: Download Button */}
              <section className="animate-in fade-in duration-500 delay-200">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                      5
                    </div>
                    <h2 className="text-base font-semibold text-foreground">
                      ডাউনলোড করুন
                    </h2>
                  </div>
                  {userImage ? (
                    <DownloadButton
                      onDownload={handleDownload}
                      disabled={!canDownload}
                    />
                  ) : (
                    <button
                      disabled
                      className="w-full px-6 py-3 bg-muted text-muted-foreground font-medium rounded-lg cursor-not-allowed opacity-60 text-center transition-colors"
                    >
                      ছবি নির্বাচন করুন
                    </button>
                  )}
                </div>
              </section>
            </div>
          </div>

          {/* Desktop Grid Layout (lg and above) */}
          <div className="hidden lg:block">
            <div className="grid lg:grid-cols-2 xl:grid-cols-[1fr,1.2fr] gap-5  min-h-[80vh]">
              {/* Left Column - Controls */}
              <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
                {/* Frame Selection */}
                <section className="animate-in fade-in slide-in-from-left-4 duration-500">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                        1
                      </div>
                      <h3 className="text-xl font-bold text-foreground">
                        ফ্রেম নির্বাচন করুন
                      </h3>
                    </div>
                    <div className="bg-card rounded-xl border border-border/40 p-6">
                      <FrameSelector
                        selectedFrameId={selectedFrameId}
                        onFrameSelect={handleFrameSelect}
                      />
                    </div>
                  </div>
                </section>

                {/* Image Upload and Zoom Control */}
                <section className="animate-in fade-in duration-500 delay-100">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                        2
                      </div>
                      <h3 className="text-xl font-bold text-foreground">
                        নিয়ন্ত্রণ
                      </h3>
                    </div>

                    <div className="bg-card rounded-xl border border-border/40 p-6">
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* Upload Section */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <h4 className="font-semibold text-foreground">
                              {userImage
                                ? "ছবি পরিবর্তন করুন"
                                : "ছবি আপলোড করুন"}
                            </h4>
                          </div>
                          <UploadButton
                            onImageUpload={handleImageUpload}
                            disabled={isLoading}
                          />
                        </div>

                        {/* Zoom Section - Only visible when image is uploaded */}
                        {userImage && (
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                              <h4 className="font-semibold text-foreground">
                                জুম সামঞ্জস্য
                              </h4>
                              <span className="ml-auto text-sm font-bold text-primary">
                                {Math.round(zoom)}%
                              </span>
                            </div>
                            <div className="bg-muted/30 rounded-lg">
                              <ZoomSlider
                                value={zoom}
                                onChange={handleZoomChange}
                                disabled={!userImage}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Download Button */}
                <section className="animate-in fade-in duration-500 delay-200">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                        3
                      </div>
                      <h3 className="text-xl font-bold text-foreground">
                        ডাউনলোড করুন
                      </h3>
                    </div>
                    {userImage ? (
                      <DownloadButton
                        onDownload={handleDownload}
                        disabled={!canDownload}
                      />
                    ) : (
                      <button
                        disabled
                        className="w-full px-6 py-4 bg-muted text-muted-foreground font-medium rounded-xl cursor-not-allowed opacity-60 text-center transition-colors text-lg"
                      >
                        ছবি নির্বাচন করুন
                      </button>
                    )}
                  </div>
                </section>
              </div>

              {/* Right Column - Canvas Preview */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-foreground">
                    প্রিভিউ
                  </h2>
                  {userImage && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      ছবি আপলোড হয়েছে
                    </span>
                  )}
                </div>

                <div className="bg-card rounded-xl border border-border/40 overflow-hidden py-8 px-6 flex justify-center min-h-[500px] sticky top-4">
                  <CanvasEditor
                    userImage={userImage}
                    selectedFrameId={selectedFrameId}
                    zoom={zoom}
                    onExportReady={handleExportReady}
                    onZoomChange={handleZoomChange}
                    onImageUpload={handleImageUpload}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center gap-2 py-4 px-4 bg-card rounded-lg border border-border/40 max-w-2xl mx-auto mt-6">
              <Sparkles className="w-4 h-4 text-primary animate-spin" />
              <span className="text-sm font-medium text-foreground">
                ছবি আপলোড হচ্ছে...
              </span>
            </div>
          )}
        </div>
      </main>

      <div className="w-full bg-muted/50">
        <div className="container mx-auto px-4 py-3 text-center">
          <p className="text-sm text-muted-foreground">
            🔒 ছবি আপনার ডিভাইসেই প্রসেস হয়, সার্ভারে কোনো তথ্য সংরক্ষণ করা হয়
            না।
          </p>
        </div>
      </div>

      <footer className="w-full border-t border-border/40 bg-background/95">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-center sm:text-left">
            {/* LEFT */}
            <p className="text-sm text-muted-foreground">
              {/* © {new Date().getFullYear()} বিএনপি ফটো ফ্রেম মেকার */}
            </p>

            {/* CENTER */}
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} বিএনপি ফটো ফ্রেম মেকার
            </p>

            {/* RIGHT */}
            <p className="text-sm text-muted-foreground">
              {/* Developed with ❤️ for Bangladesh */}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}