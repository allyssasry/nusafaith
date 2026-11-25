"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import {
  CARD_HEIGHT,
  CARD_WIDTH,
  renderGreetingCardPngDataUrl,
} from "@/lib/card-export";
import { playfairDisplay } from "@/lib/fonts";
import { Loader2 } from "lucide-react";

interface GreetingCardPreviewProps {
  fullName: string;
  cardRef: RefObject<HTMLDivElement | null>;
  onBaked?: (dataUrl: string) => void;
}

// Koordinat area plaque krem pada template asli 1920 x 1080
const PLAQUE_BOX = {
  left: 540,
  top: 480,
  width: 843,
  height: 78,
} as const;

const MAX_SINGLE_LINE_WIDTH = 760;
const MAX_FONT_SIZE = 36;
const MIN_SINGLE_LINE_FONT_SIZE = 22;
const MIN_MULTI_LINE_FONT_SIZE = 18;

export function GreetingCardPreview({
  fullName,
  cardRef,
  onBaked,
}: GreetingCardPreviewProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [scale, setScale] = useState<number>(1);
  const [bakedDataUrl, setBakedDataUrl] = useState<string | null>(null);
  const [isBaking, setIsBaking] = useState(true);
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

  // Otomatis menggabungkan gambar template + teks nama (baking)
  // Menjadi 1 file gambar utuh (flat), sehingga saat di-tap/tahan lama di HP (iOS/Android),
  // pop-up preview dan "Save to Photos" sudah mengunci nama peserta.
  useEffect(() => {
    let cancelled = false;

    async function bakeImage() {
      setIsBaking(true);
      try {
        if (typeof document !== "undefined" && "fonts" in document) {
          await document.fonts.ready;
        }

        // Tunggu sebentar agar render layout dan font selesai
        await new Promise((resolve) => setTimeout(resolve, 80));

        if (cardRef.current && !cancelled) {
          const dataUrl = await renderGreetingCardPngDataUrl(cardRef.current);
          if (!cancelled) {
            setBakedDataUrl(dataUrl);
            setIsBaking(false);
            onBaked?.(dataUrl);
          }
        }
      } catch (err) {
        console.error("Gagal melakukan baking greeting card:", err);
        if (!cancelled) {
          setIsBaking(false);
        }
      }
    }

    bakeImage();

    return () => {
      cancelled = true;
    };
  }, [fullName, textLayout, cardRef, onBaked]);

  return (
    <div className="space-y-2">
      {/* Container visual utama yang dilihat dan disentuh oleh pengguna */}
      <div
        ref={wrapperRef}
        className="relative w-full overflow-hidden rounded-xl shadow-[0_18px_45px_-14px_rgba(11,67,59,0.35)] ring-1 ring-[#C8A156]/40 bg-[#0B433B]"
        style={{
          minHeight: `${CARD_HEIGHT * scale}px`,
        }}
      >
        {bakedDataUrl ? (
          /* GAMBAR HASIL BAKING (FLATTENED IMAGE)
             Nama dan background sudah menyatu permanen. Saat pengguna HP menekan lama (long-press)
             untuk "Save to Photos" atau "Share", gambar yang disimpan/dibagikan sudah berisi nama! */
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={bakedDataUrl}
            alt={`Greeting Card Nusafaith Edisi Kasmaran untuk ${fullName}`}
            className="block h-auto w-full rounded-xl select-none"
            style={{
              WebkitTouchCallout: "default",
            }}
          />
        ) : (
          /* Tampilan DOM sementara sambil proses baking gambar selesai (< 200ms) */
          <div
            style={{
              width: `${CARD_WIDTH}px`,
              height: `${CARD_HEIGHT}px`,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            <div
              className="relative select-none overflow-hidden bg-[#0B433B]"
              style={{
                width: `${CARD_WIDTH}px`,
                height: `${CARD_HEIGHT}px`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/greeting-card-template.png"
                alt=""
                width={CARD_WIDTH}
                height={CARD_HEIGHT}
                draggable={false}
                className="block h-full w-full object-cover"
                style={{
                  pointerEvents: "none",
                  WebkitTouchCallout: "none",
                }}
              />

              <div
                className="absolute flex items-center justify-center px-6 text-center"
                style={{
                  left: `${PLAQUE_BOX.left}px`,
                  top: `${PLAQUE_BOX.top}px`,
                  width: `${PLAQUE_BOX.width}px`,
                  height: `${PLAQUE_BOX.height}px`,
                  pointerEvents: "none",
                }}
              >
                <span
                  className="block max-w-full text-center"
                  style={{
                    fontFamily: `${playfairDisplay.style.fontFamily}, Georgia, serif`,
                    fontWeight: 600,
                    fontSize: `${textLayout.fontSize}px`,
                    lineHeight: textLayout.multiline ? 1.15 : 1,
                    whiteSpace: textLayout.multiline ? "normal" : "nowrap",
                    letterSpacing: "0.01em",
                    color: "#08403A",
                    textShadow: "0 1px 0 rgba(255, 255, 255, 0.45)",
                  }}
                >
                  {fullName}
                </span>
              </div>
            </div>

            {/* Indikator baking cepat */}
            {isBaking && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/15 backdrop-blur-[2px]">
                <div className="flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-xs font-semibold text-[#0B433B] shadow-md">
                  <Loader2 className="h-4 w-4 animate-spin text-[#C8A156]" />
                  Mengunci Nama ke Kartu...
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* NODE KANONIK OFFSCREEN (1920x1080)
          Node ini tidak terlihat secara visual di layar, tetapi selalu dirender di DOM untuk html-to-image
          agar ukuran font dan koordinatnya selalu 100% konsisten pada resolusi asli Full HD */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          left: "-99999px",
          top: "0",
          width: `${CARD_WIDTH}px`,
          height: `${CARD_HEIGHT}px`,
          pointerEvents: "none",
          overflow: "hidden",
          zIndex: -50,
        }}
      >
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
            alt=""
            width={CARD_WIDTH}
            height={CARD_HEIGHT}
            crossOrigin="anonymous"
            draggable={false}
            className="block h-full w-full object-cover"
          />

          <div
            className="absolute flex items-center justify-center px-6 text-center"
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
                lineHeight: textLayout.multiline ? 1.15 : 1,
                whiteSpace: textLayout.multiline ? "normal" : "nowrap",
                letterSpacing: "0.01em",
                color: "#08403A",
                textShadow: "0 1px 0 rgba(255, 255, 255, 0.45)",
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
