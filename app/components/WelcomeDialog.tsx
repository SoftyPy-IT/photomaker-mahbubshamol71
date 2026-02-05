"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Frame, Upload, ZoomIn } from "lucide-react";
import { useEffect, useState } from "react";

interface WelcomeDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function WelcomeDialog({
  open: controlledOpen,
  onOpenChange,
}: WelcomeDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  useEffect(() => {
    // Check if user has visited before
    const hasVisited = localStorage.getItem("hasVisitedBefore");

    if (!hasVisited) {
      setTimeout(() => setInternalOpen(true), 0);
    }
  }, []);

  const handleClose = () => {
    // Mark as visited
    localStorage.setItem("hasVisitedBefore", "true");

    if (onOpenChange) {
      onOpenChange(false);
    } else {
      setInternalOpen(false);
    }
  };

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange || setInternalOpen}>
      <DialogContent
        className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto [&>button]:hidden"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-center text-primary">
            নির্দেশিকা
          </DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            মাত্র ৪টি ক্লিকে নির্বাচনী ফটোকার্ড বানান
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 ">
          {/* Step 1 */}
          <div className="flex gap-4 items-start group hover:bg-muted/50  rounded-lg transition-colors">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Frame className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  ১
                </div>
                <h3 className="font-semibold text-lg">ফ্রেম নির্বাচন</h3>
              </div>
              <p className="text-muted-foreground">
                যেকোনো একটি ফ্রেম নির্বাচন করুন।
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4 items-start group hover:bg-muted/50 rounded-lg transition-colors">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Upload className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  ২
                </div>
                <h3 className="font-semibold text-lg">ছবি আপলোড</h3>
              </div>
              <p className="text-muted-foreground">
                আপনার একটি ছবি আপলোড করুন।
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-4 items-start group hover:bg-muted/50 rounded-lg transition-colors">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <ZoomIn className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  ৩
                </div>
                <h3 className="font-semibold text-lg">পজিশন সামঞ্জস্য</h3>
              </div>
              <p className="text-muted-foreground">
                জুম ইন আউট করে আপনার ছবির পজিশন ঠিক করুন।
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex gap-4 items-start group hover:bg-muted/50 rounded-lg transition-colors">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Download className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  ৪
                </div>
                <h3 className="font-semibold text-lg">ডাউনলোড</h3>
              </div>
              <p className="text-muted-foreground">
                প্রিভিউ দেখে আপনার ফটোকার্ড টি ডাউনলোড করুন।
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button onClick={handleClose} className="flex-1 ">
            শুরু করুন
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
