"use client";

import { useRef, useState } from "react";
import {
  CheckCircle2,
  Download,
  Loader2,
  MessageCircle,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { GreetingCardPreview } from "@/components/GreetingCardPreview";
import {
  buildGreetingCardFilename,
  renderGreetingCardBlob,
  renderGreetingCardPngDataUrl,
  triggerPngDownload,
} from "@/lib/card-export";
import type { SubmittedParticipant } from "@/types/feedback";

interface GreetingCardViewProps {
  participant: SubmittedParticipant;
  onCreateAnother: () => void;
}

export function GreetingCardView({
  participant,
  onCreateAnother,
}: GreetingCardViewProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "info" | "error";
    text: string;
  } | null>(null);

  const filename = buildGreetingCardFilename(participant.fullName);

  async function handleDownload() {
    if (!cardRef.current || isDownloading || isSharing) return;

    setStatusMessage(null);
    setIsDownloading(true);

    try {
      const dataUrl = await renderGreetingCardPngDataUrl(cardRef.current);
      triggerPngDownload(dataUrl, filename);
      setStatusMessage({
        type: "success",
        text: "Greeting card resolusi tinggi (PNG) berhasil diunduh!",
      });
    } catch (error) {
      console.error("Gagal mengunduh greeting card:", error);
      setStatusMessage({
        type: "error",
        text: "Maaf, terjadi kendala saat membuat file PNG. Silakan coba lagi.",
      });
    } finally {
      setIsDownloading(false);
    }
  }

  async function handleShareWhatsApp() {
    if (!cardRef.current || isDownloading || isSharing) return;

    setStatusMessage(null);
    setIsSharing(true);

    try {
      const blob = await renderGreetingCardBlob(cardRef.current);
      const file = new File([blob], filename, { type: "image/png" });
      const shareText = `Terima kasih telah menjadi bagian dari NUSAFAITH – Edisi Kasmaran! Ini greeting card kenang-kenangan untuk ${participant.fullName}.`;

      const canNativeShareFiles =
        typeof navigator !== "undefined" &&
        typeof navigator.share === "function" &&
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] });

      if (canNativeShareFiles) {
        try {
          await navigator.share({
            files: [file],
            title: "Greeting Card NUSAFAITH – Edisi Kasmaran",
            text: shareText,
          });
          setStatusMessage({
            type: "success",
            text: "Greeting card siap dibagikan melalui WhatsApp atau aplikasi pilihanmu.",
          });
          return;
        } catch (shareError) {
          // Jika pengguna membatalkan dialog share secara sengaja, jangan paksa fallback error
          if (
            shareError instanceof Error &&
            shareError.name === "AbortError"
          ) {
            return;
          }
        }
      }

      // Fallback untuk browser desktop / browser yang belum mendukung Web Share API file
      triggerPngDownload(blob, filename);
      setStatusMessage({
        type: "info",
        text: "Browser ini belum mendukung berbagi gambar langsung. Greeting card PNG telah diunduh otomatis agar kamu bisa langsung mengirimkannya lewat WhatsApp!",
      });
    } catch (error) {
      console.error("Gagal membagikan greeting card:", error);
      setStatusMessage({
        type: "error",
        text: "Maaf, gagal menyiapkan gambar untuk dibagikan. Silakan coba tombol Download PNG.",
      });
    } finally {
      setIsSharing(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 animate-fade-slide-up">
      {/* Banner Konfirmasi Berhasil */}
      <section className="overflow-hidden rounded-2xl border border-[#DFBE7A]/70 bg-white shadow-[0_10px_35px_-12px_rgba(11,67,59,0.12)]">
        <div className="h-2.5 w-full bg-gradient-to-r from-[#0B433B] via-[#C8A156] to-[#0B433B]" />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 sm:p-6">
          <div className="flex items-start gap-3.5">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0B433B]/10 text-[#0B433B]">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#9C7324]">
                <Sparkles className="h-3.5 w-3.5" />
                Feedback Tersimpan
              </div>
              <h1
                className="mt-0.5 text-xl sm:text-2xl font-bold text-[#0B433B]"
                style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
              >
                Greeting Card Spesial Untukmu, {participant.fullName}
              </h1>
              <p className="mt-1 text-sm text-[#4D5E58]">
                Terima kasih telah mengisi feedback acara{" "}
                <span className="font-medium text-[#0B433B]">
                  Nusafaith – Edisi Kasmaran
                </span>
                . Simpan atau bagikan kartu kenang-kenanganmu di bawah ini.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Preview Greeting Card */}
      <section className="rounded-2xl border border-[#E5DEC9] bg-white p-3.5 sm:p-6 shadow-[0_14px_40px_-14px_rgba(11,67,59,0.16)]">
        <GreetingCardPreview
          fullName={participant.fullName}
          cardRef={cardRef}
        />

        {/* Status Toast / Feedback Download & Share */}
        {statusMessage && (
          <div
            role="status"
            className={`mt-4 rounded-xl border px-4 py-3 text-sm font-medium ${
              statusMessage.type === "success"
                ? "border-[#0B433B]/20 bg-[#EEF6F3] text-[#0B433B]"
                : statusMessage.type === "info"
                ? "border-[#C8A156]/40 bg-[#FAF2DF] text-[#6D4E15]"
                : "border-[#B8423E]/30 bg-[#FDF3F2] text-[#8F2D2A]"
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading || isSharing}
              className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#0B433B] to-[#125C51] px-5 py-3 text-sm sm:text-base font-semibold text-[#FAF2DF] shadow-[0_10px_25px_-8px_rgba(11,67,59,0.45)] transition hover:brightness-110 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B433B] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-65 cursor-pointer"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Menyiapkan PNG...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Download Greeting Card
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleShareWhatsApp}
              disabled={isDownloading || isSharing}
              className="inline-flex items-center justify-center gap-2.5 rounded-xl border border-[#1E8E5A]/35 bg-[#EFFAF4] px-5 py-3 text-sm sm:text-base font-semibold text-[#136A42] transition hover:bg-[#E1F5EA] active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E8E5A] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-65 cursor-pointer"
            >
              {isSharing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Menyiapkan Gambar...
                </>
              ) : (
                <>
                  <MessageCircle className="h-4 w-4" />
                  Share via WhatsApp
                </>
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={onCreateAnother}
            disabled={isDownloading || isSharing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#DDD4BE] bg-[#FCFBF8] px-4 py-3 text-sm font-semibold text-[#364A44] transition hover:border-[#0B433B]/40 hover:bg-[#FAF2DF]/50 hover:text-[#0B433B] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B433B] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            Buat Greeting Card Lagi
          </button>
        </div>
      </section>
    </div>
  );
}

