/**
 * Rucno dodaj osobu sa statusom `new`.
 *   npx tsx scripts/add-lead.ts --url "https://www.linkedin.com/in/netko" \
 *     --first "Ime" --last "Prezime" --company "Firma" --position "Pozicija"
 */
import { db, log, normalizeLinkedInUrl, arg, fullName } from './lib.js';

const url = normalizeLinkedInUrl(arg('url') ?? process.argv[2] ?? '');
if (!url || !/linkedin\.com\/in\//i.test(url)) {
  console.error('Treba valjan LinkedIn profil URL: --url "https://www.linkedin.com/in/slug"');
  process.exit(1);
}

// ako ime nije dano, pokusaj iz sluga (pretpostavka, ne cinjenica)
const slug = url.split('/in/')[1] ?? '';
const guess = slug.replace(/-[0-9a-f]{4,}$/i, '').split('-');
const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : '');

const first = arg('first') || cap(guess[0] ?? '');
const last = arg('last') || guess.slice(1).map(cap).join(' ');

const client = db();
const { data: existing } = await client
  .from('mlo_leads')
  .select('id, first_name, last_name, status')
  .eq('linkedin_url', url)
  .maybeSingle();

if (existing) {
  console.log(`Već postoji: ${fullName(existing)} | status: ${existing.status} | ništa nije promijenjeno.`);
  process.exit(0);
}

const { data, error } = await client
  .from('mlo_leads')
  .insert({
    linkedin_url: url,
    first_name: first || null,
    last_name: last || null,
    company: arg('company') ?? null,
    headline_position: arg('position') ?? null,
    status: 'new',
    csv_order: null,
    notes: arg('first') ? null : 'Ime pretpostavljeno iz LinkedIn slug-a, provjeriti.',
  })
  .select('id')
  .single();

if (error) {
  console.error('Greška:', error.message);
  process.exit(1);
}

await log(data.id, 'added_manually', { url });
console.log(`Dodano: ${[first, last].filter(Boolean).join(' ')} | ${url} | status: new`);
