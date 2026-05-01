import { PrayerSpace, FoodEntry, UserReport, UserSettings } from "@/types";

function load<T>(k: string): T[] {
  if (typeof window === "undefined") return [];
  try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : []; } catch { return []; }
}
function save<T>(k: string, v: T[]) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* quota */ }
}

export function saveEntry<T extends { id: string }>(lk: string, entry: T) {
  const a = load<T>(lk);
  const i = a.findIndex((e) => e.id === entry.id);
  if (i >= 0) a[i] = entry; else a.push(entry);
  save(lk, a);
}
export function deleteEntry(lk: string, dk: string, id: string) {
  save(lk, load<{ id: string }>(lk).filter((e) => e.id !== id));
  const d = load<string>(dk);
  if (!d.includes(id)) { d.push(id); save(dk, d); }
}

export function mergeSpaces(sd: PrayerSpace[], uid: string): PrayerSpace[] {
  const l = load<PrayerSpace>("msc_spaces");
  const d = new Set(load<string>("msc_del_spaces"));
  const m = new Map<string, PrayerSpace>();
  for (const s of sd) if (s.university_id === uid && !d.has(s.id)) m.set(s.id, s);
  for (const s of l) if (s.university_id === uid && !d.has(s.id)) m.set(s.id, s);
  return Array.from(m.values());
}
export function mergeFood(sd: FoodEntry[], uid: string): FoodEntry[] {
  const l = load<FoodEntry>("msc_food");
  const d = new Set(load<string>("msc_del_food"));
  const m = new Map<string, FoodEntry>();
  for (const f of sd) if (f.university_id === uid && !d.has(f.id)) m.set(f.id, f);
  for (const f of l) if (f.university_id === uid && !d.has(f.id)) m.set(f.id, f);
  return Array.from(m.values());
}

// ── Favourites ────────────────────────────────────────────────
export function getFavourites(): string[] { return load<string>("msc_favs"); }
export function toggleFavourite(id: string): string[] {
  const f = getFavourites();
  const i = f.indexOf(id);
  if (i >= 0) f.splice(i, 1); else f.push(id);
  save("msc_favs", f);
  return [...f];
}
export function isFavourite(id: string): boolean { return getFavourites().includes(id); }

// ── Reports ───────────────────────────────────────────────────
export function saveReport(r: UserReport) {
  const reports = load<UserReport>("msc_reports");
  reports.push(r);
  save("msc_reports", reports);
}
export function getReports(): UserReport[] { return load<UserReport>("msc_reports"); }

// ── User Settings ─────────────────────────────────────────────
const SETTINGS_KEY = "msc_settings_v2";
export const DEFAULT_SETTINGS: UserSettings = {
  dark: false,
  ramadan: false,
  onboarding_complete: false,
  location_choice: "none",
};

export function loadSettings(): UserSettings {
  if (typeof window === "undefined") return { ...DEFAULT_SETTINGS };
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: UserSettings): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch { /* quota */ }
}

export function updateSetting<K extends keyof UserSettings>(key: K, value: UserSettings[K]): UserSettings {
  const current = loadSettings();
  const next = { ...current, [key]: value };
  saveSettings(next);
  return next;
}
