import React, { useState } from 'react';
import { User } from '../types';
import { SchoolLogo } from './SchoolLogo';
import { Printer, QrCode, ArrowLeft, User as UserIcon } from 'lucide-react';

interface StudentIdCardsProps {
  users: User[];
  onBack: () => void;
}

export const StudentIdCards: React.FC<StudentIdCardsProps> = ({
  users,
  onBack
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('');

  const students = users.filter(u => u.kategori === 'Siswa');
  const uniqueClasses = Array.from(new Set(students.map(s => s.kelas))).filter(c => c && c !== '-').sort();

  const filteredStudents = students.filter(s => {
    if (selectedClass && s.kelas !== selectedClass) return false;
    return true;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header & Controls (Hidden when printing) */}
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
            <QrCode className="w-5 h-5 text-blue-600" />
            <span>Cetak Kartu Pelajar Digital (QR Code)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kartu Pelajar berformat ID Card resmi dengan QR Code untuk presensi kamera instan (&lt; 1 detik).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Kelas ({students.length} Siswa)</option>
            {uniqueClasses.map(c => (
              <option key={c} value={c}>Kelas {c}</option>
            ))}
          </select>

          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-sm transition active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Kartu (Print / PDF)</span>
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="flex flex-wrap justify-center gap-6 print:gap-4 print:p-0">
        {filteredStudents.map((student) => {
          const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(student.nisn)}`;

          return (
            <div
              key={student.user_id}
              className="w-[340px] h-[215px] bg-gradient-to-br from-white to-slate-50 rounded-2xl border-2 border-blue-600 shadow-md p-3 relative overflow-hidden flex flex-col justify-between print:shadow-none print:break-inside-avoid print:border-black"
            >
              {/* Card Header Bar */}
              <div className="-mx-3 -mt-3 px-3 py-2 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between">
                <SchoolLogo type="kiri" size={26} />
                <div className="text-center">
                  <div className="text-[10px] font-black tracking-wider uppercase">SMA YPPK YOANES XXIII</div>
                  <div className="text-[7.5px] font-bold text-blue-200 tracking-widest uppercase">KARTU PELAJAR DIGITAL</div>
                </div>
                <SchoolLogo type="kanan" size={26} />
              </div>

              {/* Card Body */}
              <div className="flex items-center gap-3 my-auto">
                {/* Avatar Box */}
                <div className="w-[72px] h-[86px] rounded-xl border-2 border-blue-600 bg-slate-100 flex flex-col items-center justify-center text-slate-400 shrink-0 shadow-inner">
                  <UserIcon className="w-10 h-10 text-slate-400" />
                  <span className="text-[7px] font-bold text-slate-500 uppercase mt-1">FOTO SISWA</span>
                </div>

                {/* Student Info */}
                <div className="flex-1 min-w-0 text-left">
                  <h4 className="text-xs font-black text-slate-900 leading-snug truncate">
                    {student.nama_siswa}
                  </h4>
                  <div className="text-[10px] font-mono font-bold text-blue-700 mt-0.5">
                    NISN: {student.nisn}
                  </div>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-100 text-blue-800">
                    KELAS {student.kelas}
                  </span>
                </div>

                {/* QR Code */}
                <div className="w-[76px] h-[76px] bg-white p-1 rounded-xl border border-slate-300 shadow-sm shrink-0 flex items-center justify-center">
                  <img
                    src={qrCodeUrl}
                    alt={`QR ${student.nisn}`}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Card Footer Bar */}
              <div className="-mx-3 -mb-3 py-1 bg-slate-100 border-t border-slate-200 text-center text-[8px] font-bold text-slate-500 uppercase tracking-wider">
                TEMPELKAN QR CODE KE KAMERA PRESENSI SEKOLAH
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
