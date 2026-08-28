import React from 'react';
import { AppStorage } from '../services/storage';

export function formatDirectImageUrl(url?: string): string {
  if (!url) return '';
  const trimmed = url.trim();

  // Handle Google Drive links (view, sharing, open, etc.)
  // Pattern 1: /file/d/([a-zA-Z0-9_-]+)
  const driveFileMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveFileMatch && driveFileMatch[1]) {
    const fileId = driveFileMatch[1];
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  // Pattern 2: id=([a-zA-Z0-9_-]+)
  const driveIdMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (driveIdMatch && driveIdMatch[1] && trimmed.includes('drive.google.com')) {
    const fileId = driveIdMatch[1];
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  // Pattern 3: /d/([a-zA-Z0-9_-]+)
  const directDriveMatch = trimmed.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);
  if (directDriveMatch && directDriveMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${directDriveMatch[1]}`;
  }

  // Handle Dropbox links (dl=0 -> raw=1)
  if (trimmed.includes('dropbox.com')) {
    return trimmed.replace('dl=0', 'raw=1').replace('?dl=1', '?raw=1');
  }

  return trimmed;
}

interface SchoolLogoProps {
  type: 'kiri' | 'kanan';
  className?: string;
  size?: number;
  onClick?: () => void;
  title?: string;
  customSrc?: string;
}

export const SchoolLogo: React.FC<SchoolLogoProps> = ({
  type,
  className = '',
  size = 48,
  onClick,
  title,
  customSrc
}) => {
  // If customSrc is explicitly provided or exists in settings
  let resolvedSrc = customSrc;
  if (!resolvedSrc) {
    try {
      const settings = AppStorage.getSettings();
      if (type === 'kiri' && settings?.custom_logo_kiri) {
        resolvedSrc = settings.custom_logo_kiri;
      } else if (type === 'kanan' && settings?.custom_logo_kanan) {
        resolvedSrc = settings.custom_logo_kanan;
      }
    } catch {}
  }

  // Format any Google Drive or cloud links to direct image URLs
  if (resolvedSrc) {
    resolvedSrc = formatDirectImageUrl(resolvedSrc);
  }

  // If a custom image is configured, display it
  if (resolvedSrc) {
    return (
      <div
        onClick={onClick}
        title={title || (type === 'kiri' ? 'SMA YPPK Yoanes XXIII Merauke' : 'Yayasan YPPK Merauke')}
        className={`relative inline-flex items-center justify-center shrink-0 cursor-pointer select-none transition-transform hover:scale-105 active:scale-95 ${className}`}
        style={{ width: size, height: size }}
      >
        <img
          src={resolvedSrc}
          alt={type === 'kiri' ? 'Logo SMA Yoanes XXIII' : 'Logo YPPK Merauke'}
          className="w-full h-full object-contain filter drop-shadow-md rounded-md"
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          onError={(e) => {
            // Fallback for Google Drive uc export if lh3 fails
            const target = e.target as HTMLImageElement;
            if (target.src.includes('googleusercontent.com/d/')) {
              const fileId = target.src.split('/d/')[1];
              if (fileId) {
                target.src = `https://drive.google.com/uc?export=view&id=${fileId}`;
                return;
              }
            }
            target.style.display = 'none';
          }}
        />
      </div>
    );
  }

  if (type === 'kiri') {
    // Logo Kiri: SMA YOANES XXIII YPPK - Widyatama Merauke
    return (
      <div 
        onClick={onClick}
        title={title || "SMA YPPK Yoanes XXIII Merauke (Klik untuk opsi / Pintu Admin)"}
        className={`relative inline-flex items-center justify-center shrink-0 cursor-pointer select-none transition-transform hover:scale-105 active:scale-95 ${className}`}
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          {/* Shield Outer Gold Border */}
          <path
            d="M 50,2 C 72,2 92,12 92,34 C 92,72 66,92 50,98 C 34,92 8,72 8,34 C 8,12 28,2 50,2 Z"
            fill="#f59e0b"
          />
          {/* Shield Inner Royal Blue Base */}
          <path
            d="M 50,5 C 70,5 88,14 88,34 C 88,70 64,89 50,95 C 36,89 12,70 12,34 C 12,14 30,5 50,5 Z"
            fill="#0284c7"
            stroke="#0369a1"
            strokeWidth="1.5"
          />
          {/* Cenderawasih Wings & Sunburst Gold Aura */}
          <path
            d="M 22,38 Q 36,58 50,58 Q 64,58 78,38 Q 70,76 50,86 Q 30,76 22,38 Z"
            fill="#fbbf24"
            opacity="0.9"
          />
          {/* Central Open Bible / Book */}
          <path
            d="M 28,62 Q 50,56 72,62 L 70,70 Q 50,64 30,70 Z"
            fill="#ffffff"
            stroke="#1e293b"
            strokeWidth="1"
          />
          <line x1="50" y1="58" x2="50" y2="67" stroke="#1e293b" strokeWidth="1.2" />
          {/* Cross on Bible */}
          <rect x="47" y="24" width="6" height="38" rx="1.5" fill="#1e293b" />
          <rect x="36" y="32" width="28" height="6" rx="1.5" fill="#1e293b" />
          {/* Sacred Heart Flame */}
          <path
            d="M 50,38 C 47,33 42,33 42,38 C 42,43 50,47 50,47 C 50,47 58,43 58,38 C 58,33 53,33 50,38 Z"
            fill="#ef4444"
          />
          {/* Feather Pen Accent */}
          <path
            d="M 64,48 Q 69,58 73,64 L 71,65 Q 66,60 62,50 Z"
            fill="#ffffff"
          />
        </svg>
      </div>
    );
  }

  // Logo Kanan: College Saint Jean XXIII Merauke Papua Selatan
  return (
    <div 
      onClick={onClick}
      title={title || "Yayasan Pendidikan dan Persekolahan Katolik (Klik untuk opsi / Pintu Admin)"}
      className={`relative inline-flex items-center justify-center shrink-0 cursor-pointer select-none transition-transform hover:scale-105 active:scale-95 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        {/* Pentagon Gold Outer Rim */}
        <polygon
          points="50,2 96,35 80,96 20,96 4,35"
          fill="#f59e0b"
        />
        {/* Pentagon Cyan Shield Body */}
        <polygon
          points="50,5 92,36 77,93 23,93 8,36"
          fill="#38bdf8"
          stroke="#0284c7"
          strokeWidth="1.5"
        />
        {/* White Dove / Holy Spirit */}
        <path
          d="M 50,19 C 45,17 40,22 47,25 C 49,26 51,26 53,25 C 60,22 55,17 50,19 Z"
          fill="#ffffff"
          stroke="#0284c7"
          strokeWidth="0.5"
        />
        {/* Papua Tifa Drums Left & Right */}
        {/* Left Tifa Drum */}
        <g transform="translate(14, 40) rotate(-10)">
          <ellipse cx="6" cy="4" rx="4" ry="2" fill="#78350f" />
          <path d="M 2,4 L 4,24 L 8,24 L 10,4 Z" fill="#92400e" stroke="#451a03" strokeWidth="0.8" />
          <line x1="2" y1="9" x2="10" y2="19" stroke="#fef3c7" strokeWidth="0.6" />
          <line x1="10" y1="9" x2="2" y2="19" stroke="#fef3c7" strokeWidth="0.6" />
        </g>
        {/* Right Tifa Drum */}
        <g transform="translate(74, 40) rotate(10)">
          <ellipse cx="6" cy="4" rx="4" ry="2" fill="#78350f" />
          <path d="M 2,4 L 4,24 L 8,24 L 10,4 Z" fill="#92400e" stroke="#451a03" strokeWidth="0.8" />
          <line x1="2" y1="9" x2="10" y2="19" stroke="#fef3c7" strokeWidth="0.6" />
          <line x1="10" y1="9" x2="2" y2="19" stroke="#fef3c7" strokeWidth="0.6" />
        </g>
        {/* Golden Cross */}
        <rect x="46.5" y="27" width="7" height="46" rx="1.5" fill="#f59e0b" stroke="#d97706" strokeWidth="1" />
        <rect x="33" y="38" width="34" height="7" rx="1.5" fill="#f59e0b" stroke="#d97706" strokeWidth="1" />
        {/* Sacred Heart in Cross */}
        <path
          d="M 50,42 C 47,37 40,37 40,43 C 40,49 50,54 50,54 C 50,54 60,49 60,43 C 60,37 53,37 50,42 Z"
          fill="#dc2626"
        />
      </svg>
    </div>
  );
};
