/**
 * SUPABASE CLIENT
 *
 * Uses environment variables:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *
 * If either is missing, supabase will be null and the app
 * falls back to local data files automatically.
 *
 * Setup:
 *   1. Create a Supabase project at supabase.com
 *   2. Copy URL and anon key from Settings → API
 *   3. Create .env.local with both variables
 *   4. Run the SQL schema from supabase/schema.sql
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;

if (url && key) {
  supabase = createClient(url, key);
}

export default supabase;

/** Check if Supabase is configured and available */
export function isSupabaseAvailable(): boolean {
  return supabase !== null;
}
