/**
 * Generator Link & Template Pesan WhatsApp Notifikasi Orang Tua & Wali Kelas
 */

export const sanitizePhoneNumber = (phone: string): string => {
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  }
  return cleaned;
};

export const createParentNotificationText = (
  studentName: string,
  status: 'Terlambat' | 'Alpa' | 'Hadir' | 'Sakit' | 'Izin',
  timeIn: string | null = '-',
  dateStr?: string
): string => {
  const d = dateStr || new Date().toISOString().split('T')[0];
  if (status === 'Terlambat') {
    return `Yth. Bapak/Ibu Orang Tua/Wali dari *${studentName}*,\n\nKami menginformasikan bahwa putra/putri Anda telah tiba di *SMA YPPK Yoanes XXIII Merauke* pada hari ini (${d}) pukul *${timeIn} WIT* dengan status: *TERLAMBAT* (melewati batas jam masuk sekolah 07:30 WIT).\n\nMohon kerjasamanya untuk selalu mendampingi kedisiplinan waktu putra/putri kita.\n\nTerima kasih.\n_Kurikulum & Kesiswaan SMA YPPK Yoanes XXIII_`;
  } else if (status === 'Alpa') {
    return `Yth. Bapak/Ibu Orang Tua/Wali dari *${studentName}*,\n\nKami menginformasikan bahwa hingga saat ini (${d}) putra/putri Anda *BELUM HADIR / TIDAK TERDATA* di presensi sekolah *SMA YPPK Yoanes XXIII Merauke* (Status: *ALPA / Tanpa Keterangan*).\n\nJika putra/putri Anda berhalangan hadir karena sakit/keperluan penting, mohon segera mengirimkan surat keterangan / konfirmasi kepada Wali Kelas.\n\nTerima kasih.\n_Kesiswaan SMA YPPK Yoanes XXIII_`;
  } else {
    return `Yth. Bapak/Ibu Orang Tua/Wali dari *${studentName}*,\n\nKami menginformasikan bahwa putra/putri Anda telah tercatat *HADIR TEPAT WAKTU* di *SMA YPPK Yoanes XXIII Merauke* pada tanggal ${d} pukul *${timeIn} WIT*.\n\nTerima kasih atas kedisiplinan putra/putri Anda.\n_SMA YPPK Yoanes XXIII_`;
  }
};

export const createDirectWhatsAppLink = (
  phone: string,
  studentName: string,
  status: 'Terlambat' | 'Alpa' | 'Hadir' | 'Sakit' | 'Izin',
  timeIn: string | null = '-',
  dateStr?: string
): string => {
  const cleanPhone = sanitizePhoneNumber(phone);
  if (!cleanPhone || cleanPhone.length < 5) return '#';
  const text = createParentNotificationText(studentName, status, timeIn, dateStr);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
};

export const createHomeroomClassReportWhatsAppLink = (
  phone: string,
  className: string,
  teacherName: string,
  lateList: string[],
  absentList: string[],
  dateStr?: string
): string => {
  const cleanPhone = sanitizePhoneNumber(phone);
  const d = dateStr || new Date().toISOString().split('T')[0];

  let text = `*LAPORAN PRESENSI HARIAN KELAS ${className}*\n`;
  text += `*SMA YPPK YOANES XXIII MERAUKE*\n`;
  text += `Tanggal: ${d}\n`;
  text += `Wali Kelas: ${teacherName}\n`;
  text += `------------------------------------\n\n`;

  text += `⚠️ *SISWA TERLAMBAT (${lateList.length}):*\n`;
  if (lateList.length > 0) {
    lateList.forEach((item, idx) => {
      text += `${idx + 1}. ${item}\n`;
    });
  } else {
    text += `(Nihil / Semua Tepat Waktu)\n`;
  }
  text += `\n`;

  text += `❌ *SISWA ALPA / BELUM ABSEN (${absentList.length}):*\n`;
  if (absentList.length > 0) {
    absentList.forEach((item, idx) => {
      text += `${idx + 1}. ${item}\n`;
    });
  } else {
    text += `(Nihil / Semua Hadir)\n`;
  }
  text += `\n`;
  text += `_Pesan ini dapat diteruskan (forward) langsung ke Grup WhatsApp Orang Tua Kelas ${className}._\n`;
  text += `_Sistem Presensi Digital SMA YPPK Yoanes XXIII_`;

  if (!cleanPhone || cleanPhone.length < 5) {
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  }
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
};

/**
 * Text notifikasi instan untuk Wali Kelas saat seorang siswa di kelasnya berhasil presensi atau datang terlambat
 */
export const createHomeroomStudentAttendanceText = (
  homeroomTeacherName: string,
  className: string,
  studentName: string,
  nisn: string,
  status: 'Terlambat' | 'Alpa' | 'Hadir' | 'Sakit' | 'Izin',
  timeIn: string | null = '-',
  dateStr?: string
): string => {
  const d = dateStr || new Date().toISOString().split('T')[0];
  const isLate = status === 'Terlambat';

  let text = `🔔 *NOTIFIKASI PRESENSI SISWA KELAS ${className}*\n`;
  text += `Kepada Yth. *${homeroomTeacherName}* (Wali Kelas ${className})\n\n`;
  text += `Berikut update presensi siswa:\n`;
  text += `• Nama: *${studentName}*\n`;
  text += `• NISN: ${nisn}\n`;
  text += `• Kelas: *${className}*\n`;
  text += `• Status: *${status.toUpperCase()}* ${isLate ? '⚠️' : '✅'}\n`;
  text += `• Waktu Masuk: *${timeIn} WIT*\n`;
  text += `• Tanggal: ${d}\n\n`;

  if (isLate) {
    text += `Catatan: Siswa tiba melewati batas jam masuk sekolah (07:30 WIT).\n\n`;
  }

  text += `_Sistem Presensi Digital SMA YPPK Yoanes XXIII Merauke_`;
  return text;
};

/**
 * Helper untuk mengirim otomatis via API Fonnte / Server Proxy (jika Token API diaktifkan)
 */
export const sendAutoWhatsAppNotification = async (
  token: string,
  targetPhone: string,
  message: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    const cleanPhone = sanitizePhoneNumber(targetPhone);
    if (!cleanPhone || cleanPhone.length < 6) {
      return { success: false, message: 'Nomor WhatsApp tidak valid' };
    }

    // Call server endpoint or direct Fonnte API
    const response = await fetch('/api/send-wa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        target: cleanPhone,
        message
      })
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, message: data.message || 'Pesan terkirim otomatis' };
    } else {
      const err = await response.json();
      return { success: false, message: err.error || 'Gagal mengirim SMS/WA API' };
    }
  } catch (error: any) {
    return { success: false, message: error.message || 'Koneksi API gagal' };
  }
};

