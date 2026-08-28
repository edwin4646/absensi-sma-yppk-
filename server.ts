import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = process.env.PORT || 3000;

// Setup body parsers with ample limit for logo uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Server persistent data file
const DATA_FILE = path.join(process.cwd(), 'server-storage.json');
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

interface ServerData {
  settings: {
    school_name: string;
    foundation_name: string;
    location_name: string;
    principal_name: string;
    token_wa: string;
    aktifkan_wa_api: boolean;
    custom_logo_kiri?: string;
    custom_logo_kanan?: string;
  };
  users?: any[];
  attendance?: any[];
  leaves?: any[];
  inventory?: any[];
}

const DEFAULT_DATA: ServerData = {
  settings: {
    school_name: 'SMA YPPK YOANES XXIII MERAUKE',
    foundation_name: 'YAYASAN PENDIDIKAN DAN PERSEKOLAHAN KATOLIK',
    location_name: 'Merauke, Papua Selatan',
    principal_name: 'Valentinus G. Nuga, S.S.,M.Fil',
    token_wa: '',
    aktifkan_wa_api: false
  }
};

function readServerData(): ServerData {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      return { ...DEFAULT_DATA, ...JSON.parse(content) };
    }
  } catch (err) {
    console.error('Error reading server data:', err);
  }
  return DEFAULT_DATA;
}

function writeServerData(data: ServerData): void {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing server data:', err);
  }
}

// Ensure initial data exists
if (!fs.existsSync(DATA_FILE)) {
  writeServerData(DEFAULT_DATA);
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// GET Settings
app.get('/api/settings', (req, res) => {
  const data = readServerData();
  res.json(data.settings);
});

// POST Settings
app.post('/api/settings', (req, res) => {
  const newSettings = req.body;
  const current = readServerData();
  current.settings = { ...current.settings, ...newSettings };
  writeServerData(current);
  res.json({ success: true, settings: current.settings });
});

// Upload Logo Endpoint
app.post('/api/upload-logo', (req, res) => {
  try {
    const { type, dataUrl } = req.body;
    if (!type || !dataUrl) {
      return res.status(400).json({ error: 'type and dataUrl are required' });
    }

    const current = readServerData();

    if (dataUrl.startsWith('data:image/')) {
      const matches = dataUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
      if (!matches || matches.length < 3) {
        return res.status(400).json({ error: 'Invalid image data' });
      }

      const ext = matches[1] === 'svg+xml' ? 'svg' : matches[1];
      const buffer = Buffer.from(matches[2], 'base64');
      const filename = `logo_${type}_${Date.now()}.${ext}`;
      const filePath = path.join(UPLOADS_DIR, filename);

      fs.writeFileSync(filePath, buffer);

      const serverLogoUrl = `/api/uploads/${filename}`;
      if (type === 'kiri') {
        current.settings.custom_logo_kiri = serverLogoUrl;
      } else {
        current.settings.custom_logo_kanan = serverLogoUrl;
      }
    } else {
      if (type === 'kiri') {
        current.settings.custom_logo_kiri = dataUrl;
      } else {
        current.settings.custom_logo_kanan = dataUrl;
      }
    }

    writeServerData(current);
    res.json({
      success: true,
      logoUrl: type === 'kiri' ? current.settings.custom_logo_kiri : current.settings.custom_logo_kanan,
      settings: current.settings
    });
  } catch (err: any) {
    console.error('Upload logo error:', err);
    res.status(500).json({ error: err.message || 'Failed to upload logo' });
  }
});

// Serve uploaded logos statically
app.use('/api/uploads', express.static(UPLOADS_DIR, {
  maxAge: '1d',
  setHeaders: (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
}));

// POST Send SMS/WhatsApp API Message
app.post('/api/send-wa', async (req, res) => {
  try {
    const { token, target, message } = req.body;
    if (!target || !message) {
      return res.status(400).json({ error: 'target and message are required' });
    }

    const currentSettings = readServerData().settings;
    const apiToken = token || currentSettings.token_wa;

    if (apiToken && currentSettings.aktifkan_wa_api) {
      const formData = new FormData();
      formData.append('target', target);
      formData.append('message', message);
      formData.append('countryCode', '62');

      const fonnteRes = await fetch('https://api.fonnte.com/send', {
        method: 'POST',
        headers: {
          'Authorization': apiToken
        },
        body: formData
      });

      const result = await fonnteRes.json();
      return res.json({ success: true, gateway: 'fonnte', data: result });
    }

    console.log(`[WA/SMS Auto Dispatch] Sent to ${target}: ${message.substring(0, 80)}...`);
    return res.json({
      success: true,
      mode: 'direct_ready',
      message: `Pesan siap dikirim ke ${target}`
    });
  } catch (err: any) {
    console.error('Send WA API Error:', err);
    res.status(500).json({ error: err.message || 'Gagal mengirim pesan API' });
  }
});

// GET / POST Sync Data across devices
app.get('/api/sync', (req, res) => {
  const data = readServerData();
  res.json(data);
});

app.post('/api/sync', (req, res) => {
  const { settings, users, attendance, leaves, inventory } = req.body;
  const current = readServerData();
  if (settings) current.settings = { ...current.settings, ...settings };
  if (users) current.users = users;
  if (attendance) current.attendance = attendance;
  if (leaves) current.leaves = leaves;
  if (inventory) current.inventory = inventory;
  writeServerData(current);
  res.json({ success: true, data: current });
});

// ----------------------------------------------------
// VITE / STATIC SERVING
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
