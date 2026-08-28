import React, { useState, useRef } from 'react';
import { SystemSettings } from '../types';
import { AppStorage } from '../services/storage';
import { SchoolLogo } from './SchoolLogo';
import { Settings, MapPin, Clock, MessageSquare, Crosshair, X, Save, RotateCcw, Image, Upload, Trash2 } from 'lucide-react';

interface SystemSettingsModalProps {
  settings: SystemSettings;
  onSaveSettings: (newSettings: SystemSettings) => void;
  onClose: () => void;
  onOpenLogoManager?: () => void;
}

export const SystemSettingsModal: React.FC<SystemSettingsModalProps> = ({
  settings,
  onSaveSettings,
  onClose,
  onOpenLogoManager
}) => {
  const [formData, setFormData] = useState<SystemSettings>({ ...settings });
  const [gpsStatusText, setGpsStatusText] = useState<string | null>(null);

  const fileInputKiriRef = useRef<HTMLInputElement | null>(null);
  const fileInputKananRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'kiri' | 'kanan') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran gambar maksimal 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (type === 'kiri') {
        setFormData(prev => ({ ...prev, custom_logo_kiri: base64 }));
      } else {
        setFormData(prev => ({ ...prev, custom_logo_kanan: base64 }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatusText("⚠️ Perangkat Anda tidak mendukung fitur Geolocation.");
      return;
    }
    setGpsStatusText("⏳ Sedang mendeteksi koordinat GPS...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData({
          ...formData,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6)
        });
        setGpsStatusText("✅ Koordinat berhasil diambil dari GPS perangkat Anda!");
      },
      (err) => {
        setGpsStatusText(`⚠️ Gagal mendeteksi lokasi: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleResetDefault = () => {
    if (confirm("Reset pengaturan ke default SMA YPPK Yoanes XXIII Merauke?")) {
      AppStorage.resetAllData();
      window.location.reload();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    AppStorage.saveSettings(formData);
    onSaveSettings(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-scaleUp my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            <span>Pengaturan Sistem & Logo Sekolah</span>
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Logo Customization Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 to-amber-50/80 border border-blue-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                <Image className="w-4 h-4 text-blue-600" />
                <span>Kustomisasi Gambar Logo Sekolah</span>
              </span>
              <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                PNG / JPG / SVG
              </span>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              Anda dapat mengganti kedua logo dengan file gambar asli sekolah. Gambar akan otomatis tersimpan dan tersinkron ke Header, Kartu Pelajar, Infografis, dan KOP Surat.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-1">
              {/* Logo Kiri */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col items-center gap-2 shadow-xs">
                <span className="text-[10px] font-bold text-slate-500">Logo Kiri (SMA Yoanes XXIII)</span>
                <div className="w-14 h-14 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center p-1">
                  <SchoolLogo type="kiri" size={44} customSrc={formData.custom_logo_kiri} />
                </div>
                
                <input
                  type="file"
                  ref={fileInputKiriRef}
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'kiri')}
                  className="hidden"
                />
                
                <div className="flex gap-1 w-full mt-1">
                  <button
                    type="button"
                    onClick={() => fileInputKiriRef.current?.click()}
                    className="flex-1 py-1 px-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[10px] rounded-lg flex items-center justify-center gap-1 transition"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Ganti</span>
                  </button>
                  {formData.custom_logo_kiri && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, custom_logo_kiri: undefined }))}
                      className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Reset ke Default"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Logo Kanan */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col items-center gap-2 shadow-xs">
                <span className="text-[10px] font-bold text-slate-500">Logo Kanan (YPPK / Saint Jean)</span>
                <div className="w-14 h-14 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center p-1">
                  <SchoolLogo type="kanan" size={44} customSrc={formData.custom_logo_kanan} />
                </div>

                <input
                  type="file"
                  ref={fileInputKananRef}
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'kanan')}
                  className="hidden"
                />

                <div className="flex gap-1 w-full mt-1">
                  <button
                    type="button"
                    onClick={() => fileInputKananRef.current?.click()}
                    className="flex-1 py-1 px-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[10px] rounded-lg flex items-center justify-center gap-1 transition"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Ganti</span>
                  </button>
                  {formData.custom_logo_kanan && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, custom_logo_kanan: undefined }))}
                      className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Reset ke Default"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Jam Masuk */}
          <div>
            <label className="font-bold text-slate-700 flex items-center gap-1.5 mb-1">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>Batas Jam Masuk (Tepat Waktu WIT)</span>
            </label>
            <input
              type="time"
              step="1"
              value={formData.jam_masuk}
              onChange={(e) => setFormData({ ...formData, jam_masuk: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold bg-slate-50"
              required
            />
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Presensi selfie lewat dari jam ini otomatis diberi status <b>"Terlambat"</b>.
            </span>
          </div>

          {/* Radius Meter */}
          <div>
            <label className="font-bold text-slate-700 flex items-center gap-1.5 mb-1">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>Batas Radius GPS Sekolah (Meter)</span>
            </label>
            <input
              type="number"
              value={formData.radius}
              onChange={(e) => setFormData({ ...formData, radius: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold bg-slate-50"
              required
            />
            <span className="text-[11px] text-slate-500 block mt-0.5">
              💡 <b>Tip:</b> Masukkan angka <b>0</b> untuk <i>Mode Bebas Radius</i> (ideal untuk pengujian online/HP di mana saja).
            </span>
          </div>

          {/* School Coordinates */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">Titik Koordinat Sekolah (GPS)</span>
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] flex items-center gap-1 transition"
              >
                <Crosshair className="w-3 h-3" />
                <span>Ambil GPS Saya</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block">Latitude</label>
                <input
                  type="text"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono text-xs"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block">Longitude</label>
                <input
                  type="text"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono text-xs"
                  required
                />
              </div>
            </div>

            {gpsStatusText && (
              <div className="text-[11px] font-semibold text-blue-700">
                {gpsStatusText}
              </div>
            )}
          </div>

          {/* WhatsApp API Gateway & Auto Dispatch to Wali Kelas */}
          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-emerald-950 flex items-center gap-1.5 text-xs">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>Gateway SMS / WhatsApp & Notifikasi Wali Kelas</span>
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.aktifkan_wa_api}
                  onChange={(e) => setFormData({ ...formData, aktifkan_wa_api: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div>
              <label className="text-[10px] font-bold text-emerald-900 block mb-0.5">Token API Fonnte / WhatsApp Gateway</label>
              <input
                type="text"
                value={formData.token_wa}
                onChange={(e) => setFormData({ ...formData, token_wa: e.target.value })}
                placeholder="Contoh: vL7xK89pQ1... (opsional untuk auto bot)"
                className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-200 font-mono text-xs bg-white"
              />
            </div>

            {/* Auto Dispatch Toggles */}
            <div className="pt-2 border-t border-emerald-200/60 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-emerald-950 text-[11px]">🔔 Otomatis Kirim Notifikasi ke Wali Kelas</div>
                  <div className="text-[10px] text-emerald-700">Kirim pemberitahuan langsung ke nomor WhatsApp Wali Kelas setiap siswa absen/terlambat</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.auto_notify_wali ?? true}
                    onChange={(e) => setFormData({ ...formData, auto_notify_wali: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-emerald-950 text-[11px]">📱 Otomatis Notifikasi ke Orang Tua Siswa</div>
                  <div className="text-[10px] text-emerald-700">Kirim konfirmasi jam tiba / terlambat ke nomor WA orang tua</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.auto_notify_ortu ?? true}
                    onChange={(e) => setFormData({ ...formData, auto_notify_ortu: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>

            <span className="text-[10px] text-emerald-800 block bg-emerald-100/60 p-2 rounded-xl border border-emerald-200">
              💡 <b>Informasi:</b> Jika Anda memasukkan Token API Fonnte, sistem akan mengirim otomatis di background. Jika tanpa token, sistem menyediakan <b>Tombol Kirim 1-Klik Langsung ke WhatsApp Wali Kelas & Orang Tua</b> secara 100% Gratis tanpa biaya pulsa/API!
            </span>
          </div>

          <div className="pt-3 flex gap-2">
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-extrabold flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Pengaturan</span>
            </button>

            <button
              type="button"
              onClick={handleResetDefault}
              className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold flex items-center gap-1.5 transition"
              title="Reset Semua Data ke Awal"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Data</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
