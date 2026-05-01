"use client";

import { useEffect, useState } from "react";
import {
  MapPin, UtensilsCrossed, Moon, Loader2, Compass, Map as MapIcon,
  ExternalLink, Users, Star, ArrowRight,
} from "lucide-react";
import { PrayerTimesData, TabKey, FoodEntry, PrayerSpace, CommunityLink } from "@/types";
import { getCurrentPrayer, getNextPrayer, formatCountdown, getHijriDate, cn } from "@/lib/utils";
import { haptics } from "@/lib/haptics";
import { getFavourites } from "@/lib/storage";
import Toggle from "@/components/ui/Toggle";
import DietaryBadge from "@/components/ui/DietaryBadge";
import GetDirections from "@/components/ui/GetDirections";
import CampusMap from "@/components/CampusMap";

interface Props {
  times: PrayerTimesData;
  loading: boolean;
  ramadan: boolean;
  setRamadan: (v: boolean) => void;
  onNavigate: (tab: TabKey) => void;
  food: FoodEntry[];
  spaces: PrayerSpace[];
  links: CommunityLink[];
  mounted: boolean;
}

/** Subtle 8-point Islamic star motif for decorative backgrounds. */
function StarMotif({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="1" className={className}>
      <rect x="30" y="30" width="60" height="60" />
      <rect x="30" y="30" width="60" height="60" transform="rotate(45 60 60)" />
      <circle cx="60" cy="60" r="26" />
    </svg>
  );
}

export default function HomeTab({
  times, loading, ramadan, setRamadan, onNavigate,
  food, spaces, links, mounted,
}: Props) {
  const [now, setNow] = useState<Date | null>(null);
  const [mapOpen, setMapOpen] = useState(false);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const next = now ? getNextPrayer(now, times) : null;
  const current = now ? getCurrentPrayer(now, times) : null;

  const dateStr = now
    ? now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })
    : "";
  const hijri = now ? getHijriDate(now) : "";

  const diningHighlights = food
    .filter((f) => f.category === "dining-hall" && f.dietary_type === "halal" && f.verification_status === "verified")
    .slice(0, 3);

  const favIds = mounted ? getFavourites() : [];
  const favFood = food.filter((f) => favIds.includes(f.id));
  const favSpaces = spaces.filter((s) => favIds.includes(s.id));

  const primaryMasjid = spaces.find((s) => s.featured);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* ── Greeting card with Hijri date and star motif ─────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-900 via-emerald-700 to-emerald-600 p-5 text-white shadow-lg shadow-emerald-900/25">
        <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white/[0.06]" />
        <StarMotif className="absolute -bottom-6 -right-6 w-32 h-32 text-white/[0.07]" />

        <div className="relative">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-white/60 mb-0.5">
            Assalamu Alaikum
          </p>
          <p
            className="text-[14px] text-white/50 mb-3 font-medium"
            style={{ fontFamily: "'Amiri', 'Noto Naskh Arabic', serif" }}
            dir="rtl"
            lang="ar"
          >
            السلام عليكم
          </p>

          <div className="text-[12px] text-white/55 mb-4 min-h-[16px]" suppressHydrationWarning>
            {dateStr ? (
              <>
                {dateStr}
                {hijri && (
                  <>
                    <span className="mx-1.5 text-white/30">✦</span>
                    <span className="text-white/50">{hijri}</span>
                  </>
                )}
              </>
            ) : "\u00A0"}
          </div>

          <div className="flex items-end justify-between min-h-[64px]">
            <div>
              {loading || !now ? (
                <div className="flex items-center gap-2 py-3">
                  <Loader2 className="w-5 h-5 animate-spin text-white/60" />
                </div>
              ) : (
                <>
                  <p className="text-[10px] font-medium text-white/60 mb-0.5">Current</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold tracking-tight">{current?.name || "Fajr"}</span>
                  </div>
                  {next && (
                    <div className="inline-block bg-white/[0.16] rounded-full px-3 py-1 text-[12px] font-semibold mt-2">
                      {next.name} in {formatCountdown(next.remaining)}
                    </div>
                  )}
                </>
              )}
            </div>
            <button
              onClick={() => { haptics.selection(); onNavigate("times"); }}
              className="text-[10px] text-white/70 hover:text-white underline underline-offset-2 pb-1"
            >
              All times →
            </button>
          </div>
        </div>
      </div>

      {/* ── Ramadan mode ─────────────────────────────────────────── */}
      <div
        className={cn(
          "flex items-center justify-between rounded-xl px-4 py-3 border transition-all",
          ramadan
            ? "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800/50"
            : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
        )}
      >
        <div className="flex items-center gap-3">
          <Moon className={cn("w-4 h-4", ramadan ? "text-yellow-600" : "text-gray-400")} />
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Ramadan Mode</p>
            {ramadan && !loading && now && (
              <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-0.5">
                Suhoor: {times.Fajr} · Iftar: {times.Maghrib}
              </p>
            )}
          </div>
        </div>
        <Toggle on={ramadan} onChange={(v) => { haptics.selection(); setRamadan(v); }} color="gold" />
      </div>

      {/* ── Primary Masjid: content-rich card (not just a tab link) ─ */}
      {primaryMasjid && (
        <section>
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Primary Masjid</h3>
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/50">
              Featured
            </span>
          </div>
          <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border-2 border-emerald-400/60 dark:border-emerald-600/60 p-4 shadow-sm">
            <StarMotif className="absolute -top-4 -right-4 w-24 h-24 text-emerald-600/[0.06] dark:text-emerald-400/[0.06]" />
            <div className="relative">
              <h4 className="text-[16px] font-bold text-gray-900 dark:text-gray-100">
                {primaryMasjid.name}
              </h4>
              <p className="text-[12px] text-gray-500 mt-0.5">
                {primaryMasjid.building}
                {primaryMasjid.distance && ` · ${primaryMasjid.distance}`}
              </p>
              <p className="text-[12px] text-gray-600 dark:text-gray-400 mt-2 leading-relaxed line-clamp-2">
                {primaryMasjid.notes}
              </p>
              <div className="mt-1">
                <GetDirections
                  name={primaryMasjid.name}
                  coordinates={primaryMasjid.coordinates}
                  address={primaryMasjid.address}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Two specific shortcuts (not tab duplicates) ─────────── */}
      <section>
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-2.5">Shortcuts</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => { haptics.selection(); setMapOpen(true); }}
            className="group relative overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 text-left active:scale-[0.98] transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center mb-3">
              <MapIcon className="w-[18px] h-[18px] text-emerald-600" />
            </div>
            <p className="text-[13px] font-bold text-gray-900 dark:text-gray-100">Campus Map</p>
            <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
              Every space on a map
            </p>
            <ArrowRight className="absolute top-4 right-4 w-3.5 h-3.5 text-gray-300 group-hover:text-emerald-500 transition-colors" />
          </button>

          <button
            onClick={() => { haptics.selection(); onNavigate("times"); }}
            className="group relative overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 text-left active:scale-[0.98] transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center mb-3">
              <Compass className="w-[18px] h-[18px] text-emerald-700" />
            </div>
            <p className="text-[13px] font-bold text-gray-900 dark:text-gray-100">Find Qibla</p>
            <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
              Live compass to Makkah
            </p>
            <ArrowRight className="absolute top-4 right-4 w-3.5 h-3.5 text-gray-300 group-hover:text-emerald-500 transition-colors" />
          </button>
        </div>
      </section>

      {/* ── Favourites ────────────────────────────────────────────── */}
      {mounted && (favFood.length > 0 || favSpaces.length > 0) && (
        <section>
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-2.5 flex items-center gap-1.5">
            <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
            Your Favourites
          </h3>
          <div className="space-y-2">
            {favSpaces.map((s) => (
              <button
                key={s.id}
                onClick={() => { haptics.selection(); onNavigate("spaces"); }}
                className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-3 flex items-center justify-between text-left active:scale-[0.99]"
              >
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-gray-900 dark:text-gray-100 truncate">{s.name}</p>
                  <p className="text-[11px] text-gray-500 truncate">{s.building}</p>
                </div>
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
              </button>
            ))}
            {favFood.map((f) => (
              <button
                key={f.id}
                onClick={() => { haptics.selection(); onNavigate("food"); }}
                className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-3 flex items-center justify-between text-left active:scale-[0.99]"
              >
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-gray-900 dark:text-gray-100 truncate">{f.name}</p>
                  <p className="text-[11px] text-gray-500 truncate">{f.location}</p>
                </div>
                <DietaryBadge type={f.dietary_type} />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ── Verified halal on campus ─────────────────────────────── */}
      {diningHighlights.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Verified Halal on Campus</h3>
            <button
              onClick={() => { haptics.selection(); onNavigate("food"); }}
              className="text-[10px] text-emerald-600 font-semibold hover:underline"
            >
              See all →
            </button>
          </div>
          <div className="space-y-2">
            {diningHighlights.map((f) => (
              <div key={f.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    {f.hall_name && (
                      <p className="text-[10px] text-gray-400 mb-0.5">
                        {f.hall_name}{f.station_name && ` → ${f.station_name}`}
                      </p>
                    )}
                    <p className="text-[13px] font-semibold text-gray-900 dark:text-gray-100 truncate">{f.name}</p>
                  </div>
                  <DietaryBadge type={f.dietary_type} />
                </div>
                {f.live_menu_url && (
                  <a
                    href={f.live_menu_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-semibold mt-1.5 hover:underline"
                  >
                    Live menu <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Community ─────────────────────────────────────────────── */}
      {links.length > 0 && (
        <section>
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-2.5">Community</h3>
          <div className="space-y-2">
            {links.map((l) => (
              <a
                key={l.id}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-3 hover:border-emerald-300 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center shrink-0">
                  {l.category === "msa" ? <Users className="w-4 h-4 text-emerald-600" /> :
                   l.category === "mosque" ? <MapPin className="w-4 h-4 text-emerald-600" /> :
                   l.category === "dining-info" ? <UtensilsCrossed className="w-4 h-4 text-emerald-600" /> :
                   <ExternalLink className="w-4 h-4 text-emerald-600" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-emerald-600">
                    {l.title}
                  </p>
                  <p className="text-[11px] text-gray-500 truncate">{l.description}</p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              </a>
            ))}
          </div>
        </section>
      )}

      {mapOpen && <CampusMap spaces={spaces} onClose={() => setMapOpen(false)} />}
    </div>
  );
}
