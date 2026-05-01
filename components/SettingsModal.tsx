"use client";
import { useState } from "react";
import {
  X, Moon, Sun, Info, MapPin, Globe,
  Shield, HelpCircle, Heart, Flag, Sparkles, ChevronRight, Check,
} from "lucide-react";
import Toggle from "@/components/ui/Toggle";
import StatusExplainer from "@/components/StatusExplainer";
import ReportModal from "@/components/ReportModal";
import { haptics } from "@/lib/haptics";
import type { LocationState } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  dark: boolean;
  setDark: (v: boolean) => void;
  onOpenLocation: () => void;
  locationLabel: string;
  locationState: LocationState;
}

type Section = "main" | "status" | "mission" | "faqs" | "privacy" | "about";

export default function SettingsModal({
  open, onClose, dark, setDark,
  onOpenLocation, locationLabel, locationState,
}: Props) {
  const [section, setSection] = useState<Section>("main");
  const [reportMode, setReportMode] = useState<"feedback" | "feature_request" | null>(null);

  if (!open) return null;

  const go = (s: Section) => { haptics.selection(); setSection(s); };
  const handleClose = () => { setSection("main"); onClose(); };

  return (
    <>
      <div className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-end justify-center" onClick={handleClose}>
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-t-2xl animate-slide-up max-h-[88vh] overflow-y-auto"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
          </div>

          <div className="px-5 pb-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                {section !== "main" && (
                  <button
                    onClick={() => { haptics.selection(); setSection("main"); }}
                    className="text-xs font-semibold text-emerald-600"
                  >
                    ← Back
                  </button>
                )}
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {section === "main" && "Settings"}
                  {section === "status" && "Status Definitions"}
                  {section === "mission" && "Our Mission"}
                  {section === "faqs" && "FAQs"}
                  {section === "privacy" && "Privacy"}
                  {section === "about" && "About"}
                </h2>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {section === "main" && (
              <MainSection
                dark={dark}
                setDark={setDark}
                go={go}
                openReport={(m) => setReportMode(m)}
                onOpenLocation={onOpenLocation}
                locationLabel={locationLabel}
                locationState={locationState}
              />
            )}
            {section === "status" && <StatusExplainer />}
            {section === "mission" && <MissionSection />}
            {section === "faqs" && <FaqsSection />}
            {section === "privacy" && <PrivacySection />}
            {section === "about" && <AboutSection />}
          </div>
        </div>
      </div>

      {reportMode && (
        <ReportModal
          open={true}
          onClose={() => setReportMode(null)}
          mode={reportMode}
          title={reportMode === "feature_request" ? "Suggest a Feature" : "Send Feedback"}
        />
      )}
    </>
  );
}

function MainSection({
  dark, setDark, go, openReport,
  onOpenLocation, locationLabel, locationState,
}: {
  dark: boolean;
  setDark: (v: boolean) => void;
  go: (s: Section) => void;
  openReport: (mode: "feedback" | "feature_request") => void;
  onOpenLocation: () => void;
  locationLabel: string;
  locationState: LocationState;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Appearance</p>
      <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          {dark ? <Moon className="w-4 h-4 text-emerald-500" /> : <Sun className="w-4 h-4 text-yellow-500" />}
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Dark Mode</p>
            <p className="text-xs text-gray-500">{dark ? "On" : "Off"}</p>
          </div>
        </div>
        <Toggle on={dark} onChange={(v) => { haptics.selection(); setDark(v); }} />
      </div>

      {/* Location */}
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 mt-5">Location</p>
      <button
        onClick={onOpenLocation}
        className="w-full flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <MapPin className="w-4 h-4 text-gray-500 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Your Location</p>
            <p className="text-xs text-gray-500 truncate">
              {locationState === "idle" || locationState === "error" ? "Tap to set location" :
               locationState === "requesting" ? "Getting location…" :
               locationState === "denied" ? "Permission denied — tap to retry" :
               locationLabel}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {locationState === "granted" || locationState === "manual" ? (
            <Check className="w-3.5 h-3.5 text-emerald-600" />
          ) : null}
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
      </button>

      <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <Globe className="w-4 h-4 text-gray-500" />
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">University</p>
            <p className="text-xs text-gray-500">Virginia Tech</p>
          </div>
        </div>
        <span className="text-xs text-emerald-600 font-semibold">VT</span>
      </div>

      {/* About & Guides */}
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 mt-5">About & Guides</p>

      <SettingsRow
        icon={<Sparkles className="w-4 h-4 text-emerald-500" />}
        label="Our Mission"
        sub="Why this app exists"
        onClick={() => go("mission")}
      />
      <SettingsRow
        icon={<Info className="w-4 h-4 text-blue-500" />}
        label="Status Definitions"
        sub="What each label means"
        onClick={() => go("status")}
      />
      <SettingsRow
        icon={<HelpCircle className="w-4 h-4 text-violet-500" />}
        label="FAQs"
        sub="Common questions answered"
        onClick={() => go("faqs")}
      />
      <SettingsRow
        icon={<Shield className="w-4 h-4 text-gray-500" />}
        label="Privacy"
        sub="How your data is handled"
        onClick={() => go("privacy")}
        last
      />

      {/* Feedback */}
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 mt-5">Help Us Improve</p>

      <SettingsRow
        icon={<Flag className="w-4 h-4 text-orange-500" />}
        label="Send Feedback"
        sub="Something not quite right?"
        onClick={() => { haptics.selection(); openReport("feedback"); }}
      />
      <SettingsRow
        icon={<Heart className="w-4 h-4 text-pink-500" />}
        label="Suggest a Feature"
        sub="We'd love to hear your ideas"
        onClick={() => { haptics.selection(); openReport("feature_request"); }}
        last
      />

      {/* App info */}
      <button
        onClick={() => go("about")}
        className="w-full mt-6 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/60 dark:from-emerald-950/40 dark:to-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 p-4 flex items-center gap-3 hover:shadow-sm transition-shadow text-left"
      >
        <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0">
          <Globe className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100">Muslim Student Companion</p>
          <p className="text-[11px] text-gray-500">v14 · Virginia Tech</p>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400" />
      </button>
    </div>
  );
}

function SettingsRow({
  icon, label, sub, onClick, last,
}: {
  icon: React.ReactNode; label: string; sub?: string; onClick: () => void; last?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between py-3 text-left ${last ? "" : "border-b border-gray-100 dark:border-gray-800"}`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{label}</p>
          {sub && <p className="text-xs text-gray-500">{sub}</p>}
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-400" />
    </button>
  );
}

// ─── Mission ──────────────────────────────────────────────────

function MissionSection() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/40 dark:to-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 p-5">
        <Sparkles className="w-5 h-5 text-emerald-600 mb-2" />
        <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">
          A guide for every Muslim student.
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          Starting university is hard enough. This app exists so that no Muslim student arrives on
          campus wondering where to pray, what's safe to eat, or whether anyone has already answered
          these questions for them.
        </p>
      </div>

      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
        Muslim Student Companion grew from a simple idea: if one student has already spent an hour
        searching for a quiet prayer room between classes, or wondering whether a campus protein is
        really halal, another student shouldn't have to repeat that search.
      </p>
      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
        Every entry is checked against an official source — a dining menu page, a certification mark,
        a community confirmation, or direct contact with the establishment. We don't invent. We don't
        guess. When something isn't verified, we say so clearly.
      </p>
      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
        Our hope is that Muslim students always know where to turn — for prayer, for halal food, and
        for reliable answers to the everyday questions that shape student life.
      </p>

      <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 p-4">
        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed italic">
          You're never alone on this campus. If you have suggestions, corrections, or places we've
          missed — please tell us. We read every message.
        </p>
      </div>
    </div>
  );
}

// ─── FAQs ─────────────────────────────────────────────────────

const FAQS: { q: string; a: string }[] = [
  {
    q: "How are prayer times calculated?",
    a: "We use the ISNA (Islamic Society of North America) method, fetched live from the AlAdhan service based on your location. Times update daily.",
  },
  {
    q: "What does 'Verified' mean for a food item?",
    a: "A verified entry has been cross-checked against an official VT Dining menu page, corporate website, or confirmed directly with the business. Menus can still change without notice — always check the live menu link.",
  },
  {
    q: "Is this app affiliated with VT Dining or the MSA?",
    a: "No. This is an independent community resource. We draw on publicly available information and community reports to help Muslim students make informed choices.",
  },
  {
    q: "Why does 'Rotates' appear next to some items?",
    a: "Dining hall menus rotate daily or weekly. A rotating halal item isn't always available on every given day — tap the 'Live menu' link on the card to see today's options.",
  },
  {
    q: "How do I favourite an item?",
    a: "Tap the star icon next to any food item or prayer space. Your favourites appear on the Home screen for quick access.",
  },
  {
    q: "Why isn't there a non-halal section?",
    a: "We intentionally don't maintain one. The app is focused on places that are relevant to Muslim students. Items labelled 'Doubtful' are kept because of common seafood questions and cross-contamination concerns.",
  },
  {
    q: "How is my location used?",
    a: "Your location is used only to calculate prayer times and the Qibla direction. It's never stored, shared, or sent anywhere except to AlAdhan to fetch prayer times.",
  },
  {
    q: "I found incorrect information — what do I do?",
    a: "Open the item, tap 'Report Issue', and tell us what's wrong. Reports go directly to our review queue and help keep the app accurate.",
  },
];

function FaqsSection() {
  return (
    <div className="space-y-2">
      {FAQS.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <button
        onClick={() => { haptics.selection(); setOpen(!open); }}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 pr-2">{q}</span>
        <ChevronRight className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${open ? "rotate-90" : ""}`} />
      </button>
      {open && (
        <div className="px-4 pb-3 animate-fade-in">
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

// ─── Privacy ──────────────────────────────────────────────────

function PrivacySection() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
        We built this app with privacy as the starting point, not an afterthought.
      </p>

      <div>
        <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
          What stays on your device
        </h4>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li>• Your settings — dark mode, Ramadan mode, calculation method.</li>
          <li>• Your favourites — spaces and food items you save.</li>
          <li>• Your location choice — whether you've enabled location, or the city you've typed.</li>
        </ul>
      </div>

      <div>
        <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
          What we never do
        </h4>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li>• Collect your name, email, or phone number.</li>
          <li>• Track you across apps or sessions.</li>
          <li>• Sell, share, or transfer your data to advertisers.</li>
          <li>• Store your precise coordinates.</li>
        </ul>
      </div>

      <div>
        <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
          Location
        </h4>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          When you enable location, your coordinates are sent only to the AlAdhan prayer times service
          and (once) to OpenStreetMap to show a friendly city name. They're discarded immediately
          afterwards and never saved on our servers.
        </p>
      </div>

      <div>
        <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
          Third-party services
        </h4>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          Prayer times come from AlAdhan. Directions open in Apple Maps or Google Maps at your choice.
          Reports you submit are stored in our hosted database (Supabase) solely for review.
        </p>
      </div>

      <div>
        <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
          Your control
        </h4>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          Clear all your data at any time by uninstalling the app, or by clearing the app's storage from
          your phone settings. There's nothing for us to delete on our end, because we never had it.
        </p>
      </div>

      <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 p-3">
        <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
          Have a privacy question? Tap Send Feedback and we'll respond.
        </p>
      </div>
    </div>
  );
}

// ─── About ────────────────────────────────────────────────────

function AboutSection() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 p-5 text-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center mx-auto mb-3">
          <Globe className="w-6 h-6 text-white" />
        </div>
        <p className="text-base font-bold text-gray-900 dark:text-gray-100">Muslim Student Companion</p>
        <p className="text-xs text-gray-500 mt-0.5">Version 14 · Virginia Tech</p>
      </div>

      <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 p-4">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-[13px] font-semibold text-amber-800 dark:text-amber-300">
              Guidance, not a fatwa.
            </p>
            <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-1 leading-relaxed">
              All information in this app is guidance only. It's not a religious ruling or
              certification. Menus rotate daily — always verify on-site. Grocery product status is
              per-product, not per-brand.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 p-4">
        <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
          Built with care for the Muslim students at Virginia Tech. If you'd like to help keep this
          data accurate, use the Send Feedback form in Settings.
        </p>
      </div>
    </div>
  );
}
