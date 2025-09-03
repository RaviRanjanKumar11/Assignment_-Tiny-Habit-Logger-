// IndexedDB with graceful fallback to localStorage
import { openDB } from 'idb';

const DB_NAME = 'habitLogger';
const STORE = 'logs';

let dbPromise = null;
let useLocalStorage = false;

async function init() {
  try {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE);
        }
      }
    });
    await dbPromise;
    useLocalStorage = false;
  } catch (e) {
    console.warn('IndexedDB unavailable, falling back to localStorage.', e);
    useLocalStorage = true;
  }
}

export async function get(key) {
  if (dbPromise === null && !useLocalStorage) await init();
  if (useLocalStorage) {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  }
  const db = await dbPromise;
  return db.get(STORE, key);
}

export async function set(key, val) {
  if (dbPromise === null && !useLocalStorage) await init();
  if (useLocalStorage) {
    localStorage.setItem(key, JSON.stringify(val));
    return;
  }
  const db = await dbPromise;
  return db.put(STORE, val, key);
}

export async function del(key) {
  if (dbPromise === null && !useLocalStorage) await init();
  if (useLocalStorage) {
    localStorage.removeItem(key);
    return;
  }
  const db = await dbPromise;
  return db.delete(STORE, key);
}

export async function clearAll() {
  if (dbPromise === null && !useLocalStorage) await init();
  if (useLocalStorage) {
    localStorage.clear();
    return;
  }
  const db = await dbPromise;
  return db.clear(STORE);
}

// Convenience helpers for our app
const KEY = 'habitLogs';

export async function loadLogs() {
  const logs = await get(KEY);
  return logs || {}; // object of { 'YYYY-MM-DD': true }
}

export async function saveLogs(logs) {
  await set(KEY, logs);
}

export async function resetLogs() {
  await del(KEY);
}
