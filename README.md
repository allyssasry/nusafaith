# NUSAFAITH – Edisi Kasmaran | Personalized Greeting Card

Website interaktif formulir feedback dan **Personalized Greeting Card** untuk acara **NUSAFAITH – Edisi Kasmaran** menggunakan Next.js (App Router), Tailwind CSS, Supabase, Lucide React, dan `html-to-image`.

## Alur Utama

1. Peserta mengisi identitas (`Nama Lengkap`, `Divisi`) dan feedback acara (`Pendapat`, `Rating Bintang 1–5`, `Hal Paling Berkesan` opsional).
2. Data divalidasi dan disimpan ke tabel `nusafaith_feedback` di Supabase.
3. Jika penyimpanan berhasil, website menampilkan preview Greeting Card yang telah dipersonalisasi dengan nama lengkap peserta di dalam desain kartu asli.
4. Peserta dapat mengunduh Greeting Card sebagai gambar **PNG resolusi tinggi (`3072 x 1728 px`)**, membagikannya melalui WhatsApp (Web Share API / fallback download PNG), atau membuat kartu lagi.

## Pengaturan Awal

### 1. Setup Tabel & RLS di Supabase

1. Buka [Supabase Dashboard](https://supabase.com/dashboard) dan pilih/buat project Anda.
2. Buka menu **SQL Editor** lalu jalankan isi file [`supabase/schema.sql`](./supabase/schema.sql).
3. Script tersebut akan membuat tabel `public.nusafaith_feedback` serta mengaktifkan **Row Level Security (RLS)** dengan policy publik khusus `INSERT` saja (pengunjung tidak dapat membaca data peserta lain).

### 2. Konfigurasi Environment Variables

Salin `.env.example` menjadi `.env.local`:

```bash
cp .env.example .env.local
```

Lalu isi nilai berikut dari **Project Settings → API** di Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

> **Penting:** Jangan pernah menaruh `service_role` key di frontend atau variabel `NEXT_PUBLIC_*`.

### 3. Mengelola Daftar Divisi

Edit array `DIVISIONS` di [`src/config/divisions.ts`](./src/config/divisions.ts) untuk menambah, mengubah, atau mengurutkan pilihan divisi. Opsi **"Lainnya"** otomatis ditambahkan di bagian akhir dropdown.

### 4. Menjalankan Aplikasi

```bash
npm install
npm run dev
```

Buka `http://localhost:3000` di browser Anda.
