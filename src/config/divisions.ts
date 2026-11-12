/**
 * Daftar pilihan divisi untuk formulir Nusafaith – Edisi Kasmaran.
 * Ubah, tambah, atau urutkan kembali item di array DIVISIONS sesuai kebutuhan organisasi.
 * Opsi "Lainnya" akan selalu tersedia secara otomatis di bagian akhir dropdown.
 */
export const DIVISIONS: readonly string[] = [
  "Sekretariat Perusahaan",
  "Sumber Daya Manusia (SDM)",
  "Keuangan & Akuntansi",
  "Operasional & Produksi",
  "Teknik & Pengolahan",
  "Pemasaran & Komersial",
  "Teknologi Informasi (TI)",
  "Hukum & Kepatuhan",
  "Pengadaan & Logistik",
  "Audit Internal",
  "Perencanaan Strategis & Manajemen Risiko",
];

export const OTHER_DIVISION_OPTION = "Lainnya";

export const DIVISION_OPTIONS: readonly string[] = [
  ...DIVISIONS,
  OTHER_DIVISION_OPTION,
];

