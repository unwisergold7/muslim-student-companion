/**
 * Prayer times fetching.
 *
 * Calls the AlAdhan API (https://api.aladhan.com) directly from the client.
 * There is no Next.js /api proxy — this project is a static Capacitor app
 * and API routes are not available. Direct client-side fetching works fine
 * in both the native WebView and on the web.
 *
 * Results are cached in localStorage for one hour to avoid redundant
 * network requests and to provide an offline fallback.
 */
import { PrayerTimesData } from "@/types";
import { to12Hour, todayDateString } from "./utils";

const ALADHAN = "https://api.aladhan.com/v1";
const CACHE_PFX = "msc_pt_";
const CACHE_TTL = 3600000; // 1 hour

export const FALLBACK_TIMES: PrayerTimesData = {
  Fajr: "5:32 AM",
  Sunrise: "6:48 AM",
  Dhuhr: "1:05 PM",
  Asr: "4:38 PM",
  Maghrib: "7:52 PM",
  Isha: "9:12 PM",
  method: "Fallback (offline)",
};

function cKey(lat: number, lng: number, m: number): string {
  return `${CACHE_PFX}${lat.toFixed(2)}_${lng.toFixed(2)}_${m}_${todayDateString()}`;
}
function cKeyCity(city: string, country: string, m: number): string {
  return `${CACHE_PFX}city_${city}_${country}_${m}_${todayDateString()}`;
}

function readCache(k: string): PrayerTimesData | null {
  try {
    const r = localStorage.getItem(k);
    if (!r) return null;
    const e = JSON.parse(r);
    return Date.now() - e.ts > CACHE_TTL ? null : e.data;
  } catch {
    return null;
  }
}

function readStale(k: string): PrayerTimesData | null {
  try {
    const r = localStorage.getItem(k);
    return r ? JSON.parse(r).data : null;
  } catch {
    return null;
  }
}

function writeCache(k: string, d: PrayerTimesData): void {
  try {
    localStorage.setItem(k, JSON.stringify({ data: d, ts: Date.now() }));
  } catch { /* storage quota */ }
}

function parseResponse(json: any): PrayerTimesData {
  const t = json.data.timings;
  return {
    Fajr: to12Hour(t.Fajr),
    Sunrise: to12Hour(t.Sunrise),
    Dhuhr: to12Hour(t.Dhuhr),
    Asr: to12Hour(t.Asr),
    Maghrib: to12Hour(t.Maghrib),
    Isha: to12Hour(t.Isha),
    date: json.data.date.readable,
    method: json.data.meta.method.name,
  };
}

/** Fetch prayer times by coordinates. Uses localStorage cache, falls back to stale. */
export async function fetchPrayerTimes(
  lat: number,
  lng: number,
  method: number = 2
): Promise<PrayerTimesData> {
  const k = cKey(lat, lng, method);
  const cached = readCache(k);
  if (cached) return cached;

  const now = new Date();
  const date = `${String(now.getDate()).padStart(2, "0")}-${String(now.getMonth() + 1).padStart(2, "0")}-${now.getFullYear()}`;

  try {
    const res = await fetch(
      `${ALADHAN}/timings/${date}?latitude=${lat}&longitude=${lng}&method=${method}`
    );
    if (!res.ok) throw new Error(`AlAdhan ${res.status}`);
    const data = parseResponse(await res.json());
    writeCache(k, data);
    return data;
  } catch (err) {
    const stale = readStale(k);
    if (stale) return { ...stale, method: (stale.method || "") + " (cached)" };
    throw err;
  }
}

/** Fetch prayer times by city name. */
export async function fetchPrayerTimesByCity(
  city: string,
  country: string = "US",
  method: number = 2
): Promise<PrayerTimesData> {
  const k = cKeyCity(city, country, method);
  const cached = readCache(k);
  if (cached) return cached;

  const now = new Date();
  const date = `${String(now.getDate()).padStart(2, "0")}-${String(now.getMonth() + 1).padStart(2, "0")}-${now.getFullYear()}`;

  try {
    const res = await fetch(
      `${ALADHAN}/timingsByCity/${date}?city=${encodeURIComponent(city)}&country=${country}&method=${method}`
    );
    if (!res.ok) throw new Error(`AlAdhan ${res.status}`);
    const data = parseResponse(await res.json());
    writeCache(k, data);
    return data;
  } catch (err) {
    const stale = readStale(k);
    if (stale) return { ...stale, method: (stale.method || "") + " (cached)" };
    throw err;
  }
}
