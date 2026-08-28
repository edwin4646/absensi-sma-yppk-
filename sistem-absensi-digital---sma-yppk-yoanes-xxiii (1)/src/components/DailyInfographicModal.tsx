import React, { useRef, useState } from 'react';
import { User, AttendanceRecord, SystemSettings } from '../types';
import { SchoolLogo } from './SchoolLogo';
import { formatIndonesianDate } from '../utils/geo';
import html2canvas from 'html2canvas';
import { Download, X, AlertTriangle, CheckCircle2, XCircle, Calendar, Sparkles } from 'lucide-react';

interface DailyInfographicModalProps {
  classNameTarget: string;
  users: User[];
  attendance: AttendanceRecord[];
  settings: SystemSettings;
  onClose: () => void;
}

export const DailyInfographicModal: React.FC<DailyInfographicModalProps> = ({
  classNameTarget,
  users,
  attendance,
  settings,
  onClose
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const dateAttendance = attendance.filter(a => a.date === todayStr);

  const classStudents = users.filter(u => u.kategori === 'Siswa' && u.kelas === classNameTarget);

  const lateList: { name: string; time: string }[] = [];
  const presentList: string[] = [];
  const absentList: string[] = [];

  classStudents.forEach(st => {
    const rec = dateAttendance.find(a => a.user_id === st.user_id);
    const status = rec ? rec.status : 'Alpa';
    if (status === 'Hadir') {
      presentList.push(st.nama_siswa);
    } else if (status === 'Terlambat') {
      lateList.push({ name: st.nama_siswa, time: rec?.time_in || '07:35:00' });
    } else {
      absentList.push(st.nama_siswa);
    }
  });

  const total = classStudents.length;
  const attendanceRate = total > 0 ? Math.round(((presentList.length + lateList.length) / total) * 100) : 0;

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, { scale: 2, useCORS: true });
      const link = document.createElement('a');
      link.download = `Infografis_Presensi_Kelas_${classNameTarget}_${todayStr}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative animate-scaleUp my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-between mb-4 pr-10">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>Infografis Presensi Harian</span>
            </h3>
            <p className="text-xs text-slate-500">Kelas {classNameTarget} &bull; Siap Dibagikan ke Status WA / Ortu</p>
          </div>
        </div>

        {/* Infographic Card (Target Element for html2canvas) */}
        <div
          ref={cardRef}
          className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-lg text-slate-900"
        >
          {/* Header Gradient */}
          <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 p-5 text-white">
            <div className="flex items-center justify-between mb-3">
              <SchoolLogo type="kiri" size={40} />
              <div className="text-center">
                <h4 className="text-sm font-black tracking-wide uppercase">SMA YPPK YOANES XXIII</h4>
                <p className="text-[10px] text-blue-200 uppercase tracking-widest font-bold">REKAP PRESENSI HARIAN DIGITAL</p>
              </div>
              <SchoolLogo type="kanan" size={40} />
            </div>

            <div className="flex items-end justify-between pt-3 border-t border-white/20">
              <div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-amber-400 text-slate-950 uppercase tracking-wider">
                  KELAS {classNameTarget}
                </span>
                <div className="flex items-center gap-1.5 text-[11px] text-blue-100 mt-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatIndonesianDate()}</span>
                </div>
              </div>

              <div className="px-3 py-1.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-center">
                <div className="text-[9px] uppercase font-bold text-blue-200">Tingkat Kehadiran</div>
                <div className="text-xl font-black text-amber-300">{attendanceRate}%</div>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-5 space-y-4">
            {/* Stat Counters */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                <div className="text-emerald-700 font-bold text-[11px]">Hadir</div>
                <div className="text-lg font-black text-emerald-900">{presentList.length}</div>
              </div>
              <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200">
                <div className="text-amber-700 font-bold text-[11px]">Terlambat</div>
                <div className="text-lg font-black text-amber-900">{lateList.length}</div>
              </div>
              <div className="p-2.5 rounded-2xl bg-rose-50 border border-rose-200">
                <div className="text-rose-700 font-bold text-[11px]">Alpa</div>
                <div className="text-lg font-black text-rose-900">{absentList.length}</div>
              </div>
            </div>

            {/* Late Students List */}
            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs">
              <div className="flex items-center gap-1.5 text-amber-900 font-extrabold mb-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Siswa Terlambat ({lateList.length})</span>
              </div>
              {lateList.length > 0 ? (
                <ol className="list-decimal list-inside space-y-1 text-slate-800 text-[11px]">
                  {lateList.map((item, i) => (
                    <li key={i} className="font-semibold">
                      {item.name} <span className="text-amber-800 font-mono text-[10px]">({item.time} WIT)</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Semua Siswa Hadir Tepat Waktu</span>
                </p>
              )}
            </div>

            {/* Absent Students List */}
            <div className="p-3.5 rounded-2xl bg-rose-50/80 border border-rose-200 text-xs">
              <div className="flex items-center gap-1.5 text-rose-900 font-extrabold mb-1.5">
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>Siswa Alpa / Belum Absen ({absentList.length})</span>
              </div>
              {absentList.length > 0 ? (
                <ol className="list-decimal list-inside space-y-1 text-slate-800 text-[11px]">
                  {absentList.map((name, i) => (
                    <li key={i} className="font-semibold">{name}</li>
                  ))}
                </ol>
              ) : (
                <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Nihil (Semua Siswa Telah Hadir)</span>
                </p>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 text-center text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              Sistem Presensi Digital SMA YPPK Yoanes XXIII &bull; Merauke, Papua Selatan
            </div>
          </div>
        </div>

        {/* Download Action */}
        <div className="mt-5 flex gap-2">
          <button
            onClick={handleDownloadImage}
            disabled={isDownloading}
            className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition active:scale-95 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloading ? 'Menyimpan Gambar...' : 'Download Gambar Infografis (PNG)'}</span>
          </button>

          <button
            onClick={onClose}
            className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
