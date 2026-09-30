/**
 * Gurni brief JSON u Supabase i postavi status.
 *   npx tsx scripts/push-brief.ts data/briefs/2026-09-11_vladimir-janackovic.json
 *
 * Match po linkedin_url. Ako lead ne postoji, kreira ga.
 * tier SKIP -> status `skipped`, inace `ready`.
 */
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { ROOT, db, log, normalizeLinkedInUrl } from './lib.js';

const file = process.argv[2];
if (!file) {
  console.error('Uporaba: npx tsx scripts/push-brief.ts <put/do/brief.json>');
  process.exit(1);
}
const abs = path.resolve(ROOT, file);
if (!existsSync(abs)) {
  console.error(`Nema fajla: ${abs}`);
  process.exit(1);
}

type Brief = {
  name?: string;
  linkedin_url?: string;
  role?: string;
  company?: string;
  vertical?: string;
  identity_confidence?: string;
  tier?: string;
  tier_reason?: string;
  offer?: string;
  hook_type?: string;
  language?: string;
  dm?: string;
  permission_dm?: string;
  followup_viewed?: string;
  followup_not_viewed?: string;
  workflows?: { id: string; why: string }[];
  sources?: string[];
  asset_type?: string;
  asset_reason?: string;
  opener?: string;
  tech_stack?: string[];
  workflow_gap?: { what_to_show?: string; n8n_search?: string };
  website_demo?: {
    why?: string;
    current_site_problems?: string[];
    demo_url?: string;
    demo_status?: string;
    brand_risk?: string;
  };
};

const brief: Brief = JSON.parse(readFileSync(abs, 'utf8'));

// --- validacija ---
const errs: string[] = [];
const url = normalizeLinkedInUrl(brief.linkedin_url ?? '');
if (!url) errs.push('nedostaje linkedin_url');
if (!brief.tier || !['A', 'B', 'C', 'SKIP'].includes(brief.tier)) errs.push('tier mora biti A, B, C ili SKIP');
if (brief.tier === 'SKIP' && !brief.tier_reason) errs.push('SKIP mora imati tier_reason');
if (brief.tier === 'B' && !brief.permission_dm) errs.push('B tier mora imati permission_dm');
if (brief.tier && brief.tier !== 'SKIP') {
  if (!brief.sources?.length) errs.push('sources ne smije biti prazan');
  if (!brief.dm && !brief.permission_dm) errs.push('nedostaje dm ili permission_dm');
  if ((brief.workflows?.length ?? 0) > 2) errs.push('maksimalno 2 workflowa');
}
// --- asset_type (CLAUDE.md sekcija 5b) ---
const asset = brief.asset_type;
if (!asset || !['website_demo', 'n8n_loom', 'none'].includes(asset)) {
  errs.push('asset_type mora biti website_demo, n8n_loom ili none');
}
if ((brief.tier === 'SKIP' || brief.tier === 'C') && asset && asset !== 'none') {
  errs.push(`tier ${brief.tier} mora imati asset_type "none"`);
}
if (brief.tier === 'B' && asset && asset !== 'n8n_loom') {
  errs.push('tier B mora imati asset_type "n8n_loom", demo se ne obecava prije dopustenja');
}
if (asset === 'website_demo') {
  if (brief.tier !== 'A') errs.push('website_demo je dopusten samo za tier A');
  if (brief.identity_confidence !== 'high') {
    errs.push('website_demo trazi identity_confidence "high", inace ide n8n_loom');
  }
  const wd = brief.website_demo;
  if (!wd?.why) errs.push('website_demo.why je obavezan');
  if (!wd?.current_site_problems?.length) errs.push('website_demo.current_site_problems ne smije biti prazan');
  if (wd?.brand_risk && wd.brand_risk !== 'none') {
    errs.push(`website_demo.brand_risk je "${wd.brand_risk}", takvi leadovi idu na n8n_loom`);
  }
  if (wd?.demo_status && !['todo', 'built', 'sent'].includes(wd.demo_status)) {
    errs.push('website_demo.demo_status mora biti todo, built ili sent');
  }
  if (wd?.demo_status && wd.demo_status !== 'todo' && !wd.demo_url) {
    errs.push('demo_status nije "todo" a demo_url je prazan');
  }
} else if (asset === 'n8n_loom') {
  if (!brief.workflows?.length && !brief.workflow_gap?.what_to_show) {
    errs.push('n8n_loom bez workflowa mora imati workflow_gap.what_to_show');
  }
}

// --- opener (CLAUDE.md sekcija 5c) ---
// Kod website demoa opener je neobavezan: demo je sam po sebi otvaranje.
if ((brief.tier === 'A' || brief.tier === 'B') && asset !== 'website_demo') {
  if (!brief.opener) errs.push(`tier ${brief.tier} mora imati opener`);
}
if (brief.tier === 'A' || brief.tier === 'B') {
  if (brief.opener && /https?:\/\//.test(brief.opener)) {
    errs.push('opener ne smije sadrzavati link');
  }
}
if ((brief.tier === 'SKIP' || brief.tier === 'C') && brief.opener) {
  errs.push(`tier ${brief.tier} ne salje opener`);
}
if (brief.opener && brief.opener.length > 300) {
  console.warn(`Upozorenje: opener ima ${brief.opener.length} znakova (cilj ~250).`);
}
if (brief.opener?.includes('—')) {
  console.warn('Upozorenje: opener sadrzi em dash. Playbook kaze bez njih.');
}

if (brief.tier === 'A' && brief.dm && brief.dm.length > 400) {
  console.warn(`Upozorenje: DM ima ${brief.dm.length} znakova (cilj ~350).`);
}
if (brief.dm?.includes('—') || brief.permission_dm?.includes('—')) {
  console.warn('Upozorenje: DM sadrži em dash. Playbook kaže bez njih.');
}
if (errs.length) {
  console.error('Brief nije valjan:');
  errs.forEach((e) => console.error('  - ' + e));
  process.exit(1);
}

const demoPending =
  brief.asset_type === 'website_demo' && (brief.website_demo?.demo_status ?? 'todo') === 'todo';

const status =
  brief.tier === 'SKIP' ? 'skipped' : demoPending ? 'needs_demo' : 'ready';

const patch: Record<string, unknown> = {
  status,
  tier: brief.tier,
  identity_confidence: brief.identity_confidence ?? null,
  vertical: brief.vertical ?? null,
  language: brief.language ?? null,
  hook_type: brief.hook_type ?? null,
  offer: brief.offer ?? null,
  brief,
  dm_draft: brief.dm ?? null,
  permission_dm: brief.permission_dm ?? null,
  followup_viewed: brief.followup_viewed ?? null,
  followup_not_viewed: brief.followup_not_viewed ?? null,
  skip_reason: brief.tier === 'SKIP' ? (brief.tier_reason ?? null) : null,
  asset_type: brief.asset_type ?? null,
  demo_url: brief.website_demo?.demo_url || null,
  demo_status:
    brief.asset_type === 'website_demo' ? (brief.website_demo?.demo_status ?? 'todo') : null,
  opener: brief.opener ?? null,
  tech_stack: brief.tech_stack?.length ? brief.tech_stack : null,
};

// Kolone dolaze iz supabase/2026-09-21_website-demo.sql i 2026-09-22_opener.sql.
// Ako migracija jos nije pokrenuta, padamo natrag na patch bez njih i upozorimo.
const ASSET_COLS = ['asset_type', 'demo_url', 'demo_status', 'opener', 'tech_stack'];
const patchNoAsset = Object.fromEntries(
  Object.entries(patch).filter(([k]) => !ASSET_COLS.includes(k))
);
const missingAssetCols = (msg: string) =>
  ASSET_COLS.some((c) => msg.includes(c)) && /column|schema cache/i.test(msg);
const migrationHint =
  'Kolone za asset/opener jos ne postoje. Pokreni supabase/2026-09-21_website-demo.sql i supabase/2026-09-22_opener.sql u Supabase SQL Editoru.';

const client = db();
const { data: existing } = await client
  .from('mlo_leads')
  .select('id, first_name, last_name')
  .eq('linkedin_url', url)
  .maybeSingle();

// Bez migracije nema ni statusa `needs_demo` u check constraintu.
const fallbackPatch = { ...patchNoAsset, status: status === 'needs_demo' ? 'ready' : status };
let usedFallback = false;

let id: string;
if (existing) {
  let { error } = await client.from('mlo_leads').update(patch).eq('id', existing.id);
  if (error && missingAssetCols(error.message)) {
    usedFallback = true;
    ({ error } = await client.from('mlo_leads').update(fallbackPatch).eq('id', existing.id));
  }
  if (error) {
    console.error('Greška:', error.message);
    process.exit(1);
  }
  id = existing.id;
} else {
  const parts = (brief.name ?? '').trim().split(/\s+/);
  const identity = {
    linkedin_url: url,
    first_name: parts[0] ?? null,
    last_name: parts.slice(1).join(' ') || null,
    company: brief.company ?? null,
    headline_position: brief.role ?? null,
  };
  let { data, error } = await client
    .from('mlo_leads')
    .insert({ ...patch, ...identity })
    .select('id')
    .single();
  if (error && missingAssetCols(error.message)) {
    usedFallback = true;
    ({ data, error } = await client
      .from('mlo_leads')
      .insert({ ...fallbackPatch, ...identity })
      .select('id')
      .single());
  }
  if (error || !data) {
    console.error('Greška:', error?.message ?? 'insert nije vratio redak');
    process.exit(1);
  }
  id = data.id;
  console.log('Lead nije postojao, kreiran novi.');
}

// Kad migracija fali, u bazu je otisao fallbackPatch, ne patch.
const storedStatus = usedFallback ? (fallbackPatch.status as string) : status;

if (usedFallback) {
  console.warn(`Upozorenje: ${migrationHint}`);
  console.warn('Asset polja su spremljena samo u brief jsonb.');
  if (storedStatus !== status) {
    console.warn(`Status je spremljen kao "${storedStatus}" umjesto "${status}".`);
  }
}

await log(id, storedStatus, {
  tier: brief.tier,
  offer: brief.offer,
  identity_confidence: brief.identity_confidence,
  brief_file: path.relative(ROOT, abs),
});

console.log(
  `${brief.name ?? url} | ${brief.tier} | ${brief.offer ?? brief.tier_reason ?? ''} | ${brief.identity_confidence ?? '-'} | -> ${storedStatus}`
);
