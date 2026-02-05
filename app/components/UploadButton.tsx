"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, Upload } from "lucide-react";
import { memo, useCallback, useRef, useState } from "react";

interface UploadButtonProps {
  onImageUpload: (file: File) => void;
  disabled?: boolean;
}

export const UploadButton = memo<UploadButtonProps>(function UploadButton({
  onImageUpload,
  disabled,
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback((file: File): string | null => {
    if (!file.type.startsWith("image/")) {
      return "দয়া করে একটি ছবি ফাইল নির্বাচন করুন।";
    }
    if (file.size > 10 * 1024 * 1024) {
      return "ছবির সাইজ ১০MB এর চেয়ে কম হতে হবে।";
    }
    return null;
  }, []);

  const handleFile = useCallback(
    (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        setTimeout(() => setError(null), 5000);
        return;
      }
      setError(null);
      onImageUpload(file);
    },
    [validateFile, onImageUpload],
  );

  const handleClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  }, [disabled]);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        handleFile(file);
        // Reset input so same file can be selected again
        event.target.value = "";
      }
    },
    [handleFile],
  );

  return (
    <div className="w-full space-y-3">
      <Button
        onClick={handleClick}
        disabled={disabled}
        size="lg"
        className="w-full h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all gap-3 active:scale-[0.98] "
      >
        <Upload className="w-5 h-5" strokeWidth={2.5} />
        <span>ব্রাউজ করুন</span>
      </Button>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Upload image"
      />
    </div>
  );
});
