import React, { useState } from 'react';
import { User, InventoryItem } from '../types';
import { AppStorage } from '../services/storage';
import { Box, Plus, CheckCircle, Clock, ArrowLeft, X } from 'lucide-react';

interface InventoryManagerProps {
  currentUser: User;
  inventory: InventoryItem[];
  onRefreshInventory: () => void;
  onBack: () => void;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({
  currentUser,
  inventory,
  onRefreshInventory,
  onBack
}) => {
  const [modalNewOpen, setModalNewOpen] = useState(false);
  const [selectedItemName, setSelectedItemName] = useState('Proyektor Epson EB-X500');
  const [reason, setReason] = useState('');

  const availableItems = [
    'Proyektor Epson EB-X500',
    'Laptop Asus VivoBook Lab',
    'Speaker Portabel Wireless + Mic',
    'Microphone Wireless UHF (Set)',
    'Kabel Roll Terminal Listrik 15m',
    'Kabel HDMI 10 Meter'
  ];

  const handleBorrow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    const allInventory = AppStorage.getInventory();
    const newId = allInventory.length > 0 ? Math.max(...allInventory.map(i => i.id)) + 1 : 1;

    const newItem: InventoryItem = {
      id: newId,
      user_id: currentUser.user_id,
      nama_peminjam: currentUser.nama_siswa,
      nama_barang: selectedItemName,
      keperluan: reason.trim(),
      tanggal_pinjam: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: 'Sedang Dipinjam'
    };

    allInventory.unshift(newItem);
    AppStorage.saveInventory(allInventory);
    onRefreshInventory();
    setModalNewOpen(false);
    setReason('');
  };

  const handleReturn = (id: number) => {
    const allInventory = AppStorage.getInventory();
    const idx = allInventory.findIndex(i => i.id === id);
    if (idx >= 0) {
      allInventory[idx].status = 'Sudah Dikembalikan';
      AppStorage.saveInventory(allInventory);
      onRefreshInventory();
    }
  };

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
            <Box className="w-5 h-5 text-amber-500" />
            <span>Peminjaman Alat & Inventaris Sekolah</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pencatatan sirkulasi peminjaman proyektor, speaker, laptop, dan perlengkapan mengajar.
          </p>
        </div>

        <button
          onClick={() => setModalNewOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs flex items-center gap-2 shadow-sm transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Pinjam Barang / Alat</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Nama Barang</th>
                <th className="py-3 px-4">Peminjam</th>
                <th className="py-3 px-4">Waktu Pinjam</th>
                <th className="py-3 px-4">Keperluan</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center w-36">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {inventory.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 text-center font-mono text-slate-400">{idx + 1}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{item.nama_barang}</td>
                  <td className="py-3 px-4 font-semibold text-slate-700">{item.nama_peminjam}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">{item.tanggal_pinjam}</td>
                  <td className="py-3 px-4 text-slate-600">{item.keperluan}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                      item.status === 'Sudah Dikembalikan'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item.status === 'Sudah Dikembalikan' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      <span>{item.status}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {item.status === 'Sedang Dipinjam' ? (
                      <button
                        onClick={() => handleReturn(item.id)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] transition shadow-sm"
                      >
                        Kembalikan
                      </button>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Selesai</span>
                    )}
                  </td>
                </tr>
              ))}

              {inventory.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Belum ada riwayat peminjaman barang.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Borrow Modal */}
      {modalNewOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-scaleUp">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Box className="w-5 h-5 text-amber-500" />
                <span>Form Peminjaman Barang</span>
              </h3>
              <button onClick={() => setModalNewOpen(false)} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBorrow} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Pilih Barang / Alat</label>
                <select
                  value={selectedItemName}
                  onChange={(e) => setSelectedItemName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold bg-slate-50"
                >
                  {availableItems.map(item => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Keperluan Penggunaan</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Contoh: Mengajar kelas X-1 jam ke-3 materi Video Pembelajaran"
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  required
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-extrabold shadow-sm transition active:scale-95"
                >
                  Ajukan Peminjaman
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
