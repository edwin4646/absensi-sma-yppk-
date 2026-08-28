import React, { useState } from 'react';
import { Globe, Smartphone, Copy, Check, CheckCircle2, ShieldCheck, X, Share2, Sparkles } from 'lucide-react';

interface DomainOnlineGuideModalProps {
  onClose: () => void;
}

export const DomainOnlineGuideModal: React.FC<DomainOnlineGuideModalProps> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);

  // Dynamic app URL from window location or Cloud Run dev domain
  const currentAppUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ais-dev-fe66qkiecybhlaevs4t3z4-410745317130.asia-southeast1.run.app';

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(currentAppUrl)}`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(currentAppUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-scaleUp my-8 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title & Badge */}
        <div className="text-center space-y-2 mb-5 pr-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping mr-1"></span>
            STATUS: ONLINE & AKTIF DI DOMAIN CLOUD RUN
          </div>

          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            Aplikasi Presensi Anda Sudah Online!
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Aplikasi SMA YPPK Yoanes XXIII ini sudah dapat diakses langsung oleh guru, siswa, dan admin dari HP / Laptop mana saja di seluruh dunia.
          </p>
        </div>

        {/* Main URL Box */}
        <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 shadow-inner">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
            <div className="flex items-center gap-1.5 text-sky-400">
              <Globe className="w-4 h-4" />
              <span>Link Domain / URL Online Aplikasi:</span>
            </div>
            <span className="text-[10px] text-emerald-400">HTTPS AMAN</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 font-mono text-xs text-sky-300 break-all select-all font-semibold">
            {currentAppUrl}
          </div>

          <button
            onClick={handleCopyUrl}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Alamat Link Berhasil Disalin!' : 'Salin Alamat Link untuk Dibagikan'}</span>
          </button>
        </div>

        {/* QR Code for Mobile Scanning */}
        <div className="mt-5 p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-slate-900 font-extrabold text-xs">
            <Smartphone className="w-4 h-4 text-blue-600" />
            <span>Scan QR Code dari HP untuk Buka Langsung</span>
          </div>

          <div className="w-44 h-44 mx-auto p-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center">
            <img
              src={qrUrl}
              alt="QR Code URL"
              className="w-full h-full object-contain"
            />
          </div>

          <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
            Buka kamera HP atau aplikasi scanner, lalu arahkan ke QR Code di atas untuk membuka aplikasi secara instan di smartphone.
          </p>
        </div>

        {/* Features Checklist */}
        <div className="mt-5 space-y-2 text-xs">
          <div className="flex items-start gap-2 text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span><b>Tanpa Perlu Sewa Hosting Tambahan</b>: Aplikasi sudah berjalan 24/7 di server cloud Google.</span>
          </div>
          <div className="flex items-start gap-2 text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span><b>Dukungan Kamera Depan & Belakang HP</b>: Selfie AI biometrik anti-curang otomatis memvalidasi wajah asli.</span>
          </div>
          <div className="flex items-start gap-2 text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span><b>Integrasi WhatsApp Ortu</b>: Notifikasi keterlambatan dan alpa dapat dikirim dengan 1-klik.</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition"
        >
          Tutup & Lanjutkan Menggunakan Aplikasi
        </button>
      </div>
    </div>
  );
};
