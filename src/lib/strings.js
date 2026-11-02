/** "12.5 -> 13h" */
export function fmtHours(h) {
  const n = Number(h) || 0;
  return Number.isInteger(n) ? `${n}h` : `${Math.round(n)}h`;
}

/** 95 -> "1m 35s" */
export function fmtDuration(totalSeconds) {
  const s = Math.max(0, Number(totalSeconds) || 0);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m > 0 ? `${m}m ${r}s` : `${r}s`;
}

/** Safe percent clamped to 0-100. */
export function pct(p) {
  const n = Number(p);
  if (Number.isNaN(n)) return 0;
  return Math.min(100, Math.max(0, Math.round(n)));
}

/** mm:ss ticking clock for the quiz screen. */
export function fmtClock(totalSeconds) {
  const s = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

/** HTTP probe helper for the Setup Status page. */
export async function probe(request) {
  try {
    const res = await request();
    return { ok: true, status: res.status, body: res.data };
  } catch (error) {
    if (error.response) {
      return { ok: false, status: error.response.status, body: error.response.data };
    }
    return { ok: false, status: 0, body: null, network: true };
  }
}
