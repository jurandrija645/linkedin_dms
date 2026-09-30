import 'server-only';
import { db } from './supabase';
import type { Lead, Workflow } from './types';

const TIER_ORDER: Record<string, number> = { A: 0, B: 1, C: 2, SKIP: 3 };

export async function getReadyLeads(): Promise<Lead[]> {
  const { data, error } = await db()
    .from('mlo_leads')
    .select('*')
    .in('status', ['ready', 'recorded', 'needs_demo'])
    .order('csv_order', { ascending: false, nullsFirst: true });
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as Lead[];
  // Prvo oni koje se moze snimiti odmah, tek onda oni kojima demo jos treba izgraditi.
  const rank = (l: Lead) => (l.status === 'needs_demo' ? 1 : 0);
  return rows.sort(
    (a, b) =>
      rank(a) - rank(b) ||
      (TIER_ORDER[a.tier ?? 'SKIP'] ?? 9) - (TIER_ORDER[b.tier ?? 'SKIP'] ?? 9)
  );
}

/**
 * Leadovi kojima je opener napisan a jos nije poslan. Salje se dan prije Looma.
 *
 * Filtrira se u JS-u, a ne u SQL-u, da stranica radi i prije nego se pokrene
 * supabase/2026-09-22_opener.sql. Dok kolona `opener` ne postoji, cita se
 * vrijednost iz `brief` jsonb-a.
 */
export async function getOpenerQueue(): Promise<Lead[]> {
  const { data, error } = await db()
    .from('mlo_leads')
    .select('*')
    .in('status', ['ready', 'recorded', 'needs_demo'])
    .order('csv_order', { ascending: false, nullsFirst: true });
  if (error) throw new Error(error.message);
  const rows = ((data ?? []) as Lead[]).filter(
    (l) => !!(l.opener ?? l.brief?.opener) && !l.opener_sent_at
  );
  return rows.sort(
    (a, b) => (TIER_ORDER[a.tier ?? 'SKIP'] ?? 9) - (TIER_ORDER[b.tier ?? 'SKIP'] ?? 9)
  );
}

/** Leadovi kojima je brief gotov, ali demo stranica jos nije izgradjena. */
export async function getDemoQueue(): Promise<Lead[]> {
  const { data, error } = await db()
    .from('mlo_leads')
    .select('*')
    .eq('status', 'needs_demo')
    .order('csv_order', { ascending: false, nullsFirst: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Lead[];
}

export async function getFollowupLeads(): Promise<Lead[]> {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await db()
    .from('mlo_leads')
    .select('*')
    .eq('status', 'sent')
    .lte('followup_due', today)
    .order('followup_due', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Lead[];
}

export async function getFollowupUpcoming(): Promise<number> {
  const today = new Date().toISOString().slice(0, 10);
  const { count } = await db()
    .from('mlo_leads')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'sent')
    .gt('followup_due', today);
  return count ?? 0;
}

export async function getAllLeads(filters: {
  status?: string;
  tier?: string;
  vertical?: string;
  q?: string;
}): Promise<Lead[]> {
  let query = db().from('mlo_leads').select('*');
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.tier) query = query.eq('tier', filters.tier);
  if (filters.vertical) query = query.eq('vertical', filters.vertical);
  if (filters.q) {
    const q = `%${filters.q}%`;
    query = query.or(`first_name.ilike.${q},last_name.ilike.${q},company.ilike.${q}`);
  }
  const { data, error } = await query
    .order('updated_at', { ascending: false })
    .limit(500);
  if (error) throw new Error(error.message);
  return (data ?? []) as Lead[];
}

export async function getLead(id: string): Promise<Lead | null> {
  const { data } = await db().from('mlo_leads').select('*').eq('id', id).maybeSingle();
  return (data as Lead) ?? null;
}

export async function getWorkflows(ids: string[]): Promise<Workflow[]> {
  if (!ids.length) return [];
  const { data } = await db().from('mlo_workflows').select('*').in('id', ids);
  return (data ?? []) as Workflow[];
}

export async function getVerticals(): Promise<string[]> {
  const { data } = await db().from('mlo_leads').select('vertical').not('vertical', 'is', null).limit(2000);
  const set = new Set((data ?? []).map((r: { vertical: string }) => r.vertical));
  return [...set].sort();
}

/** Koliko je danas poslano + niz uzastopnih dana s barem jednim poslanim. */
export async function getTodayAndStreak(): Promise<{ today: number; streak: number }> {
  const since = new Date();
  since.setDate(since.getDate() - 400);
  const { data } = await db()
    .from('mlo_leads')
    .select('sent_at')
    .not('sent_at', 'is', null)
    .gte('sent_at', since.toISOString())
    .order('sent_at', { ascending: false });

  const local = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const daysWithSends = new Set((data ?? []).map((r: { sent_at: string }) => local(r.sent_at)));

  const now = new Date();
  const todayKey = local(now.toISOString());
  const today = (data ?? []).filter((r: { sent_at: string }) => local(r.sent_at) === todayKey).length;

  // Streak: krece od danas ako je danas poslano, inace od jucer.
  let streak = 0;
  const cursor = new Date(now);
  if (!daysWithSends.has(todayKey)) cursor.setDate(cursor.getDate() - 1);
  for (;;) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
    if (!daysWithSends.has(key)) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return { today, streak };
}
