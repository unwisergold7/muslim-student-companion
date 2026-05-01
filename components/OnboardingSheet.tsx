"use client";
import { useState } from "react";
import { MapPin, UtensilsCrossed, Compass, ChevronRight, X, Sparkles } from "lucide-react";
import { haptics } from "@/lib/haptics";

/**
 * First-run onboarding sheet. Shown exactly once (gated by
 * `onboarding_complete` in settings). Explains why location helps
 * and asks the user to either enable it or skip with a clear
 * explanation of the trade-off.
 */
export default function OnboardingSheet({
  onEnableLocation,
  onSkip,
  onManual,
}: {
  onEnableLocation: () => void;
  onSkip: () => void;
  onManual: () => void;
}) {
  const [page, setPage] = useState<0 | 1>(0);

  return (
    <div className="fixed inset-0 z-[1000] bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 flex flex-col animate-fade-in">
      {/* Top safe area */}
      <div style={{ paddingTop: "env(safe-area-inset-top)" }} />

      {page === 0 && (
        <div className="flex-1 flex flex-col px-6 pt-10 pb-8 text-white">
          {/* Icon */}
          <div className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-xl flex items-center justify-center mb-8 shadow-xl">
            <Sparkles className="w-10 h-10 text-yellow-300" />
          </div>

          <div className="flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-white/50 mb-2">
              Assalamu Alaikum
            </p>
            <h1 className="text-3xl font-bold leading-tight mb-3">
              Welcome to your companion.
            </h1>
            <p className="text-[15px] text-white/75 leading-relaxed">
              A quiet, reliable guide for Muslim students at Virginia Tech —
              prayer times, trusted halal food, and every prayer space on campus.
            </p>
          </div>

          <button
            onClick={() => { haptics.light(); setPage(1); }}
            className="w-full py-4 bg-white text-emerald-900 text-[15px] font-bold rounded-2xl hover:bg-white/90 transition-colors active:scale-[0.98] flex items-center justify-center gap-2"
          >
            Get Started
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {page === 1 && (
        <div className="flex-1 flex flex-col px-6 pt-8 pb-8 text-white">
          <button
            onClick={() => { haptics.selection(); setPage(0); }}
            className="self-start mb-6 text-[13px] font-semibold text-white/60 hover:text-white/90"
          >
            ← Back
          </button>

          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center mb-6">
            <MapPin className="w-8 h-8 text-yellow-300" />
          </div>

          <h2 className="text-2xl font-bold leading-tight mb-2">
            Make it yours with location.
          </h2>
          <p className="text-[14px] text-white/70 leading-relaxed mb-6">
            Location helps us show what actually matters to you. Your coordinates
            are used only to calculate prayer times and Qibla, and never leave your device.
          </p>

          <div className="space-y-3 mb-auto">
            <Feature
              icon={<Compass className="w-4 h-4" />}
              title="Accurate prayer times"
              desc="Fajr through Isha, based exactly on where you are."
            />
            <Feature
              icon={<UtensilsCrossed className="w-4 h-4" />}
              title="Halal food nearby"
              desc="See dining halls and restaurants close to you first."
            />
            <Feature
              icon={<MapPin className="w-4 h-4" />}
              title="Prayer spaces near you"
              desc="Every campus space and mosque on a clean map."
            />
          </div>

          <div className="space-y-2 mt-8">
            <button
              onClick={() => { haptics.medium(); onEnableLocation(); }}
              className="w-full py-4 bg-white text-emerald-900 text-[15px] font-bold rounded-2xl hover:bg-white/90 transition-colors active:scale-[0.98]"
            >
              Enable Location
            </button>
            <button
              onClick={() => { haptics.selection(); onManual(); }}
              className="w-full py-3 bg-white/10 text-white text-[14px] font-semibold rounded-2xl hover:bg-white/15 transition-colors active:scale-[0.98]"
            >
              Enter my city instead
            </button>
            <button
              onClick={() => { haptics.selection(); onSkip(); }}
              className="w-full py-2.5 text-white/60 text-[13px] font-medium hover:text-white/80 transition-colors"
            >
              Skip for now
            </button>
          </div>
          <p className="text-[11px] text-white/40 text-center mt-2 leading-relaxed">
            Skipping means prayer times and Qibla will use a default Blacksburg location.
          </p>
        </div>
      )}

      {/* Bottom safe area */}
      <div style={{ paddingBottom: "env(safe-area-inset-bottom)" }} />
    </div>
  );
}

function Feature({
  icon, title, desc,
}: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex gap-3 items-start p-3.5 rounded-2xl bg-white/[0.08] backdrop-blur-xl border border-white/10">
      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 text-white">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[14px] font-semibold text-white">{title}</p>
        <p className="text-[12px] text-white/60 leading-relaxed mt-0.5">{desc}</p>
      </div>
    </div>
  );
}
