/**
 * Native-first haptic feedback.
 *
 * Tries Capacitor's Haptics plugin when the app is running in a native
 * shell (iOS/Android). Falls back to `navigator.vibrate` on the web.
 * Silently no-ops on platforms that support neither. Every call is
 * wrapped in try/catch so an unsupported environment can never crash
 * the UI.
 *
 * Usage:
 *   import { haptics } from "@/lib/haptics";
 *   haptics.selection();  // tab change, toggle, filter pill
 *   haptics.light();      // card expand, button tap
 *   haptics.success();    // save complete, report sent
 *   haptics.warning();    // validation issue
 *   haptics.error();      // action failed
 */

type Level = "selection" | "light" | "medium" | "success" | "warning" | "error";

let capacitorHaptics: any = null;
let capacitorLoaded = false;

async function getCapacitorHaptics(): Promise<any> {
  if (capacitorLoaded) return capacitorHaptics;
  capacitorLoaded = true;
  if (typeof window === "undefined") return null;
  // Capacitor exposes a global when running in the native container.
  const cap = (window as any).Capacitor;
  if (!cap || !cap.isNativePlatform || !cap.isNativePlatform()) return null;
  try {
    const mod = await import("@capacitor/haptics");
    capacitorHaptics = mod;
    return capacitorHaptics;
  } catch {
    return null;
  }
}

function webFallback(level: Level): void {
  if (typeof navigator === "undefined" || !navigator.vibrate) return;
  const ms =
    level === "selection" ? 8 :
    level === "light" ? 10 :
    level === "medium" ? 18 :
    level === "success" ? [12, 40, 18] :
    level === "warning" ? [10, 30, 10] :
    /* error */ [20, 40, 20];
  try { navigator.vibrate(ms); } catch { /* ignore */ }
}

async function run(level: Level): Promise<void> {
  try {
    const H = await getCapacitorHaptics();
    if (H) {
      if (level === "selection") return void H.Haptics.selectionChanged();
      if (level === "light") return void H.Haptics.impact({ style: H.ImpactStyle.Light });
      if (level === "medium") return void H.Haptics.impact({ style: H.ImpactStyle.Medium });
      if (level === "success") return void H.Haptics.notification({ type: H.NotificationType.Success });
      if (level === "warning") return void H.Haptics.notification({ type: H.NotificationType.Warning });
      if (level === "error") return void H.Haptics.notification({ type: H.NotificationType.Error });
    }
    webFallback(level);
  } catch {
    // Never crash the UI for a missing haptic
  }
}

export const haptics = {
  selection: () => { run("selection"); },
  light:     () => { run("light"); },
  medium:    () => { run("medium"); },
  success:   () => { run("success"); },
  warning:   () => { run("warning"); },
  error:     () => { run("error"); },
};
