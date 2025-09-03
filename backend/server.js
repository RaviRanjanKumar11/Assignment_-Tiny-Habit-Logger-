import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;
const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, 'data.json');

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

function loadData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return { logs: {} };
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load data:', e);
    return { logs: {} };
  }
}

function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error('Failed to save data:', e);
    return false;
  }
}

// Health
app.get('/api/health', (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// Get logs (optionally limit days via query)
app.get('/api/logs', (req, res) => {
  const days = parseInt(req.query.days || '0', 10);
  const data = loadData();
  if (days > 0) {
    // filter to last N days only
    const out = {};
    const today = new Date();
    for (let i = 0; i < days; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0,10);
      if (data.logs[key]) out[key] = true;
    }
    return res.json({ logs: out });
  }
  res.json({ logs: data.logs || {} });
});

// Mark done for a date
app.post('/api/mark', (req, res) => {
  const { date } = req.body || {};
  const d = date || new Date().toISOString().slice(0,10);
  const data = loadData();
  if (!data.logs) data.logs = {};
  data.logs[d] = true;
  saveData(data);
  res.json({ ok: true, date: d });
});

// Reset all data
app.post('/api/reset', (req, res) => {
  const data = { logs: {} };
  saveData(data);
  res.json({ ok: true });
});

// Bulk sync (optional): accept full logs object
app.post('/api/sync', (req, res) => {
  const { logs } = req.body || {};
  if (!logs || typeof logs !== 'object') {
    return res.status(400).json({ ok: false, error: 'Invalid logs' });
  }
  const data = loadData();
  data.logs = { ...(data.logs || {}), ...logs };
  saveData(data);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
