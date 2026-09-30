/**
 * Podaci za /analiza.
 *   npx tsx scripts/stats.ts          -> citljiv ispis
 *   npx tsx scripts/stats.ts --json   -> sirovi JSON (ukljucuje tekstove odgovora)
 */
import { db, flag, fullName } from './lib.js';

const SENT = ['sent', 'followed_up', 'replied', 'call_booked', 'not_interested'];

type Row = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  company: string | null;
  status: string;
  tier: string | null;
  vertical: string | null;
  language: string | null;
  hook_type: string | null;
  offer: string | null;
  identity_confidence: string | null;
  loom_url: string | null;
  viewed: boolean;
  sent_at: string | null;
  replied_at: string | null;
  reply_text: string | null;
  reply_sentiment: string | null;
  dm_draft: string | null;
  dm_final: string | null;
  skip_reason: string | null;
};

const { data, error } = await db()
  .from('mlo_leads')
  .select(
    'id, first_name, last_name, company, status, tier, vertical, language, hook_type, offer, ' +
      'identity_confidence, loom_url, viewed, sent_at, replied_at, reply_text, reply_sentiment, ' +
      'dm_draft, dm_final, skip_reason'
  )
  .not('status', 'in', '("new","queued","legacy")');

if (error) {
  console.error('Greška:', error.message);
  process.exit(1);
}

const rows = (data ?? []) as unknown as Row[];
const sent = rows.filter((r) => SENT.includes(r.status));
const replied = rows.filter((r) => r.replied_at);

function rate(group: Row[]) {
  const s = group.filter((r) => SENT.includes(r.status));
  const rep = s.filter((r) => r.replied_at);
  return { sent: s.length, replied: rep.length, pct: s.length ? Math.round((rep.length / s.length) * 100) : 0 };
}

function by(key: (r: Row) => string | null) {
  const out: Record<string, ReturnType<typeof rate>> = {};
  for (const k of new Set(rows.map(key).filter(Boolean) as string[])) {
    out[k] = rate(rows.filter((r) => key(r) === k));
  }
  return out;
}

const days = replied
  .filter((r) => r.sent_at && r.replied_at)
  .map((r) => (new Date(r.replied_at!).getTime() - new Date(r.sent_at!).getTime()) / 86400000);

const result = {
  funnel: {
    ready: rows.filter((r) => r.status === 'ready').length,
    recorded: rows.filter((r) => r.loom_url).length,
    sent: sent.length,
    replied: replied.length,
    call_booked: rows.filter((r) => r.status === 'call_booked').length,
    skipped: rows.filter((r) => r.status === 'skipped').length,
  },
  by_tier: by((r) => r.tier),
  by_vertical: by((r) => r.vertical),
  by_hook_type: by((r) => r.hook_type),
  by_language: by((r) => r.language),
  by_identity_confidence: by((r) => r.identity_confidence),
  video_vs_no_video: {
    video: rate(rows.filter((r) => r.loom_url)),
    no_video: rate(rows.filter((r) => !r.loom_url)),
  },
  avg_days_to_reply: days.length ? Number((days.reduce((a, b) => a + b, 0) / days.length).toFixed(1)) : null,
  sentiment: Object.fromEntries(
    ['pozitivan', 'neutralan', 'negativan', 'ne_sad'].map((s) => [s, replied.filter((r) => r.reply_sentiment === s).length])
  ),
  replies: replied.map((r) => ({
    name: fullName(r),
    company: r.company,
    tier: r.tier,
    vertical: r.vertical,
    language: r.language,
    hook_type: r.hook_type,
    had_video: !!r.loom_url,
    viewed: r.viewed,
    sentiment: r.reply_sentiment,
    reply_text: r.reply_text,
  })),
  dm_edits: sent
    .filter((r) => r.dm_final && r.dm_draft && r.dm_final.trim() !== r.dm_draft.trim())
    .map((r) => ({ name: fullName(r), tier: r.tier, draft: r.dm_draft, final: r.dm_final })),
};

if (flag('json')) {
  console.log(JSON.stringify(result, null, 2));
} else {
  const f = result.funnel;
  console.log(
    `\nFunnel: ready ${f.ready} -> snimljeno ${f.recorded} -> poslano ${f.sent} -> odgovorilo ${f.replied} -> call ${f.call_booked}   (skipped ${f.skipped})`
  );
  const show = (label: string, o: Record<string, ReturnType<typeof rate>>) => {
    console.log(`\n${label}:`);
    Object.entries(o)
      .sort((a, b) => b[1].sent - a[1].sent)
      .forEach(([k, v]) => console.log(`  ${k.padEnd(18)} ${String(v.replied).padStart(3)}/${String(v.sent).padEnd(3)} = ${v.pct}%${v.sent < 10 ? '  (uzorak premalen)' : ''}`));
  };
  show('Po tieru', result.by_tier);
  show('Po vertikali', result.by_vertical);
  show('Po hooku', result.by_hook_type);
  show('Po jeziku', result.by_language);
  show('Video vs bez', result.video_vs_no_video as any);
  console.log(`\nProsječno dana do odgovora: ${result.avg_days_to_reply ?? '-'}`);
  console.log(`Rukom mijenjanih DM-ova: ${result.dm_edits.length}`);
}
