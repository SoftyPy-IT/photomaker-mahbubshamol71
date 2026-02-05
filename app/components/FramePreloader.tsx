"use client";

import { useEffect } from "react";

interface FramePreloaderProps {
  frameUrls: string[];
  preloadCount?: number;
}

export function FramePreloader({
  frameUrls,
  preloadCount = 3,
}: FramePreloaderProps) {
  useEffect(() => {
    // Preload first few frames
    const framesToPreload = frameUrls.slice(0, preloadCount);

    framesToPreload.forEach((url, index) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = url;
      // Higher priority for first frame
      if (index === 0) {
        link.setAttribute("fetchpriority", "high");
      }
      document.head.appendChild(link);
    });

    // Cleanup function
    return () => {
      const preloadLinks = document.querySelectorAll(
        'link[rel="preload"][as="image"]',
      );
      preloadLinks.forEach((link) => {
        if (frameUrls.some((url) => link.getAttribute("href")?.includes(url))) {
          link.remove();
        }
      });
    };
  }, [frameUrls, preloadCount]);

  return null; // This component doesn't render anything
}
