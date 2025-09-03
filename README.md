# Tiny Habit Logger

Minimal full‑stack app to log a single habit by day, with 7‑day streak display, CRUD actions, and persistence.
- **Frontend**: React (Vite). Uses **IndexedDB**, gracefully falls back to **localStorage**.
- **Backend**: Node.js (Express). Persists to a JSON file. Frontend works offline and can optionally sync with backend.

## Features
- Track a single habit (“Drink Water”) by day
- Actions: **Mark Done (today)**, **View last 7 days**, **Reset**
- Persistence: **IndexedDB**, fallback to **localStorage** if IDB is unavailable
- Optional backend sync (Node/Express) for server persistence
- Streak shows consecutive days up to **today**
- Reloading keeps history

## Quickstart

### 1) Backend (Node + Express)
```bash
cd backend
cp .env.example .env         # (optional) edit PORT or DATA_FILE
npm install
npm run start
# Backend runs at http://localhost:4000 by default
```

**Endpoints**
- `GET /api/health` – liveness
- `GET /api/logs?days=7` – returns recent logs
- `POST /api/mark` – body: `{ "date": "YYYY-MM-DD" }` (defaults to today)
- `POST /api/reset` – clears all logs
- `POST /api/sync` – body: `{ "logs": { "YYYY-MM-DD": true, ... } }`

### 2) Frontend (React + Vite)
```bash
cd frontend
cp .env.example .env
# Optional: set VITE_BACKEND_URL in .env, e.g. VITE_BACKEND_URL=http://localhost:4000
npm install
npm run dev
# Frontend runs at http://localhost:5173
```

> The app functions fully **without** a backend (local persistence). If `VITE_BACKEND_URL` is configured and reachable, it will also sync to the server.

## Acceptance Criteria Mapping
- **Marking done** creates/updates today's record → `Mark Done` button calls `markToday()` which sets `logs[today] = true` and persists (IDB/localStorage), then best‑effort POSTs `/api/mark`.
- **Reloading keeps history** → logs saved in IndexedDB (fallback localStorage).
- **Streak up to today** → `computeStreak()` counts consecutive days starting from today.
- **Graceful fallback** → `idb.js` tries IndexedDB, catches errors, switches to localStorage.
- **Full stack** → Node/Express backend included; React frontend included.
- **Run instructions** → in this README and `.env.example` files.

## Testing the Demo (what to show in your screen recording)
1. Start with a fresh load (streak = 0)
2. Click **Mark Done** (streak increments)
3. Reload the page – see data persist
4. Manually edit previous days (optional for demo): you can POST to the backend or set localStorage keys to simulate non‑consecutive days if desired. Alternatively, wait a day to see natural progression.
5. Click **Reset** – streak resets to 0
6. (Optional) Stop backend; app still works locally

## Notes
- Single habit is hardcoded as “Drink Water” for simplicity but can be extended.
- Timezone: relies on the browser/Node locale for `YYYY‑MM‑DD` keys (`toISOString().slice(0,10)` uses UTC). For strict local‑timezone behavior, adjust date handling.
"# Assignment_-Tiny-Habit-Logger-" 
