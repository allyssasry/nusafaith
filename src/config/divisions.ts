/**
 * Daftar pilihan divisi untuk formulir Nusafaith – Edisi Kasmaran.
 * Ubah, tambah, atau urutkan kembali item di array DIVISIONS sesuai kebutuhan organisasi.
 * Opsi "Lainnya" akan selalu tersedia secara otomatis di bagian akhir dropdown.
 */
export const DIVISIONS: readonly string[] = [
  'Direktur SDM dan Umum',
  'Direktur Keuangan dan Manajemen Risiko',
  'Direktur Aset',
  'Direktur Produksi dan Pengembangan',
  'Direktur Bisnis',
  'Divisi Akuntansi dan Perpajakan',
  'Divisi Aneka Tanaman',
  'Divisi Hubungan Kelembagaan dan Hukum',
  'Divisi Manajemen Risiko',
  'Divisi Keuangan Strategis dan Anggaran',
  'Divisi Kelapa Sawit dan Karet',
  'Divisi Manajemen Aset',
  'Divisi Strategi dan Pengembangan SDM',
  'Divisi Operasional SDM',
  'Divisi Pengadaan dan Umum',
  'PMO Pengembangan Komoditi dan Hilirisasi',
  'Divisi Transformasi Digital',
  'Divisi Pemasaran dan Penjualan',
  'Divisi Strategi dan Manajemen Kinerja Korporasi'
];

export const OTHER_DIVISION_OPTION = "Lainnya";

export const DIVISION_OPTIONS: readonly string[] = [
  ...DIVISIONS,
  OTHER_DIVISION_OPTION,
];

