import { OTHER_DIVISION_OPTION } from "@/config/divisions";
import { getSupabaseClient } from "@/lib/supabase/client";
import type {
  FeedbackFieldErrors,
  FeedbackFormValues,
  FeedbackInsertPayload,
} from "@/types/feedback";

export interface ValidationResult {
  isValid: boolean;
  errors: FeedbackFieldErrors;
  payload: FeedbackInsertPayload | null;
}

export interface SubmitFeedbackResult {
  ok: boolean;
  errorMessage?: string;
  fieldErrors?: FeedbackFieldErrors;
}

export function validateFeedbackForm(
  values: FeedbackFormValues
): ValidationResult {
  const errors: FeedbackFieldErrors = {};

  const trimmedName = values.fullName.trim().replace(/\s+/g, " ");
  const selectedEntity = values.entity.trim();
  const selectedDivision = values.division.trim();
  const trimmedOtherDivision = values.otherDivision.trim().replace(/\s+/g, " ");
  const trimmedFeedback = values.feedback.trim();
  const trimmedMoment = values.memorableMoment.trim();

  if (!trimmedName) {
    errors.fullName = "Nama lengkap wajib diisi.";
  } else if (trimmedName.length < 2) {
    errors.fullName = "Nama lengkap minimal terdiri dari 2 karakter.";
  } else if (trimmedName.length > 100) {
    errors.fullName = "Nama lengkap maksimal 100 karakter.";
  }

  if (!selectedEntity) {
    errors.entity = "Silakan pilih entitas Anda.";
  }

  let resolvedDivision = selectedDivision;
  if (!selectedDivision) {
    errors.division = "Silakan pilih divisi Anda.";
  } else if (selectedDivision === OTHER_DIVISION_OPTION) {
    if (!trimmedOtherDivision) {
      errors.otherDivision = "Silakan tuliskan nama divisi Anda.";
    } else if (trimmedOtherDivision.length > 100) {
      errors.otherDivision = "Nama divisi maksimal 100 karakter.";
    } else {
      resolvedDivision = `Lainnya: ${trimmedOtherDivision}`.slice(0, 100);
    }
  }

  if (!trimmedFeedback) {
    errors.feedback = "Pendapat/feedback acara wajib diisi.";
  } else if (trimmedFeedback.length < 3) {
    errors.feedback = "Tuliskan pendapat Anda minimal 3 karakter.";
  } else if (trimmedFeedback.length > 2000) {
    errors.feedback = "Feedback maksimal 2000 karakter.";
  }

  if (!Number.isInteger(values.rating) || values.rating < 1 || values.rating > 5) {
    errors.rating = "Silakan pilih rating bintang antara 1 hingga 5.";
  }

  if (trimmedMoment.length > 1000) {
    errors.memorableMoment = "Hal berkesan maksimal 1000 karakter.";
  }

  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors, payload: null };
  }

  return {
    isValid: true,
    errors: {},
    payload: {
      full_name: trimmedName,
      entity: selectedEntity,
      division: resolvedDivision,
      feedback: trimmedFeedback,
      rating: values.rating,
      memorable_moment: trimmedMoment.length > 0 ? trimmedMoment : null,
    },
  };
}

export async function submitNusafaithFeedback(
  values: FeedbackFormValues
): Promise<SubmitFeedbackResult> {
  const validation = validateFeedbackForm(values);

  if (!validation.isValid || !validation.payload) {
    return {
      ok: false,
      errorMessage: "Mohon periksa kembali isian formulir Anda.",
      fieldErrors: validation.errors,
    };
  }

  try {
    const supabase = getSupabaseClient();

    // Catatan: Tidak memanggil .select() setelah .insert() karena RLS publik
    // hanya mengizinkan operasi INSERT dan membatasi akses baca (SELECT).
    const { error } = await supabase
      .from("nusafaith_feedback")
      .insert([validation.payload]);

    if (error) {
      console.error("Supabase insert error:", error);

      // Fallback toleran jika kolom 'entity' belum sempat ditambahkan di Supabase
      if (
        error.message?.includes("entity") ||
        error.code === "PGRST204" ||
        error.message?.toLowerCase().includes("column")
      ) {
        const fallbackPayload = {
          full_name: validation.payload.full_name,
          division: `${validation.payload.entity} - ${validation.payload.division}`.slice(0, 100),
          feedback: validation.payload.feedback,
          rating: validation.payload.rating,
          memorable_moment: validation.payload.memorable_moment,
        };

        const { error: fallbackError } = await supabase
          .from("nusafaith_feedback")
          .insert([fallbackPayload]);

        if (!fallbackError) {
          return { ok: true };
        }
      }

      return {
        ok: false,
        errorMessage:
          "Gagal menyimpan data ke database. Pastikan tabel & policy Supabase sudah aktif, lalu coba lagi.",
      };
    }

    return { ok: true };
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Terjadi kendala jaringan saat menghubungi server.";
    return {
      ok: false,
      errorMessage: message,
    };
  }
}
