"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { RATING_LABELS } from "@/types/feedback";

interface StarRatingProps {
  value: number;
  onChange: (rating: number) => void;
  disabled?: boolean;
  error?: string;
}

export function StarRating({
  value,
  onChange,
  disabled = false,
  error,
}: StarRatingProps) {
  const [hovered, setHovered] = useState<number>(0);
  const activeValue = hovered || value;

  return (
    <div className="space-y-3">
      <div
        className="flex flex-wrap items-center gap-2 sm:gap-3"
        role="radiogroup"
        aria-label="Penilaian acara bintang 1 sampai 5"
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= activeValue;
          const isSelected = star === value;

          return (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={`${star} bintang - ${RATING_LABELS[star]}`}
              disabled={disabled}
              onClick={() => onChange(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className={`group flex flex-col items-center justify-center rounded-xl border px-3 py-2.5 sm:px-4 sm:py-3 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B433B] focus-visible:ring-offset-2 ${
                isSelected
                  ? "border-[#C8A156] bg-[#FAF2DF]/80 shadow-sm"
                  : isFilled
                  ? "border-[#DFBE7A] bg-[#FAF2DF]/45"
                  : "border-[#E5DEC9] bg-white hover:border-[#C8A156]/70 hover:bg-[#FBF8F1]"
              } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
            >
              <Star
                className={`h-7 w-7 sm:h-8 sm:w-8 transition-transform duration-150 group-hover:scale-110 ${
                  isFilled
                    ? "fill-[#D1A347] text-[#B88930]"
                    : "fill-transparent text-[#B8B29F]"
                }`}
                strokeWidth={1.75}
              />
              <span
                className={`mt-1 text-xs font-semibold ${
                  isSelected ? "text-[#0B433B]" : "text-[#6B6E66]"
                }`}
              >
                {star}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#6B6E66]">
        <span>1 = Sangat Kurang Puas</span>
        {activeValue > 0 && (
          <span className="inline-flex items-center rounded-full bg-[#0B433B]/10 px-3 py-1 font-semibold text-[#0B433B]">
            {activeValue} / 5 — {RATING_LABELS[activeValue]}
          </span>
        )}
        <span>5 = Sangat Puas</span>
      </div>

      {error && (
        <p className="text-sm font-medium text-[#B8423E]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

