"use client";
import { useState, useEffect, useCallback } from "react";
import { Navigation } from "lucide-react";
import { calculateQiblaBearing, bearingToCardinal } from "@/lib/qibla";
import { haptics } from "@/lib/haptics";

/**
 * Kaaba icon — filled black cube. Represents Makkah and stays
 * stationary at the top of the compass ring. The user rotates their
 * phone until the green needle points at the Kaaba.
 */
function KaabaIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <rect x="5" y="6" width="14" height="14" rx="0.5" fill="#111827" />
      {/* Gold band — simplified Kiswah detail */}
      <rect x="5" y="11.5" width="14" height="1.2" fill="#D4A574" opacity="0.9" />
      {/* Door panel */}
      <rect x="10" y="13" width="4" height="6" fill="#D4A574" opacity="0.7" />
    </svg>
  );
}

export default function QiblaCompass({ lat, lng }: { lat: number | null; lng: number | null }) {
  const [heading, setHeading] = useState<number | null>(null);
  const [perm, setPerm] = useState<"idle" | "requesting" | "granted" | "denied">("idle");
  const bearing = lat !== null && lng !== null ? calculateQiblaBearing(lat, lng) : null;

  const requestCompass = useCallback(async () => {
    haptics.light();
    setPerm("requesting");
    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof (DeviceOrientationEvent as any).requestPermission === "function"
    ) {
      try {
        const p = await (DeviceOrientationEvent as any).requestPermission();
        setPerm(p === "granted" ? "granted" : "denied");
      } catch {
        setPerm("denied");
      }
    } else {
      setPerm("granted");
    }
  }, []);

  useEffect(() => {
    if (perm !== "granted") return;
    const handler = (e: any) => {
      let v: number | null = null;
      if (e.webkitCompassHeading !== undefined) v = e.webkitCompassHeading;
      else if (e.alpha !== null) v = (360 - e.alpha) % 360;
      if (v !== null) setHeading(v);
    };
    window.addEventListener("deviceorientationabsolute", handler, true);
    window.addEventListener("deviceorientation", handler, true);
    return () => {
      window.removeEventListener("deviceorientationabsolute", handler, true);
      window.removeEventListener("deviceorientation", handler, true);
    };
  }, [perm]);

  if (!bearing) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        Enable location to see the Qibla direction.
      </div>
    );
  }

  const hasCompass = heading !== null;
  // The needle rotates to point at the stationary Kaaba icon.
  // Ring rotates opposite to user heading so cardinal letters stay true.
  const needleRotation = hasCompass ? (bearing - heading + 360) % 360 : bearing;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 text-center shadow-sm">
      <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-1">Qibla Direction</p>
      <p className="text-xs text-gray-400 mb-4">
        Rotate your phone until the green needle points at the Kaaba.
      </p>

      <div className="relative w-52 h-52 mx-auto mb-4">
        {/* Outer compass ring with N/E/S/W — rotates opposite to heading */}
        <div
          className="absolute inset-0 rounded-full border-2 border-gray-200 dark:border-gray-700"
          style={{
            transform: hasCompass ? `rotate(${-heading}deg)` : "none",
            transition: "transform 0.3s ease-out",
          }}
        >
          {["N", "E", "S", "W"].map((d, i) => (
            <div
              key={d}
              className="absolute text-[11px] font-bold text-gray-400 dark:text-gray-500"
              style={{
                top: i === 0 ? "6px" : i === 2 ? "auto" : "50%",
                bottom: i === 2 ? "6px" : "auto",
                left: i === 3 ? "8px" : i === 1 ? "auto" : "50%",
                right: i === 1 ? "8px" : "auto",
                transform: i % 2 === 0 ? "translateX(-50%)" : "translateY(-50%)",
              }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Inner circular area */}
        <div className="absolute inset-5 rounded-full bg-gray-50 dark:bg-gray-800/60 flex items-center justify-center">
          {/* Stationary Kaaba icon at top — represents Makkah */}
          <div className="absolute top-1 left-1/2 -translate-x-1/2 z-20">
            <KaabaIcon className="w-7 h-7" />
          </div>

          {/* Rotating needle pointing toward Kaaba */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              transform: `rotate(${needleRotation}deg)`,
              transition: "transform 0.3s ease-out",
            }}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Top half — bright green (points at Kaaba) */}
              <div className="absolute top-8 left-1/2 -translate-x-1/2 w-0.5 h-[calc(50%-10px)] bg-emerald-500 rounded-full" />
              {/* Arrowhead at needle tip */}
              <div className="absolute top-[28px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[8px] border-b-emerald-500" />
              {/* Bottom half — faded tail */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-0.5 h-[calc(50%-16px)] bg-gray-300 dark:bg-gray-600 rounded-full opacity-40" />
            </div>
          </div>

          {/* Centre pivot */}
          <div className="w-3 h-3 rounded-full bg-emerald-600 dark:bg-emerald-400 z-10 shadow-md" />
        </div>
      </div>

      <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400" style={{ fontVariantNumeric: "tabular-nums" }}>
        {bearing.toFixed(1)}° {bearingToCardinal(bearing)}
      </p>

      {!hasCompass && perm === "idle" && (
        <button
          onClick={requestCompass}
          className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-full hover:bg-emerald-700 transition-colors active:scale-95"
        >
          <Navigation className="w-3.5 h-3.5" />
          Enable Live Compass
        </button>
      )}
      {perm === "denied" && <p className="text-xs text-red-500 mt-2">Compass permission denied.</p>}
      {hasCompass && (
        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
          Live — align the needle with the Kaaba
        </p>
      )}
      <p className="mt-3 text-[10px] text-gray-400">
        {hasCompass ? "Hold phone flat. Figure-8 to calibrate." : "Tap Enable Live Compass on mobile."}
      </p>
    </div>
  );
}
