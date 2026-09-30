/**
 * Skeniraj inputs/n8n-workflows/*.json i napravi/osvjezi catalog/workflows.json.
 *
 *   npx tsx scripts/build-catalog.ts          -> samo skenira i pise skeleton
 *   npx tsx scripts/build-catalog.ts --push   -> upsert u tablicu workflows
 *
 * Polja what_it_does / best_for_verticals / demo_tip popunjava Claude rucno
 * u catalog/workflows.json. Skripta ih NE prepisuje ako vec postoje.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { ROOT, db, env, flag, slugify } from './lib.js';

const SRC = path.join(ROOT, 'inputs', 'n8n-workflows');
const OUT = path.join(ROOT, 'catalog', 'workflows.json');
const BASE = (process.env.N8N_BASE_URL ?? '').replace(/\/+$/, '');

type Entry = {
  id: string;
  name: string;
  n8n_url: string;
  what_it_does: string;
  trigger: string;
  integrations: string[];
  best_for_verticals: string[];
  demo_tip: string;
};

const INTERNAL = new Set([
  'set', 'if', 'switch', 'code', 'function', 'functionitem', 'merge', 'noop',
  'stickynote', 'splitinbatches', 'splitout', 'aggregate', 'itemlists',
  'executeworkflow', 'executeworkflowtrigger', 'filter', 'wait', 'limit',
  'datetime', 'renamekeys', 'removeduplicates', 'sort', 'html', 'xml',
  'converttofile', 'extractfromfile', 'respondtowebhook', 'stopanderror',
]);

function shortType(t: string): string {
  return (t || '').split('.').pop()?.replace(/Trigger$/, '') ?? '';
}

function describeTrigger(nodes: any[]): string {
  const t = nodes.find((n) => /trigger|webhook|formTrigger|chatTrigger/i.test(n?.type ?? ''));
  if (!t) return 'ručno';
  const s = shortType(t.type).toLowerCase();
  if (s.includes('webhook')) return 'webhook';
  if (s.includes('schedule') || s.includes('cron')) return 'raspored';
  if (s.includes('form')) return 'web formular';
  if (s.includes('chat')) return 'chat';
  if (s.includes('emailread') || s.includes('imap')) return 'novi email';
  if (s.includes('gmail')) return 'Gmail događaj';
  return s || 'ručno';
}

function integrations(nodes: any[]): string[] {
  const out = new Set<string>();
  for (const n of nodes) {
    const s = shortType(n?.type ?? '');
    const key = s.toLowerCase();
    if (!s || INTERNAL.has(key) || key.startsWith('manual')) continue;
    out.add(s);
  }
  return [...out].sort();
}

if (!existsSync(SRC) || !readdirSync(SRC).some((f) => f.endsWith('.json'))) {
  console.error(`Nema .json fajlova u ${path.relative(ROOT, SRC)}.`);
  console.error('Exportaj workflowe iz n8n (workflow > ... > Download) i stavi ih tamo.');
  process.exit(1);
}

const previous: Record<string, Entry> = {};
if (existsSync(OUT)) {
  for (const e of JSON.parse(readFileSync(OUT, 'utf8')) as Entry[]) previous[e.id] = e;
}

const entries: Entry[] = [];
for (const f of readdirSync(SRC).filter((f) => f.endsWith('.json'))) {
  let wf: any;
  try {
    wf = JSON.parse(readFileSync(path.join(SRC, f), 'utf8'));
  } catch {
    console.warn(`Preskačem ${f}: nije valjan JSON.`);
    continue;
  }
  const nodes: any[] = Array.isArray(wf?.nodes) ? wf.nodes : [];
  const name = wf?.name ?? path.basename(f, '.json');
  const id = String(wf?.id ?? slugify(name));
  const prev = previous[id];
  entries.push({
    id,
    name,
    n8n_url: BASE ? `${BASE}/workflow/${id}` : (prev?.n8n_url ?? ''),
    what_it_does: prev?.what_it_does ?? '',
    trigger: describeTrigger(nodes),
    integrations: integrations(nodes),
    best_for_verticals: prev?.best_for_verticals ?? [],
    demo_tip: prev?.demo_tip ?? '',
  });
}

entries.sort((a, b) => a.name.localeCompare(b.name));
writeFileSync(OUT, JSON.stringify(entries, null, 2) + '\n');
console.log(`Zapisano ${entries.length} workflowa u ${path.relative(ROOT, OUT)}.`);

const missing = entries.filter((e) => !e.what_it_does || !e.demo_tip);
if (missing.length) {
  console.log(`\nTreba popuniti what_it_does / demo_tip za ${missing.length}:`);
  missing.forEach((e) => console.log(`  - ${e.name}  (trigger: ${e.trigger}, integracije: ${e.integrations.join(', ') || '-'})`));
}
if (!BASE) console.log('\nN8N_BASE_URL nije postavljen, n8n_url je prazan.');

if (flag('push')) {
  if (missing.length) {
    console.error('\nNe pusham dok what_it_does i demo_tip nisu popunjeni za sve.');
    process.exit(1);
  }
  env('SUPABASE_URL');
  const { error } = await db().from('mlo_workflows').upsert(entries, { onConflict: 'id' });
  if (error) {
    console.error('Greška:', error.message);
    process.exit(1);
  }
  console.log(`Pushano ${entries.length} workflowa u Supabase.`);
}
