export type UserRole = 'admin' | 'guru' | 'siswa';

export interface User {
  user_id: number;
  nisn: string;
  nama_siswa: string;
  kelas: string;
  kategori: 'Admin' | 'Guru' | 'Siswa';
  jabatan: string;
  no_wa_ortu: string;
  has_device: number;
  avatar?: string;
}

export type AttendanceStatus = 'Hadir' | 'Terlambat' | 'Izin' | 'Sakit' | 'Alpa';

export interface AttendanceRecord {
  attendance_id: number;
  user_id: number;
  date: string; // YYYY-MM-DD
  time_in: string | null; // HH:mm:ss
  time_out: string | null; // HH:mm:ss
  status: AttendanceStatus;
  photo?: string;
  location_info?: string; // "lat,lng"
  nisn?: string;
  nama_siswa?: string;
  kelas?: string;
  kategori?: string;
}

export interface LeaveRequest {
  id_izin: number;
  user_id: number;
  nama_siswa: string;
  kategori: string;
  kelas: string;
  jenis_izin: 'Sakit' | 'Izin';
  tanggal_mulai: string;
  keterangan: string;
  file_bukti?: string;
  status: 'Menunggu' | 'Disetujui' | 'Ditolak';
  created_at: string;
}

export interface InventoryItem {
  id: number;
  user_id: number;
  nama_peminjam: string;
  nama_barang: string;
  keperluan: string;
  tanggal_pinjam: string;
  status: 'Sedang Dipinjam' | 'Sudah Dikembalikan';
}

export interface SystemSettings {
  id: number;
  jam_masuk: string; // e.g. "07:30:00"
  radius: number; // in meters, 0 = no limit
  latitude: string; // e.g. "-8.484890"
  longitude: string; // e.g. "140.391467"
  school_name: string;
  foundation_name: string;
  location_name: string;
  principal_name: string;
  token_wa: string;
  aktifkan_wa_api: boolean;
  auto_notify_wali?: boolean; // Otomatis kirim pesan notifikasi ke WhatsApp Wali Kelas saat siswa absen/terlambat
  auto_notify_ortu?: boolean; // Otomatis kirim pesan notifikasi ke WhatsApp Orang Tua
  custom_logo_kiri?: string; // Data URL or Image URL for Left Logo (SMA Yoanes XXIII)
  custom_logo_kanan?: string; // Data URL or Image URL for Right Logo (College Saint Jean / YPPK)
}

export type ActiveView = 
  | 'home'
  | 'kamera'
  | 'portal'
  | 'hitung_kehadiran'
  | 'rekap'
  | 'rekap_honor'
  | 'cetak_kartu'
  | 'data_users'
  | 'admin_izin'
  | 'inventaris'
  | 'riwayat'
  | 'statistik';
