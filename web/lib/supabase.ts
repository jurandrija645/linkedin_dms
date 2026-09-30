import 'server-only';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let cached: SupabaseClient | null = null;

/** Service role klijent. Samo server-side. Nikad ne izvoziti u klijent. */
export function db(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Nedostaje SUPABASE_URL ili SUPABASE_SERVICE_ROLE_KEY.');
  }
  cached = createClient(url, key, { auth: { persistSession: false } });
  return cached;
}

export async function logActivity(leadId: string | null, action: string, payload?: unknown) {
  await db().from('mlo_activity_log').insert({ lead_id: leadId, action, payload: payload ?? null });
}
