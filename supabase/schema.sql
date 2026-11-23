-- ============================================================================
-- NUSAFAITH – EDISI KASMARAN
-- Schema & Row Level Security (RLS) untuk tabel nusafaith_feedback
-- Jalankan script ini di Supabase Dashboard -> SQL Editor
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.nusafaith_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  entity TEXT,
  division TEXT NOT NULL,
  feedback TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  memorable_moment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Menambahkan kolom entity jika tabel sudah dibuat sebelumnya
ALTER TABLE public.nusafaith_feedback ADD COLUMN IF NOT EXISTS entity TEXT;

COMMENT ON TABLE public.nusafaith_feedback IS
  'Menyimpan data identitas peserta dan feedback acara Nusafaith Edisi Kasmaran.';

-- Aktifkan Row Level Security (RLS)
ALTER TABLE public.nusafaith_feedback ENABLE ROW LEVEL SECURITY;

-- Hapus policy lama jika ada agar script aman dijalankan ulang
DROP POLICY IF EXISTS "Allow public feedback submission" ON public.nusafaith_feedback;

-- Policy aman untuk formulir publik:
-- Pengunjung (anon / authenticated) hanya diizinkan melakukan INSERT data valid,
-- dan TIDAK diizinkan membaca (SELECT), mengubah (UPDATE), atau menghapus (DELETE)
-- data feedback milik peserta lain.
CREATE POLICY "Allow public feedback submission"
  ON public.nusafaith_feedback
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(trim(full_name)) >= 2
    AND char_length(trim(full_name)) <= 100
    AND (
      entity IS NULL
      OR (char_length(trim(entity)) >= 1 AND char_length(trim(entity)) <= 150)
    )
    AND char_length(trim(division)) >= 1
    AND char_length(trim(division)) <= 100
    AND char_length(trim(feedback)) >= 3
    AND char_length(trim(feedback)) <= 2000
    AND rating >= 1
    AND rating <= 5
    AND (
      memorable_moment IS NULL
      OR char_length(trim(memorable_moment)) <= 1000
    )
  );
