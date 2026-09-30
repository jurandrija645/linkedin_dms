import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, '..');

config({ path: path.join(ROOT, '.env.local') });
config({ path: path.join(ROOT, '.env') });

export function env(name: string, required = true): string {
  const v = process.env[name];
  if (!v && required) {
    console.error(`Nedostaje ${name} u .env.local`);
    process.exit(1);
  }
  return v ?? '';
}

let _db: SupabaseClient | null = null;
export function db(): SupabaseClient {
  if (!_db) {
    _db = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), {
      auth: { persistSession: false },
    });
  }
  return _db;
}

export async function log(leadId: string | null, action: string, payload?: unknown) {
  await db().from('mlo_activity_log').insert({ lead_id: leadId, action, payload: payload ?? null });
}

/** https://www.linkedin.com/in/slug — bez query stringa, bez zadnje kose crte */
export function normalizeLinkedInUrl(raw: string): string {
  let u = (raw || '').trim();
  if (!u) return '';
  u = u.split('?')[0].split('#')[0].replace(/\/+$/, '');
  u = u.replace(/^http:\/\//i, 'https://');
  if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
  u = u.replace(/^https:\/\/(?:[a-z]{2,3}\.)?linkedin\.com/i, 'https://www.linkedin.com');
  return u;
}

/** "15 Jul 2026" -> "2026-07-15" */
const MONTHS: Record<string, string> = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
};
export function parseConnectedOn(raw: string): string | null {
  const s = (raw || '').trim();
  if (!s) return null;
  const m = s.match(/^(\d{1,2})\s+([A-Za-z]{3,})\s+(\d{4})$/);
  if (m) {
    const mm = MONTHS[m[2].slice(0, 3).toLowerCase()];
    if (mm) return `${m[3]}-${mm}-${m[1].padStart(2, '0')}`;
  }
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

/** "Ivo Šarić" -> "ivo-saric" */
export function slugify(s: string): string {
  return s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addDays(days: number, from = new Date()): string {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 ? process.argv[i + 1] : undefined;
}

export function flag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

export function fullName(l: { first_name?: string | null; last_name?: string | null }): string {
  return [l.first_name, l.last_name].filter(Boolean).join(' ').trim();
}
