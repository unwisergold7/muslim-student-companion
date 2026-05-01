/**
 * SUPABASE QUERIES — Data Access Layer
 *
 * Every read function logs clearly to the console:
 *   ✅ [MSC] food_entries: 30 rows from Supabase
 *   ⚠️ [MSC] food_entries: Supabase empty, using local fallback (16 entries)
 *   ❌ [MSC] food_entries: Supabase FAILED: {error details}
 *   🔇 [MSC] food_entries: Supabase not configured, using local data
 *
 * DEBUG MODE (NEXT_PUBLIC_DISABLE_LOCAL_FALLBACK=true):
 *   Disables fallback so you can verify Supabase is actually working.
 *   Empty data = Supabase issue, not masked by local files.
 */

import supabase, { isSupabaseAvailable } from "./supabaseClient";
import { FoodEntry, PrayerSpace, CommunityLink } from "@/types";
import { FOOD_ENTRIES } from "@/data/food-entries";
import { PRAYER_SPACES } from "@/data/prayer-spaces";
import { COMMUNITY_LINKS } from "@/data/community-links";

const NO_FALLBACK = process.env.NEXT_PUBLIC_DISABLE_LOCAL_FALLBACK === "true";

// ─── Food Entries ──────────────────────────────────────────────

export async function getFoodEntries(universityId: string): Promise<FoodEntry[]> {
  const local = FOOD_ENTRIES.filter((f) => f.university_id === universityId);

  if (!isSupabaseAvailable()) {
    if (NO_FALLBACK) {
      console.error("❌ [MSC] food_entries: Supabase not configured and fallback DISABLED — returning empty. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local");
      return [];
    }
    console.log(`🔇 [MSC] food_entries: Supabase not configured, using local data (${local.length} entries)`);
    return local;
  }

  try {
    const { data, error } = await supabase!
      .from("food_entries").select("*")
      .eq("university_id", universityId).order("name");

    if (error) {
      console.error(`❌ [MSC] food_entries: Supabase query FAILED:`, error.message, `| Code: ${error.code} | Details: ${error.details} | Hint: ${error.hint}`);
      if (NO_FALLBACK) return [];
      console.log(`⚠️ [MSC] food_entries: Using local fallback (${local.length} entries)`);
      return local;
    }

    if (!data || data.length === 0) {
      if (NO_FALLBACK) {
        console.warn(`⚠️ [MSC] food_entries: Supabase returned 0 rows and fallback DISABLED. Either the table is empty or seed hasn't been run. Run: npm run seed`);
        return [];
      }
      console.log(`⚠️ [MSC] food_entries: Supabase returned 0 rows, using local fallback (${local.length} entries)`);
      return local;
    }

    console.log(`✅ [MSC] food_entries: ${data.length} rows from Supabase`);
    return data.map(mapFoodRow);
  } catch (err: any) {
    console.error(`❌ [MSC] food_entries: Unexpected error:`, err?.message || err);
    if (NO_FALLBACK) return [];
    console.log(`⚠️ [MSC] food_entries: Using local fallback (${local.length} entries)`);
    return local;
  }
}

// ─── Prayer Spaces ─────────────────────────────────────────────

export async function getPrayerSpaces(universityId: string): Promise<PrayerSpace[]> {
  const local = PRAYER_SPACES.filter((s) => s.university_id === universityId);

  if (!isSupabaseAvailable()) {
    if (NO_FALLBACK) { console.error("❌ [MSC] prayer_spaces: Supabase not configured, fallback DISABLED"); return []; }
    console.log(`🔇 [MSC] prayer_spaces: Supabase not configured, using local data (${local.length} entries)`);
    return local;
  }

  try {
    const { data, error } = await supabase!
      .from("prayer_spaces").select("*")
      .eq("university_id", universityId)
      .order("featured", { ascending: false }).order("name");

    if (error) {
      console.error(`❌ [MSC] prayer_spaces: Supabase query FAILED:`, error.message, `| Code: ${error.code} | Details: ${error.details} | Hint: ${error.hint}`);
      if (NO_FALLBACK) return [];
      console.log(`⚠️ [MSC] prayer_spaces: Using local fallback (${local.length} entries)`);
      return local;
    }

    if (!data || data.length === 0) {
      if (NO_FALLBACK) { console.warn(`⚠️ [MSC] prayer_spaces: 0 rows, fallback DISABLED. Run: npm run seed`); return []; }
      console.log(`⚠️ [MSC] prayer_spaces: 0 rows, using local fallback (${local.length} entries)`);
      return local;
    }

    console.log(`✅ [MSC] prayer_spaces: ${data.length} rows from Supabase`);
    return data.map(mapSpaceRow);
  } catch (err: any) {
    console.error(`❌ [MSC] prayer_spaces: Unexpected error:`, err?.message || err);
    if (NO_FALLBACK) return [];
    return local;
  }
}

// ─── Community Links ───────────────────────────────────────────

export async function getCommunityLinks(universityId: string): Promise<CommunityLink[]> {
  const local = COMMUNITY_LINKS.filter((l) => l.university_id === universityId);

  if (!isSupabaseAvailable()) {
    if (NO_FALLBACK) { console.error("❌ [MSC] community_links: Supabase not configured, fallback DISABLED"); return []; }
    console.log(`🔇 [MSC] community_links: Supabase not configured, using local data (${local.length} entries)`);
    return local;
  }

  try {
    const { data, error } = await supabase!
      .from("community_links").select("*")
      .eq("university_id", universityId);

    if (error) {
      console.error(`❌ [MSC] community_links: Supabase query FAILED:`, error.message, `| Code: ${error.code} | Details: ${error.details} | Hint: ${error.hint}`);
      if (NO_FALLBACK) return [];
      return local;
    }

    if (!data || data.length === 0) {
      if (NO_FALLBACK) { console.warn(`⚠️ [MSC] community_links: 0 rows, fallback DISABLED`); return []; }
      return local;
    }

    console.log(`✅ [MSC] community_links: ${data.length} rows from Supabase`);
    return data as CommunityLink[];
  } catch (err: any) {
    console.error(`❌ [MSC] community_links: Unexpected error:`, err?.message || err);
    if (NO_FALLBACK) return [];
    return local;
  }
}

// ─── User Reports (insert-only) ────────────────────────────────

export async function submitReport(report: {
  university_id: string;
  target_type: "space" | "food" | "app";
  target_id: string;
  issue_type: string;
  message: string;
}): Promise<boolean> {
  if (!isSupabaseAvailable()) {
    try {
      const reports = JSON.parse(localStorage.getItem("msc_reports") || "[]");
      reports.push({ ...report, id: `local-${Date.now()}`, created_at: new Date().toISOString() });
      localStorage.setItem("msc_reports", JSON.stringify(reports));
      return true;
    } catch { return false; }
  }
  try {
    const { error } = await supabase!.from("user_reports").insert(report);
    if (error) { console.error("[MSC] Report insert failed:", error.message); throw error; }
    return true;
  } catch {
    try {
      const reports = JSON.parse(localStorage.getItem("msc_reports") || "[]");
      reports.push({ ...report, id: `local-${Date.now()}`, created_at: new Date().toISOString() });
      localStorage.setItem("msc_reports", JSON.stringify(reports));
      return true;
    } catch { return false; }
  }
}

// ─── Saved Items / Favourites ──────────────────────────────────

export async function getSavedItems(): Promise<{ item_type: string; item_id: string }[]> {
  if (!isSupabaseAvailable()) {
    try { return JSON.parse(localStorage.getItem("msc_favs_v2") || "[]"); } catch { return []; }
  }
  try {
    const { data, error } = await supabase!.from("saved_items").select("item_type, item_id");
    if (error) throw error;
    return data || [];
  } catch {
    try { return JSON.parse(localStorage.getItem("msc_favs_v2") || "[]"); } catch { return []; }
  }
}

export async function toggleSavedItem(itemType: string, itemId: string): Promise<boolean> {
  const saved = await getSavedItems();
  const exists = saved.some((s) => s.item_type === itemType && s.item_id === itemId);
  if (!isSupabaseAvailable()) {
    try {
      let items: { item_type: string; item_id: string }[] = JSON.parse(localStorage.getItem("msc_favs_v2") || "[]");
      if (exists) items = items.filter((s) => !(s.item_type === itemType && s.item_id === itemId));
      else items.push({ item_type: itemType, item_id: itemId });
      localStorage.setItem("msc_favs_v2", JSON.stringify(items));
      return !exists;
    } catch { return false; }
  }
  try {
    if (exists) { await supabase!.from("saved_items").delete().eq("item_type", itemType).eq("item_id", itemId); return false; }
    else { await supabase!.from("saved_items").insert({ item_type: itemType, item_id: itemId }); return true; }
  } catch { return exists; }
}

// ─── Row Mapping ───────────────────────────────────────────────

function mapFoodRow(r: any): FoodEntry {
  return {
    id: r.id, university_id: r.university_id, name: r.name,
    location: r.location_name || "", hall_name: r.hall_name || undefined,
    station_name: r.station_name || undefined, category: r.category || "dining-hall",
    dietary_type: r.dietary_type || "halal", availability: r.availability || "menu_rotates",
    explanation: r.explanation || "", notes: r.notes || "",
    brand: r.brand || undefined, product_line: r.product_line || undefined,
    label_note: r.label_note || undefined, live_menu_url: r.live_menu_url || undefined,
    coordinates: r.latitude && r.longitude ? { lat: r.latitude, lng: r.longitude } : undefined,
    address: r.address || undefined, distance: r.distance || undefined,
    hours_text: r.hours_text || "", hours_last_verified: r.hours_last_verified || undefined,
    verification_status: r.verification_status || "unverified",
    last_verified: r.last_verified || new Date().toISOString().split("T")[0],
    source: r.source || "", source_note: r.source_note || "",
    source_url: r.source_url || undefined, verified_by: r.verified_by || undefined,
    evidence_note: r.evidence_note || undefined, contact_method: r.contact_method || undefined,
  };
}

function mapSpaceRow(r: any): PrayerSpace {
  return {
    id: r.id, university_id: r.university_id, name: r.name,
    building: r.building || "", floor: r.floor || "",
    type: r.type || "campus", featured: r.featured || false,
    tags: r.tags || [],
    coordinates: r.latitude && r.longitude ? { lat: r.latitude, lng: r.longitude } : undefined,
    address: r.address || undefined, distance: r.distance || undefined,
    hours_text: r.hours_text || "", hours_last_verified: r.hours_last_verified || undefined,
    notes: r.notes || "",
    verification_status: r.verification_status || "unverified",
    last_verified: r.last_verified || new Date().toISOString().split("T")[0],
    source: r.source || "", source_note: r.source_note || "",
    source_url: r.source_url || undefined, verified_by: r.verified_by || undefined,
    evidence_note: r.evidence_note || undefined, contact_method: r.contact_method || undefined,
  };
}
