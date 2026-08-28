import React, { useState } from 'react';
import { User, AttendanceRecord, SystemSettings } from '../types';
import { INDONESIAN_MONTHS, formatIndonesianDate } from '../utils/geo';
import { SchoolLogo } from './SchoolLogo';
import { Banknote, Printer, Download, ArrowLeft, Award, Calendar } from 'lucide-react';

interface TeacherHonoraryProps {
  users: User[];
  attendance: AttendanceRecord[];
  settings: SystemSettings;
  onBack: () => void;
}

export const TeacherHonorary: React.FC<TeacherHonoraryProps> = ({
  users,
  attendance,
  settings,
  onBack
}) => {
  const currentMonthNum = new Date().getMonth() + 1;
  const currentYearNum = new Date().getFullYear();

  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonthNum);
  const [selectedYear, setSelectedYear] = useState<number>(currentYearNum);
  const [honorPerHadir, setHonorPerHadir] = useState<number>(50000);

  const teachers = users.filter(u => u.kategori === 'Guru');

  const teacherStats = teachers.map((teacher, index) => {
    const records = attendance.filter(a => {
      if (a.user_id !== teacher.user_id) return false;
      const d = new Date(a.date);
      return d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear && (a.status === 'Hadir' || a.status === 'Terlambat');
    });

    const totalHadir = records.length;
    const totalHonor = totalHadir * honorPerHadir;

    return {
      no: index + 1,
      teacher,
      totalHadir,
      totalHonor
    };
  });

  const grandTotalHadir = teacherStats.reduce((acc, curr) => acc + curr.totalHadir, 0);
  const grandTotalHonor = teacherStats.reduce((acc, curr) => acc + curr.totalHonor, 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const handleExportCSV = () => {
    let csv = `No,NIP/ID,Nama Guru,Jabatan,Total Hadir (Hari),Honor Per Hadir,Total Estimasi Honor\n`;
    teacherStats.forEach(item => {
      csv += `${item.no},"${item.teacher.nisn}","${item.teacher.nama_siswa}","${item.teacher.jabatan}",${item.totalHadir},${honorPerHadir},${item.totalHonor}\n`;
    });
    csv += `TOTAL KESELURUHAN,,,${grandTotalHadir},,${grandTotalHonor}\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Rekap_Honor_Guru_${INDONESIAN_MONTHS[selectedMonth]}_${selectedYear}.csv`;
    link.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Controls Bar */}
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
            <Banknote className="w-5 h-5 text-emerald-600" />
            <span>Perhitungan Kehadiran & Honor Guru</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Perhitungan otomatis akumulasi honor guru dan staf berdasarkan kehadiran bulanan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center gap-1.5 border border-emerald-200 transition"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-sm transition active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Rekap Honor</span>
          </button>
        </div>
      </div>

      {/* Filter Options */}
      <div className="no-print bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-700">Periode:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50"
            >
              {INDONESIAN_MONTHS.slice(1).map((m, i) => (
                <option key={m} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50"
          >
            {[currentYearNum - 1, currentYearNum, currentYearNum + 1].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">Honor / Hadir:</span>
          <div className="flex items-center">
            <span className="px-3 py-1.5 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-xs font-bold text-slate-500">Rp</span>
            <input
              type="number"
              value={honorPerHadir}
              onChange={(e) => setHonorPerHadir(Number(e.target.value) || 0)}
              className="w-28 px-3 py-1.5 border border-slate-200 rounded-r-xl text-xs font-bold font-mono focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Printable Sheet */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm print:p-0 print:border-none print:shadow-none">
        {/* KOP Surat */}
        <div className="border-b-4 border-black pb-4 mb-6">
          <div className="flex items-center justify-between gap-4">
            <SchoolLogo type="kiri" size={65} />
            <div className="text-center flex-1">
              <h4 className="text-xs font-bold text-black uppercase tracking-wider">{settings.foundation_name}</h4>
              <h2 className="text-lg font-black text-black uppercase tracking-tight">{settings.school_name}</h2>
              <p className="text-xs text-black font-serif italic">Merauke, Papua Selatan &bull; Sistem Presensi Kehadiran Terpadu</p>
            </div>
            <SchoolLogo type="kanan" size={65} />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h3 className="text-base font-black uppercase underline tracking-wide text-black">
            LAPORAN REKAPITULASI HONOR KEHADIRAN GURU & STAF
          </h3>
          <p className="text-xs text-black font-semibold mt-1">
            Periode: <b>{INDONESIAN_MONTHS[selectedMonth]} {selectedYear}</b> &bull; Tarif: <b>{formatCurrency(honorPerHadir)} / Kehadiran</b>
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse border border-black">
            <thead>
              <tr className="bg-slate-100 text-black font-bold uppercase text-[10px] text-center border-b border-black">
                <th className="py-2.5 px-3 border border-black w-10">No</th>
                <th className="py-2.5 px-3 border border-black w-28">NIP / ID</th>
                <th className="py-2.5 px-4 border border-black text-left">Nama Guru / Staf</th>
                <th className="py-2.5 px-3 border border-black text-left">Jabatan</th>
                <th className="py-2.5 px-3 border border-black w-24">Total Hadir</th>
                <th className="py-2.5 px-3 border border-black w-32">Honor / Hadir</th>
                <th className="py-2.5 px-4 border border-black w-36 text-right">Total Honor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black text-black">
              {teacherStats.map((item) => (
                <tr key={item.teacher.user_id} className="hover:bg-slate-50 transition">
                  <td className="py-2 px-3 border border-black text-center font-mono">{item.no}</td>
                  <td className="py-2 px-3 border border-black font-mono text-center">{item.teacher.nisn}</td>
                  <td className="py-2 px-4 border border-black font-bold">{item.teacher.nama_siswa}</td>
                  <td className="py-2 px-3 border border-black text-slate-700">{item.teacher.jabatan}</td>
                  <td className="py-2 px-3 border border-black text-center font-bold text-emerald-800">{item.totalHadir} Hari</td>
                  <td className="py-2 px-3 border border-black text-center font-mono">{formatCurrency(honorPerHadir)}</td>
                  <td className="py-2 px-4 border border-black text-right font-black text-emerald-900 font-mono">
                    {formatCurrency(item.totalHonor)}
                  </td>
                </tr>
              ))}

              <tr className="bg-slate-100 text-black font-black text-xs border-t-2 border-black">
                <td colSpan={4} className="py-3 px-4 border border-black text-center uppercase tracking-wider">
                  TOTAL KESELURUHAN
                </td>
                <td className="py-3 px-3 border border-black text-center font-bold text-emerald-900">
                  {grandTotalHadir} Hari
                </td>
                <td className="py-3 px-3 border border-black text-center">-</td>
                <td className="py-3 px-4 border border-black text-right font-black text-emerald-900 font-mono">
                  {formatCurrency(grandTotalHonor)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Signature */}
        <div className="mt-10 pt-4 flex justify-end text-black text-xs">
          <div className="text-center w-72 space-y-1">
            <p>Merauke, {formatIndonesianDate()}</p>
            <p className="font-bold">Kepala Sekolah SMA YPPK Yoanes XXIII</p>
            <div className="h-20" />
            <p className="font-bold underline text-sm">{settings.principal_name}</p>
            <p className="text-[11px] text-slate-700">NIP. .......................................</p>
          </div>
        </div>
      </div>
    </div>
  );
};
