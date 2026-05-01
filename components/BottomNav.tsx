"use client";
import { Home, Clock, UtensilsCrossed } from "lucide-react";
import { TabKey } from "@/types";
import { cn } from "@/lib/utils";
import { haptics } from "@/lib/haptics";

function MosqueIcon({ className, strokeWidth }: { className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth || 1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 21V12" />
      <path d="M18 21V12" />
      <path d="M4 21h16" />
      <path d="M6 12h12" />
      <path d="M6 12Q6 6 12 4Q18 6 18 12" />
      <path d="M12 4V2" />
      <circle cx="12" cy="1.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

const TABS: { key: TabKey; label: string; icon: any }[] = [
  { key: "home", label: "Home", icon: Home },
  { key: "times", label: "Times", icon: Clock },
  { key: "spaces", label: "Spaces", icon: MosqueIcon },
  { key: "food", label: "Food", icon: UtensilsCrossed },
];

interface Props { active: TabKey; onTab: (t: TabKey) => void; }

export default function BottomNav({ active, onTab }: Props) {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg z-[200]" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200/60 dark:border-gray-800/60">
        <div className="flex items-center justify-around px-2 pt-2 pb-3">
          {TABS.map((t) => {
            const isActive = active === t.key;
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => {
                  haptics.selection();
                  // Double-tap active tab → return to Home
                  if (isActive) onTab("home");
                  else onTab(t.key);
                }}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-1 px-4 rounded-lg transition-all",
                  isActive ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400 dark:text-gray-500"
                )}
                aria-label={t.label}
              >
                <Icon className={cn("w-[21px] h-[21px]", isActive && "scale-110")} strokeWidth={isActive ? 2.4 : 1.8} />
                <span className={cn("text-[10px]", isActive ? "font-bold" : "font-medium")}>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
