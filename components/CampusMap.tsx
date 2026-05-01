"use client";

import { useState } from "react";
import { PrayerSpace } from "@/types";
import { cn } from "@/lib/utils";
import { haptics } from "@/lib/haptics";
import GetDirections from "@/components/ui/GetDirections";

const BOUNDS = { minLat: 37.215, maxLat: 37.245, minLng: -80.432, maxLng: -80.408 };
const W = 380, H = 420;

function toXY(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * W;
  const y = H - ((lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat)) * H;
  return { x: Math.max(16, Math.min(W - 16, x)), y: Math.max(16, Math.min(H - 16, y)) };
}

/** Push overlapping pins apart so every dot is individually tappable. */
function spreadPins(spaces: PrayerSpace[]): { space: PrayerSpace; x: number; y: number }[] {
  const pins = spaces
    .filter((s) => s.coordinates)
    .map((s) => {
      const { x, y } = toXY(s.coordinates!.lat, s.coordinates!.lng);
      return { space: s, x, y };
    });
  const MIN_DIST = 34;
  // Run a few iterations of pairwise separation
  for (let iter = 0; iter < 4; iter++) {
    for (let i = 0; i < pins.length; i++) {
      for (let j = i + 1; j < pins.length; j++) {
        const dx = pins[j].x - pins[i].x, dy = pins[j].y - pins[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.0001;
        if (dist < MIN_DIST) {
          const push = (MIN_DIST - dist) / 2;
          const nx = dx / dist, ny = dy / dist;
          pins[i].x = Math.max(16, Math.min(W - 16, pins[i].x - nx * push));
          pins[i].y = Math.max(16, Math.min(H - 16, pins[i].y - ny * push));
          pins[j].x = Math.max(16, Math.min(W - 16, pins[j].x + nx * push));
          pins[j].y = Math.max(16, Math.min(H - 16, pins[j].y + ny * push));
        }
      }
    }
  }
  return pins;
}

interface Props { spaces: PrayerSpace[]; onClose: () => void; }

export default function CampusMap({ spaces, onClose }: Props) {
  const [selected, setSelected] = useState<PrayerSpace | null>(null);
  const pins = spreadPins(spaces);

  // Satellite tile (ESRI World Imagery) via an open static tile provider.
  // Centred on VT campus. If the tile fails to load we fall back to a
  // styled emerald background so the pins remain usable.
  const centerLat = (BOUNDS.minLat + BOUNDS.maxLat) / 2;
  const centerLng = (BOUNDS.minLng + BOUNDS.maxLng) / 2;
  const satelliteUrl = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?bbox=${BOUNDS.minLng},${BOUNDS.minLat},${BOUNDS.maxLng},${BOUNDS.maxLat}&bboxSR=4326&size=760,840&imageSR=4326&format=jpg&f=image`;

  return (
    <div className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-end justify-center" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-t-2xl max-h-[90vh] overflow-y-auto animate-slide-up"
      >
        <div className="sticky top-0 bg-white dark:bg-gray-900 z-10 px-5 pt-5 pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Campus Prayer Map</h2>
            <button onClick={onClose} className="text-xs font-semibold text-gray-500 hover:text-gray-700">
              Close
            </button>
          </div>
        </div>

        <div className="px-4 py-4">
          {/* Map with satellite background */}
          <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800" style={{ minHeight: 380 }}>
            {/* Satellite tile */}
            <img
              src={satelliteUrl}
              alt="Virginia Tech satellite view"
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
            {/* Dimming overlay so the pins stand out against the imagery */}
            <div className="absolute inset-0 bg-gray-900/20 dark:bg-gray-950/40" />

            <svg viewBox={`0 0 ${W} ${H}`} className="relative w-full" style={{ minHeight: 380 }}>
              <text x={W / 2} y={18} textAnchor="middle" className="fill-white" fontSize="10" fontWeight="700" style={{ paintOrder: "stroke", stroke: "rgba(0,0,0,0.6)", strokeWidth: 3 } as any}>
                Virginia Tech — Prayer Spaces
              </text>

              {pins.map(({ space: s, x, y }) => {
                const isSelected = selected?.id === s.id;
                const isFeatured = s.featured;
                const isMosque = s.type === "mosque";
                return (
                  <g
                    key={s.id}
                    onClick={() => { haptics.selection(); setSelected(isSelected ? null : s); }}
                    className="cursor-pointer"
                  >
                    {/* Invisible large tap target */}
                    <circle cx={x} cy={y} r="22" fill="transparent" />
                    {isFeatured && <circle cx={x} cy={y} r="16" className="fill-emerald-400/25 animate-pulse-soft" />}
                    <circle
                      cx={x}
                      cy={y}
                      r={isFeatured ? 10 : isMosque ? 9 : 7}
                      className={cn(
                        isSelected
                          ? "fill-emerald-400 stroke-white"
                          : isFeatured
                          ? "fill-emerald-500 stroke-white"
                          : isMosque
                          ? "fill-emerald-500 stroke-white"
                          : "fill-blue-500 stroke-white"
                      )}
                      strokeWidth={isSelected ? 3 : 2}
                    />
                    <text
                      x={x}
                      y={y + (isFeatured ? 22 : 18)}
                      textAnchor="middle"
                      fill="white"
                      fontSize="8"
                      fontWeight="700"
                      style={{ paintOrder: "stroke", stroke: "rgba(0,0,0,0.75)", strokeWidth: 2.5 } as any}
                    >
                      {s.name.length > 18 ? s.name.slice(0, 16) + "…" : s.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-3 px-1">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-emerald-500 border border-white" />
              <span className="text-[10px] text-gray-500">Mosque</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 border border-white" />
              <span className="text-[10px] text-gray-500">Campus</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-400/40 border-2 border-emerald-500" />
              <span className="text-[10px] text-gray-500">Featured</span>
            </div>
          </div>

          {/* Selected detail */}
          {selected && (
            <div className="mt-4 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/50 bg-white dark:bg-gray-900 shadow-sm animate-fade-in">
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">{selected.name}</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {selected.building}
                {selected.floor && ` — ${selected.floor}`}
              </p>
              {selected.distance && <p className="text-xs text-emerald-600 font-medium mt-0.5">{selected.distance}</p>}
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">{selected.notes}</p>
              <GetDirections name={selected.name} coordinates={selected.coordinates} address={selected.address} />
            </div>
          )}

          <a
            href="https://www.google.com/maps/search/prayer+spaces+near+Virginia+Tech/@37.2296,-80.4139,15z"
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-3 text-center text-xs font-semibold text-emerald-600 hover:underline"
          >
            Open full map in Google Maps →
          </a>
        </div>
      </div>
    </div>
  );
}
