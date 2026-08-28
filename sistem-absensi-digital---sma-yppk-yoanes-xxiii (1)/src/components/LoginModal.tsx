import React, { useState } from 'react';
import { User } from '../types';
import { SchoolLogo } from './SchoolLogo';
import { LogIn, ShieldAlert, KeyRound, User as UserIcon, X, CheckCircle2, ShieldCheck } from 'lucide-react';

interface LoginModalProps {
  users: User[];
  onSelectUser: (user: User) => void;
  isStealthMode?: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  users,
  onSelectUser,
  isStealthMode = false,
  onClose
}) => {
  const [activeStealth, setActiveStealth] = useState(isStealthMode);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAdminSecretLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const adminPassMap: Record<string, string> = {
      admin: 'admin123',
      '123456': '123456',
      admin123: '123456',
      kepsek: 'kepsek2026',
      azura: 'rahasia77'
    };

    const uname = username.trim().toLowerCase();
    const pass = password.trim();
    if ((adminPassMap[uname] && adminPassMap[uname] === pass) || (uname === 'admin' && (pass === 'admin123' || pass === '123456')) || pass === '123456' || pass === 'admin123') {
      const adminUser = users.find(u => u.kategori === 'Admin') || {
        user_id: 1,
        nisn: 'admin',
        nama_siswa: 'Valentinus G. Nuga, S.S.,M.Fil',
        kelas: 'ADMIN',
        kategori: 'Admin',
        jabatan: 'Kepala Sekolah / Admin',
        no_wa_ortu: '082155080559',
        has_device: 1
      };
      onSelectUser(adminUser);
      onClose();
    } else {
      setErrorMsg('❌ Kunci Rahasia Ditolak: Username atau Password/PIN admin salah!');
    }
  };

  const handleStandardLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const uname = username.trim().toLowerCase();
    const foundUser = users.find(u => u.nisn.toLowerCase() === uname || u.nama_siswa.toLowerCase().includes(uname));

    if (foundUser) {
      onSelectUser(foundUser);
      onClose();
    } else {
      setErrorMsg(`❌ NISN / NIP "${username}" tidak ditemukan di database.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-scaleUp my-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {activeStealth ? (
          /* Secret Admin Login Screen */
          <div>
            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-2xl bg-rose-600 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-rose-600/30">
                <KeyRound className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Pintu Rahasia Administrator</h3>
              <p className="text-xs text-rose-600 font-semibold">Area Terbatas &bull; Kunci Master Sistem</p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleAdminSecretLogin} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Username Master / Admin</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: admin / 123456 / kepsek"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Password / PIN Master</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contoh: admin123 / 123456"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md shadow-rose-600/25 transition active:scale-95"
              >
                Buka Portal Administrator
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStealth(false)}
                  className="text-slate-500 hover:text-slate-700 font-bold text-xs"
                >
                  Kembali ke Login Biasa
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Standard Login Screen */
          <div>
            <div className="text-center mb-5">
              <div className="flex justify-center items-center gap-3 mb-2">
                <SchoolLogo type="kiri" size={42} />
                <SchoolLogo type="kanan" size={42} />
              </div>
              <h3 className="text-lg font-black text-slate-900 leading-tight">SMA YPPK YOANES XXIII</h3>
              <p className="text-xs text-blue-700 font-semibold">Masuk Akun Presensi Digital</p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleStandardLogin} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">NISN / NIP / ID Pengguna</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan NISN siswa atau NIP guru"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-600/25 transition active:scale-95 flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk Presensi</span>
              </button>
            </form>

            <div className="text-center mt-6 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveStealth(true)}
                className="text-xs text-rose-600 hover:text-rose-700 font-bold inline-flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Masuk Sebagai Administrator / Kepala Sekolah</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
