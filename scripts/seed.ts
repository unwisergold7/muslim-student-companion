/**
 * SEED SCRIPT — Upload local data to Supabase
 *
 * Uses SUPABASE_SERVICE_ROLE_KEY (not the public anon key) because
 * content tables have RLS policies that block public writes. The
 * service role key bypasses RLS and is safe here because this script
 * only runs locally on the developer's machine — it is never bundled
 * into the client app.
 *
 * Usage:
 *   1. Add SUPABASE_SERVICE_ROLE_KEY to your .env.local
 *      (get it from Supabase Dashboard → Settings → API → service_role)
 *   2. Run the SQL schema from supabase/schema.sql in the SQL editor
 *   3. Run: npm run seed
 *
 * Safe to re-run — uses upsert with onConflict: "id".
 */

import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

// Load .env.local from project root (tsx doesn't auto-load it like Next.js does)
config({ path: resolve(__dirname, "..", ".env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL in .env.local");
  process.exit(1);
}

if (!serviceKey) {
  console.error("❌ Missing SUPABASE_SERVICE_ROLE_KEY in .env.local");
  console.error("   Get it from: Supabase Dashboard → Settings → API → service_role (secret)");
  console.error("   ⚠ This key bypasses RLS — never expose it in client code or commit it.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

async function seed() {
  console.log("🌱 Seeding Supabase...\n");

  // ── Universities ───────────────────────────────────────
  console.log("📍 Seeding universities...");
  const { UNIVERSITIES } = await import("../data/universities");
  for (const u of UNIVERSITIES) {
    const { error } = await supabase.from("universities").upsert({
      id: u.id,
      name: u.name,
      short_name: u.short_name,
      city: u.city,
      state: u.state,
      country: u.country,
      latitude: u.coordinates.lat,
      longitude: u.coordinates.lng,
      timezone: u.timezone,
      is_active: u.enabled,
    }, { onConflict: "id" });
    if (error) console.error(`  ❌ ${u.name}: ${error.message}`);
    else console.log(`  ✓ ${u.name}`);
  }

  // ── Prayer Spaces ──────────────────────────────────────
  console.log("\n🕌 Seeding prayer spaces...");
  const { PRAYER_SPACES } = await import("../data/prayer-spaces");
  for (const s of PRAYER_SPACES) {
    const { error } = await supabase.from("prayer_spaces").upsert({
      id: s.id,
      university_id: s.university_id,
      name: s.name,
      building: s.building,
      floor: s.floor,
      type: s.type,
      featured: s.featured || false,
      tags: s.tags,
      address: s.address || null,
      latitude: s.coordinates?.lat || null,
      longitude: s.coordinates?.lng || null,
      distance: s.distance || null,
      hours_text: s.hours_text,
      hours_last_verified: s.hours_last_verified || null,
      notes: s.notes,
      source: s.source,
      source_note: s.source_note,
      source_url: s.source_url || null,
      verification_status: s.verification_status,
      verified_by: s.verified_by || null,
      evidence_note: s.evidence_note || null,
      contact_method: s.contact_method || null,
      last_verified: s.last_verified,
    }, { onConflict: "id" });
    if (error) console.error(`  ❌ ${s.name}: ${error.message}`);
    else console.log(`  ✓ ${s.name}`);
  }

  // ── Food Entries ───────────────────────────────────────
  console.log("\n🍽️  Seeding food entries...");
  const { FOOD_ENTRIES } = await import("../data/food-entries");
  for (const f of FOOD_ENTRIES) {
    const { error } = await supabase.from("food_entries").upsert({
      id: f.id,
      university_id: f.university_id,
      name: f.name,
      location_name: f.location,
      hall_name: f.hall_name || null,
      station_name: f.station_name || null,
      category: f.category,
      dietary_type: f.dietary_type,
      availability: f.availability,
      explanation: f.explanation,
      notes: f.notes,
      brand: f.brand || null,
      product_line: f.product_line || null,
      label_note: f.label_note || null,
      live_menu_url: f.live_menu_url || null,
      address: f.address || null,
      latitude: f.coordinates?.lat || null,
      longitude: f.coordinates?.lng || null,
      distance: f.distance || null,
      hours_text: f.hours_text,
      hours_last_verified: f.hours_last_verified || null,
      source: f.source,
      source_note: f.source_note,
      source_url: f.source_url || null,
      verification_status: f.verification_status,
      verified_by: f.verified_by || null,
      evidence_note: f.evidence_note || null,
      contact_method: f.contact_method || null,
      last_verified: f.last_verified,
    }, { onConflict: "id" });
    if (error) console.error(`  ❌ ${f.name}: ${error.message}`);
    else console.log(`  ✓ ${f.name}`);
  }

  // ── Community Links ────────────────────────────────────
  console.log("\n🔗 Seeding community links...");
  const { COMMUNITY_LINKS } = await import("../data/community-links");
  for (const l of COMMUNITY_LINKS) {
    const { error } = await supabase.from("community_links").upsert({
      id: l.id,
      university_id: l.university_id,
      title: l.title,
      description: l.description,
      url: l.url,
      category: l.category,
    }, { onConflict: "id" });
    if (error) console.error(`  ❌ ${l.title}: ${error.message}`);
    else console.log(`  ✓ ${l.title}`);
  }

  console.log("\n✅ Seeding complete!");
}

seed().catch(console.error);
