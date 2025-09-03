export function fmt(d) {
  if (typeof d === 'string') return d;
  return d.toISOString().slice(0,10);
}

export function todayKey() {
  return new Date().toISOString().slice(0,10);
}

export function lastNDates(n) {
  const out = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    out.push(d.toISOString().slice(0,10));
  }
  return out;
}

// Streak: consecutive days up to today where done === true
export function computeStreak(logs) {
  // logs: object { 'YYYY-MM-DD': true/false }
  let streak = 0;
  const now = new Date();
  for (let i = 0; ; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = d.toISOString().slice(0,10);
    if (logs[key]) {
      streak += 1;
    } else {
      // Break at the first missing day (including today)
      break;
    }
  }
  return streak;
}
