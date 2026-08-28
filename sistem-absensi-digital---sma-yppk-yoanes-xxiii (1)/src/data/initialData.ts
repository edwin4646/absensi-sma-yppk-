import { User, AttendanceRecord, LeaveRequest, InventoryItem, SystemSettings } from '../types';

export const INITIAL_SETTINGS: SystemSettings = {
  id: 1,
  jam_masuk: '07:30:00',
  radius: 0, // Mode bebas radius default untuk kemudahan demo online/HP
  latitude: '-8.484890',
  longitude: '140.391467',
  school_name: 'SMA YPPK YOANES XXIII MERAUKE',
  foundation_name: 'YAYASAN PENDIDIKAN DAN PERSEKOLAHAN KATOLIK',
  location_name: 'Merauke, Papua Selatan',
  principal_name: 'Valentinus G. Nuga, S.S.,M.Fil',
  token_wa: '',
  aktifkan_wa_api: false,
  custom_logo_kanan: 'https://lh3.googleusercontent.com/d/1x6ZCFNVUEaCQGRstQXt2ktMlwk0k7PjM'
};

export const INITIAL_USERS: User[] = [
  // Admin & Kepala Sekolah
  { user_id: 1, nisn: 'admin', nama_siswa: 'Valentinus G. Nuga, S.S.,M.Fil', kelas: 'ADMIN', kategori: 'Admin', jabatan: 'Kepala Sekolah & Administrator', no_wa_ortu: '082155080559', has_device: 1 },
  { user_id: 2, nisn: '001', nama_siswa: 'Edwin IT Officer', kelas: 'ADMIN', kategori: 'Admin', jabatan: 'IT & Administrator Sistem', no_wa_ortu: '082248123451', has_device: 1 },
  
  // Guru & Staf (33 Guru dan Tenaga Administrasi SMA YPPK Yoanes XXIII Merauke)
  { user_id: 201, nisn: 'GURU001', nama_siswa: 'Valentinus G. Nuga, S.S.,M.Fil', kelas: '-', kategori: 'Guru', jabatan: 'Kepala Sekolah', no_wa_ortu: '082155080559', has_device: 1 },
  { user_id: 202, nisn: 'GURU002', nama_siswa: 'Agnes Ujoto', kelas: '-', kategori: 'Guru', jabatan: 'Guru Mapel Biologi', no_wa_ortu: '082397619163', has_device: 1 },
  { user_id: 203, nisn: 'GURU003', nama_siswa: 'Bernadeta Murtini', kelas: '-', kategori: 'Guru', jabatan: 'Guru Mapel Bahasa Indonesia', no_wa_ortu: '081344510588', has_device: 1 },
  { user_id: 204, nisn: 'GURU004', nama_siswa: 'Bernadetha Budiarti', kelas: '-', kategori: 'Guru', jabatan: 'Guru Mapel Matematika', no_wa_ortu: '082199294836', has_device: 1 },
  { user_id: 205, nisn: 'GURU005', nama_siswa: 'Martha Ch.Manuputty', kelas: '-', kategori: 'Guru', jabatan: 'Guru BK', no_wa_ortu: '081248886884', has_device: 1 },
  { user_id: 206, nisn: 'GURU006', nama_siswa: 'Sebastianus T.Mangelo', kelas: 'X-2', kategori: 'Guru', jabatan: 'Guru Mapel PPKn', no_wa_ortu: '081342836473', has_device: 1 },
  { user_id: 207, nisn: 'GURU007', nama_siswa: 'Margaretha M.Haumahu', kelas: '-', kategori: 'Guru', jabatan: 'Guru Mapel Fisika', no_wa_ortu: '082398613379', has_device: 1 },
  { user_id: 208, nisn: 'GURU008', nama_siswa: 'Palupi H.Ratih', kelas: '-', kategori: 'Guru', jabatan: 'Guru Mapel Fisika', no_wa_ortu: '082131191970', has_device: 1 },
  { user_id: 209, nisn: 'GURU009', nama_siswa: 'Alphonsa P. Wulansari', kelas: 'X-1', kategori: 'Guru', jabatan: 'Guru Mapel Kimia', no_wa_ortu: '082110102775', has_device: 1 },
  { user_id: 210, nisn: 'GURU010', nama_siswa: 'Maria Yasinta Goi', kelas: 'XI-1', kategori: 'Guru', jabatan: 'Guru Mapel Ekonomi', no_wa_ortu: '085396476988', has_device: 1 },
  { user_id: 211, nisn: 'GURU011', nama_siswa: 'Christo F.W Tarenggop', kelas: '-', kategori: 'Guru', jabatan: 'Guru Mapel Bahasa Inggris', no_wa_ortu: '082248420214', has_device: 1 },
  { user_id: 212, nisn: 'GURU012', nama_siswa: 'Josefita Siwasiwan', kelas: '-', kategori: 'Guru', jabatan: 'Guru Mapel Sosiologi', no_wa_ortu: '082165439735', has_device: 1 },
  { user_id: 213, nisn: 'GURU013', nama_siswa: 'Yonas Bato\'Rinding', kelas: 'XII-1', kategori: 'Guru', jabatan: 'Guru Mapel Bahasa Inggris', no_wa_ortu: '081344652351', has_device: 1 },
  { user_id: 214, nisn: 'GURU014', nama_siswa: 'Odilia Laiyan', kelas: '-', kategori: 'Guru', jabatan: 'Guru Mapel Agama', no_wa_ortu: '082199225135', has_device: 1 },
  { user_id: 215, nisn: 'GURU015', nama_siswa: 'Yohana Watu', kelas: '-', kategori: 'Guru', jabatan: 'Tenaga Administrasi', no_wa_ortu: '081240052255', has_device: 1 },
  { user_id: 216, nisn: 'GURU016', nama_siswa: 'Maria Yanti Tina', kelas: '-', kategori: 'Guru', jabatan: 'Tenaga Administrasi', no_wa_ortu: '085205142001', has_device: 1 },
  { user_id: 217, nisn: 'GURU017', nama_siswa: 'Fonny H.P Lassol', kelas: '-', kategori: 'Guru', jabatan: 'Tenaga Administrasi', no_wa_ortu: '082353653127', has_device: 1 },
  { user_id: 218, nisn: 'GURU018', nama_siswa: 'Natalia Horokubun', kelas: '-', kategori: 'Guru', jabatan: 'Tenaga Administrasi', no_wa_ortu: '082248596520', has_device: 1 },
  { user_id: 219, nisn: 'GURU019', nama_siswa: 'Oktoviando B. Gili', kelas: '-', kategori: 'Guru', jabatan: 'Guru Mapel PJOK', no_wa_ortu: '082397627086', has_device: 1 },
  { user_id: 220, nisn: 'GURU020', nama_siswa: 'Lidiya BR Manik', kelas: '-', kategori: 'Guru', jabatan: 'Guru Mapel TIK', no_wa_ortu: '082312162293', has_device: 1 },
  { user_id: 221, nisn: 'GURU021', nama_siswa: 'Ristawati Sarumaha', kelas: '-', kategori: 'Guru', jabatan: 'Guru Mapel Agama', no_wa_ortu: '082333788323', has_device: 1 },
  { user_id: 222, nisn: 'GURU022', nama_siswa: 'Ayup Saman', kelas: '-', kategori: 'Guru', jabatan: 'Tenaga Administrasi', no_wa_ortu: '08219025791', has_device: 1 },
  { user_id: 223, nisn: 'GURU023', nama_siswa: 'Rosalia Eno', kelas: '-', kategori: 'Guru', jabatan: 'Guru Mapel Ekonomi', no_wa_ortu: '081238957003', has_device: 1 },
  { user_id: 224, nisn: 'GURU024', nama_siswa: 'Rosalia Resubun', kelas: '-', kategori: 'Guru', jabatan: 'Tenaga Administrasi', no_wa_ortu: '082191994883', has_device: 1 },
  { user_id: 225, nisn: 'GURU025', nama_siswa: 'Erwin P. Silalahi', kelas: '-', kategori: 'Guru', jabatan: 'Guru Mapel Matematika', no_wa_ortu: '085361377098', has_device: 1 },
  { user_id: 226, nisn: 'GURU026', nama_siswa: 'Fidensius Arifando', kelas: '-', kategori: 'Guru', jabatan: 'Guru Mapel Bahasa Mandarin', no_wa_ortu: '0813174131691', has_device: 1 },
  { user_id: 227, nisn: 'GURU027', nama_siswa: 'Sr. Juliani Piay, SJMJ', kelas: '-', kategori: 'Guru', jabatan: 'Tenaga Administrasi', no_wa_ortu: '081342598863', has_device: 1 },
  { user_id: 228, nisn: 'GURU028', nama_siswa: 'Basmat Yubelina Owandity', kelas: '-', kategori: 'Guru', jabatan: 'Guru Mapel Bahasa Indonesia', no_wa_ortu: '082238805926', has_device: 1 },
  { user_id: 229, nisn: 'GURU029', nama_siswa: 'Fransina Matrutty', kelas: '-', kategori: 'Guru', jabatan: 'Guru Mapel Sejarah', no_wa_ortu: '082198478588', has_device: 1 },
  { user_id: 230, nisn: 'GURU030', nama_siswa: 'Anatasia Elvi Gleko', kelas: '-', kategori: 'Guru', jabatan: 'Guru Mapel Kimia', no_wa_ortu: '085254161056', has_device: 1 },
  { user_id: 231, nisn: 'GURU031', nama_siswa: 'Margerita Lasfeto', kelas: '-', kategori: 'Guru', jabatan: 'Guru Mapel Matematika', no_wa_ortu: '082144082647', has_device: 1 },
  { user_id: 232, nisn: 'GURU032', nama_siswa: 'Monika Ndari', kelas: '-', kategori: 'Guru', jabatan: 'Guru Mapel Geografi', no_wa_ortu: '082196673811', has_device: 1 },
  { user_id: 233, nisn: 'GURU033', nama_siswa: 'Yulningsi F. Tuka', kelas: '-', kategori: 'Guru', jabatan: 'Guru Mapel Biologi', no_wa_ortu: '081354972962', has_device: 1 },

  // Siswa
  { user_id: 3, nisn: '1001', nama_siswa: 'Budi Santoso', kelas: 'X-1', kategori: 'Siswa', jabatan: 'Siswa', no_wa_ortu: '082248123451', has_device: 1 },
  { user_id: 4, nisn: '1002', nama_siswa: 'Anisa Rahma', kelas: 'X-1', kategori: 'Siswa', jabatan: 'Siswa', no_wa_ortu: '082248123451', has_device: 1 },
  { user_id: 5, nisn: '1003', nama_siswa: 'Yohanes Papua', kelas: 'X-1', kategori: 'Siswa', jabatan: 'Siswa', no_wa_ortu: '082248123451', has_device: 1 },
  { user_id: 6, nisn: '1004', nama_siswa: 'Maria Goreti', kelas: 'X-1', kategori: 'Siswa', jabatan: 'Siswa', no_wa_ortu: '082248123451', has_device: 1 },
  { user_id: 7, nisn: '1005', nama_siswa: 'Christian Batmyanik', kelas: 'X-1', kategori: 'Siswa', jabatan: 'Siswa', no_wa_ortu: '082248123451', has_device: 1 },
  { user_id: 8, nisn: '1006', nama_siswa: 'Siti Aminah', kelas: 'X-2', kategori: 'Siswa', jabatan: 'Siswa', no_wa_ortu: '082248123451', has_device: 1 },
  { user_id: 9, nisn: '1007', nama_siswa: 'Markus Wamu', kelas: 'X-2', kategori: 'Siswa', jabatan: 'Siswa', no_wa_ortu: '082248123451', has_device: 1 },
  { user_id: 10, nisn: '1008', nama_siswa: 'Dewi Lestari', kelas: 'XI-1', kategori: 'Siswa', jabatan: 'Siswa', no_wa_ortu: '082248123451', has_device: 1 },
  { user_id: 11, nisn: '1009', nama_siswa: 'Alexander Tan', kelas: 'XI-1', kategori: 'Siswa', jabatan: 'Siswa', no_wa_ortu: '082248123451', has_device: 1 },
  { user_id: 12, nisn: '1010', nama_siswa: 'Fransiskus Merauke', kelas: 'XII-1', kategori: 'Siswa', jabatan: 'Siswa', no_wa_ortu: '082248123451', has_device: 1 }
];

export const getTodayDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  { attendance_id: 1, user_id: 3, date: getTodayDateString(), time_in: '07:15:20', time_out: null, status: 'Hadir', location_info: '-8.484890,140.391467' },
  { attendance_id: 2, user_id: 4, date: getTodayDateString(), time_in: '07:46:10', time_out: null, status: 'Terlambat', location_info: '-8.484890,140.391467' },
  { attendance_id: 3, user_id: 5, date: getTodayDateString(), time_in: '07:53:45', time_out: null, status: 'Terlambat', location_info: '-8.484890,140.391467' },
  { attendance_id: 4, user_id: 6, date: getTodayDateString(), time_in: '07:30:00', time_out: null, status: 'Sakit', location_info: '-8.484890,140.391467' },
  { attendance_id: 5, user_id: 8, date: getTodayDateString(), time_in: '07:08:12', time_out: null, status: 'Hadir', location_info: '-8.484890,140.391467' },
  { attendance_id: 6, user_id: 9, date: getTodayDateString(), time_in: '07:58:30', time_out: null, status: 'Terlambat', location_info: '-8.484890,140.391467' },
  { attendance_id: 7, user_id: 10, date: getTodayDateString(), time_in: '07:30:00', time_out: null, status: 'Izin', location_info: '-8.484890,140.391467' },
  { attendance_id: 8, user_id: 12, date: getTodayDateString(), time_in: '07:04:55', time_out: null, status: 'Hadir', location_info: '-8.484890,140.391467' },
  { attendance_id: 9, user_id: 2, date: getTodayDateString(), time_in: '07:10:00', time_out: null, status: 'Hadir', location_info: '-8.484890,140.391467' },
  { attendance_id: 10, user_id: 201, date: getTodayDateString(), time_in: '07:05:00', time_out: null, status: 'Hadir', location_info: '-8.484890,140.391467' },
  { attendance_id: 11, user_id: 202, date: getTodayDateString(), time_in: '07:20:00', time_out: null, status: 'Hadir', location_info: '-8.484890,140.391467' }
];

export const INITIAL_LEAVES: LeaveRequest[] = [
  {
    id_izin: 1,
    user_id: 6,
    nama_siswa: 'Maria Goreti',
    kategori: 'Siswa',
    kelas: 'X-1',
    jenis_izin: 'Sakit',
    tanggal_mulai: getTodayDateString(),
    keterangan: 'Demam tinggi dan flu butuh istirahat dokter 2 hari.',
    status: 'Disetujui',
    created_at: getTodayDateString() + ' 07:00:00'
  },
  {
    id_izin: 2,
    user_id: 10,
    nama_siswa: 'Dewi Lestari',
    kategori: 'Siswa',
    kelas: 'XI-1',
    jenis_izin: 'Izin',
    tanggal_mulai: getTodayDateString(),
    keterangan: 'Ada acara adat keluarga di Kurik Merauke.',
    status: 'Disetujui',
    created_at: getTodayDateString() + ' 06:45:00'
  }
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 1,
    user_id: 202,
    nama_peminjam: 'Alphonsa P. Wulansari, S.Pd., Gr.',
    nama_barang: 'Proyektor Epson EB-X500',
    keperluan: 'Mengajar kelas X-1 materi presentasi Sejarah',
    tanggal_pinjam: getTodayDateString() + ' 08:00:00',
    status: 'Sedang Dipinjam'
  },
  {
    id: 2,
    user_id: 206,
    nama_peminjam: 'Agnes Ujoto, S.Pd',
    nama_barang: 'Speaker Portabel + Mic Wireless',
    keperluan: 'Kegiatan pembinaan rohani siswa di aula',
    tanggal_pinjam: getTodayDateString() + ' 09:30:00',
    status: 'Sedang Dipinjam'
  }
];
