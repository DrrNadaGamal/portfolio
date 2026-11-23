// Pure helpers, no DOM, no globals. Imported by the app and the tests.

export function formatMinutes(min) {
  if (!Number.isFinite(min) || min < 0) return "0m";
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function clamp(n, lo, hi) {
  return Math.min(hi, Math.max(lo, n));
}

export function round1(n) {
  return Math.round(n * 10) / 10;
}

export function slugify(s) {
  return String(s)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/** Case-insensitive substring match across the given fields of an object. */
export function matchesQuery(obj, fields, query) {
  const q = String(query || "").trim().toLowerCase();
  if (!q) return true;
  return fields.some((f) => {
    const v = obj[f];
    if (Array.isArray(v)) return v.some((x) => String(x).toLowerCase().includes(q));
    return String(v ?? "").toLowerCase().includes(q);
  });
}

export function uniqueBy(list, key) {
  const seen = new Set();
  return list.filter((item) => {
    const k = item[key];
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}
