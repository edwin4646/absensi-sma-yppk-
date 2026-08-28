import React, { useState, useEffect } from 'react';
import { User, ActiveView } from '../types';
import { SchoolLogo } from './SchoolLogo';
import { getFormattedWITTime } from '../utils/geo';
import { 
  Camera, 
  Calculator, 
  FileSpreadsheet, 
  Users, 
  QrCode, 
  FileText, 
  Settings, 
  LogOut, 
  Globe, 
  ShieldCheck, 
  UserCheck, 
  Menu, 
  X,
  Smartphone,
  ChevronDown,
  Image as ImageIcon
} from 'lucide-react';

interface HeaderNavbarProps {
  currentUser: User;
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  onOpenLoginModal: () => void;
  onOpenDomainGuide: () => void;
  onOpenSettings: () => void;
  onOpenLogoManager?: () => void;
  onStealthAdminTrigger: () => void;
  users: User[];
  onSwitchUser: (user: User) => void;
  onLogout?: () => void;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  currentUser,
  activeView,
  setActiveView,
  onOpenLoginModal,
  onOpenDomainGuide,
  onOpenSettings,
  onOpenLogoManager,
  onStealthAdminTrigger,
  users,
  onSwitchUser,
  onLogout
}) => {
  const [witTime, setWitTime] = useState(getFormattedWITTime());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [logoTapCount, setLogoTapCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setWitTime(getFormattedWITTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogoTap = () => {
    const newCount = logoTapCount + 1;
    setLogoTapCount(newCount);
    if (newCount >= 5) {
      setLogoTapCount(0);
      onStealthAdminTrigger();
    } else {
      setTimeout(() => setLogoTapCount(0), 3000);
    }
  };

  // Primary Navigation Items for Desktop Header
  const primaryNavItems = [
    { id: 'portal' as ActiveView, label: 'Portal Admin', icon: UserCheck },
    { id: 'kamera' as ActiveView, label: 'Presensi Selfie AI', icon: Camera, highlight: true },
    { id: 'hitung_kehadiran' as ActiveView, label: 'WhatsApp Ortu', icon: Calculator },
    { id: 'rekap' as ActiveView, label: 'Rekap & Print', icon: FileSpreadsheet }
  ];

  // Secondary Items for Dropdown & Mobile
  const moreNavItems = [
    { id: 'cetak_kartu' as ActiveView, label: 'Cetak Kartu QR', icon: QrCode },
    { id: 'rekap_honor' as ActiveView, label: 'Honorarium Guru', icon: FileText },
    { id: 'data_users' as ActiveView, label: 'Kelola Pengguna', icon: Users },
    { id: 'admin_izin' as ActiveView, label: 'Validasi Izin', icon: ShieldCheck },
    { id: 'inventaris' as ActiveView, label: 'Inventaris Sarpras', icon: Globe }
  ];

  const allNavItems = [
    ...primaryNavItems,
    ...moreNavItems
  ];

  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      {/* Top Notification Bar for Admin */}
      <div className="bg-slate-900 text-white text-xs py-1.5 px-4 sm:px-6 flex items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-2 min-w-0 shrink">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-rose-500/20 text-rose-300 border-rose-500/30 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-rose-400 animate-pulse"></span>
            ADMINISTRATOR
          </span>
          <span className="text-slate-300 text-xs truncate hidden sm:inline">
            SMA YPPK Yoanes XXIII Merauke &bull; <strong className="text-sky-300 font-mono">{witTime} WIT</strong>
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {onOpenLogoManager && (
            <button
              onClick={onOpenLogoManager}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold transition text-[11px]"
              title="Ganti / Upload file logo sekolah asli"
            >
              <ImageIcon className="w-3 h-3" />
              <span className="hidden md:inline">Ganti Logo</span>
            </button>
          )}

          <button
            onClick={onOpenDomainGuide}
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition text-[11px]"
            title="Lihat Link Domain & Akses HP"
          >
            <Globe className="w-3 h-3" />
            <span className="hidden md:inline">Info Domain & Link HP</span>
            <span className="md:hidden">Akses HP</span>
          </button>
          
          <button
            onClick={onOpenSettings}
            className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            title="Pengaturan Sistem"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white font-bold transition text-[11px] border border-rose-500/50 ml-0.5"
              title="Keluar dari Akun Administrator"
            >
              <LogOut className="w-3 h-3" />
              <span>Keluar</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & School Name */}
          <div className="flex items-center gap-3 shrink-0">
            <SchoolLogo type="kiri" size={38} onClick={handleLogoTap} title="Ketuk 5x untuk Pintu Rahasia Admin" />
            <div className="cursor-pointer" onClick={() => setActiveView('portal')}>
              <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight leading-tight flex items-center gap-1.5">
                <span>SMA YPPK YOANES XXIII</span>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-rose-100 text-rose-800">
                  Admin
                </span>
              </h1>
              <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wide truncate max-w-[200px] sm:max-w-none">
                Sistem Manajemen Presensi & Administrator &bull; Merauke
              </p>
            </div>
            <SchoolLogo type="kanan" size={38} onClick={handleLogoTap} className="hidden xl:flex" title="Ketuk 5x untuk Pintu Rahasia Admin" />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {primaryNavItems.map(item => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : item.highlight
                      ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Dropdown for More Features */}
            <div className="relative">
              <button
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  moreNavItems.some(i => i.id === activeView)
                    ? 'bg-blue-100 text-blue-800'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>Menu Lainnya</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {moreMenuOpen && (
                <div 
                  className="absolute left-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs"
                  onMouseLeave={() => setMoreMenuOpen(false)}
                >
                  {moreNavItems.map(item => {
                    const Icon = item.icon;
                    const isActive = activeView === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveView(item.id);
                          setMoreMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-left transition font-semibold ${
                          isActive ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-slate-500" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* User Profile & Role Switcher */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold transition"
              >
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs bg-rose-600 shrink-0">
                  {currentUser.nama_siswa.charAt(0)}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="font-bold text-slate-900 leading-tight truncate max-w-[100px]">{currentUser.nama_siswa}</div>
                  <div className="text-[10px] text-slate-500 leading-none truncate max-w-[100px]">Admin ({currentUser.kelas})</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 text-xs">
                  <div className="px-4 py-2 border-b border-slate-100 bg-slate-50">
                    <div className="font-bold text-slate-900">{currentUser.nama_siswa}</div>
                    <div className="text-slate-500 font-mono text-[11px]">NISN/NIP: {currentUser.nisn}</div>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full font-bold text-[10px] bg-rose-100 text-rose-800">
                      {currentUser.kategori} &bull; {currentUser.jabatan}
                    </span>
                  </div>

                  {onOpenLogoManager && (
                    <div className="p-2 border-b border-slate-100">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenLogoManager();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-xl font-bold transition text-xs"
                      >
                        <ImageIcon className="w-4 h-4 text-amber-600" />
                        <span>Ganti Gambar Logo Sekolah</span>
                      </button>
                    </div>
                  )}

                  <div className="p-2 space-y-1">
                    {onLogout && (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onLogout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl font-bold transition text-xs"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Keluar dari Admin (Log Out)</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenLoginModal();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-xl font-semibold transition text-xs"
                    >
                      <Users className="w-4 h-4 text-slate-500" />
                      <span>Ganti Akun Pengguna</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-1">
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              onClick={() => {
                setActiveView('kamera');
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-md text-xs"
            >
              <Camera className="w-4 h-4" />
              <span>Presensi Selfie AI</span>
            </button>

            <button
              onClick={() => {
                onOpenDomainGuide();
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-800 text-white rounded-xl font-bold text-xs"
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Buka di HP</span>
            </button>
          </div>

          {onOpenLogoManager && (
            <button
              onClick={() => {
                onOpenLogoManager();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl font-bold text-xs transition mb-3"
            >
              <ImageIcon className="w-4 h-4 text-amber-600" />
              <span>Ganti / Kustomisasi Logo Sekolah</span>
            </button>
          )}

          <div className="space-y-1">
            {allNavItems.map(item => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                    isActive ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {onLogout && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-100 mt-2 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar dari Akun Administrator</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
