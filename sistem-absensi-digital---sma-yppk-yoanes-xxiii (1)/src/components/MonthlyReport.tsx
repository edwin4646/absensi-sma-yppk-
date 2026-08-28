import React, { useState } from 'react';
import { User, AttendanceRecord, SystemSettings } from '../types';
import { SchoolLogo } from './SchoolLogo';
import { INDONESIAN_MONTHS, formatIndonesianDate } from '../utils/geo';
import { 
  Printer, 
  FileSpreadsheet, 
  ArrowLeft, 
  Download, 
  Users, 
  Award,
  Calendar,
  Filter
} from 'lucide-react';

interface MonthlyReportProps {
  users: User[];
  attendance: AttendanceRecord[];
  settings: SystemSettings;
  onBack: () => void;
}

export const MonthlyReport: React.FC<MonthlyReportProps> = ({
  users,
  attendance,
  settings,
  onBack
}) => {
  const currentMonthNum = new Date().getMonth() + 1;
  const currentYearNum = new Date().getFullYear();

  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonthNum);
  const [selectedYear, setSelectedYear] = useState<number>(currentYearNum);
  const [selectedCategory, setSelectedCategory] = useState<'Siswa' | 'Guru'>('Siswa');
  const [selectedClass, setSelectedClass] = useState<string>('');

  const targetUsers = users.filter(u => {
    if (u.kategori !== selectedCategory) return false;
    if (selectedCategory === 'Siswa' && selectedClass && u.kelas !== selectedClass) return false;
    return true;
  });

  const uniqueClasses = Array.from(new Set(users.filter(u => u.kategori === 'Siswa').map(s => s.kelas))).filter(c => c && c !== '-').sort();

  // Aggregate Attendance for Month & Year
  const userMonthlyStats = targetUsers.map((user, index) => {
    const userRecords = attendance.filter(a => {
      if (a.user_id !== user.user_id) return false;
      const recDate = new Date(a.date);
      return recDate.getMonth() + 1 === selectedMonth && recDate.getFullYear() === selectedYear;
    });

    const totalHadir = userRecords.filter(r => r.status === 'Hadir').length;
    const totalTerlambat = userRecords.filter(r => r.status === 'Terlambat').length;
    const totalIzin = userRecords.filter(r => r.status === 'Izin').length;
    const totalSakit = userRecords.filter(r => r.status === 'Sakit').length;
    const totalKehadiran = totalHadir + totalTerlambat;

    return {
      no: index + 1,
      user,
      totalHadir,
      totalTerlambat,
      totalIzin,
      totalSakit,
      totalKehadiran
    };
  });

  // Export to CSV
  const handleExportCSV = () => {
    let csv = `No,NIP/NISN,Nama Lengkap,Kategori,Kelas/Jabatan,Hadir Tepat Waktu,Terlambat,Izin,Sakit,Total Kehadiran\n`;
    userMonthlyStats.forEach(item => {
      csv += `${item.no},"${item.user.nisn}","${item.user.nama_siswa}","${item.user.kategori}","${item.user.kelas}",${item.totalHadir},${item.totalTerlambat},${item.totalIzin},${item.totalSakit},${item.totalKehadiran}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Rekap_Presensi_${selectedCategory}_${INDONESIAN_MONTHS[selectedMonth]}_${selectedYear}.csv`;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Control Bar (Hidden when printing) */}
      <div className="no-print bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </button>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <span>Laporan Rekapitulasi Kehadiran Bulanan</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Laporan presensi resmi SMA YPPK Yoanes XXIII Merauke dengan KOP Surat dan format cetak standar dinas.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center gap-1.5 border border-emerald-200 transition"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-sm transition active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Simpan PDF</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Selectors (Hidden on print) */}
      <div className="no-print bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedCategory('Siswa')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition ${
              selectedCategory === 'Siswa' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Rekap Siswa</span>
          </button>

          <button
            onClick={() => setSelectedCategory('Guru')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition ${
              selectedCategory === 'Guru' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Rekap Guru & Staf</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Month Selector */}
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 focus:outline-none"
            >
              {INDONESIAN_MONTHS.slice(1).map((m, idx) => (
                <option key={m} value={idx + 1}>{m}</option>
              ))}
            </select>
          </div>

          {/* Year Selector */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 focus:outline-none"
          >
            {[currentYearNum - 1, currentYearNum, currentYearNum + 1].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          {/* Class Filter if Siswa */}
          {selectedCategory === 'Siswa' && (
            <div className="flex items-center gap-1">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 focus:outline-none"
              >
                <option value="">Semua Kelas</option>
                {uniqueClasses.map(c => (
                  <option key={c} value={c}>Kelas {c}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Printable Report Sheet */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm print:shadow-none print:p-0 print:border-none">
        {/* Official School Letterhead (KOP SURAT) */}
        <div className="border-b-4 border-black pb-4 mb-6">
          <div className="flex items-center justify-between gap-4">
            <SchoolLogo type="kiri" size={70} />
            <div className="text-center flex-1">
              <h4 className="text-sm font-bold text-black uppercase tracking-wider">
                {settings.foundation_name}
              </h4>
              <h2 className="text-xl font-black text-black uppercase tracking-tight">
                {settings.school_name}
              </h2>
              <p className="text-xs text-black font-serif italic mt-0.5">
                Alamat: Merauke, Papua Selatan &bull; Sistem Informasi Presensi Digital Terpadu
              </p>
            </div>
            <SchoolLogo type="kanan" size={70} />
          </div>
        </div>

        {/* Title & Period */}
        <div className="text-center mb-6">
          <h3 className="text-base font-black uppercase underline tracking-wide text-black">
            LAPORAN REKAPITULASI KEHADIRAN {selectedCategory.toUpperCase()}
          </h3>
          <p className="text-xs text-black font-semibold mt-1">
            Periode: <b>{INDONESIAN_MONTHS[selectedMonth]} {selectedYear}</b>
            {selectedCategory === 'Siswa' && selectedClass && ` | Kelas: ${selectedClass}`}
          </p>
        </div>

        {/* Summary Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse border border-black">
            <thead>
              <tr className="bg-slate-100 text-black font-bold uppercase text-[10px] text-center border-b border-black">
                <th className="py-2.5 px-3 border border-black w-10">No</th>
                <th className="py-2.5 px-3 border border-black w-28">NIP / NISN</th>
                <th className="py-2.5 px-4 border border-black text-left">Nama Lengkap</th>
                <th className="py-2.5 px-3 border border-black w-24">
                  {selectedCategory === 'Guru' ? 'Jabatan' : 'Kelas'}
                </th>
                <th className="py-2.5 px-2 border border-black w-16 text-emerald-800">Hadir</th>
                <th className="py-2.5 px-2 border border-black w-16 text-amber-800">Telat</th>
                <th className="py-2.5 px-2 border border-black w-16 text-blue-800">Izin</th>
                <th className="py-2.5 px-2 border border-black w-16 text-indigo-800">Sakit</th>
                <th className="py-2.5 px-3 border border-black w-24 text-black font-black">Total Hadir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black text-black">
              {userMonthlyStats.map((item) => (
                <tr key={item.user.user_id} className="hover:bg-slate-50 transition">
                  <td className="py-2 px-3 border border-black text-center font-mono">{item.no}</td>
                  <td className="py-2 px-3 border border-black font-mono font-semibold text-center">{item.user.nisn}</td>
                  <td className="py-2 px-4 border border-black font-bold">{item.user.nama_siswa}</td>
                  <td className="py-2 px-3 border border-black text-center font-medium">
                    {selectedCategory === 'Guru' ? item.user.jabatan : item.user.kelas}
                  </td>
                  <td className="py-2 px-2 border border-black text-center font-bold text-emerald-800">{item.totalHadir}</td>
                  <td className="py-2 px-2 border border-black text-center font-bold text-amber-800">{item.totalTerlambat}</td>
                  <td className="py-2 px-2 border border-black text-center font-bold text-blue-800">{item.totalIzin}</td>
                  <td className="py-2 px-2 border border-black text-center font-bold text-indigo-800">{item.totalSakit}</td>
                  <td className="py-2 px-3 border border-black text-center font-black bg-slate-50">
                    {item.totalKehadiran} Hari
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Official Signature Block */}
        <div className="mt-10 pt-4 flex justify-end text-black text-xs">
          <div className="text-center w-72 space-y-1">
            <p>Merauke, {formatIndonesianDate()}</p>
            <p className="font-bold">Kepala Sekolah SMA YPPK Yoanes XXIII</p>
            <div className="h-20" /> {/* Spacer for physical signature */}
            <p className="font-bold underline text-sm">{settings.principal_name}</p>
            <p className="text-[11px] text-slate-700">NIP. .......................................</p>
          </div>
        </div>
      </div>
    </div>
  );
};
