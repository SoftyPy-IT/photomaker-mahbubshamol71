"use client";

import { Button } from "@/components/ui/button";
import { Check, Download, Loader } from "lucide-react";
import { memo, useCallback, useState } from "react";

interface DownloadButtonProps {
  onDownload: () => void;
  disabled?: boolean;
}

export const DownloadButton = memo<DownloadButtonProps>(
  function DownloadButton({ onDownload, disabled }) {
    const [isDownloading, setIsDownloading] = useState(false);
    const [justDownloaded, setJustDownloaded] = useState(false);

    const handleDownload = useCallback(async () => {
      if (disabled || isDownloading) return;

      try {
        setIsDownloading(true);

        // Add processing delay for visual feedback
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Execute the download
        onDownload();

        setJustDownloaded(true);
        setTimeout(() => setJustDownloaded(false), 2000);
      } catch (error) {
        console.error("Download error:", error);
        alert("ডাউনলোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
      } finally {
        setIsDownloading(false);
      }
    }, [disabled, isDownloading, onDownload]);

    const getButtonContent = () => {
      if (isDownloading) {
        return (
          <>
            <Loader className="w-5 h-5 animate-spin" strokeWidth={2.5} />
            <span>প্রসেসিং...</span>
          </>
        );
      }

      if (justDownloaded) {
        return (
          <>
            <Check className="w-5 h-5" strokeWidth={2.5} />
            <span>ডাউনলোড সম্পন্ন!</span>
          </>
        );
      }

      return (
        <>
          <Download className="w-5 h-5" strokeWidth={2.5} />
          <span>ছবি ডাউনলোড করুন</span>
        </>
      );
    };

    const getButtonColor = () => {
      if (justDownloaded) {
        return "bg-green-600 hover:bg-green-700";
      }
      return "bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700";
    };

    return (
      <div className="space-y-3">
        <Button
          onClick={handleDownload}
          disabled={disabled || isDownloading}
          size="lg"
          className={`w-full h-10 rounded-xl ${getButtonColor()} text-white font-bold text-base transition-all gap-3 active:scale-[0.98] ${
            justDownloaded ? "animate-pulse" : ""
          }`}
        >
          {getButtonContent()}
        </Button>
      </div>
    );
  },
);
