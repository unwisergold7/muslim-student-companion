/**
 * Native-first geolocation wrapper.
 *
 * On iOS/Android (when running inside the Capacitor shell) this uses
 * the Capacitor Geolocation plugin, which in turn drives the real
 * CoreLocation / Android LocationManager APIs and respects the
 * system permission dialogs configured via Info.plist and
 * AndroidManifest.
 *
 * On the web, it falls back to `navigator.geolocation`.
 *
 * Always returns a typed result — never throws up through the UI.
 */

export type GeoError =
  | { kind: "unsupported" }
  | { kind: "denied" }
  | { kind: "timeout" }
  | { kind: "unavailable"; message?: string };

export type GeoResult =
  | { ok: true; lat: number; lng: number }
  | { ok: false; error: GeoError };

async function getCapacitorGeo(): Promise<any | null> {
  if (typeof window === "undefined") return null;
  const cap = (window as any).Capacitor;
  if (!cap || !cap.isNativePlatform || !cap.isNativePlatform()) return null;
  try {
    const mod = await import("@capacitor/geolocation");
    return mod;
  } catch {
    return null;
  }
}

export async function requestLocationPermission(): Promise<"granted" | "denied" | "prompt" | "unsupported"> {
  const Geo = await getCapacitorGeo();
  if (Geo) {
    try {
      const status = await Geo.Geolocation.checkPermissions();
      if (status.location === "granted") return "granted";
      const requested = await Geo.Geolocation.requestPermissions();
      return requested.location === "granted" ? "granted" : "denied";
    } catch {
      return "unsupported";
    }
  }
  // Web: permission prompt happens as part of getCurrentPosition
  if (typeof navigator === "undefined" || !navigator.geolocation) return "unsupported";
  return "prompt";
}

export async function getCurrentLocation(timeoutMs = 10000): Promise<GeoResult> {
  const Geo = await getCapacitorGeo();

  if (Geo) {
    try {
      const pos = await Geo.Geolocation.getCurrentPosition({
        enableHighAccuracy: false,
        timeout: timeoutMs,
      });
      return { ok: true, lat: pos.coords.latitude, lng: pos.coords.longitude };
    } catch (err: any) {
      const msg = String(err?.message || err).toLowerCase();
      if (msg.includes("denied")) return { ok: false, error: { kind: "denied" } };
      if (msg.includes("timeout")) return { ok: false, error: { kind: "timeout" } };
      return { ok: false, error: { kind: "unavailable", message: err?.message } };
    }
  }

  // Web fallback
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return { ok: false, error: { kind: "unsupported" } };
  }
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ ok: true, lat: p.coords.latitude, lng: p.coords.longitude }),
      (err) => {
        if (err.code === err.PERMISSION_DENIED) return resolve({ ok: false, error: { kind: "denied" } });
        if (err.code === err.TIMEOUT) return resolve({ ok: false, error: { kind: "timeout" } });
        resolve({ ok: false, error: { kind: "unavailable", message: err.message } });
      },
      { enableHighAccuracy: false, timeout: timeoutMs, maximumAge: 300000 }
    );
  });
}
