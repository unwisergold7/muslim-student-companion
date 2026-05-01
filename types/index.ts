export interface Coordinates { lat: number; lng: number; }
export interface University { id: string; name: string; short_name: string; city: string; state: string; country: string; coordinates: Coordinates; timezone: string; enabled: boolean; }

export type VerificationStatus = "verified" | "community" | "unverified" | "outdated";
/**
 * NOTE: The "outdated" status is set manually by developers only.
 * It is NEVER applied automatically by any client code, user, or timer.
 */
export interface Verifiable { verification_status: VerificationStatus; last_verified: string; source: string; source_note: string; source_url?: string; verified_by?: string; evidence_note?: string; contact_method?: string; }
export interface Locatable { coordinates?: Coordinates; address?: string; distance?: string; }
export interface HasHours { hours_text: string; hours_last_verified?: string; }

export type SpaceTag = "quiet" | "wudu" | "women-friendly" | "jummah" | "parking" | "accessible";
export type SpaceType = "campus" | "mosque";
export interface PrayerSpace extends Verifiable, Locatable, HasHours { id: string; university_id: string; name: string; building: string; floor: string; notes: string; tags: SpaceTag[]; type: SpaceType; featured?: boolean; }

export type DietaryType = "halal" | "kosher" | "doubtful" | "not-halal" | "vegetarian" | "vegan";
export type AvailabilityType = "available_today" | "usually_available" | "menu_rotates" | "reported_only" | "always_available";
export type FoodCategory = "dining-hall" | "on-campus" | "off-campus" | "grocery" | "community";
export interface FoodEntry extends Verifiable, Locatable, HasHours { id: string; university_id: string; hall_name?: string; station_name?: string; name: string; location: string; dietary_type: DietaryType; explanation: string; notes: string; category: FoodCategory; availability: AvailabilityType; brand?: string; product_line?: string; label_note?: string; live_menu_url?: string; }

export type LinkCategory = "msa" | "mosque" | "campus-faith" | "dining-info" | "other";
export interface CommunityLink { id: string; university_id: string; title: string; description: string; url: string; category: LinkCategory; }

export interface PrayerTimesData { Fajr: string; Sunrise: string; Dhuhr: string; Asr: string; Maghrib: string; Isha: string; date?: string; method?: string; }
export interface NextPrayer { name: string; time: string; remaining: number; }
export interface CurrentPrayer { name: string; time: string; }
export type TabKey = "home" | "times" | "spaces" | "food";

export interface AladhanTimings { Fajr: string; Sunrise: string; Dhuhr: string; Asr: string; Sunset: string; Maghrib: string; Isha: string; Imsak: string; Midnight: string; }
export interface AladhanResponse { code: number; status: string; data: { timings: AladhanTimings; date: { readable: string; hijri: { date: string; month: { en: string }; year: string } }; meta: { method: { id: number; name: string } }; }; }

export type ReportKind = "issue" | "changed" | "not_found" | "feedback" | "feature_request" | "general";
export type ReportTargetType = "space" | "food" | "app";
export interface UserReport { id: string; entity_id: string; entity_type: ReportTargetType; report_type: ReportKind; message: string; timestamp: string; }

/**
 * Persisted user settings (localStorage). The app uses the ISNA
 * calculation method only — there's no user-facing selector, so
 * the method is a constant in data/calculation-methods.ts rather
 * than a stored preference.
 */
export interface UserSettings {
  dark: boolean;
  ramadan: boolean;
  onboarding_complete: boolean;
  location_choice: "granted" | "manual" | "skipped" | "none";
  manual_city?: string;
}

export type LocationState = "idle" | "requesting" | "granted" | "denied" | "error" | "manual";
