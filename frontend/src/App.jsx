import React, { useEffect, useMemo, useState } from 'react';
import { loadLogs, saveLogs, resetLogs } from './idb';
import { todayKey, lastNDates, computeStreak } from './utils';
import { apiGetLogs, apiMark, apiReset, apiSync } from './api';

const HABIT_NAME = 'Drink Water'; // Single habit for the assignment

export default function App() {
  const [logs, setLogs] = useState({});
  const [status, setStatus] = useState(''); // small UX helper

  // On mount: load from local (IndexedDB/localStorage)
  useEffect(() => {
    (async () => {
      const local = await loadLogs();
      setLogs(local);

      // Optional: try to fetch from backend & merge (best-effort)
      const remote = await apiGetLogs(7);
      if (remote && remote.logs) {
        const merged = { ...local, ...remote.logs };
        setLogs(merged);
        await saveLogs(merged);
      }
    })();
  }, []);

  const streak = useMemo(() => computeStreak(logs), [logs]);
  const days = useMemo(() => lastNDates(7), [logs]);

  const markToday = async () => {
    const key = todayKey();
    const next = { ...logs, [key]: true };
    setLogs(next);
    await saveLogs(next);
    await apiMark(key);       // ignore errors
    await apiSync(next);      // ignore errors
    setStatus('Marked done for today');
    setTimeout(() => setStatus(''), 1200);
  };

  const resetAll = async () => {
    setLogs({});
    await resetLogs();
    await apiReset();         // ignore errors
    setStatus('Reset complete');
    setTimeout(() => setStatus(''), 1200);
  };

  return (
    <div className="card">
      <h1>Tiny Habit Logger</h1>
      <div className="muted">Tracking: <strong>{HABIT_NAME}</strong></div>

      <div className="row">
        <div>
          <div className="muted">7‑day streak</div>
          <div className="streak">{streak}</div>
        </div>
        <div className="row" style={{gap: 8}}>
          <button className="btn primary" onClick={markToday}>Mark Done</button>
          <button className="btn danger" onClick={resetAll}>Reset</button>
        </div>
      </div>

      <div className="grid">
        {days.map((d) => {
          const label = new Date(d).toLocaleDateString(undefined, { weekday: 'short' }).slice(0,2);
          const isDone = !!logs[d];
          return (
            <div key={d} className={['day', isDone ? 'done' : ''].join(' ')} title={d}>
              {isDone ? '✓' : '–'}
              <small>{label}</small>
            </div>
          );
        })}
      </div>

      {status && <div className="footer">{status}</div>}
      {!status && <div className="footer">Data persists locally (IndexedDB → localStorage fallback) and optionally syncs to a backend.</div>}
    </div>
  );
}
