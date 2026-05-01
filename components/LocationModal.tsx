"use client";
import { useState, useEffect } from "react";
import { MapPin, X, Loader2, Check, AlertCircle, ChevronRight } from "lucide-react";
import { haptics } from "@/lib/haptics";
import type { LocationState } from "@/types";

interface Props {
  open: boolean;
  state: LocationState;
  currentLabel: string;
  onClose: () => void;
  onEnableLocation: () => void;
  onSetManualCity: (city: string) => void;
  onClearLocation: () => void;
}

/**
 * In-app location sheet. Replaces every `window.prompt()` usage and
 * surfaces clean loading/success/denied/manual states. Users can:
 *  • Tap "Use current location" to trigger the native permission
 *  • Type a city as a fallback
 *  • Clear their stored location
 */
export default function LocationModal({
  open, state, currentLabel, onClose,
  onEnableLocation, onSetManualCity, onClearLocation,
}: Props) {
  const [mode, setMode] = useState<"choose" | "manual">("choose");
  const [city, setCity] = useState("");

  useEffect(() => {
    if (open) { setMode("choose"); setCity(""); }
  }, [open]);

  if (!open) return null;

  const submitManual = () => {
    const c = city.trim();
    if (!c) return;
    haptics.medium();
    onSetManualCity(c);
  };

  return (
    <div
      className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-end justify-center"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-t-2xl animate-slide-up"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>

        <div className="px-5 pb-6 pt-2">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                {mode === "manual" ? "Enter Your City" : "Your Location"}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {mode === "manual" ? "We'll use this for prayer times" : "Keeps prayer times and the Qibla accurate"}
              </p>
            </div>
            <button
              onClick={() => { haptics.selection(); onClose(); }}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {mode === "choose" && (
            <>
              {/* Current status banner */}
              <CurrentStatus state={state} label={currentLabel} />

              <div className="space-y-2 mt-3">
                <button
                  onClick={() => { haptics.medium(); onEnableLocation(); }}
                  disabled={state === "requesting"}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.99] transition-all disabled:opacity-60"
                >
                  <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
                    {state === "requesting" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <MapPin className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-[14px] font-semibold">
                      {state === "requesting" ? "Getting location…" : "Use current location"}
                    </p>
                    <p className="text-[11px] text-white/75">Most accurate — runs on your device only</p>
                  </div>
                </button>

                <button
                  onClick={() => { haptics.selection(); setMode("manual"); }}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-[0.99] transition-all"
                >
                  <div className="w-9 h-9 rounded-xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-[14px] font-semibold text-gray-900 dark:text-gray-100">
                      Enter a city instead
                    </p>
                    <p className="text-[11px] text-gray-500">Type your city manually</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>

                {state !== "idle" && state !== "requesting" && (
                  <button
                    onClick={() => { haptics.selection(); onClearLocation(); onClose(); }}
                    className="w-full py-3 text-[12px] font-medium text-gray-500 hover:text-gray-700"
                  >
                    Clear location
                  </button>
                )}
              </div>

              <p className="text-[11px] text-gray-400 leading-relaxed mt-4 text-center">
                Your coordinates are never stored or shared. They're used only to
                calculate your prayer times and the direction of the Qibla.
              </p>
            </>
          )}

          {mode === "manual" && (
            <div className="space-y-3">
              <label htmlFor="city-input" className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                City
              </label>
              <input
                id="city-input"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitManual()}
                placeholder="e.g. Blacksburg"
                autoFocus
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-[16px] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => { haptics.selection(); setMode("choose"); }}
                  className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-[13px] font-semibold text-gray-700 dark:text-gray-300"
                >
                  Back
                </button>
                <button
                  onClick={submitManual}
                  disabled={!city.trim()}
                  className="flex-[2] py-3 rounded-xl bg-emerald-600 text-white text-[13px] font-semibold hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CurrentStatus({ state, label }: { state: LocationState; label: string }) {
  if (state === "idle") {
    return (
      <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 px-4 py-3">
        <p className="text-[12px] font-semibold text-gray-600 dark:text-gray-400">No location set yet</p>
        <p className="text-[11px] text-gray-500 mt-0.5">Prayer times default to Blacksburg, VA.</p>
      </div>
    );
  }
  if (state === "requesting") {
    return (
      <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 px-4 py-3 flex items-center gap-3">
        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
        <p className="text-[12px] font-semibold text-blue-700 dark:text-blue-300">Getting your location…</p>
      </div>
    );
  }
  if (state === "granted" || state === "manual") {
    return (
      <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 px-4 py-3 flex items-center gap-3">
        <Check className="w-4 h-4 text-emerald-600" />
        <div>
          <p className="text-[12px] font-semibold text-emerald-700 dark:text-emerald-300">{label}</p>
          <p className="text-[11px] text-emerald-600/80">
            {state === "manual" ? "Manual — tap to update" : "Location active"}
          </p>
        </div>
      </div>
    );
  }
  if (state === "denied") {
    return (
      <div className="rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/50 px-4 py-3 flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-[12px] font-semibold text-orange-700 dark:text-orange-300">Location access denied</p>
          <p className="text-[11px] text-orange-600/80 leading-relaxed mt-0.5">
            Prayer times may be less accurate. Try again, or enter a city manually.
            You can enable location any time in your phone's Settings.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 px-4 py-3 flex items-start gap-3">
      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
      <div>
        <p className="text-[12px] font-semibold text-red-700 dark:text-red-300">Couldn't get location</p>
        <p className="text-[11px] text-red-600/80 mt-0.5">Try again or enter a city manually.</p>
      </div>
    </div>
  );
}
