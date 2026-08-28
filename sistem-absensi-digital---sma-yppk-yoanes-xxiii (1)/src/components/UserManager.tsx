import React, { useState } from 'react';
import { User } from '../types';
import { AppStorage } from '../services/storage';
import { 
  Users, 
  UserPlus, 
  Search, 
  Trash2, 
  Edit3, 
  UploadCloud, 
  Download, 
  ArrowLeft, 
  Check, 
  X, 
  Phone,
  GraduationCap,
  Award
} from 'lucide-react';

interface UserManagerProps {
  users: User[];
  onRefreshUsers: () => void;
  onBack: () => void;
}

export const UserManager: React.FC<UserManagerProps> = ({
  users,
  onRefreshUsers,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<'Siswa' | 'Guru'>('Siswa');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'import' | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    nama_siswa: string;
    nisn: string;
    kategori: 'Siswa' | 'Guru';
    kelas: string;
    jabatan: string;
    no_wa_ortu: string;
  }>({
    nama_siswa: '',
    nisn: '',
    kategori: 'Siswa',
    kelas: 'X-1',
    jabatan: 'Siswa',
    no_wa_ortu: '082248123451'
  });

  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Filtered Users
  const filteredUsers = users.filter(u => {
    if (u.kategori !== activeTab) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        u.nama_siswa.toLowerCase().includes(q) ||
        u.nisn.toLowerCase().includes(q) ||
        u.kelas.toLowerCase().includes(q) ||
        u.jabatan.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Open Add Modal
  const handleOpenAdd = () => {
    setFormData({
      nama_siswa: '',
      nisn: activeTab === 'Siswa' ? `${1000 + users.length + 1}` : `GURU${String(users.length + 1).padStart(3, '0')}`,
      kategori: activeTab,
      kelas: activeTab === 'Siswa' ? 'X-1' : '-',
      jabatan: activeTab === 'Siswa' ? 'Siswa' : 'Guru Pengajar',
      no_wa_ortu: '082248123451'
    });
    setEditingUser(null);
    setModalMode('add');
  };

  // Open Edit Modal
  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      nama_siswa: user.nama_siswa,
      nisn: user.nisn,
      kategori: user.kategori as 'Siswa' | 'Guru',
      kelas: user.kelas,
      jabatan: user.jabatan,
      no_wa_ortu: user.no_wa_ortu
    });
    setModalMode('edit');
  };

  // Save User
  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    const currentUsers = AppStorage.getUsers();

    if (modalMode === 'add') {
      const newId = currentUsers.length > 0 ? Math.max(...currentUsers.map(u => u.user_id)) + 1 : 1;
      const newUser: User = {
        user_id: newId,
        nisn: formData.nisn.trim(),
        nama_siswa: formData.nama_siswa.trim(),
        kategori: formData.kategori,
        kelas: formData.kategori === 'Siswa' ? formData.kelas.trim() : '-',
        jabatan: formData.kategori === 'Guru' ? formData.jabatan.trim() : 'Siswa',
        no_wa_ortu: formData.no_wa_ortu.trim() || '-',
        has_device: 1
      };
      currentUsers.push(newUser);
    } else if (modalMode === 'edit' && editingUser) {
      const idx = currentUsers.findIndex(u => u.user_id === editingUser.user_id);
      if (idx >= 0) {
        currentUsers[idx] = {
          ...currentUsers[idx],
          nisn: formData.nisn.trim(),
          nama_siswa: formData.nama_siswa.trim(),
          kategori: formData.kategori,
          kelas: formData.kategori === 'Siswa' ? formData.kelas.trim() : '-',
          jabatan: formData.kategori === 'Guru' ? formData.jabatan.trim() : 'Siswa',
          no_wa_ortu: formData.no_wa_ortu.trim() || '-'
        };
      }
    }

    AppStorage.saveUsers(currentUsers);
    onRefreshUsers();
    setModalMode(null);
  };

  // Delete Single User
  const handleDeleteUser = (userId: number, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data ${name}?`)) {
      const updated = AppStorage.getUsers().filter(u => u.user_id !== userId);
      AppStorage.saveUsers(updated);
      onRefreshUsers();
    }
  };

  // Batch Delete
  const handleBatchDelete = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Apakah Anda yakin ingin menghapus ${selectedIds.length} data terpilih?`)) {
      const updated = AppStorage.getUsers().filter(u => !selectedIds.includes(u.user_id));
      AppStorage.saveUsers(updated);
      setSelectedIds([]);
      onRefreshUsers();
    }
  };

  // Handle CSV Import
  const handleCsvFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const lines = content.split('\n');
      const currentUsers = AppStorage.getUsers();
      let importedCount = 0;

      lines.forEach((line, index) => {
        if (index === 0 || !line.trim()) return; // skip header or empty
        const parts = line.split(',').map(p => p.replace(/^"|"$/g, '').trim());
        if (parts.length >= 2) {
          const nisn = parts[0];
          const nama = parts[1];
          const kelasOrJabatan = parts[2] || (activeTab === 'Siswa' ? 'X-1' : 'Guru Pengajar');
          const wa = parts[3] || '082248123451';

          if (!currentUsers.some(u => u.nisn === nisn)) {
            const newId = currentUsers.length > 0 ? Math.max(...currentUsers.map(u => u.user_id)) + 1 : 1;
            currentUsers.push({
              user_id: newId,
              nisn,
              nama_siswa: nama,
              kategori: activeTab,
              kelas: activeTab === 'Siswa' ? kelasOrJabatan : '-',
              jabatan: activeTab === 'Guru' ? kelasOrJabatan : 'Siswa',
              no_wa_ortu: wa,
              has_device: 1
            });
            importedCount++;
          }
        }
      });

      AppStorage.saveUsers(currentUsers);
      onRefreshUsers();
      setImportStatus(`Berhasil mengimpor ${importedCount} data ${activeTab} baru.`);
      setTimeout(() => {
        setImportStatus(null);
        setModalMode(null);
      }, 2500);
    };
    reader.readAsText(file);
  };

  // Export CSV
  const handleExportCSV = () => {
    let csv = `NISN/NIP,Nama Lengkap,Kelas/Jabatan,No. WhatsApp\n`;
    filteredUsers.forEach(u => {
      csv += `"${u.nisn}","${u.nama_siswa}","${u.kategori === 'Siswa' ? u.kelas : u.jabatan}","${u.no_wa_ortu}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Data_${activeTab}_SMA_YPPK_Yoanes_XXIII.csv`;
    link.click();
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredUsers.map(u => u.user_id));
    } else {
      setSelectedIds([]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header Bar */}
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
            <Users className="w-5 h-5 text-blue-600" />
            <span>Kelola Data Pengguna (Siswa & Guru)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Total terdaftar: <b>{filteredUsers.length} {activeTab}</b> &bull; Manajemen akun, NISN, NIP, dan No. WhatsApp.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setModalMode('import')}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs flex items-center gap-1.5 transition"
          >
            <UploadCloud className="w-4 h-4 text-blue-600" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center gap-1.5 border border-emerald-200 transition"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah {activeTab}</span>
          </button>
        </div>
      </div>

      {/* Tabs and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveTab('Siswa');
              setSelectedIds([]);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition ${
              activeTab === 'Siswa' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>👨‍🎓 Data Siswa</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('Guru');
              setSelectedIds([]);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition ${
              activeTab === 'Guru' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>👨‍🏫 Data Guru & Staf</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Cari nama, NISN, kelas...`}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="py-3 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.length > 0 && selectedIds.length === filteredUsers.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                </th>
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Nama Lengkap</th>
                <th className="py-3 px-4">{activeTab === 'Guru' ? 'NIP / ID Guru' : 'NISN'}</th>
                <th className="py-3 px-4">{activeTab === 'Guru' ? 'Jabatan / Mengampu' : 'Kelas'}</th>
                <th className="py-3 px-4">No. WhatsApp</th>
                <th className="py-3 px-4 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredUsers.map((user, idx) => {
                const isSelected = selectedIds.includes(user.user_id);
                return (
                  <tr key={user.user_id} className={`hover:bg-slate-50 transition ${isSelected ? 'bg-blue-50/50' : ''}`}>
                    <td className="py-3 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedIds([...selectedIds, user.user_id]);
                          else setSelectedIds(selectedIds.filter(id => id !== user.user_id));
                        }}
                        className="rounded text-blue-600"
                      />
                    </td>
                    <td className="py-3 px-4 text-center text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div>{user.nama_siswa}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">
                      <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200">
                        {user.nisn}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      {activeTab === 'Siswa' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-800">
                          {user.kelas}
                        </span>
                      ) : (
                        <span>{user.jabatan}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-emerald-600" />
                        <span>{user.no_wa_ortu}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 transition"
                          title="Edit Pengguna"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.user_id, user.nama_siswa)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition"
                          title="Hapus Pengguna"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Tidak ada data {activeTab.toLowerCase()} yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Batch Delete Footer */}
        {selectedIds.length > 0 && (
          <div className="p-3 bg-rose-50 border-t border-rose-100 flex items-center justify-between text-xs">
            <span className="font-bold text-rose-900">
              {selectedIds.length} data {activeTab.toLowerCase()} terpilih
            </span>
            <button
              onClick={handleBatchDelete}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Terpilih</span>
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(modalMode === 'add' || modalMode === 'edit') && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-scaleUp">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-base text-slate-900">
                {modalMode === 'add' ? `Tambah Data ${formData.kategori}` : `Edit Data ${formData.nama_siswa}`}
              </h3>
              <button onClick={() => setModalMode(null)} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Kategori</label>
                <select
                  value={formData.kategori}
                  onChange={(e) => setFormData({ ...formData, kategori: e.target.value as 'Siswa' | 'Guru' })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold bg-slate-50"
                >
                  <option value="Siswa">👨‍🎓 Siswa</option>
                  <option value="Guru">👨‍🏫 Guru / Staf</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={formData.nama_siswa}
                  onChange={(e) => setFormData({ ...formData, nama_siswa: e.target.value })}
                  placeholder="Contoh: Fransiskus Xaverius"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {formData.kategori === 'Siswa' ? 'NISN (ID Login)' : 'NIP / Kode Guru'}
                </label>
                <input
                  type="text"
                  value={formData.nisn}
                  onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                  placeholder="Contoh: 1011 atau GURU034"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold"
                  required
                />
              </div>

              {formData.kategori === 'Siswa' ? (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kelas</label>
                  <input
                    type="text"
                    value={formData.kelas}
                    onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                    placeholder="Contoh: X-1, XI-1, XII-1"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                    required
                  />
                </div>
              ) : (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jabatan / Guru Mapel</label>
                  <input
                    type="text"
                    value={formData.jabatan}
                    onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                    placeholder="Contoh: Guru Kimia / Wali Kelas X-1"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                    required
                  />
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {formData.kategori === 'Siswa' ? 'No. WhatsApp Orang Tua' : 'No. WhatsApp Guru'}
                </label>
                <input
                  type="text"
                  value={formData.no_wa_ortu}
                  onChange={(e) => setFormData({ ...formData, no_wa_ortu: e.target.value })}
                  placeholder="Contoh: 082248123451"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-extrabold shadow-sm transition"
                >
                  {modalMode === 'add' ? 'Simpan Data Baru' : 'Simpan Perubahan'}
                </button>
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {modalMode === 'import' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-scaleUp">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-base text-slate-900">
                Import File CSV ({activeTab})
              </h3>
              <button onClick={() => setModalMode(null)} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900">
                <strong className="block mb-1">Format Kolom CSV:</strong>
                <code className="text-[11px] block bg-white p-2 rounded border border-blue-100">
                  NISN,Nama Siswa,Kelas,No WhatsApp
                </code>
              </div>

              {importStatus && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold">
                  {importStatus}
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">Pilih File CSV (.csv):</label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCsvFile}
                  className="w-full p-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setModalMode(null)}
                  className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
