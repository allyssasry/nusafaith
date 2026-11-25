"use client";

import { useState, type FormEvent } from "react";
import {
  AlertCircle,
  ChevronDown,
  HeartHandshake,
  Loader2,
  Send,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { StarRating } from "@/components/StarRating";
import { ENTITY_OPTIONS } from "@/config/entities";
import {
  submitNusafaithFeedback,
  validateFeedbackForm,
} from "@/lib/supabase/feedback";
import type {
  FeedbackFieldErrors,
  FeedbackFormValues,
  SubmittedParticipant,
} from "@/types/feedback";

interface FeedbackFormProps {
  onSuccess: (participant: SubmittedParticipant) => void;
}

const INITIAL_VALUES: FeedbackFormValues = {
  fullName: "",
  entity: "",
  division: "",
  feedback: "",
  rating: 0,
  memorableMoment: "",
};

export function FeedbackForm({ onSuccess }: FeedbackFormProps) {
  const [values, setValues] = useState<FeedbackFormValues>(INITIAL_VALUES);
  const [fieldErrors, setFieldErrors] = useState<FeedbackFieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<K extends keyof FeedbackFormValues>(
    field: K,
    value: FeedbackFormValues[K]
  ) {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }));

    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });

    if (submitError) {
      setSubmitError(null);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);

    const validation = validateFeedbackForm(values);
    if (!validation.isValid || !validation.payload) {
      setFieldErrors(validation.errors);
      setSubmitError(
        "Mohon lengkapi seluruh kolom wajib yang ditandai sebelum mengirim formulir."
      );
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const result = await submitNusafaithFeedback(values);

      if (!result.ok) {
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
        setSubmitError(
          result.errorMessage ??
            "Terjadi kesalahan saat menyimpan feedback. Silakan coba lagi."
        );
        return;
      }

      onSuccess({
        fullName: validation.payload.full_name,
        entity: validation.payload.entity,
        division: validation.payload.division,
        rating: validation.payload.rating,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="mx-auto w-full max-w-2xl space-y-5 animate-fade-slide-up"
    >
      {/* Header Card ala Google Form */}
      <section className="overflow-hidden rounded-2xl border border-[#E5DEC9] bg-white shadow-[0_10px_35px_-12px_rgba(11,67,59,0.12)]">
        <div className="h-3 w-full bg-gradient-to-r from-[#0B433B] via-[#C8A156] to-[#0B433B]" />
        <div className="p-6 sm:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#DFBE7A]/70 bg-[#FAF2DF] px-3.5 py-1 text-xs font-semibold tracking-wider text-[#0B433B] uppercase">
            <Sparkles className="h-3.5 w-3.5 text-[#B88930]" />
            Kajian Insan Entreplanters Rutinan
          </div>

          <h1
            className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0B433B]"
            style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
          >
            NUSAFAITH – EDISI KASMARAN
          </h1>

          <p className="mt-3 text-sm sm:text-base leading-relaxed text-[#42554F]">
            Terima kasih telah menjadi bagian dari momen spesial Nusafaith Edisi
            Kasmaran! Yuk, bagikan pengalamanmu dan dapatkan greeting card
            spesial sebagai kenang-kenangan dari acara ini.
          </p>

          <div className="mt-5 border-t border-[#EFE9D8] pt-3.5 text-xs font-medium text-[#B8423E]">
            * Menunjukkan pertanyaan yang wajib diisi
          </div>
        </div>
      </section>

      {/* Bagian A - Identitas Peserta */}
      <section className="rounded-2xl border border-[#E5DEC9] bg-white p-6 sm:p-7 shadow-[0_6px_24px_-10px_rgba(11,67,59,0.08)] space-y-6">
        <div className="flex items-center gap-2.5 border-b border-[#EFE9D8] pb-3.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0B433B]/10 text-[#0B433B]">
            <UserCheck className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#0B433B]">
              Bagian A – Identitas Peserta
            </h2>
            <p className="text-xs text-[#6B6E66]">
              Informasi ini digunakan untuk personalisasi greeting card Anda.
            </p>
          </div>
        </div>

        {/* 1. Nama Lengkap */}
        <div className="space-y-2">
          <label
            htmlFor="fullName"
            className="block text-sm sm:text-[15px] font-semibold text-[#132E29]"
          >
            1. Nama Lengkap <span className="text-[#B8423E]">*</span>
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            maxLength={100}
            disabled={isSubmitting}
            value={values.fullName}
            onChange={(e) => updateField("fullName", e.target.value)}
            placeholder="Masukkan Nama Lengkap"
            aria-invalid={Boolean(fieldErrors.fullName)}
            className={`w-full rounded-xl border bg-[#FCFBF8] px-4 py-3 text-sm sm:text-base text-[#132E29] placeholder:text-[#9AA09A] transition focus:bg-white focus:outline-none focus:ring-2 ${
              fieldErrors.fullName
                ? "border-[#B8423E] focus:border-[#B8423E] focus:ring-[#B8423E]/20"
                : "border-[#DDD4BE] focus:border-[#0B433B] focus:ring-[#0B433B]/15"
            }`}
          />
          <p className="text-xs text-[#6B6E66]">
            Nama ini akan langsung tercantum di desain greeting card digital
            Anda.
          </p>
          {fieldErrors.fullName && (
            <p className="text-sm font-medium text-[#B8423E]" role="alert">
              {fieldErrors.fullName}
            </p>
          )}
        </div>

        {/* 2. Entitas */}
        <div className="space-y-2">
          <label
            htmlFor="entity"
            className="block text-sm sm:text-[15px] font-semibold text-[#132E29]"
          >
            2. Entitas <span className="text-[#B8423E]">*</span>
          </label>
          <div className="relative">
            <select
              id="entity"
              name="entity"
              required
              disabled={isSubmitting}
              value={values.entity}
              onChange={(e) => updateField("entity", e.target.value)}
              aria-invalid={Boolean(fieldErrors.entity)}
              className={`w-full appearance-none rounded-xl border bg-[#FCFBF8] px-4 py-3 pr-10 text-sm sm:text-base transition focus:bg-white focus:outline-none focus:ring-2 ${
                values.entity ? "text-[#132E29]" : "text-[#8A918B]"
              } ${
                fieldErrors.entity
                  ? "border-[#B8423E] focus:border-[#B8423E] focus:ring-[#B8423E]/20"
                  : "border-[#DDD4BE] focus:border-[#0B433B] focus:ring-[#0B433B]/15"
              }`}
            >
              <option value="" disabled>
                Pilih entitas Anda...
              </option>
              {ENTITY_OPTIONS.map((entity) => (
                <option key={entity} value={entity} className="text-[#132E29]">
                  {entity}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B6E66]" />
          </div>
          {fieldErrors.entity && (
            <p className="text-sm font-medium text-[#B8423E]" role="alert">
              {fieldErrors.entity}
            </p>
          )}
        </div>

        {/* 3. Divisi (Input Teks) */}
        <div className="space-y-2">
          <label
            htmlFor="division"
            className="block text-sm sm:text-[15px] font-semibold text-[#132E29]"
          >
            3. Divisi <span className="text-[#B8423E]">*</span>
          </label>
          <input
            id="division"
            name="division"
            type="text"
            required
            maxLength={100}
            disabled={isSubmitting}
            value={values.division}
            onChange={(e) => updateField("division", e.target.value)}
            placeholder="Masukkan Divisi Anda..."
            aria-invalid={Boolean(fieldErrors.division)}
            className={`w-full rounded-xl border bg-[#FCFBF8] px-4 py-3 text-sm sm:text-base text-[#132E29] placeholder:text-[#9AA09A] transition focus:bg-white focus:outline-none focus:ring-2 ${
              fieldErrors.division
                ? "border-[#B8423E] focus:border-[#B8423E] focus:ring-[#B8423E]/20"
                : "border-[#DDD4BE] focus:border-[#0B433B] focus:ring-[#0B433B]/15"
            }`}
          />
          {fieldErrors.division && (
            <p className="text-sm font-medium text-[#B8423E]" role="alert">
              {fieldErrors.division}
            </p>
          )}
        </div>
      </section>

      {/* Bagian B - Feedback Acara */}
      <section className="rounded-2xl border border-[#E5DEC9] bg-white p-6 sm:p-7 shadow-[0_6px_24px_-10px_rgba(11,67,59,0.08)] space-y-6">
        <div className="flex items-center gap-2.5 border-b border-[#EFE9D8] pb-3.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#C8A156]/15 text-[#9C7324]">
            <HeartHandshake className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#0B433B]">
              Bagian B – Feedback Acara
            </h2>
            <p className="text-xs text-[#6B6E66]">
              Masukan Anda sangat berarti untuk menghadirkan kajian berikutnya
              yang lebih baik.
            </p>
          </div>
        </div>

        {/* 4. Pendapat tentang acara */}
        <div className="space-y-2">
          <label
            htmlFor="feedback"
            className="block text-sm sm:text-[15px] font-semibold text-[#132E29]"
          >
            4. Bagaimana pendapatmu tentang acara Nusafaith Edisi Kasmaran?{" "}
            <span className="text-[#B8423E]">*</span>
          </label>
          <textarea
            id="feedback"
            name="feedback"
            rows={4}
            required
            maxLength={2000}
            disabled={isSubmitting}
            value={values.feedback}
            onChange={(e) => updateField("feedback", e.target.value)}
            placeholder="Tuliskan kesan, pesan, dan saran Anda untuk acara ini..."
            aria-invalid={Boolean(fieldErrors.feedback)}
            className={`w-full resize-y rounded-xl border bg-[#FCFBF8] px-4 py-3 text-sm sm:text-base text-[#132E29] placeholder:text-[#9AA09A] transition focus:bg-white focus:outline-none focus:ring-2 ${
              fieldErrors.feedback
                ? "border-[#B8423E] focus:border-[#B8423E] focus:ring-[#B8423E]/20"
                : "border-[#DDD4BE] focus:border-[#0B433B] focus:ring-[#0B433B]/15"
            }`}
          />
          <div className="flex items-center justify-between text-xs text-[#6B6E66]">
            <span>Kesan, pesan, maupun saran untuk panitia.</span>
            <span>{values.feedback.length}/2000</span>
          </div>
          {fieldErrors.feedback && (
            <p className="text-sm font-medium text-[#B8423E]" role="alert">
              {fieldErrors.feedback}
            </p>
          )}
        </div>

        {/* 5. Penilaian Bintang 1-5 */}
        <div className="space-y-2">
          <span className="block text-sm sm:text-[15px] font-semibold text-[#132E29]">
            5. Bagaimana penilaianmu terhadap acara ini?{" "}
            <span className="text-[#B8423E]">*</span>
          </span>
          <StarRating
            value={values.rating}
            onChange={(rating) => updateField("rating", rating)}
            disabled={isSubmitting}
            error={fieldErrors.rating}
          />
        </div>

        {/* 6. Hal paling berkesan (Opsional) */}
        <div className="space-y-2">
          <label
            htmlFor="memorableMoment"
            className="block text-sm sm:text-[15px] font-semibold text-[#132E29]"
          >
            6. Apa hal yang paling berkesan selama mengikuti acara ini?{" "}
            <span className="ml-1 text-xs font-normal text-[#6B6E66]">
              (Opsional)
            </span>
          </label>
          <textarea
            id="memorableMoment"
            name="memorableMoment"
            rows={3}
            maxLength={1000}
            disabled={isSubmitting}
            value={values.memorableMoment}
            onChange={(e) => updateField("memorableMoment", e.target.value)}
            placeholder="Ceritakan momen, kutipan materi, atau suasana yang paling berkesan..."
            aria-invalid={Boolean(fieldErrors.memorableMoment)}
            className={`w-full resize-y rounded-xl border bg-[#FCFBF8] px-4 py-3 text-sm sm:text-base text-[#132E29] placeholder:text-[#9AA09A] transition focus:bg-white focus:outline-none focus:ring-2 ${
              fieldErrors.memorableMoment
                ? "border-[#B8423E] focus:border-[#B8423E] focus:ring-[#B8423E]/20"
                : "border-[#DDD4BE] focus:border-[#0B433B] focus:ring-[#0B433B]/15"
            }`}
          />
          {fieldErrors.memorableMoment && (
            <p className="text-sm font-medium text-[#B8423E]" role="alert">
              {fieldErrors.memorableMoment}
            </p>
          )}
        </div>
      </section>

      {/* Error Summary Banner */}
      {submitError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-[#B8423E]/30 bg-[#FDF3F2] px-4 py-3.5 text-sm text-[#8F2D2A]"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#B8423E]" />
          <div>
            <p className="font-semibold">Pengiriman belum berhasil</p>
            <p className="mt-0.5 leading-relaxed">{submitError}</p>
          </div>
        </div>
      )}

      {/* Submit Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1 pb-4">
        <p className="text-xs text-[#6B6E66]">
          Data Anda disimpan secara aman sebelum greeting card dibuat.
        </p>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#0B433B] to-[#125C51] px-6 py-3.5 text-sm sm:text-base font-semibold text-[#FAF2DF] shadow-[0_10px_25px_-8px_rgba(11,67,59,0.5)] transition-all duration-150 hover:brightness-110 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B433B] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Menyimpan &amp; Menyiapkan Kartu...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Kirim &amp; Lihat Greeting Card
            </>
          )}
        </button>
      </div>
    </form>
  );
}
