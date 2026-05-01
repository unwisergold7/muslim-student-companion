"use client";
import { useMemo, useState } from "react";
import { AlertTriangle, Info, ExternalLink, Star, Flag, RotateCcw, ChevronDown } from "lucide-react";
import { FoodEntry, DietaryType } from "@/types";
import { cn } from "@/lib/utils";
import { haptics } from "@/lib/haptics";
import { toggleFavourite, isFavourite } from "@/lib/storage";
import DietaryBadge from "@/components/ui/DietaryBadge";
import SearchInput from "@/components/ui/SearchInput";
import Pill from "@/components/ui/Pill";
import GetDirections from "@/components/ui/GetDirections";
import TrustInfo from "@/components/ui/TrustInfo";
import ReportModal from "@/components/ReportModal";
import FoodGuideModal from "@/components/FoodGuideModal";

const BORDER: Record<DietaryType, string> = {
  halal: "border-l-emerald-500",
  kosher: "border-l-blue-500",
  doubtful: "border-l-amber-500",
  "not-halal": "border-l-red-500",
  vegetarian: "border-l-lime-500",
  vegan: "border-l-green-500",
};
const CATS: Record<string, string> = {
  all: "All",
  "dining-hall": "Dining",
  "off-campus": "Off Campus",
  grocery: "Grocery",
};
const DIET_FILTERS: { k: DietaryType; l: string; d: string }[] = [
  { k: "halal", l: "Halal", d: "bg-emerald-500" },
  { k: "kosher", l: "Kosher", d: "bg-blue-500" },
  { k: "vegetarian", l: "Vegetarian", d: "bg-lime-500" },
  { k: "doubtful", l: "Seafood / Doubtful", d: "bg-amber-500" },
];

function FoodCard({
  food, onReport, onFav, mounted,
}: {
  food: FoodEntry;
  onReport: (f: FoodEntry) => void;
  onFav: (id: string) => void;
  mounted: boolean;
}) {
  const [exp, setExp] = useState(false);
  const fav = mounted && isFavourite(food.id);
  const isRotating = food.availability === "menu_rotates";

  const toggleExpand = () => { haptics.selection(); setExp(!exp); };

  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm border-l-4",
        BORDER[food.dietary_type] || "border-l-gray-300"
      )}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={toggleExpand}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleExpand(); }
        }}
        className="w-full text-left p-4 cursor-pointer"
      >
        {food.hall_name && (
          <p className="text-[10px] text-gray-400 mb-0.5">
            {food.hall_name}{food.station_name && ` → ${food.station_name}`}
          </p>
        )}
        {food.brand && (
          <p className="text-[10px] text-gray-400 mb-0.5">
            {food.brand}{food.product_line && ` · ${food.product_line}`}
          </p>
        )}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-[15px] font-bold text-gray-900 dark:text-gray-100 leading-snug">{food.name}</h3>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <p className="text-[12px] text-gray-500">{food.location}</p>
              {isRotating && (
                <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-600 font-medium">
                  <RotateCcw className="w-2.5 h-2.5" />
                  Rotates
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onFav(food.id); }}
              className={cn(
                "p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
                fav ? "text-yellow-500" : "text-gray-300"
              )}
              aria-label={fav ? "Remove from favourites" : "Save to favourites"}
            >
              <Star className="w-4 h-4" fill={fav ? "currentColor" : "none"} />
            </button>
            <DietaryBadge type={food.dietary_type} />
          </div>
        </div>

        <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-400">
          <ChevronDown className={cn("w-3 h-3 transition-transform", exp && "rotate-180")} />
          <span>{exp ? "Tap to collapse" : "Tap for details"}</span>
        </div>
      </div>

      {exp && (
        <div className="px-4 pb-4 space-y-2 border-t border-gray-100 dark:border-gray-800 animate-fade-in">
          <p className="text-[13px] text-gray-600 dark:text-gray-300 leading-relaxed pt-2">
            {food.explanation}
          </p>
          {food.notes && (
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">⚠ {food.notes}</p>
          )}
          {food.label_note && (
            <p className="text-xs text-orange-600 font-medium bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/50 rounded-lg px-2.5 py-1.5">
              {food.label_note}
            </p>
          )}
          {food.live_menu_url && (
            <a
              href={food.live_menu_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 hover:bg-emerald-100 transition-colors"
            >
              Open live VT menu <ExternalLink className="w-3 h-3" />
            </a>
          )}
          <GetDirections name={food.name} coordinates={food.coordinates} address={food.address} />
          <TrustInfo entry={food} showHours />
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onReport(food); }}
              className="text-xs text-gray-500 flex items-center gap-1 hover:text-orange-600"
            >
              <Flag className="w-3 h-3" />
              Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface Props { food: FoodEntry[]; mounted: boolean; }

export default function FoodTab({ food, mounted }: Props) {
  const [search, setSearch] = useState("");
  const [dietF, setDietF] = useState<DietaryType | null>(null);
  const [catF, setCatF] = useState("all");
  const [reportTarget, setReportTarget] = useState<FoodEntry | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const [, setFavVer] = useState(0);

  const doFav = (id: string) => {
    haptics.selection();
    toggleFavourite(id);
    setFavVer((v) => v + 1);
  };

  const filtered = useMemo(() => {
    return food.filter((f) => {
      const q = search.toLowerCase();
      const text = `${f.name} ${f.location} ${f.hall_name || ""} ${f.station_name || ""} ${f.brand || ""}`.toLowerCase();
      return (
        (!q || text.includes(q)) &&
        (!dietF || f.dietary_type === dietF) &&
        (catF === "all" || f.category === catF)
      );
    });
  }, [food, search, dietF, catF]);

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Food Guide</h2>
        <button
          onClick={() => { haptics.selection(); setGuideOpen(true); }}
          className="flex items-center gap-1 text-xs font-semibold text-emerald-600"
        >
          <Info className="w-3.5 h-3.5" />
          Guide
        </button>
      </div>

      <div className="flex items-start gap-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 px-3.5 py-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 dark:text-amber-300">
          Menus rotate daily. Always check the live menu before going.
        </p>
      </div>

      <SearchInput value={search} onChange={setSearch} placeholder="Search items, halls, brands…" />

      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {Object.keys(CATS).map((c) => (
          <Pill key={c} active={catF === c} onClick={() => { haptics.selection(); setCatF(c); }}>
            {CATS[c]}
          </Pill>
        ))}
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {DIET_FILTERS.map((sf) => (
          <button
            key={sf.k}
            onClick={() => { haptics.selection(); setDietF(dietF === sf.k ? null : sf.k); }}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all",
              dietF === sf.k
                ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300"
                : "bg-white dark:bg-gray-900 text-gray-500 border-gray-200 dark:border-gray-700"
            )}
          >
            <span className={cn("w-1.5 h-1.5 rounded-full", sf.d)} />
            {sf.l}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-10 text-gray-400 text-sm">No results.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((f) => (
            <FoodCard
              key={f.id}
              food={f}
              onReport={(e) => setReportTarget(e)}
              onFav={doFav}
              mounted={mounted}
            />
          ))}
        </div>
      )}

      <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 p-3">
        <p className="text-[10px] text-gray-500 dark:text-gray-400 text-center">
          Guidance only · Not a fatwa ·{" "}
          <a
            href="https://dining.vt.edu/menus.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 hover:underline"
          >
            VT Dining menus
          </a>
        </p>
      </div>

      <FoodGuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />

      {reportTarget && (
        <ReportModal
          entityId={reportTarget.id}
          entityType="food"
          entityName={reportTarget.name}
          open={true}
          mode="entry"
          onClose={() => setReportTarget(null)}
        />
      )}
    </div>
  );
}
