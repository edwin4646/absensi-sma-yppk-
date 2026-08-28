import React, { useState } from 'react';
import { User, LeaveRequest } from '../types';
import { AppStorage } from '../services/storage';
import { formatIndonesianDate } from '../utils/geo';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Send, 
  ArrowLeft, 
  Plus, 
  FileCheck, 
  X 
} from 'lucide-react';

interface LeaveValidationProps {
  currentUser: User;
  leaves: LeaveRequest[];
  onRefreshLeaves: () => void;
  onBack: () => void;
}

export const LeaveValidation: React.FC<LeaveValidationProps> = ({
  currentUser,
  leaves,
  onRefreshLeaves,
  onBack
}) => {
  const [modalNewOpen, setModalNewOpen] = useState(false);
  const [filterType, setFilterType] = useState<'All' | 'Menunggu' | 'Disetujui' | 'Ditolak'>('All');

  // New Request Form
  const [formType, setFormType] = useState<'Sakit' | 'Izin'>('Sakit');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formReason, setFormReason] = useState('');

  const isAdminOrTeacher = currentUser.kategori === 'Admin' || currentUser.kategori === 'Guru';

  // Handle Approve / Reject
  const handleUpdateStatus = (id: number, newStatus: 'Disetujui' | 'Ditolak') => {
    const allLeaves = AppStorage.getLeaves();
    const idx = allLeaves.findIndex(l => l.id_izin === id);
    if (idx >= 0) {
      allLeaves[idx].status = newStatus;
      AppStorage.saveLeaves(allLeaves);

      // If approved, update attendance record for that date
      if (newStatus === 'Disetujui') {
        const item = allLeaves[idx];
        AppStorage.addOrUpdateAttendance({
          user_id: item.user_id,
          date: item.tanggal_mulai,
          time_in: '07:30:00',
          time_out: null,
          status: item.jenis_izin,
          nama_siswa: item.nama_siswa,
          kelas: item.kelas,
          kategori: item.kategori
        });
      }

      onRefreshLeaves();
    }
  };

  // Submit New Leave Request
  const handleSubmitNewLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formReason.trim()) return;

    const allLeaves = AppStorage.getLeaves();
    const newId = allLeaves.length > 0 ? Math.max(...allLeaves.map(l => l.id_izin)) + 1 : 1;

    const newLeave: LeaveRequest = {
      id_izin: newId,
      user_id: currentUser.user_id,
      nama_siswa: currentUser.nama_siswa,
      kategori: currentUser.kategori,
      kelas: currentUser.kelas,
      jenis_izin: formType,
      tanggal_mulai: formDate,
      keterangan: formReason.trim(),
      status: 'Menunggu',
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    allLeaves.unshift(newLeave);
    AppStorage.saveLeaves(allLeaves);
    onRefreshLeaves();
    setModalNewOpen(false);
    setFormReason('');
  };

  const filteredLeaves = leaves.filter(l => {
    if (filterType !== 'All' && l.status !== filterType) return false;
    if (!isAdminOrTeacher && l.user_id !== currentUser.user_id) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </button>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-500" />
            <span>Validasi Pengajuan Izin & Sakit</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola pengajuan surat izin dan surat dokter siswa serta persetujuan resmi.
          </p>
        </div>

        <button
          onClick={() => setModalNewOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-sm transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Ajukan Izin / Sakit Baru</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['All', 'Menunggu', 'Disetujui', 'Ditolak'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilterType(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              filterType === tab ? 'bg-slate-900 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab === 'All' ? 'Semua Pengajuan' : tab}
          </button>
        ))}
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Tanggal Izin</th>
                <th className="py-3 px-4">Nama Pengaju</th>
                <th className="py-3 px-4">Jenis</th>
                <th className="py-3 px-4">Keterangan / Alasan</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center w-36">Aksi Persetujuan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredLeaves.map((item, idx) => (
                <tr key={item.id_izin} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 text-center font-mono text-slate-400">{idx + 1}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {formatIndonesianDate(item.tanggal_mulai)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{item.nama_siswa}</div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700">
                      {item.kategori} &bull; {item.kelas}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                      item.jenis_izin === 'Sakit' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item.jenis_izin}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-700 max-w-xs">{item.keterangan}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                      item.status === 'Disetujui'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.status === 'Ditolak'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {item.status === 'Disetujui' && <CheckCircle className="w-3 h-3" />}
                      {item.status === 'Ditolak' && <XCircle className="w-3 h-3" />}
                      {item.status === 'Menunggu' && <Clock className="w-3 h-3" />}
                      <span>{item.status}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {isAdminOrTeacher && item.status === 'Menunggu' ? (
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleUpdateStatus(item.id_izin, 'Disetujui')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm transition active:scale-95"
                          title="Setujui Izin"
                        >
                          ACC
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(item.id_izin, 'Ditolak')}
                          className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] shadow-sm transition active:scale-95"
                          title="Tolak Izin"
                        >
                          Tolak
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium">Selesai</span>
                    )}
                  </td>
                </tr>
              ))}

              {filteredLeaves.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Belum ada data pengajuan izin atau sakit.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Request Modal */}
      {modalNewOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-scaleUp">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-blue-600" />
                <span>Form Pengajuan Izin / Sakit</span>
              </h3>
              <button onClick={() => setModalNewOpen(false)} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewLeave} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Jenis Pengajuan</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as 'Sakit' | 'Izin')}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold bg-slate-50"
                >
                  <option value="Sakit">🏥 Sakit (Butuh Istirahat Dokter)</option>
                  <option value="Izin">📝 Izin (Keperluan Keluarga / Adat)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tanggal Mulai</label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Keterangan / Alasan Lengkap</label>
                <textarea
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  placeholder="Tuliskan keterangan detail..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  required
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-extrabold shadow-sm transition active:scale-95"
                >
                  Kirim Pengajuan
                </button>
                <button
                  type="button"
                  onClick={() => setModalNewOpen(false)}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
