import React from 'react';
import { User, AttendanceRecord, LeaveRequest, InventoryItem, SystemSettings, ActiveView } from '../types';
import { SchoolLogo } from './SchoolLogo';
import { INDONESIAN_MONTHS } from '../utils/geo';
import { 
  Camera, 
  Calendar, 
  Clock, 
  Box, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  ShieldCheck, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface StudentHomeProps {
  currentUser: User;
  attendance: AttendanceRecord[];
  leaves: LeaveRequest[];
  inventory: InventoryItem[];
  settings: SystemSettings;
  onNavigate: (view: ActiveView) => void;
  onOpenDomainGuide?: () => void;
  onOpenLeaveModal: () => void;
  onOpenLoginModal?: () => void;
  onStealthAdminTrigger?: () => void;
}

export const StudentHome: React.FC<StudentHomeProps> = ({
  currentUser,
  attendance,
  leaves,
  inventory,
  settings,
  onNavigate,
  onOpenLeaveModal,
  onOpenLoginModal,
  onStealthAdminTrigger
}) => {
  const [logoTaps, setLogoTaps] = React.useState(0);

  const handleLogoTap = () => {
    const newCount = logoTaps + 1;
    setLogoTaps(newCount);
    if (newCount >= 5) {
      setLogoTaps(0);
      if (onStealthAdminTrigger) {
        onStealthAdminTrigger();
      }
    }
  };
  const currentMonthNum = new Date().getMonth() + 1;
  const currentYearNum = new Date().getFullYear();
  const todayStr = new Date().toISOString().split('T')[0];

  // Today's attendance for current user
  const todayRecord = attendance.find(a => a.user_id === currentUser.user_id && a.date === todayStr);

  // Month stats for current user
  const userMonthRecords = attendance.filter(a => {
    if (a.user_id !== currentUser.user_id) return false;
    const d = new Date(a.date);
    return d.getMonth() + 1 === currentMonthNum && d.getFullYear() === currentYearNum;
  });

  const countHadir = userMonthRecords.filter(a => a.status === 'Hadir').length;
  const countTelat = userMonthRecords.filter(a => a.status === 'Terlambat').length;
  const countIzin = leaves.filter(l => l.user_id === currentUser.user_id && l.status === 'Disetujui').length;
  const countBorrowing = inventory.filter(i => i.status === 'Sedang Dipinjam').length;

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-5">
      {/* School Card Header */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
        <SchoolLogo type="kiri" size={48} onClick={handleLogoTap} title="Ketuk 5x untuk Akses Admin" />
        <div className="text-center">
          <h2 className="text-sm font-extrabold text-slate-900 leading-tight uppercase">
            SMA YPPK YOANES XXIII
          </h2>
          <p className="text-[11px] font-semibold text-blue-700">
            Sistem Informasi Kehadiran Digital
          </p>
          <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-100 text-blue-800">
            Merauke &bull; Papua Selatan
          </span>
        </div>
        <SchoolLogo type="kanan" size={48} onClick={handleLogoTap} title="Ketuk 5x untuk Akses Admin" />
      </div>

      {/* Profile Card */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400">Selamat Datang,</span>
            <h3 className="text-lg font-black text-white tracking-tight">{currentUser.nama_siswa}</h3>
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-300">
              <span className="font-mono bg-white/10 px-2 py-0.5 rounded-md text-[11px] font-bold">
                {currentUser.nisn}
              </span>
              <span>&bull;</span>
              <span className="text-sky-300 font-semibold">{currentUser.kategori} ({currentUser.kelas})</span>
            </div>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-black text-lg text-white shadow-lg">
            {currentUser.nama_siswa.charAt(0)}
          </div>
        </div>

        {/* Today's Status Banner */}
        <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <Clock className="w-4 h-4 text-sky-400" />
            <span>Presensi Hari Ini:</span>
          </div>
          {todayRecord ? (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black ${
              todayRecord.status === 'Hadir'
                ? 'bg-emerald-500 text-white'
                : todayRecord.status === 'Terlambat'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-blue-500 text-white'
            }`}>
              {todayRecord.status} ({todayRecord.time_in ? `${todayRecord.time_in} WIT` : 'Tercatat'})
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-700 text-slate-200">
              Belum Presensi Hari Ini
            </span>
          )}
        </div>

        {/* Quick User Switch & Admin Login Toolbar */}
        <div className="flex items-center justify-between pt-1 text-xs border-t border-white/10">
          <button
            type="button"
            onClick={onOpenLoginModal}
            className="text-xs font-bold text-sky-300 hover:text-white flex items-center gap-1.5 transition"
          >
            <span>🔄 Ganti Siswa / Masuk Akun</span>
          </button>
          
          <button
            type="button"
            onClick={onStealthAdminTrigger}
            className="text-xs font-bold text-slate-400 hover:text-rose-300 flex items-center gap-1 transition"
            title="Masuk sebagai Administrator"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Login Admin</span>
          </button>
        </div>
      </div>

      {/* Main Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onNavigate('kamera')}
          className="p-5 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white flex flex-col justify-between h-36 shadow-lg shadow-blue-600/20 transition group active:scale-[0.98]"
        >
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition">
            <Camera className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <div className="text-sm font-black">Absen Masuk</div>
            <div className="text-[11px] text-blue-200">Kamera Selfie AI</div>
          </div>
        </button>

        <button
          onClick={() => onNavigate('kamera')}
          className="p-5 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black text-white flex flex-col justify-between h-36 shadow-lg shadow-slate-900/20 transition group active:scale-[0.98]"
        >
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition">
            <Clock className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-left">
            <div className="text-sm font-black">Absen Pulang</div>
            <div className="text-[11px] text-slate-300">Ketuk saat pulang</div>
          </div>
        </button>
      </div>

      {/* Quick Menu Icons Grid */}
      <div className="grid grid-cols-4 gap-2 text-center text-xs">
        <button
          onClick={() => onNavigate('kamera')}
          className="p-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 transition shadow-sm space-y-1.5 flex flex-col items-center"
        >
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Camera className="w-5 h-5" />
          </div>
          <span className="font-bold text-slate-800 text-[11px]">Kamera</span>
        </button>

        <button
          onClick={() => onNavigate('admin_izin')}
          className="p-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 transition shadow-sm space-y-1.5 flex flex-col items-center"
        >
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <span className="font-bold text-slate-800 text-[11px]">Izin / Sakit</span>
        </button>

        <button
          onClick={() => onNavigate('rekap')}
          className="p-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 transition shadow-sm space-y-1.5 flex flex-col items-center"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <span className="font-bold text-slate-800 text-[11px]">Riwayat</span>
        </button>

        <button
          onClick={() => onNavigate('inventaris')}
          className="p-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 transition shadow-sm space-y-1.5 flex flex-col items-center"
        >
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Box className="w-5 h-5" />
          </div>
          <span className="font-bold text-slate-800 text-[11px]">Barang</span>
        </button>
      </div>

      {/* Monthly Stats Cards */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
            Kehadiran Bulan Ini
          </span>
          <span className="text-xs font-bold text-blue-700">
            {INDONESIAN_MONTHS[currentMonthNum]} {currentYearNum}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
            <div className="w-7 h-7 rounded-xl bg-emerald-500 text-white flex items-center justify-center mx-auto mb-1 text-xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="text-[10px] font-bold text-slate-600">Hadir</div>
            <div className="text-base font-black text-emerald-900">{countHadir} x</div>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-100">
            <div className="w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center mx-auto mb-1 text-xs">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="text-[10px] font-bold text-slate-600">Telat</div>
            <div className="text-base font-black text-amber-900">{countTelat} x</div>
          </div>

          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100">
            <div className="w-7 h-7 rounded-xl bg-rose-500 text-white flex items-center justify-center mx-auto mb-1 text-xs">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="text-[10px] font-bold text-slate-600">Izin</div>
            <div className="text-base font-black text-rose-900">{countIzin} x</div>
          </div>
        </div>
      </div>
    </div>
  );
};
