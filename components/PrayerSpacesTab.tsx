"use client";
import { useMemo, useState } from "react";
import { Map as MapIcon, Star, Flag, ChevronDown } from "lucide-react";
import { PrayerSpace, SpaceTag } from "@/types";
import { cn } from "@/lib/utils";
import { haptics } from "@/lib/haptics";
import { toggleFavourite, isFavourite } from "@/lib/storage";
import Tag from "@/components/ui/Tag";
import SearchInput from "@/components/ui/SearchInput";
import Pill from "@/components/ui/Pill";
import GetDirections from "@/components/ui/GetDirections";
import TrustInfo from "@/components/ui/TrustInfo";
import CampusMap from "@/components/CampusMap";
import ReportModal from "@/components/ReportModal";

const TC: Record<SpaceTag, "teal" | "violet" | "gold" | "slate" | "amber" | "blue"> = {
  quiet: "slate",
  wudu: "teal",
  "women-friendly": "violet",
  jummah: "gold",
  parking: "amber",
  accessible: "blue",
};

interface Props { spaces: PrayerSpace[]; mounted: boolean; }

export default function PrayerSpacesTab({ spaces, mounted }: Props) {
  const [search, setSearch] = useState("");
  const [typeF, setTypeF] = useState<"all" | "campus" | "mosque">("all");
  const [mapOpen, setMapOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<PrayerSpace | null>(null);
  const [, setFavVer] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sorted = useMemo(() => {
    const f = spaces.filter((s) => {
      const q = search.toLowerCase();
      return (
        (!q || s.name.toLowerCase().includes(q) || s.building.toLowerCase().includes(q)) &&
        (typeF === "all" || s.type === typeF)
      );
    });
    // Featured first, "not yet open" entries last
    return f.sort((a, b) => {
      const aNotOpen = a.name.toLowerCase().includes("not yet open") ? 1 : 0;
      const bNotOpen = b.name.toLowerCase().includes("not yet open") ? 1 : 0;
      if (aNotOpen !== bNotOpen) return aNotOpen - bNotOpen;
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [spaces, search, typeF]);

  const doFav = (id: string) => {
    haptics.selection();
    toggleFavourite(id);
    setFavVer((v) => v + 1);
  };

  const toggleExpand = (id: string) => {
    haptics.selection();
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Prayer Spaces</h2>
        <button
          onClick={() => { haptics.selection(); setMapOpen(true); }}
          className="flex items-center gap-1 text-xs font-semibold text-emerald-600"
        >
          <MapIcon className="w-3.5 h-3.5" />
          Map
        </button>
      </div>

      <SearchInput value={search} onChange={setSearch} placeholder="Search spaces…" />
      <div className="flex gap-1.5">
        <Pill active={typeF === "all"} onClick={() => setTypeF("all")}>All</Pill>
        <Pill active={typeF === "campus"} onClick={() => setTypeF("campus")}>Campus</Pill>
        <Pill active={typeF === "mosque"} onClick={() => setTypeF("mosque")}>Mosques</Pill>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-10 text-gray-400 text-sm">No spaces found.</div>
      ) : (
        <div className="space-y-3">
          {sorted.map((s) => {
            const fav = mounted && isFavourite(s.id);
            const isExpanded = expandedId === s.id;
            const isNotOpen = s.name.toLowerCase().includes("not yet open");
            return (
              <div
                key={s.id}
                className={cn(
                  "bg-white dark:bg-gray-900 border rounded-2xl overflow-hidden shadow-sm transition-all",
                  isNotOpen && "opacity-75",
                  s.featured
                    ? "border-emerald-400 dark:border-emerald-600 border-2"
                    : s.type === "mosque"
                    ? "border-l-4 border-l-emerald-500 border-gray-200 dark:border-gray-800"
                    : "border-gray-200 dark:border-gray-800"
                )}
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleExpand(s.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleExpand(s.id);
                    }
                  }}
                  className="w-full text-left p-4 cursor-pointer"
                >
                  {s.featured && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-bold mb-2">
                      <Star className="w-2.5 h-2.5" /> Primary Masjid
                    </span>
                  )}
                  {isNotOpen && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-[9px] font-bold mb-2">
                      Not yet open
                    </span>
                  )}

                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className={cn("font-bold text-gray-900 dark:text-gray-100 leading-snug", s.featured ? "text-base" : "text-[15px]")}>
                        {s.name}
                      </h3>
                      <p className="text-[12px] text-gray-500 mt-0.5">
                        {s.building}
                        {s.floor && s.floor !== "—" && ` — ${s.floor}`}
                      </p>
                      {s.distance && <p className="text-[11px] text-emerald-600 font-medium">{s.distance}</p>}
                    </div>

                    {/* Favourite star — separate button, stopPropagation */}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); doFav(s.id); }}
                      className={cn(
                        "p-2 shrink-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
                        fav ? "text-yellow-500" : "text-gray-300"
                      )}
                      aria-label={fav ? "Remove from favourites" : "Save to favourites"}
                    >
                      <Star className="w-4 h-4" fill={fav ? "currentColor" : "none"} />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {s.tags.slice(0, 4).map((t) => <Tag key={t} label={t} variant={TC[t] || "slate"} />)}
                  </div>

                  <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-400">
                    <ChevronDown className={cn("w-3 h-3 transition-transform", isExpanded && "rotate-180")} />
                    <span>{isExpanded ? "Tap to collapse" : "Tap for details"}</span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-2 animate-fade-in border-t border-gray-100 dark:border-gray-800">
                    <p className="text-[13px] text-gray-600 dark:text-gray-300 leading-relaxed pt-2">{s.notes}</p>
                    {!isNotOpen && <GetDirections name={s.name} coordinates={s.coordinates} address={s.address} />}
                    <TrustInfo entry={s} showHours />
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setReportTarget(s); }}
                      className="text-xs text-gray-500 flex items-center gap-1 hover:text-orange-600 pt-1"
                    >
                      <Flag className="w-3 h-3" />
                      Report Issue
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {mapOpen && <CampusMap spaces={spaces} onClose={() => setMapOpen(false)} />}
      {reportTarget && (
        <ReportModal
          entityId={reportTarget.id}
          entityType="space"
          entityName={reportTarget.name}
          open={true}
          mode="entry"
          onClose={() => setReportTarget(null)}
        />
      )}
    </div>
  );
}
