"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Settings, Loader2, RefreshCw } from "lucide-react";
import { TabKey, PrayerTimesData, FoodEntry, PrayerSpace, CommunityLink, LocationState } from "@/types";
import { DEFAULT_UNIVERSITY_ID } from "@/data/universities";
import { DEFAULT_METHOD, METHOD_NAME } from "@/data/calculation-methods";
import { cn, getFriendlyLocationLabel } from "@/lib/utils";
import { haptics } from "@/lib/haptics";
import { loadSettings, saveSettings } from "@/lib/storage";
import { getCurrentLocation } from "@/lib/geolocation";
import { fetchPrayerTimes, fetchPrayerTimesByCity, FALLBACK_TIMES } from "@/lib/prayer-times";
import { getFoodEntries, getPrayerSpaces, getCommunityLinks } from "@/lib/supabase-queries";
import BottomNav from "@/components/BottomNav";
import SettingsModal from "@/components/SettingsModal";
import OnboardingSheet from "@/components/OnboardingSheet";
import LocationModal from "@/components/LocationModal";
import HomeTab from "@/components/HomeTab";
import PrayerTimesTab from "@/components/PrayerTimesTab";
import PrayerSpacesTab from "@/components/PrayerSpacesTab";
import FoodTab from "@/components/FoodTab";
import type { UserSettings } from "@/types";

type DataState = "loading" | "ready" | "empty" | "error";

export default function AppShell() {
  const universityId = DEFAULT_UNIVERSITY_ID;

  const [tab, setTab] = useState<TabKey>("home");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  const [mounted, setMounted] = useState(false);

  const settingsRef = useRef<UserSettings | null>(null);
  const [ramadan, setRamadan] = useState(false);
  const [dark, setDark] = useState(false);

  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [manualCity, setManualCity] = useState<string>("");
  const [locLabel, setLocLabel] = useState("Tap to set location");
  const [locState, setLocState] = useState<LocationState>("idle");

  const [times, setTimes] = useState<PrayerTimesData>(FALLBACK_TIMES);
  const [timesLoading, setTimesLoading] = useState(false);
  const [timesError, setTimesError] = useState<string | null>(null);

  const [spaces, setSpaces] = useState<PrayerSpace[]>([]);
  const [food, setFood] = useState<FoodEntry[]>([]);
  const [links, setLinks] = useState<CommunityLink[]>([]);
  const [dataState, setDataState] = useState<DataState>("loading");
  const [dataError, setDataError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const s = loadSettings();
    settingsRef.current = s;
    setDark(s.dark);
    setRamadan(s.ramadan);

    if (s.location_choice === "manual" && s.manual_city) {
      setManualCity(s.manual_city);
      setLocLabel(s.manual_city);
      setLocState("manual");
    } else if (s.location_choice === "skipped") {
      setLocState("idle");
      setLocLabel("Using Blacksburg (default)");
    }

    if (!s.onboarding_complete) {
      setOnboardingOpen(true);
    }
  }, []);

  const persist = (patch: Partial<UserSettings>) => {
    const next = { ...(settingsRef.current || loadSettings()), ...patch } as UserSettings;
    settingsRef.current = next;
    saveSettings(next);
  };

  useEffect(() => {
    if (!mounted) return;
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [dark, mounted]);

  const handleDark = (v: boolean) => { setDark(v); persist({ dark: v }); };
  const handleRamadan = (v: boolean) => { setRamadan(v); persist({ ramadan: v }); };

  const loadData = useCallback(async () => {
    setDataState("loading");
    setDataError(null);
    try {
      const [s, f, l] = await Promise.all([
        getPrayerSpaces(universityId),
        getFoodEntries(universityId),
        getCommunityLinks(universityId),
      ]);
      setSpaces(s);
      setFood(f);
      setLinks(l);
      if (s.length === 0 && f.length === 0) setDataState("empty");
      else setDataState("ready");
    } catch (err: any) {
      setDataError(err?.message || "Could not load data");
      setDataState("error");
    }
  }, [universityId]);

  useEffect(() => { loadData(); }, [loadData]);

  const loadTimes = useCallback(async () => {
    setTimesLoading(true);
    setTimesError(null);
    try {
      if (lat !== null && lng !== null) {
        setTimes(await fetchPrayerTimes(lat, lng, DEFAULT_METHOD));
      } else if (manualCity) {
        setTimes(await fetchPrayerTimesByCity(manualCity, "US", DEFAULT_METHOD));
      } else {
        setTimes(FALLBACK_TIMES);
      }
    } catch (e: any) {
      setTimesError(e?.message || "Couldn't update prayer times");
      setTimes(FALLBACK_TIMES);
    } finally {
      setTimesLoading(false);
    }
  }, [lat, lng, manualCity]);

  useEffect(() => { loadTimes(); }, [loadTimes]);

  const requestLocation = useCallback(async () => {
    setLocState("requesting");
    setLocLabel("Getting your location…");
    haptics.light();

    const result = await getCurrentLocation(10000);
    if (result.ok) {
      setLat(result.lat);
      setLng(result.lng);
      setManualCity("");
      setLocState("granted");
      setLocLabel("Near you");
      persist({ location_choice: "granted", manual_city: undefined });
      haptics.success();
      getFriendlyLocationLabel(result.lat, result.lng).then(setLocLabel);
    } else {
      if (result.error.kind === "denied") {
        setLocState("denied");
        setLocLabel("Location denied");
        haptics.warning();
      } else {
        setLocState("error");
        setLocLabel("Couldn't get location");
        haptics.error();
      }
    }
  }, []);

  const setManualLocation = (city: string) => {
    setLat(null);
    setLng(null);
    setManualCity(city);
    setLocLabel(city);
    setLocState("manual");
    setLocationModalOpen(false);
    persist({ location_choice: "manual", manual_city: city });
    haptics.success();
  };

  const clearLocation = () => {
    setLat(null);
    setLng(null);
    setManualCity("");
    setLocLabel("Tap to set location");
    setLocState("idle");
    persist({ location_choice: "skipped", manual_city: undefined });
  };

  const finishOnboardingEnable = async () => {
    persist({ onboarding_complete: true });
    setOnboardingOpen(false);
    await requestLocation();
  };
  const finishOnboardingManual = () => {
    persist({ onboarding_complete: true });
    setOnboardingOpen(false);
    setLocationModalOpen(true);
  };
  const finishOnboardingSkip = () => {
    persist({ onboarding_complete: true, location_choice: "skipped" });
    setOnboardingOpen(false);
    setLocState("idle");
    setLocLabel("Using Blacksburg (default)");
  };

  const methodName = times.method || METHOD_NAME;

  return (
    <div
      className={cn(
        "max-w-lg mx-auto min-h-screen flex flex-col transition-colors duration-300",
        dark ? "bg-gray-950 text-gray-100" : "bg-gray-50 text-gray-900"
      )}
      style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif" }}
    >
      <header
        className={cn(
          "sticky top-0 z-[100] backdrop-blur-xl",
          dark ? "bg-gray-950/90" : "bg-gray-50/90"
        )}
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="flex items-center justify-between px-4 pt-3 pb-3">
          <h1 className="text-base font-bold tracking-tight">Muslim Student Companion</h1>
          <button
            onClick={() => { haptics.selection(); setSettingsOpen(true); }}
            className={cn(
              "p-2 rounded-lg border",
              dark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
            )}
            aria-label="Settings"
          >
            <Settings className="w-[18px] h-[18px] text-gray-500" />
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 pb-24 pt-2">
        {dataState === "loading" && (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mb-3" />
            <p className="text-sm">Loading your companion…</p>
          </div>
        )}

        {dataState === "error" && (
          <ErrorState message={dataError} onRetry={loadData} />
        )}

        {dataState === "empty" && (
          <EmptyState onRetry={loadData} />
        )}

        {dataState === "ready" && (
          <>
            {tab === "home" && (
              <HomeTab
                times={times}
                loading={timesLoading}
                ramadan={ramadan}
                setRamadan={handleRamadan}
                onNavigate={setTab}
                food={food}
                spaces={spaces}
                links={links}
                mounted={mounted}
              />
            )}
            {tab === "times" && (
              <PrayerTimesTab
                times={times}
                loading={timesLoading}
                error={timesError}
                ramadan={ramadan}
                methodName={methodName}
                locationLabel={locLabel}
                locationState={locState}
                onRetry={loadTimes}
                onOpenLocation={() => { haptics.selection(); setLocationModalOpen(true); }}
                lat={lat}
                lng={lng}
              />
            )}
            {tab === "spaces" && <PrayerSpacesTab spaces={spaces} mounted={mounted} />}
            {tab === "food" && <FoodTab food={food} mounted={mounted} />}
          </>
        )}
      </main>

      <BottomNav active={tab} onTab={setTab} />

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        dark={dark}
        setDark={handleDark}
        onOpenLocation={() => { setSettingsOpen(false); setTimeout(() => setLocationModalOpen(true), 150); }}
        locationLabel={locLabel}
        locationState={locState}
      />

      <LocationModal
        open={locationModalOpen}
        state={locState}
        currentLabel={locLabel}
        onClose={() => setLocationModalOpen(false)}
        onEnableLocation={async () => { await requestLocation(); }}
        onSetManualCity={setManualLocation}
        onClearLocation={clearLocation}
      />

      {onboardingOpen && mounted && (
        <OnboardingSheet
          onEnableLocation={finishOnboardingEnable}
          onManual={finishOnboardingManual}
          onSkip={finishOnboardingSkip}
        />
      )}
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string | null; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center mb-4">
        <RefreshCw className="w-6 h-6 text-red-500" />
      </div>
      <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">
        Something went wrong
      </h3>
      <p className="text-xs text-gray-500 max-w-xs mb-4 leading-relaxed">
        {message || "We couldn't load your data. Check your connection and try again."}
      </p>
      <button
        onClick={() => { haptics.light(); onRetry(); }}
        className="px-5 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors active:scale-[0.98]"
      >
        Try again
      </button>
    </div>
  );
}

function EmptyState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        <Loader2 className="w-6 h-6 text-gray-400" />
      </div>
      <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">Nothing here yet</h3>
      <p className="text-xs text-gray-500 max-w-xs mb-4 leading-relaxed">
        Your companion is ready but there's no data to show right now.
      </p>
      <button
        onClick={() => { haptics.light(); onRetry(); }}
        className="px-5 py-2.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-semibold rounded-xl active:scale-[0.98]"
      >
        Refresh
      </button>
    </div>
  );
}
