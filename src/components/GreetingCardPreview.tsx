"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { CARD_HEIGHT, CARD_WIDTH } from "@/lib/card-export";
import { playfairDisplay } from "@/lib/fonts";

interface GreetingCardPreviewProps {
  fullName: string;
  cardRef: RefObject<HTMLDivElement | null>;
}

// Koordinat area plaque krem pada template asli 1920 x 1080
const PLAQUE_BOX = {
  left: 590,
  top: 438,
  width: 759,
  height: 71,
} as const;

const MAX_SINGLE_LINE_WIDTH = 725;
const MAX_FONT_SIZE = 44;
const MIN_SINGLE_LINE_FONT_SIZE = 24;
const MIN_MULTI_LINE_FONT_SIZE = 20;

export function GreetingCardPreview({
  fullName,
  cardRef,
}: GreetingCardPreviewProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [scale, setScale] = useState<number>(1);
  const [textLayout, setTextLayout] = useState<{
    fontSize: number;
    multiline: boolean;
  }>({
    fontSize: MAX_FONT_SIZE,
    multiline: false,
  });

  // Skala responsif agar preview di HP maupun desktop tetap presisi 1920x1080
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const updateScale = () => {
      const availableWidth = wrapper.clientWidth;
      if (availableWidth > 0) {
        setScale(availableWidth / CARD_WIDTH);
      }
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(wrapper);

    return () => observer.disconnect();
  }, []);

  // Penyesuaian ukuran font otomatis berdasarkan panjang nama & lebar terukur
  useLayoutEffect(() => {
    let cancelled = false;

    const fitText = () => {
      const el = textRef.current;
      if (!el || cancelled) return;

      el.style.whiteSpace = "nowrap";
      el.style.lineHeight = "1.05";

      let size = MAX_FONT_SIZE;
      el.style.fontSize = `${size}px`;

      while (
        el.scrollWidth > MAX_SINGLE_LINE_WIDTH &&
        size > MIN_SINGLE_LINE_FONT_SIZE
      ) {
        size -= 1;
        el.style.fontSize = `${size}px`;
      }

      if (el.scrollWidth <= MAX_SINGLE_LINE_WIDTH) {
        if (!cancelled) {
          setTextLayout({ fontSize: size, multiline: false });
        }
        return;
      }

      // Fallback 2 baris untuk nama yang sangat panjang agar tetap rapi di dalam plaque
      el.style.whiteSpace = "normal";
      el.style.lineHeight = "1.12";
      let multiSize = 24;
      el.style.fontSize = `${multiSize}px`;

      while (
        (el.scrollHeight > PLAQUE_BOX.height - 4 ||
          el.scrollWidth > PLAQUE_BOX.width - 16) &&
        multiSize > MIN_MULTI_LINE_FONT_SIZE
      ) {
        multiSize -= 1;
        el.style.fontSize = `${multiSize}px`;
      }

      if (!cancelled) {
        setTextLayout({ fontSize: multiSize, multiline: true });
      }
    };

    fitText();

    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(() => {
        if (!cancelled) {
          fitText();
        }
      });
    }

    return () => {
      cancelled = true;
    };
  }, [fullName]);

  return (
    <div
      ref={wrapperRef}
      className="relative w-full overflow-hidden rounded-xl shadow-[0_18px_45px_-14px_rgba(11,67,59,0.35)] ring-1 ring-[#C8A156]/40 bg-[#0B433B]"
      style={{
        height: `${CARD_HEIGHT * scale}px`,
      }}
    >
      <div
        style={{
          width: `${CARD_WIDTH}px`,
          height: `${CARD_HEIGHT}px`,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {/* Node kanonik 1920x1080 yang dirender langsung oleh html-to-image */}
        <div
          ref={cardRef}
          className="relative select-none overflow-hidden bg-[#0B433B]"
          style={{
            width: `${CARD_WIDTH}px`,
            height: `${CARD_HEIGHT}px`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/greeting-card-template.png"
            alt={`Greeting Card Nusafaith Edisi Kasmaran untuk ${fullName}`}
            width={CARD_WIDTH}
            height={CARD_HEIGHT}
            draggable={false}
            className="block h-full w-full object-cover"
          />

          {/* Nama peserta terintegrasi di dalam plaque tengah desain asli */}
          <div
            className="absolute flex items-center justify-center px-3 text-center"
            style={{
              left: `${PLAQUE_BOX.left}px`,
              top: `${PLAQUE_BOX.top}px`,
              width: `${PLAQUE_BOX.width}px`,
              height: `${PLAQUE_BOX.height}px`,
            }}
          >
            <span
              ref={textRef}
              className="block max-w-full text-center"
              style={{
                fontFamily: `${playfairDisplay.style.fontFamily}, Georgia, serif`,
                fontWeight: 600,
                fontSize: `${textLayout.fontSize}px`,
                lineHeight: textLayout.multiline ? 1.12 : 1.05,
                whiteSpace: textLayout.multiline ? "normal" : "nowrap",
                letterSpacing: "0.015em",
                color: "#08403A",
                textShadow: "0 1px 0 rgba(255, 255, 255, 0.5)",
                paddingBottom: "2px",
              }}
            >
              {fullName}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
