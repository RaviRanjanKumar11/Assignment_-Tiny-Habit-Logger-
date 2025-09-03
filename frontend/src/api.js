// Optional backend syncing. If VITE_BACKEND_URL is unset or backend is unreachable,
// the app still works with local storage/IndexedDB.
const BASE = import.meta.env.VITE_BACKEND_URL;

async function safeFetch(url, opts) {
  if (!BASE) return null;
  try {
    const res = await fetch(BASE + url, {
      headers: { 'Content-Type': 'application/json' },
      ...opts
    });
    if (!res.ok) throw new Error('Bad response');
    return await res.json();
  } catch (e) {
    // Silently ignore to keep app functioning without backend
    return null;
  }
}

export async function apiGetLogs(days=7) {
  return safeFetch(`/api/logs?days=${days}`);
}
export async function apiMark(date) {
  return safeFetch('/api/mark', { method: 'POST', body: JSON.stringify({ date }) });
}
export async function apiReset() {
  return safeFetch('/api/reset', { method: 'POST' });
}
export async function apiSync(logs) {
  return safeFetch('/api/sync', { method: 'POST', body: JSON.stringify({ logs }) });
}
