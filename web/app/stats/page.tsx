import { db } from '@/lib/supabase';
import { Card, Empty } from '@/components/ui';

export const dynamic = 'force-dynamic';

const SENT = ['sent', 'followed_up', 'replied', 'call_booked', 'not_interested'];

type Row = {
  status: string;
  tier: string | null;
  vertical: string | null;
  language: string | null;
  hook_type: string | null;
  loom_url: string | null;
  sent_at: string | null;
  replied_at: string | null;
  reply_sentiment: string | null;
};

function rate(rows: Row[]) {
  const s = rows.filter((r) => SENT.includes(r.status));
  const rep = s.filter((r) => r.replied_at);
  return { sent: s.length, replied: rep.length, pct: s.length ? Math.round((rep.length / s.length) * 100) : 0 };
}

function Breakdown({
  title,
  groups,
}: {
  title: string;
  groups: [string, ReturnType<typeof rate>][];
}) {
  const visible = groups.filter(([, v]) => v.sent > 0).sort((a, b) => b[1].sent - a[1].sent);
  if (!visible.length) return null;
  const max = Math.max(...visible.map(([, v]) => v.pct), 1);

  return (
    <Card>
      <h2 className="mb-3 text-sm font-semibold">{title}</h2>
      <div className="space-y-2">
        {visible.map(([k, v]) => (
          <div key={k}>
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-medium">{k}</span>
              <span className="text-slate-500">
                {v.replied}/{v.sent} = {v.pct}%
                {v.sent < 10 && <span className="text-amber-600"> · mali uzorak</span>}
              </span>
            </div>
            <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100">
              <div
                className="h-1.5 rounded-full bg-teal-600"
                style={{ width: `${Math.round((v.pct / max) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default async function StatsPage() {
  const { data } = await db()
    .from('mlo_leads')
    .select('status, tier, vertical, language, hook_type, loom_url, sent_at, replied_at, reply_sentiment')
    .not('status', 'in', '("new","queued","legacy")')
    .limit(5000);

  const rows = (data ?? []) as unknown as Row[];

  if (!rows.length) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Statistika</h1>
        <Empty>Još nema podataka. Pošalji prvi DM pa se vrati.</Empty>
      </div>
    );
  }

  const by = (key: (r: Row) => string | null): [string, ReturnType<typeof rate>][] =>
    [...new Set(rows.map(key).filter(Boolean) as string[])].map((k) => [
      k,
      rate(rows.filter((r) => key(r) === k)),
    ]);

  const funnel = [
    ['spremno', rows.filter((r) => r.status === 'ready').length],
    ['snimljeno', rows.filter((r) => r.loom_url).length],
    ['poslano', rows.filter((r) => SENT.includes(r.status)).length],
    ['odgovorilo', rows.filter((r) => r.replied_at).length],
    ['call', rows.filter((r) => r.status === 'call_booked').length],
  ] as [string, number][];
  const funnelMax = Math.max(...funnel.map(([, n]) => n), 1);

  const days = rows
    .filter((r) => r.sent_at && r.replied_at)
    .map((r) => (new Date(r.replied_at!).getTime() - new Date(r.sent_at!).getTime()) / 86400000);
  const avgDays = days.length ? (days.reduce((a, b) => a + b, 0) / days.length).toFixed(1) : null;

  const sentiments = ['pozitivan', 'neutralan', 'negativan', 'ne_sad'].map(
    (s) => [s, rows.filter((r) => r.reply_sentiment === s).length] as [string, number]
  );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Statistika</h1>

      <Card>
        <h2 className="mb-3 text-sm font-semibold">Funnel</h2>
        <div className="space-y-2">
          {funnel.map(([label, n]) => (
            <div key={label}>
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-medium">{label}</span>
                <span className="text-slate-500">{n}</span>
              </div>
              <div className="mt-1 h-2 w-full rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-slate-800"
                  style={{ width: `${Math.round((n / funnelMax) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-slate-500">
          Prosječno dana do odgovora: <strong>{avgDays ?? '-'}</strong>
        </p>
      </Card>

      <Breakdown title="Reply rate po tieru" groups={by((r) => r.tier)} />
      <Breakdown title="Reply rate po vertikali" groups={by((r) => r.vertical)} />
      <Breakdown title="Reply rate po hooku" groups={by((r) => r.hook_type)} />
      <Breakdown title="Reply rate po jeziku" groups={by((r) => r.language)} />
      <Breakdown
        title="Video vs bez videa"
        groups={[
          ['s videom', rate(rows.filter((r) => r.loom_url))],
          ['bez videa', rate(rows.filter((r) => !r.loom_url))],
        ]}
      />

      {sentiments.some(([, n]) => n > 0) && (
        <Card>
          <h2 className="mb-3 text-sm font-semibold">Sentiment odgovora</h2>
          <div className="flex flex-wrap gap-2 text-sm">
            {sentiments.map(([s, n]) => (
              <span key={s} className="rounded-lg bg-slate-100 px-3 py-1">
                {s.replace('_', ' ')}: <strong>{n}</strong>
              </span>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
