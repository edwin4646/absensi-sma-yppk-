import React, { useState } from 'react';
import { User, AttendanceRecord, SystemSettings } from '../types';
import { AppStorage } from '../services/storage';
import { formatIndonesianDate } from '../utils/geo';
import { 
  createDirectWhatsAppLink, 
  createParentNotificationText, 
  createHomeroomClassReportWhatsAppLink,
  sendAutoWhatsAppNotification
} from '../utils/whatsapp';
import { 
  Calculator, 
  Send, 
  Copy, 
  Check, 
  ExternalLink, 
  MessageSquare, 
  AlertTriangle, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Sparkles,
  PhoneCall,
  Image as ImageIcon,
  Zap,
  CheckCheck
} from 'lucide-react';

interface AttendanceCalculatorProps {
  currentUser?: User;
  users: User[];
  attendance: AttendanceRecord[];
  settings: SystemSettings;
  onOpenInfographicModal: (className: string) => void;
  onRefreshData: () => void;
  onBack?: () => void;
}

export const AttendanceCalculator: React.FC<AttendanceCalculatorProps> = ({
  currentUser,
  users,
  attendance,
  settings,
  onOpenInfographicModal,
  onRefreshData,
  onBack
}) => {
  const isStudent = currentUser?.kategori === 'Siswa';
  const isAdmin = currentUser?.kategori === 'Admin';
  const isGuru = currentUser?.kategori === 'Guru';
  const isWaliKelas = isGuru && currentUser?.kelas && currentUser?.kelas !== '-';

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  // Default to Wali Kelas's class if applicable
  const [selectedClass, setSelectedClass] = useState<string>(
    isWaliKelas ? (currentUser?.kelas || '') : ''
  );
  const [testPhoneNumber, setTestPhoneNumber] = useState<string>('082248123451');
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [actionAlert, setActionAlert] = useState<string | null>(null);

  // If student tries to open this view, show access restricted screen
  if (isStudent) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-5">
        <div className="w-20 h-20 rounded-3xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
          <AlertTriangle className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-extrabold text-slate-900">
            Akses Khusus Admin & Wali Kelas
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
            Halaman <strong>Kirim Notifikasi WhatsApp & Perhitungan Kehadiran</strong> ini hanya diperuntukkan bagi <strong>Administrator Sekolah</strong> dan <strong>Wali Kelas</strong> untuk menghubungi orang tua siswa.
          </p>
        </div>
        <div className="pt-2">
          <button
            onClick={onBack}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-extrabold shadow-md transition"
          >
            Kembali ke Beranda Siswa
          </button>
        </div>
      </div>
    );
  }

  // Filter students
  const students = users.filter(u => u.kategori === 'Siswa');
  const filteredStudents = students.filter(s => {
    if (selectedClass && s.kelas !== selectedClass) return false;
    return true;
  });

  // Unique Classes
  const uniqueClasses: string[] = Array.from(new Set(students.map(s => s.kelas))).filter((c): c is string => Boolean(c && c !== '-')).sort();

  // Attendance for selected date
  const dateAttendance = attendance.filter(a => a.date === selectedDate);

  // Calculate statistics
  let totalHadir = 0;
  let totalTerlambat = 0;
  let totalSakit = 0;
  let totalIzin = 0;

  const studentStatusList = filteredStudents.map(student => {
    const record = dateAttendance.find(a => a.user_id === student.user_id);
    let status: 'Hadir' | 'Terlambat' | 'Sakit' | 'Izin' | 'Alpa' = 'Alpa';
    let timeIn: string | null = '-';

    if (record) {
      status = record.status;
      timeIn = record.time_in;
    }

    if (status === 'Hadir') totalHadir++;
    else if (status === 'Terlambat') totalTerlambat++;
    else if (status === 'Sakit') totalSakit++;
    else if (status === 'Izin') totalIzin++;

    return {
      student,
      record,
      status,
      timeIn
    };
  });

  const totalSiswa = filteredStudents.length;
  const totalRecorded = totalHadir + totalTerlambat + totalSakit + totalIzin;
  const totalAlpa = Math.max(0, totalSiswa - totalRecorded);
  const percentAttendance = totalSiswa > 0 ? Math.round(((totalHadir + totalTerlambat) / totalSiswa) * 100) : 0;

  // Group by Class for Homeroom Report
  const classBreakdown: Record<string, { total: number; late: string[]; absent: string[]; homeroom: User | null }> = {};

  uniqueClasses.forEach(cls => {
    const clsStudents = students.filter(s => s.kelas === cls);
    const lateList: string[] = [];
    const absentList: string[] = [];

    clsStudents.forEach(st => {
      const rec = dateAttendance.find(a => a.user_id === st.user_id);
      const stStatus = rec ? rec.status : 'Alpa';
      if (stStatus === 'Terlambat') {
        lateList.push(`${st.nama_siswa} (${rec?.time_in || '-'} WIT)`);
      } else if (stStatus === 'Alpa') {
        absentList.push(st.nama_siswa);
      }
    });

    const homeroom = users.find(u => u.kategori === 'Guru' && (u.kelas === cls || u.jabatan.includes(cls))) || null;

    classBreakdown[cls] = {
      total: clsStudents.length,
      late: lateList,
      absent: absentList,
      homeroom
    };
  });

  const [isBlastingHomeroom, setIsBlastingHomeroom] = useState(false);
  const [blastingProgress, setBlastingProgress] = useState<{ current: number; total: number; successCount: number } | null>(null);

  // Automatic / Instant blast to all homeroom teachers via API or Direct
  const handleAutoBlastAllHomeroom = async () => {
    const classEntries = Object.entries(classBreakdown);
    if (classEntries.length === 0) return;

    setIsBlastingHomeroom(true);
    setBlastingProgress({ current: 0, total: classEntries.length, successCount: 0 });

    let successCount = 0;

    for (let i = 0; i < classEntries.length; i++) {
      const [clsName, data] = classEntries[i];
      const homeroomName = data.homeroom ? data.homeroom.nama_siswa : 'Wali Kelas ' + clsName;
      const homeroomPhone = data.homeroom ? data.homeroom.no_wa_ortu : '082248123451';

      const d = selectedDate || new Date().toISOString().split('T')[0];
      let msg = `*LAPORAN PRESENSI HARIAN KELAS ${clsName}*\n`;
      msg += `*SMA YPPK YOANES XXIII MERAUKE*\n`;
      msg += `Tanggal: ${d}\n`;
      msg += `Wali Kelas: ${homeroomName}\n`;
      msg += `------------------------------------\n\n`;
      msg += `⚠️ *SISWA TERLAMBAT (${data.late.length}):*\n`;
      if (data.late.length > 0) {
        data.late.forEach((item, idx) => { msg += `${idx + 1}. ${item}\n`; });
      } else {
        msg += `(Nihil / Semua Tepat Waktu)\n`;
      }
      msg += `\n❌ *SISWA ALPA / BELUM ABSEN (${data.absent.length}):*\n`;
      if (data.absent.length > 0) {
        data.absent.forEach((item, idx) => { msg += `${idx + 1}. ${item}\n`; });
      } else {
        msg += `(Nihil / Semua Hadir)\n`;
      }
      msg += `\n_Pesan ini dapat diteruskan langsung ke Grup WhatsApp Orang Tua Kelas ${clsName}._`;

      // Call API
      const res = await sendAutoWhatsAppNotification(settings.token_wa, homeroomPhone, msg);
      if (res.success) {
        successCount++;
      }

      setBlastingProgress({ current: i + 1, total: classEntries.length, successCount });
      // Small pause to prevent rate limiting
      await new Promise(r => setTimeout(r, 400));
    }

    setIsBlastingHomeroom(false);
    setActionAlert(`⚡ Berhasil memproses pengiriman otomatis ke ${successCount} dari ${classEntries.length} Wali Kelas!`);
    setTimeout(() => {
      setActionAlert(null);
      setBlastingProgress(null);
    }, 6000);
  };

  // Apply test phone number to all students
  const handleApplyTestNumber = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhoneNumber) return;
    AppStorage.setAllStudentsParentWhatsApp(testPhoneNumber);
    onRefreshData();
    setActionAlert(`✅ Nomor WhatsApp Orang Tua seluruh siswa berhasil diubah ke: ${testPhoneNumber}! Sekarang semua tombol WA akan langsung mengarah ke nomor Anda.`);
    setTimeout(() => setActionAlert(null), 6000);
  };

  // Copy all WA Messages for Broadcast List
  const handleCopyAllWAMessages = () => {
    const lateAndAbsent = studentStatusList.filter(s => s.status === 'Terlambat' || s.status === 'Alpa');
    if (lateAndAbsent.length === 0) {
      alert("Tidak ada siswa terlambat / alpa pada tanggal ini.");
      return;
    }

    let text = `*REKAP NOTIFIKASI ORANG TUA SISWA - SMA YPPK YOANES XXIII*\n`;
    text += `Tanggal: ${selectedDate}\n`;
    text += `========================================\n\n`;

    lateAndAbsent.forEach((item, idx) => {
      text += `${idx + 1}. *${item.student.nama_siswa}* (${item.student.kelas})\n`;
      text += `   Status: *${item.status}* (${item.timeIn} WIT)\n`;
      text += `   No. WA Ortu: ${item.student.no_wa_ortu}\n`;
      text += `   Pesan: ${createParentNotificationText(item.student.nama_siswa, item.status, item.timeIn, selectedDate).replace(/\n/g, ' ')}\n\n`;
    });

    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 3000);
  };

  // Open batch 5 tabs
  const handleOpenBatchWA = (startIndex: number, count: number) => {
    const lateAndAbsent = studentStatusList.filter(s => s.status === 'Terlambat' || s.status === 'Alpa');
    const slice = lateAndAbsent.slice(startIndex, startIndex + count);
    if (slice.length === 0) {
      alert("Tidak ada data siswa lagi pada urutan batch ini.");
      return;
    }

    slice.forEach(item => {
      const link = createDirectWhatsAppLink(item.student.no_wa_ortu, item.student.nama_siswa, item.status, item.timeIn, selectedDate);
      if (link !== '#') window.open(link, '_blank');
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex items-center gap-1.5 text-blue-700 font-bold text-xs uppercase tracking-wider">
              <Calculator className="w-4 h-4" />
              <span>Gateway Notifikasi WhatsApp</span>
            </span>
            {isWaliKelas && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
                👑 Wali Kelas {currentUser?.kelas}
              </span>
            )}
            {isAdmin && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200">
                🛡️ Administrator
              </span>
            )}
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Perhitungan Kehadiran & Notifikasi Orang Tua
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isWaliKelas 
              ? `Layanan pengiriman notifikasi WhatsApp khusus untuk Orang Tua Siswa Kelas ${currentUser?.kelas} & Infografis Kehadiran.`
              : 'Rekap otomatis kehadiran real-time dan pengiriman notifikasi instan via WhatsApp ke Orang Tua & Wali Kelas.'}
          </p>
        </div>

        {/* Date and Class Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Kelas ({students.length} Siswa)</option>
            {uniqueClasses.map(c => (
              <option key={c} value={c}>
                Kelas {c} {isWaliKelas && currentUser?.kelas === c ? '(Kelas Anda)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {actionAlert && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-fadeIn shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{actionAlert}</span>
        </div>
      )}

      {/* Test WhatsApp Number Injector Banner */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-3xl p-4 sm:p-5 shadow-sm">
        <form onSubmit={handleApplyTestNumber} className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-emerald-900 font-extrabold text-xs">
              <PhoneCall className="w-4 h-4 text-emerald-600" />
              <span>Uji Coba Langsung: Pasang Nomor WhatsApp Anda</span>
            </div>
            <p className="text-[11px] text-emerald-700">
              Masukkan nomor WA Anda untuk menguji link WhatsApp notifikasi ke nomor Anda sendiri secara gratis.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={testPhoneNumber}
              onChange={(e) => setTestPhoneNumber(e.target.value)}
              placeholder="Contoh: 082248123451"
              className="px-3 py-2 rounded-xl border border-emerald-300 text-xs font-mono font-bold bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-48"
              required
            />
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shrink-0 shadow-sm transition active:scale-95"
            >
              Set Ke Seluruh Siswa
            </button>
          </div>
        </form>
      </div>

      {/* Key Metric Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance Percentage */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-5 rounded-3xl shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-100 uppercase tracking-wider">Tingkat Kehadiran</span>
            <Users className="w-5 h-5 text-blue-200" />
          </div>
          <div className="text-3xl font-black">{percentAttendance}%</div>
          <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
            <div className="bg-amber-400 h-full rounded-full" style={{ width: `${percentAttendance}%` }} />
          </div>
          <p className="text-[11px] text-blue-100">
            Dari Total {totalSiswa} Siswa {selectedClass ? `Kelas ${selectedClass}` : 'Sekolah'}
          </p>
        </div>

        {/* Present on Time */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-xs font-extrabold uppercase tracking-wider">Hadir Tepat Waktu</span>
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="text-3xl font-black text-slate-900">{totalHadir} <span className="text-xs font-normal text-slate-500">Siswa</span></div>
          <p className="text-[11px] text-emerald-600 font-semibold">
            {totalSiswa > 0 ? Math.round((totalHadir / totalSiswa) * 100) : 0}% Presensi Tepat Waktu (≤ {settings.jam_masuk} WIT)
          </p>
        </div>

        {/* Late */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-xs font-extrabold uppercase tracking-wider">Terlambat Masuk</span>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="text-3xl font-black text-slate-900">{totalTerlambat} <span className="text-xs font-normal text-slate-500">Siswa</span></div>
          <p className="text-[11px] text-amber-600 font-semibold">
            Tiba lewat batas jam masuk sekolah
          </p>
        </div>

        {/* Absent */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-rose-600">
            <span className="text-xs font-extrabold uppercase tracking-wider">Alpa / Belum Absen</span>
            <XCircle className="w-5 h-5" />
          </div>
          <div className="text-3xl font-black text-slate-900">{totalAlpa} <span className="text-xs font-normal text-slate-500">Siswa</span></div>
          <p className="text-[11px] text-slate-500">
            Sakit/Izin: <strong className="text-slate-700">{totalSakit + totalIzin} Siswa</strong>
          </p>
        </div>
      </div>

      {/* Homeroom Teachers Forwarding Panel */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <span>📢 Kirim Laporan Ke Wali Kelas (Otomatis / Manual 1-Klik)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Draf laporan presensi per kelas dikirim langsung ke WhatsApp Wali Kelas untuk diforward ke Grup WhatsApp Orang Tua.
            </p>
          </div>

          <button
            onClick={handleAutoBlastAllHomeroom}
            disabled={isBlastingHomeroom}
            className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
          >
            {isBlastingHomeroom ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Mengirim ({blastingProgress?.current}/{blastingProgress?.total})...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-amber-300" />
                <span>⚡ Kirim Otomatis Ke Semua Wali Kelas</span>
              </>
            )}
          </button>
        </div>

        {blastingProgress && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-900">
            <span className="font-bold">Proses Pengiriman Otomatis API: {blastingProgress.current} dari {blastingProgress.total} Kelas</span>
            <span className="font-extrabold text-emerald-700">Terkirim: {blastingProgress.successCount}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(classBreakdown).map(([clsName, data]) => {
            const homeroomName = data.homeroom ? data.homeroom.nama_siswa : 'Wali Kelas ' + clsName;
            const homeroomPhone = data.homeroom ? data.homeroom.no_wa_ortu : '082248123451';
            const waHomeroomLink = createHomeroomClassReportWhatsAppLink(
              homeroomPhone,
              clsName,
              homeroomName,
              data.late,
              data.absent,
              selectedDate
            );

            return (
              <div key={clsName} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-slate-900 text-sm">Kelas {clsName}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-100 text-blue-800">
                      {data.total} Siswa
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 leading-snug">
                    <div className="truncate font-semibold text-slate-700">{homeroomName}</div>
                    <div className="font-mono text-slate-400">{homeroomPhone}</div>
                  </div>

                  <div className="flex gap-2 mt-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                      Telat: {data.late.length}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">
                      Alpa: {data.absent.length}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-200">
                  <a
                    href={waHomeroomLink}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim WA Wali Kelas</span>
                  </a>

                  <button
                    onClick={() => onOpenInfographicModal(clsName)}
                    className="w-full py-1.5 px-3 rounded-xl bg-white hover:bg-slate-100 text-blue-700 font-bold text-xs border border-blue-200 flex items-center justify-center gap-1.5 transition"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Gambar Infografis</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Batch 20+ Broadcast Controls */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Solusi Cepat 20+ Orang Tua (Broadcast List & Batch WhatsApp)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Gunakan tombol berikut jika ingin mengirim notifikasi massal tanpa perlu klik satu per satu.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleCopyAllWAMessages}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-sm transition active:scale-95"
            >
              {copiedAll ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedAll ? 'Tersalin ke Clipboard!' : '📋 Salin Semua Pesan WA (Broadcast)'}</span>
            </button>

            <button
              onClick={() => handleOpenBatchWA(0, 5)}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Buka Batch WA (1-5)</span>
            </button>

            <button
              onClick={() => handleOpenBatchWA(5, 5)}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Buka Batch WA (6-10)</span>
            </button>
          </div>
        </div>

        {/* Detailed Student Attendance Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="py-3 px-4">No</th>
                <th className="py-3 px-4">NISN</th>
                <th className="py-3 px-4">Nama Siswa</th>
                <th className="py-3 px-4">Kelas</th>
                <th className="py-3 px-4">Jam Masuk</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">WhatsApp Orang Tua</th>
                <th className="py-3 px-4 text-center">Aksi Langsung</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {studentStatusList.map((item, idx) => {
                const isLateOrAbsent = item.status === 'Terlambat' || item.status === 'Alpa';
                const waLink = createDirectWhatsAppLink(
                  item.student.no_wa_ortu,
                  item.student.nama_siswa,
                  item.status,
                  item.timeIn,
                  selectedDate
                );

                return (
                  <tr key={item.student.user_id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">{item.student.nisn}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{item.student.nama_siswa}</td>
                    <td className="py-3 px-4 font-semibold text-slate-600">{item.student.kelas}</td>
                    <td className="py-3 px-4 font-mono">{item.timeIn ? `${item.timeIn} WIT` : '-'}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                        item.status === 'Hadir'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'Terlambat'
                          ? 'bg-amber-100 text-amber-800'
                          : item.status === 'Sakit' || item.status === 'Izin'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{item.student.no_wa_ortu}</td>
                    <td className="py-3 px-4 text-center">
                      {isLateOrAbsent ? (
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition active:scale-95"
                          title="Buka WhatsApp & Kirim Pesan Resmi Ke Orang Tua"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Kirim WA Ortu</span>
                        </a>
                      ) : (
                        <span className="text-slate-400 text-[11px] font-medium">✓ Hadir Tepat Waktu</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
