"use client";
import { ShieldCheck, Info, AlertTriangle } from "lucide-react";
import DietaryBadge from "@/components/ui/DietaryBadge";
import Tag from "@/components/ui/Tag";

/**
 * Inline status definitions. Used inside the Settings modal.
 * No "Not Halal" section — not-halal entries are no longer shown
 * in the app, so documenting them would confuse users.
 */
export default function StatusExplainer() {
  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
        These labels represent our best understanding and are <strong>not</strong> religious rulings.
      </p>

      <div>
        <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Dietary Statuses</h4>
        {[
          {
            type: "halal" as const,
            icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />,
            b: "border-emerald-200 dark:border-emerald-800/60",
            bg: "bg-emerald-50/50 dark:bg-emerald-950/30",
            desc: "Confirmed halal via official menu labelling, certification, or direct owner confirmation.",
          },
          {
            type: "kosher" as const,
            icon: <ShieldCheck className="w-4 h-4 text-blue-600" />,
            b: "border-blue-200 dark:border-blue-800/60",
            bg: "bg-blue-50/50 dark:bg-blue-950/30",
            desc: "Carries a recognised kosher certification symbol (OU, OK, Triangle-K). Not the same as halal.",
          },
          {
            type: "vegetarian" as const,
            icon: <ShieldCheck className="w-4 h-4 text-lime-600" />,
            b: "border-lime-200 dark:border-lime-800/60",
            bg: "bg-lime-50/50 dark:bg-lime-950/30",
            desc: "No meat ingredients. Suitable for vegetarians, and usually a safe option for Muslims avoiding questionable meat.",
          },
          {
            type: "doubtful" as const,
            icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
            b: "border-amber-200 dark:border-amber-800/60",
            bg: "bg-amber-50/50 dark:bg-amber-950/30",
            desc: "Status unclear. Seafood from non-halal kitchens, cross-contamination concerns, or per-product labels required. Exercise caution.",
          },
        ].map((s) => (
          <div key={s.type} className={`rounded-xl border p-3 mb-2 ${s.b} ${s.bg}`}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-white/80 dark:bg-gray-800/80 flex items-center justify-center">
                {s.icon}
              </div>
              <DietaryBadge type={s.type} />
            </div>
            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>

      <div>
        <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Verification Levels</h4>
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-3 space-y-2">
          {[
            { l: "Verified", d: "Confirmed via official dining pages, corporate sources, or the business directly", v: "teal" as const },
            { l: "Community", d: "Reported by students — widely believed but not independently audited", v: "blue" as const },
            { l: "Unverified", d: "Placeholder entry that still needs checking", v: "slate" as const },
            { l: "Outdated", d: "Information may have changed — flagged manually by our team for review", v: "orange" as const },
          ].map((v) => (
            <div key={v.l} className="flex items-start gap-2">
              <Tag label={v.l} variant={v.v} />
              <p className="text-[11px] text-gray-500 dark:text-gray-400 pt-0.5">{v.d}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 p-3">
        <div className="flex gap-2">
          <Info className="w-3.5 h-3.5 text-gray-500 shrink-0 mt-0.5" />
          <div className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed space-y-1">
            <p><strong>Important:</strong> All information is guidance. Not a fatwa or guarantee.</p>
            <p>Menu items rotate daily — check the VT Dining menus link on each food card.</p>
            <p>Grocery products are verified per-product, not per-brand.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
