import React, { useState, useMemo } from 'react';
import { User, AttendanceRecord, ActiveView, SystemSettings } from '../types';
import { formatIndonesianDate } from '../utils/geo';
import { 
  Calculator, 
  FileSpreadsheet, 
  Users, 
  ShieldCheck, 
  QrCode, 
  FileText, 
  Box, 
  Settings, 
  RefreshCw, 
  MapPin, 
  Clock, 
  Eye, 
  X,
  Camera,
  Image as ImageIcon,
  LogOut,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Building2,
  TrendingUp,
  Filter,
  Layers,
  Sparkles
} from 'lucide-react';

interface PortalAdminProps {
  currentUser: User;
  users: User[];
  attendance: AttendanceRecord[];
  settings: SystemSettings;
  onNavigate: (view: ActiveView) => void;
  onOpenSettings: () => void;
  onOpenLogoManager?: () => void;
  onRefreshData: () => void;
  onLogout?: () => void;
}

export const PortalAdmin: React.FC<PortalAdminProps> = ({
  currentUser,
  users,
  attendance,
  settings,
  onNavigate,
  onOpenSettings,
  onOpenLogoManager,
  onRefreshData,
  onLogout
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Hadir' | 'Terlambat'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'Siswa' | 'Guru'>('all');

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendance = useMemo(() => {
    return attendance.filter(a => a.date === todayStr);
  }, [attendance, todayStr]);

  // Metric Computations
  const totalStudents = users.filter(u => u.kategori === 'Siswa').length;
  const totalTeachers = users.filter(u => u.kategori === 'Guru').length;
  const presentCount = todayAttendance.filter(a => a.status === 'Hadir').length;
  const lateCount = todayAttendance.filter(a => a.status === 'Terlambat').length;
  const attendanceRate = users.length > 0 
    ? Math.round((todayAttendance.length / users.length) * 100) 
    : 0;

  // Filtered Today's Attendance
  const filteredAttendance = useMemo(() => {
    return todayAttendance.filter(rec => {
      const user = users.find(u => u.user_id === rec.user_id);
      const name = (rec.nama_siswa || user?.nama_siswa || '').toLowerCase();
      const nisn = (user?.nisn || '').toLowerCase();
      const kelas = (rec.kelas || user?.kelas || '').toLowerCase();
      const q = searchQuery.toLowerCase();

      const matchesSearch = !q || name.includes(q) || nisn.includes(q) || kelas.includes(q);
      const matchesStatus = statusFilter === 'all' || rec.status === statusFilter;
      const userCategory = rec.kategori || user?.kategori || 'Siswa';
      const matchesCategory = categoryFilter === 'all' || userCategory === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [todayAttendance, users, searchQuery, statusFilter, categoryFilter]);

  // Main feature navigation groups
  const primaryFeatures = [
    {
      id: 'kamera' as ActiveView,
      title: 'Presensi Kamera AI',
      desc: 'Verifikasi selfie biometrik live',
      tag: 'Live Stream',
      icon: Camera,
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
      iconBg: 'bg-rose-600 text-white'
    },
    {
      id: 'hitung_kehadiran' as ActiveView,
      title: 'WhatsApp Ortu & Wali',
      desc: 'Rekap & blast pesan WA per kelas',
      tag: 'Broadcast WA',
      icon: Calculator,
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      iconBg: 'bg-amber-500 text-white'
    },
    {
      id: 'rekap' as ActiveView,
      title: 'Rekap & Print Laporan',
      desc: 'Laporan harian, bulanan, & semester',
      tag: 'Export PDF/Excel',
      icon: FileSpreadsheet,
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconBg: 'bg-emerald-600 text-white'
    },
    {
      id: 'data_users' as ActiveView,
      title: 'Manajemen Pengguna',
      desc: 'Database NISN siswa & 33 guru',
      tag: `${users.length} Akun`,
      icon: Users,
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      iconBg: 'bg-blue-600 text-white'
    }
  ];

  const secondaryFeatures = [
    {
      id: 'admin_izin' as ActiveView,
      title: 'Validasi Surat Izin',
      desc: 'Persetujuan izin, sakit, & dispensasi',
      icon: ShieldCheck,
      iconBg: 'bg-purple-100 text-purple-700'
    },
    {
      id: 'cetak_kartu' as ActiveView,
      title: 'Cetak Kartu QR Pelajar',
      desc: 'Generate ID Card resmi berstempel',
      icon: QrCode,
      iconBg: 'bg-indigo-100 text-indigo-700'
    },
    {
      id: 'rekap_honor' as ActiveView,
      title: 'Honorarium Guru',
      desc: 'Kalkulasi jam mengajar & kehadiran',
      icon: FileText,
      iconBg: 'bg-teal-100 text-teal-700'
    },
    {
      id: 'inventaris' as ActiveView,
      title: 'Inventaris Sarpras',
      desc: 'Peminjaman proyektor, mic, & laptop',
      icon: Box,
      iconBg: 'bg-slate-100 text-slate-700'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Welcome & Quick Actions Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-xl relative overflow-hidden">
        {/* Background Subtle Accent Pattern */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-16 w-60 h-60 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                PANEL UTAMA ADMINISTRATOR
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white/10 text-slate-300 border border-white/10">
                <Building2 className="w-3.5 h-3.5 text-sky-400" />
                SMA YPPK Yoanes XXIII Merauke
              </span>
              <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                GPS Radius: {settings.radiusMeters}m
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Pusat Kendali Presensi & Tata Kelola Sekolah
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Pantau arus kehadiran siswa dan guru secara *real-time*, kelola data induk NISN/NIP, validasi berkas perizinan, dan unduh laporan resmi berstempel.
            </p>
          </div>

          {/* Action Button Bar */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
            {onOpenLogoManager && (
              <button
                onClick={onOpenLogoManager}
                className="px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
                title="Ganti / Upload file logo sekolah asli"
              >
                <ImageIcon className="w-4 h-4 text-amber-400" />
                <span>Logo Sekolah</span>
              </button>
            )}

            <button
              onClick={onOpenSettings}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
              title="Pengaturan Sistem & Koordinat"
            >
              <Settings className="w-4 h-4 text-sky-400" />
              <span>Pengaturan</span>
            </button>

            <button
              onClick={onRefreshData}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95"
              title="Sinkronkan & Segarkan Data"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Segarkan</span>
            </button>

            {onLogout && (
              <button
                onClick={onLogout}
                className="px-3.5 py-2 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95 border border-rose-500/50"
                title="Keluar dari Panel Admin"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Users */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Terdaftar</span>
            <div className="text-2xl font-black text-slate-900">{users.length}</div>
            <div className="text-[11px] text-slate-500 font-medium">
              <span className="text-blue-600 font-bold">{totalStudents}</span> Siswa &bull; <span className="text-slate-700 font-bold">{totalTeachers}</span> Guru
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Hadir Hari Ini */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Presensi Hari Ini</span>
            <div className="text-2xl font-black text-emerald-600">{todayAttendance.length}</div>
            <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
              <span>{presentCount} Tepat Waktu</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Terlambat */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Terlambat Masuk</span>
            <div className="text-2xl font-black text-amber-600">{lateCount}</div>
            <div className="text-[11px] text-slate-500 font-medium">
              Jam Batas: <span className="font-mono font-bold text-slate-700">{settings.lateThreshold} WIT</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Persentase Kehadiran */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tingkat Kehadiran</span>
            <div className="text-2xl font-black text-slate-900">{attendanceRate}%</div>
            <div className="text-[11px] text-slate-500 font-medium">
              {formatIndonesianDate()}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Primary Features Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Layanan Utama Presensi & Notifikasi</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {primaryFeatures.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition text-left flex flex-col justify-between group active:scale-[0.99] relative overflow-hidden"
              >
                <div className="flex items-start justify-between w-full mb-3">
                  <div className={`w-11 h-11 rounded-xl ${item.iconBg} flex items-center justify-center shadow-sm group-hover:scale-105 transition`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                    {item.tag}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm group-hover:text-blue-600 transition">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-snug">{item.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Secondary Administration Features */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-600" />
            <span>Tata Kelola Akademik & Berkas Pendukung</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {secondaryFeatures.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-slate-400 hover:shadow-sm transition text-left flex items-center gap-3.5 group active:scale-[0.99]"
              >
                <div className={`w-10 h-10 rounded-xl ${item.iconBg} flex items-center justify-center shrink-0 group-hover:scale-105 transition`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-900 text-xs group-hover:text-blue-600 transition truncate">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{item.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Attendance Feed Center */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4">
        {/* Table Title & Filter Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="font-extrabold text-slate-900 text-base">
                Pantauan Presensi Hari Ini
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-100 text-blue-800">
                {todayAttendance.length} Rekaman
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Menampilkan data selfie & koordinat GPS siswa dan guru terverifikasi hari ini ({formatIndonesianDate()})
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigate('rekap')}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Rekap Lengkap</span>
            </button>
            <button
              onClick={() => onNavigate('kamera')}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
            >
              <Camera className="w-4 h-4" />
              <span>Buka Kamera</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama siswa, guru, NISN, atau kelas..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <div className="flex items-center bg-white rounded-xl border border-slate-300 p-1 text-xs">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition text-[11px] ${
                  statusFilter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Semua ({todayAttendance.length})
              </button>
              <button
                onClick={() => setStatusFilter('Hadir')}
                className={`px-2.5 py-1 rounded-lg font-bold transition text-[11px] ${
                  statusFilter === 'Hadir' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Hadir ({presentCount})
              </button>
              <button
                onClick={() => setStatusFilter('Terlambat')}
                className={`px-2.5 py-1 rounded-lg font-bold transition text-[11px] ${
                  statusFilter === 'Terlambat' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Terlambat ({lateCount})
              </button>
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="py-1.5 px-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Kategori</option>
              <option value="Siswa">Khusus Siswa</option>
              <option value="Guru">Khusus Guru</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="py-3 px-4 w-16 text-center">Selfie</th>
                <th className="py-3 px-4">Nama Lengkap</th>
                <th className="py-3 px-4">Kategori & Kelas</th>
                <th className="py-3 px-4">Waktu Masuk</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Verifikasi Lokasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredAttendance.map((rec) => {
                const user = users.find(u => u.user_id === rec.user_id);
                const name = rec.nama_siswa || user?.nama_siswa || 'Pengguna';
                const category = rec.kategori || user?.kategori || 'Siswa';
                const className = rec.kelas || user?.kelas || '-';

                const mapLink = rec.location_info
                  ? `https://www.google.com/maps?q=${rec.location_info}`
                  : `https://www.google.com/maps?q=${settings.latitude},${settings.longitude}`;

                return (
                  <tr key={rec.attendance_id} className="hover:bg-slate-50/80 transition">
                    <td className="py-2.5 px-4 text-center">
                      {rec.photo ? (
                        <div className="relative inline-block">
                          <img
                            src={rec.photo}
                            alt="Selfie"
                            onClick={() => setSelectedPhoto(rec.photo || null)}
                            className="w-10 h-10 rounded-xl object-cover border-2 border-slate-200 cursor-pointer hover:scale-105 transition shadow-sm"
                          />
                          <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-full">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-[10px] font-bold">
                          N/A
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="font-extrabold text-slate-900">{name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">NISN/NIP: {user?.nisn || '-'}</div>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        category === 'Guru' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {category}
                      </span>
                      <span className="text-slate-600 font-semibold ml-1.5 text-xs">{className}</span>
                    </td>
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-800">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{rec.time_in ? `${rec.time_in} WIT` : '-'}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                        rec.status === 'Hadir'
                          ? 'bg-emerald-100 text-emerald-800'
                          : rec.status === 'Terlambat'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {rec.status === 'Hadir' && <CheckCircle2 className="w-3 h-3" />}
                        {rec.status === 'Terlambat' && <AlertTriangle className="w-3 h-3" />}
                        <span>{rec.status}</span>
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <a
                        href={mapLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] border border-blue-200/80 transition"
                      >
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        <span>Titik GPS</span>
                      </a>
                    </td>
                  </tr>
                );
              })}

              {filteredAttendance.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="max-w-xs mx-auto space-y-2">
                      <FileCheck className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="font-semibold text-slate-600 text-xs">
                        {searchQuery ? 'Tidak ada rekaman yang cocok dengan filter pencarian.' : 'Belum ada data presensi selfie pada hari ini.'}
                      </p>
                      {searchQuery && (
                        <button
                          onClick={() => { setSearchQuery(''); setStatusFilter('all'); setCategoryFilter('all'); }}
                          className="text-xs text-blue-600 font-bold underline"
                        >
                          Reset Filter
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Photo Lightbox Modal */}
      {selectedPhoto && (
        <div 
          onClick={() => setSelectedPhoto(null)} 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl p-4 max-w-sm w-full shadow-2xl relative animate-scaleUp" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black text-white rounded-full transition"
            >
              <X className="w-4 h-4" />
            </button>
            <img src={selectedPhoto} alt="Preview Selfie" className="w-full rounded-2xl object-cover" />
            <div className="text-center pt-2 text-xs font-bold text-slate-700">
              Foto Presensi Selfie Biometrik &bull; Berstempel Tanggal & Jam WIT
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

