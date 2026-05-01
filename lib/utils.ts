import { PrayerTimesData, NextPrayer, CurrentPrayer, VerificationStatus, Coordinates } from "@/types";

export function parseTime(s: string): number {
  const [t, m] = s.trim().split(" ");
  let [h, mn] = t.split(":").map(Number);
  if (m?.toUpperCase() === "PM" && h !== 12) h += 12;
  if (m?.toUpperCase() === "AM" && h === 12) h = 0;
  return h * 60 + mn;
}

export function to12Hour(t24: string): string {
  const [hStr, mStr] = t24.split(":");
  let h = parseInt(hStr, 10);
  const m = mStr.replace(/\s*\(.*\)/, "");
  const mer = h >= 12 ? "PM" : "AM";
  if (h > 12) h -= 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${mer}`;
}

export function formatCountdown(mins: number): string {
  if (mins <= 0) return "Now";
  const h = Math.floor(mins / 60), m = mins % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  return h > 0 ? `${h}h` : `${m}m`;
}

export function getNextPrayer(now: Date, times: PrayerTimesData): NextPrayer {
  const c = now.getHours() * 60 + now.getMinutes();
  for (const n of ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const) {
    const p = parseTime(times[n]);
    if (p > c) return { name: n, time: times[n], remaining: p - c };
  }
  return { name: "Fajr", time: times.Fajr, remaining: parseTime(times.Fajr) + 1440 - c };
}

export function getCurrentPrayer(now: Date, times: PrayerTimesData): CurrentPrayer | null {
  const c = now.getHours() * 60 + now.getMinutes();
  const order = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;
  let current: CurrentPrayer | null = null;
  for (const n of order) {
    const p = parseTime(times[n]);
    if (p <= c) current = { name: n, time: times[n] };
  }
  if (!current) current = { name: "Isha", time: times.Isha };
  return current;
}

/** Hijri date via the Umm al-Qura calendar. Returns "" on runtimes
 *  that don't support the islamic-umalqura calendar. */
export function getHijriDate(d: Date): string {
  try {
    return new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
      day: "numeric", month: "long", year: "numeric",
    }).format(d);
  } catch {
    return "";
  }
}

export function todayDateString(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
}

export function cn(...c: (string | false | null | undefined)[]): string {
  return c.filter(Boolean).join(" ");
}

export function isOutdated(d: string, days: number = 90): boolean {
  return new Date(d) < new Date(Date.now() - days * 86400000);
}

export function effectiveVerification(s: VerificationStatus, _d: string): VerificationStatus {
  return s;
}

export function verificationHasDecayedForDisplay(s: VerificationStatus, d: string): boolean {
  if (s === "verified" && isOutdated(d, 90)) return true;
  if (s === "community" && isOutdated(d, 60)) return true;
  return false;
}

export function areHoursStale(d?: string): boolean {
  return !d || isOutdated(d, 30);
}

export function appleMapUrl(name: string, coords?: Coordinates, address?: string): string {
  if (coords) return `https://maps.apple.com/?q=${encodeURIComponent(name)}&ll=${coords.lat},${coords.lng}`;
  if (address) return `https://maps.apple.com/?q=${encodeURIComponent(address)}`;
  return `https://maps.apple.com/?q=${encodeURIComponent(name)}`;
}

export function googleMapUrl(name: string, coords?: Coordinates, address?: string): string {
  if (coords) return `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`;
  if (address) return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`;
}

export function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function copyToClipboard(text: string): Promise<void> {
  if (typeof navigator !== "undefined" && navigator.clipboard) return navigator.clipboard.writeText(text);
  return Promise.reject("Clipboard not available");
}

/** Kept for backward compatibility. New code should use lib/haptics. */
import { haptics as _haptics } from "./haptics";
export function haptic(style: "light" | "medium" | "selection" | "success" | "warning" | "error" = "light"): void {
  if (style === "selection") return _haptics.selection();
  if (style === "light") return _haptics.light();
  if (style === "medium") return _haptics.medium();
  if (style === "success") return _haptics.success();
  if (style === "warning") return _haptics.warning();
  if (style === "error") return _haptics.error();
}

export async function getFriendlyLocationLabel(lat: number, lng: number): Promise<string> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
      { signal: ctrl.signal, headers: { "Accept-Language": "en" } }
    );
    clearTimeout(timer);
    if (!res.ok) return "Near you";
    const data = await res.json();
    const a = data?.address;
    if (!a) return "Near you";
    const city = a.city || a.town || a.village || a.county;
    const state = a.state;
    if (city && state) return `${city}, ${state}`;
    if (city) return city;
    if (state) return state;
    return "Near you";
  } catch {
    return "Near you";
  }
}
