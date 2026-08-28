import React, { useState, useRef } from 'react';
import { SystemSettings } from '../types';
import { AppStorage } from '../services/storage';
import { SchoolLogo, formatDirectImageUrl } from './SchoolLogo';
import { Image, Upload, Trash2, X, Check, RotateCcw, Link as LinkIcon, Sparkles, CheckCircle2 } from 'lucide-react';

interface LogoManagerModalProps {
  settings: SystemSettings;
  onSaveSettings: (newSettings: SystemSettings) => void;
  onClose: () => void;
}

export const LogoManagerModal: React.FC<LogoManagerModalProps> = ({
  settings,
  onSaveSettings,
  onClose
}) => {
  const [logoKiri, setLogoKiri] = useState<string>(settings.custom_logo_kiri || '');
  const [logoKanan, setLogoKanan] = useState<string>(settings.custom_logo_kanan || '');
  
  const [inputUrlKiri, setInputUrlKiri] = useState<string>('');
  const [inputUrlKanan, setInputUrlKanan] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'kiri' | 'kanan'>('kiri');

  const fileInputKiriRef = useRef<HTMLInputElement | null>(null);
  const fileInputKananRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'kiri' | 'kanan') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (type === 'kiri') {
        setLogoKiri(base64);
      } else {
        setLogoKanan(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = (type: 'kiri' | 'kanan') => {
    if (type === 'kiri' && inputUrlKiri.trim()) {
      const formatted = formatDirectImageUrl(inputUrlKiri.trim());
      setLogoKiri(formatted);
      setInputUrlKiri('');
    } else if (type === 'kanan' && inputUrlKanan.trim()) {
      const formatted = formatDirectImageUrl(inputUrlKanan.trim());
      setLogoKanan(formatted);
      setInputUrlKanan('');
    }
  };

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  const handleSave = async () => {
    setIsSaving(true);
    let finalLogoKiri = logoKiri;
    let finalLogoKanan = logoKanan;

    try {
      if (logoKiri && logoKiri.startsWith('data:image/')) {
        finalLogoKiri = await AppStorage.uploadLogoToServer('kiri', logoKiri);
      }
      if (logoKanan && logoKanan.startsWith('data:image/')) {
        finalLogoKanan = await AppStorage.uploadLogoToServer('kanan', logoKanan);
      }

      const updated: SystemSettings = {
        ...settings,
        custom_logo_kiri: finalLogoKiri ? finalLogoKiri : undefined,
        custom_logo_kanan: finalLogoKanan ? finalLogoKanan : undefined
      };
      
      AppStorage.saveSettings(updated);
      onSaveSettings(updated);
      setSuccessMessage('Logo berhasil disimpan ke server & disinkronkan ke semua perangkat (HP & Laptop)!');
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (e) {
      console.error(e);
      const updated: SystemSettings = {
        ...settings,
        custom_logo_kiri: logoKiri ? logoKiri : undefined,
        custom_logo_kanan: logoKanan ? logoKanan : undefined
      };
      AppStorage.saveSettings(updated);
      onSaveSettings(updated);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetBoth = () => {
    if (confirm('Kembalikan kedua logo ke logo bawaan sistem?')) {
      setLogoKiri('');
      setLogoKanan('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-scaleUp my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Image className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Ganti & Sesuaikan Logo Sekolah
              </h3>
              <p className="text-xs text-slate-500">
                Upload file gambar logo asli PNG/JPG/SVG untuk SMA Yoanes XXIII & YPPK
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-slate-100 p-1 rounded-2xl mb-5">
          <button
            type="button"
            onClick={() => setActiveTab('kiri')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
              activeTab === 'kiri' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🛡️ Logo Kiri (SMA Yoanes XXIII)</span>
            {logoKiri && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('kanan')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
              activeTab === 'kanan' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>⭐ Logo Kanan (College Saint Jean / YPPK)</span>
            {logoKanan && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
          </button>
        </div>

        {/* Tab Content: Logo Kiri */}
        {activeTab === 'kiri' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-5">
              {/* Preview Box */}
              <div className="flex flex-col items-center gap-2 shrink-0">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pratinjau</span>
                <div className="w-24 h-24 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center p-2 relative overflow-hidden">
                  <SchoolLogo type="kiri" size={72} customSrc={logoKiri || undefined} />
                </div>
                <span className="text-[10px] font-bold text-slate-600">
                  {logoKiri ? 'Custom Image' : 'Default Vector'}
                </span>
              </div>

              {/* Action Upload */}
              <div className="flex-1 w-full space-y-3">
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Upload Gambar dari Komputer / HP</h4>
                  <p className="text-[11px] text-slate-500">Pilih file format PNG transparan, JPG, atau SVG asli sekolah.</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <input
                    type="file"
                    ref={fileInputKiriRef}
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'kiri')}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputKiriRef.current?.click()}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-sm active:scale-95"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Pilih File Logo Kiri</span>
                  </button>

                  {logoKiri && (
                    <button
                      type="button"
                      onClick={() => setLogoKiri('')}
                      className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Kembalikan Default</span>
                    </button>
                  )}
                </div>

                {/* URL Option */}
                <div className="pt-2 border-t border-slate-200/80">
                  <label className="text-[10px] font-bold text-slate-600 block mb-1 flex items-center gap-1">
                    <LinkIcon className="w-3 h-3 text-slate-400" />
                    <span>Atau gunakan Link / URL Gambar (Mendukung Google Drive):</span>
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="url"
                      placeholder="https://drive.google.com/file/d/... atau https://contoh.com/logo.png"
                      value={inputUrlKiri}
                      onChange={(e) => setInputUrlKiri(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyUrl('kiri')}
                      disabled={!inputUrlKiri.trim()}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition"
                    >
                      Terapkan
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    💡 Link Google Drive (sharing/drive_link) otomatis dikonversi ke direct image link.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Logo Kanan */}
        {activeTab === 'kanan' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-5">
              {/* Preview Box */}
              <div className="flex flex-col items-center gap-2 shrink-0">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pratinjau</span>
                <div className="w-24 h-24 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center p-2 relative overflow-hidden">
                  <SchoolLogo type="kanan" size={72} customSrc={logoKanan || undefined} />
                </div>
                <span className="text-[10px] font-bold text-slate-600">
                  {logoKanan ? 'Custom Image' : 'Default Vector'}
                </span>
              </div>

              {/* Action Upload */}
              <div className="flex-1 w-full space-y-3">
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Upload Gambar dari Komputer / HP</h4>
                  <p className="text-[11px] text-slate-500">Pilih file logo lambang College Saint Jean / YPPK Merauke.</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <input
                    type="file"
                    ref={fileInputKananRef}
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'kanan')}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputKananRef.current?.click()}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-sm active:scale-95"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Pilih File Logo Kanan</span>
                  </button>

                  {logoKanan && (
                    <button
                      type="button"
                      onClick={() => setLogoKanan('')}
                      className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Kembalikan Default</span>
                    </button>
                  )}
                </div>

                {/* URL Option */}
                <div className="pt-2 border-t border-slate-200/80">
                  <label className="text-[10px] font-bold text-slate-600 block mb-1 flex items-center gap-1">
                    <LinkIcon className="w-3 h-3 text-slate-400" />
                    <span>Atau gunakan Link / URL Gambar (Mendukung Google Drive):</span>
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="url"
                      placeholder="https://drive.google.com/file/d/... atau https://contoh.com/logo-yppk.png"
                      value={inputUrlKanan}
                      onChange={(e) => setInputUrlKanan(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyUrl('kanan')}
                      disabled={!inputUrlKanan.trim()}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition"
                    >
                      Terapkan
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    💡 Link Google Drive (sharing/drive_link) otomatis dikonversi ke direct image link.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Live Preview Dual Side-by-Side */}
        <div className="mt-4 p-3 bg-blue-50/70 border border-blue-100 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SchoolLogo type="kiri" size={38} customSrc={logoKiri || undefined} />
            <div>
              <p className="font-extrabold text-xs text-blue-950">Pratinjau KOP Surat & Header</p>
              <p className="text-[11px] text-blue-700">Logo kiri & kanan akan sinkron ke Kartu Pelajar, Rekap, dan Header.</p>
            </div>
          </div>
          <SchoolLogo type="kanan" size={38} customSrc={logoKanan || undefined} />
        </div>

        {/* Success Feedback */}
        {successMessage && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-emerald-800 text-xs font-bold animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={isSaving}
            onClick={handleResetBoth}
            className="py-2.5 px-3 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Semua</span>
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={isSaving}
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-bold text-xs transition disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSave}
              className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition active:scale-95 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Menyimpan ke Server...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Simpan Logo (Sinkron ke Semua HP)</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
