/**
 * Import / merge LinkedIn Connections.csv.
 *
 *   npx tsx scripts/import-connections.ts --dry-run
 *   npx tsx scripts/import-connections.ts
 *   npx tsx scripts/import-connections.ts --cutoff "Ben Inzelbuch" --file inputs/linkedin/Connections.csv
 *
 * Cutoff ide po POZICIJI u CSV-u, ne po datumu.
 * CSV je poredan od najnovijih (csv_order 0) prema najstarijima.
 * Cutoff osoba i svi stariji (veci csv_order) -> legacy. Noviji -> new.
 */
import { readFileSync, existsSync, appendFileSync } from 'node:fs';
import path from 'node:path';
import { parse } from 'csv-parse/sync';
import { ROOT, db, normalizeLinkedInUrl, parseConnectedOn, arg, flag, log } from './lib.js';

const DRY = flag('dry-run');
const CUTOFF = (arg('cutoff') ?? 'Ben Inzelbuch').trim().toLowerCase();
const FILE = path.resolve(ROOT, arg('file') ?? 'inputs/linkedin/Connections.csv');

if (!existsSync(FILE)) {
  console.error(`Nema fajla: ${FILE}`);
  console.error('Stavi LinkedIn export u inputs/linkedin/Connections.csv');
  process.exit(1);
}

// --- 1. nadi pravi header (LinkedIn stavlja "Notes:" retke na vrh) ---
const raw = readFileSync(FILE, 'utf8').replace(/^\uFEFF/, '');
const lines = raw.split(/\r?\n/);
const headerIdx = lines.findIndex(
  (l) => /first\s*name/i.test(l) && /\burl\b/i.test(l)
);
if (headerIdx === -1) {
  console.error('Ne nalazim header red s "First Name" i "URL".');
  process.exit(1);
}
const csvBody = lines.slice(headerIdx).join('\n');

type Row = Record<string, string>;
const rows: Row[] = parse(csvBody, {
  columns: (h: string[]) => h.map((c) => c.trim().toLowerCase().replace(/\s+/g, '_')),
  skip_empty_lines: true,
  relax_column_count: true,
  trim: true,
});

// --- 2. mapiraj, csv_order = pozicija u originalnom exportu ---
const people = rows
  .map((r, i) => ({
    csv_order: i,
    first_name: r['first_name'] || null,
    last_name: r['last_name'] || null,
    linkedin_url: normalizeLinkedInUrl(r['url'] || ''),
    email: r['email_address'] || null,
    company: r['company'] || null,
    headline_position: r['position'] || null,
    connected_on: parseConnectedOn(r['connected_on'] || ''),
  }))
  .filter((p) => p.linkedin_url);

const name = (p: { first_name: string | null; last_name: string | null }) =>
  [p.first_name, p.last_name].filter(Boolean).join(' ');

// --- 3. cutoff ---
const cutoffIdx = people.findIndex((p) => name(p).toLowerCase() === CUTOFF);
if (cutoffIdx === -1) {
  console.error(`Ne nalazim cutoff osobu "${arg('cutoff') ?? 'Ben Inzelbuch'}" u CSV-u.`);
  console.error('Provjeri ime ili proslijedi --cutoff "Ime Prezime".');
  process.exit(1);
}

console.log(`\nFajl: ${path.relative(ROOT, FILE)}`);
console.log(`Header na retku ${headerIdx + 1}, ukupno ${people.length} konekcija.\n`);
console.log('Kontekst oko cutoffa (csv_order | ime | pozicija | firma | datum):\n');
for (let i = Math.max(0, cutoffIdx - 3); i <= Math.min(people.length - 1, cutoffIdx + 3); i++) {
  const p = people[i];
  const mark = i === cutoffIdx ? ' <<< CUTOFF' : '';
  const side = i < cutoffIdx ? 'new   ' : 'legacy';
  console.log(
    `  ${side} ${String(p.csv_order).padStart(4)} | ${name(p).padEnd(24)} | ${(p.headline_position ?? '').slice(0, 34).padEnd(34)} | ${(p.company ?? '').slice(0, 22).padEnd(22)} | ${p.connected_on ?? ''}${mark}`
  );
}

const toInsert = people.map((p) => ({
  ...p,
  status: p.csv_order < cutoffIdx ? 'new' : 'legacy',
}));
const newCount = toInsert.filter((p) => p.status === 'new').length;
const legacyCount = toInsert.length - newCount;
console.log(`\nnew: ${newCount}   legacy (cutoff i stariji): ${legacyCount}`);

// --- 4. sto je vec u bazi ---
const client = db();
const existing = new Set<string>();
{
  let from = 0;
  const page = 1000;
  for (;;) {
    const { data, error } = await client
      .from('mlo_leads')
      .select('linkedin_url')
      .range(from, from + page - 1);
    if (error) {
      console.error('Supabase greška:', error.message);
      process.exit(1);
    }
    (data ?? []).forEach((r: { linkedin_url: string }) => existing.add(r.linkedin_url));
    if (!data || data.length < page) break;
    from += page;
  }
}

const fresh = toInsert.filter((p) => !existing.has(p.linkedin_url));
const dupes = toInsert.length - fresh.length;
console.log(`U bazi već: ${dupes}   za unijeti: ${fresh.length}`);

if (DRY) {
  console.log('\n[dry-run] Ništa nije upisano. Potvrdi pa pokreni bez --dry-run.');
  process.exit(0);
}

if (fresh.length === 0) {
  console.log('\nNema novih konekcija.');
  process.exit(0);
}

// --- 5. upis u batchevima, dedupe po linkedin_url, postojece ne diramo ---
let inserted = 0;
for (let i = 0; i < fresh.length; i += 500) {
  const chunk = fresh.slice(i, i + 500);
  const { error, data } = await client.from('mlo_leads').insert(chunk).select('id');
  if (error) {
    console.error('Greška kod unosa:', error.message);
    process.exit(1);
  }
  inserted += data?.length ?? 0;
  process.stdout.write(`  ${inserted}/${fresh.length}\r`);
}

const freshNew = fresh.filter((p) => p.status === 'new').length;
console.log(`\nUneseno ${inserted} (novih za obradu: ${freshNew}, legacy: ${inserted - freshNew}).`);

await log(null, 'import', {
  file: path.basename(FILE),
  total: people.length,
  inserted,
  new: freshNew,
  legacy: inserted - freshNew,
  skipped_dupes: dupes,
  cutoff: arg('cutoff') ?? 'Ben Inzelbuch',
});

appendFileSync(
  path.join(ROOT, 'data', 'import-log.md'),
  `- ${new Date().toISOString().slice(0, 16).replace('T', ' ')} | ${path.basename(FILE)} | u CSV-u ${people.length} | uneseno ${inserted} (new ${freshNew}, legacy ${inserted - freshNew}) | duplikata preskočeno ${dupes} | cutoff ${arg('cutoff') ?? 'Ben Inzelbuch'}\n`
);

const { count } = await client
  .from('mlo_leads')
  .select('*', { count: 'exact', head: true })
  .eq('status', 'new');
console.log(`Ukupno sa statusom new: ${count}. Sljedeći korak: /sljedeci`);
