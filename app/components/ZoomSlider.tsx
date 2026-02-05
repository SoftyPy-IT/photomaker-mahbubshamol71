"use client";

import { memo, useCallback } from "react";
import { Slider } from "@/components/ui/slider";
import { Minus, Plus } from "lucide-react";

interface ZoomSliderProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export const ZoomSlider = memo<ZoomSliderProps>(function ZoomSlider({
  value,
  onChange,
  disabled,
}) {
  const handleIncrement = useCallback(() => {
    if (!disabled) {
      onChange(Math.min(value + 10, 300));
    }
  }, [disabled, onChange, value]);

  const handleDecrement = useCallback(() => {
    if (!disabled) {
      onChange(Math.max(value - 10, 50));
    }
  }, [disabled, onChange, value]);

  const handleSliderChange = useCallback(
    (vals: number[]) => onChange(vals[0]),
    [onChange],
  );

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      {/* Main Zoom Slider */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || value <= 50}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 hover:bg-primary/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
          aria-label="Decrease zoom"
        >
          <Minus className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
        </button>

        <div className="flex-1 px-2">
          <Slider
            value={[value]}
            onValueChange={handleSliderChange}
            min={50}
            max={300}
            step={5}
            disabled={disabled}
            className="py-2"
          />
        </div>

        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || value >= 300}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 hover:bg-primary/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
          aria-label="Increase zoom"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
        </button>
      </div>
    </div>
  );
});
