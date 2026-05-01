"use client";
import { useEffect, useState } from "react";
import { Moon, MapPin, RefreshCw, Loader2, AlertTriangle, Check, AlertCircle } from "lucide-react";
import { PrayerTimesData, LocationState } from "@/types";
import { getCurrentPrayer, getNextPrayer, formatCountdown, cn } from "@/lib/utils";
import { haptics } from "@/lib/haptics";
import QiblaCompass from "@/components/QiblaCompass";

const ALL = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;

interface Props {
  times: PrayerTimesData;
  loading: boolean;
  error: string | null;
  ramadan: boolean;
  methodName: string;
  locationLabel: string;
  locationState: LocationState;
  onRetry: () => void;
  onOpenLocation: () => void;
  lat: number | null;
  lng: number | null;
}

export default function PrayerTimesTab({
  times, loading, error, ramadan, methodName,
  locationLabel, locationState, onRetry, onOpenLocation, lat, lng,
}: Props) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const current = now ? getCurrentPrayer(now, times) : null;
  const next = now ? getNextPrayer(now, times) : null;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Prayer Times</h2>
        <button
          onClick={() => { haptics.selection(); onRetry(); }}
          disabled={loading}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 disabled:opacity-50"
          aria-label="Refresh"
        >
          <RefreshCw className={cn("w-4 h-4 text-gray-500", loading && "animate-spin")} />
        </button>
      </div>

      {/* Location control */}
      <LocationBar state={locationState} label={locationLabel} hasLocation={lat !== null && lng !== null} onOpen={onOpenLocation} />

      {error && (
        <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 p-3.5 flex gap-2.5">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700 dark:text-red-300">Couldn't update prayer times</p>
            <p className="text-xs text-red-600 mt-0.5">{error}</p>
            <button onClick={onRetry} className="text-xs font-semibold text-red-700 mt-1 hover:underline">
              Try again
            </button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        {ALL.map((n, i) => {
          const isCurrent = current?.name === n;
          const isSunrise = n === "Sunrise";
          return (
            <div
              key={n}
              className={cn(
                "flex items-center justify-between px-4 py-3.5 min-h-[56px]",
                i < 5 && "border-b border-gray-100 dark:border-gray-800/60",
                isCurrent && "bg-emerald-50/70 dark:bg-emerald-950/30",
                isSunrise && "opacity-60"
              )}
            >
              <div className="flex items-center gap-2.5">
                {isCurrent && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-soft" />}
                <div>
                  <span className={cn("text-sm", isCurrent ? "font-bold text-emerald-700 dark:text-emerald-400" : "font-medium text-gray-700 dark:text-gray-300")}>
                    {n}
                  </span>
                  {isCurrent && next && !loading && now && (
                    <p className="text-[10px] text-emerald-600 mt-0.5">
                      {next.name} in {formatCountdown(next.remaining)}
                    </p>
                  )}
                </div>
              </div>
              <span
                className={cn("text-[15px]", isCurrent ? "font-bold text-emerald-700 dark:text-emerald-400" : "font-semibold text-gray-500")}
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                ) : (
                  times[n as keyof PrayerTimesData] || "—"
                )}
              </span>
            </div>
          );
        })}
      </div>

      {ramadan && !loading && (
        <div className="rounded-xl bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800/50 p-4">
          <div className="flex items-center gap-2 mb-2.5">
            <Moon className="w-4 h-4 text-yellow-600" />
            <span className="text-[13px] font-bold text-yellow-800 dark:text-yellow-300">Ramadan</span>
          </div>
          <div className="flex justify-between">
            <div>
              <p className="text-[11px] text-yellow-600">Suhoor ends</p>
              <p className="text-lg font-bold text-yellow-800 dark:text-yellow-200">{times.Fajr}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-yellow-600">Iftar</p>
              <p className="text-lg font-bold text-yellow-800 dark:text-yellow-200">{times.Maghrib}</p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 px-4 py-3">
        <p className="text-[11px] text-gray-500 mb-0.5">Calculation Method</p>
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
          {loading ? "Loading…" : methodName}
        </p>
      </div>

      <QiblaCompass lat={lat} lng={lng} />
    </div>
  );
}

function LocationBar({
  state, label, hasLocation, onOpen,
}: { state: LocationState; label: string; hasLocation: boolean; onOpen: () => void }) {
  if (state === "requesting") {
    return (
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50">
        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
        <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">Getting your location…</span>
      </div>
    );
  }

  if (state === "granted" || state === "manual") {
    return (
      <button
        onClick={onOpen}
        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors active:scale-[0.99]"
      >
        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex-1 text-left truncate">
          {label}
        </span>
        <span className="text-[10px] text-emerald-600">Change</span>
      </button>
    );
  }

  if (state === "denied") {
    return (
      <button
        onClick={onOpen}
        className="w-full flex items-start gap-2 px-3 py-2.5 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/50 hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors text-left"
      >
        <AlertCircle className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-orange-700 dark:text-orange-300">Location permission denied</p>
          <p className="text-[11px] text-orange-600/80 mt-0.5">Tap to try again or enter a city manually.</p>
        </div>
      </button>
    );
  }

  if (state === "error") {
    return (
      <button
        onClick={onOpen}
        className="w-full flex items-start gap-2 px-3 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 hover:bg-red-100 transition-colors text-left"
      >
        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-red-700 dark:text-red-300">Couldn't get location</p>
          <p className="text-[11px] text-red-600/80 mt-0.5">Tap to try again.</p>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onOpen}
      className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors active:scale-[0.99]"
    >
      <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex-1 text-left">
        Set your location
      </span>
      <span className="text-[10px] text-gray-400">for accurate times</span>
    </button>
  );
}
