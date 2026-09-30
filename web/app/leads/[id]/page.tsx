import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLead, getWorkflows } from '@/lib/queries';
import { fullName, STATUS_LABEL } from '@/lib/types';
import { markReplied, markOutcome, updateNotes } from '@/lib/actions';
import { Card, Section, TierBadge, ConfidenceBadge } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default async function LeadDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await getLead(id);
  if (!lead) notFound();

  const b = lead.brief ?? {};
  const workflows = await getWorkflows((b.workflows ?? []).map((w) => w.id));

  return (
    <div className="space-y-5">
      <Link href="/leads" className="text-sm text-slate-400 hover:text-slate-600">
        ← svi leadovi
      </Link>

      <Card>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold">{fullName(lead)}</h1>
          <TierBadge tier={lead.tier} />
          <ConfidenceBadge level={lead.identity_confidence} />
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
            {STATUS_LABEL[lead.status]}
          </span>
        </div>
        <p className="text-sm text-slate-600">
          {[lead.headline_position, lead.company, b.location].filter(Boolean).join(' · ')}
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <a
            href={lead.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-700 underline underline-offset-2"
          >
            LinkedIn
          </a>
          {b.company_website && (
            <a
              href={b.company_website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-700 underline underline-offset-2"
            >
              Web stranica
            </a>
          )}
          {(lead.demo_url || b.website_demo?.demo_url) && (
            <a
              href={(lead.demo_url || b.website_demo?.demo_url)!}
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-700 underline underline-offset-2"
            >
              Demo stranica
            </a>
          )}
          {lead.loom_url && (
            <a
              href={lead.loom_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-700 underline underline-offset-2"
            >
              Loom
            </a>
          )}
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
          {[
            ['Vertikala', lead.vertical],
            ['Jezik', lead.language],
            ['Hook', lead.hook_type],
            ['Asset', lead.asset_type ?? b.asset_type],
            ['Demo', lead.demo_status ?? b.website_demo?.demo_status],
            ['Konektirani', lead.connected_on],
            ['Poslano', lead.sent_at ? new Date(lead.sent_at).toLocaleDateString('hr-HR') : null],
            ['Follow-up', lead.followup_due],
            ['Odgovorio', lead.replied_at ? new Date(lead.replied_at).toLocaleDateString('hr-HR') : null],
          ]
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <div key={String(k)}>
                <dt className="text-xs uppercase tracking-wide text-slate-400">{k}</dt>
                <dd>{String(v)}</dd>
              </div>
            ))}
        </dl>
      </Card>

      {lead.skip_reason && (
        <Card>
          <Section title="Razlog preskakanja">
            <p className="text-sm">{lead.skip_reason}</p>
          </Section>
        </Card>
      )}

      {(b.offer || b.hook_line || b.video_beats?.length || b.summary?.length) && (
        <Card>
          <div className="space-y-4">
            {b.offer && (
              <Section title="Ponuda">
                <p className="text-sm">{b.offer}</p>
              </Section>
            )}
            {b.tier_reason && (
              <Section title="Zašto ovaj tier">
                <p className="text-sm text-slate-600">{b.tier_reason}</p>
              </Section>
            )}
            {b.hook_line && (
              <Section title="Hook">
                <p className="text-sm italic">{b.hook_line}</p>
              </Section>
            )}
            {!!b.summary?.length && (
              <Section title="Sažetak">
                <ul className="list-inside list-disc space-y-0.5 text-sm text-slate-600">
                  {b.summary.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </Section>
            )}
            {!!b.video_beats?.length && (
              <Section title="Video">
                <ol className="space-y-1 text-sm">
                  {b.video_beats.map((v, i) => (
                    <li key={i} className="rounded-lg bg-slate-50 px-3 py-1.5">
                      {v}
                    </li>
                  ))}
                </ol>
              </Section>
            )}
            {!!workflows.length && (
              <Section title="Workflowi">
                <ul className="space-y-1 text-sm">
                  {workflows.map((w) => (
                    <li key={w.id}>
                      {w.n8n_url ? (
                        <a
                          href={w.n8n_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-teal-700 underline underline-offset-2"
                        >
                          {w.name}
                        </a>
                      ) : (
                        <span className="font-medium">{w.name}</span>
                      )}
                      {w.demo_tip && <div className="text-xs text-slate-500">{w.demo_tip}</div>}
                    </li>
                  ))}
                </ul>
              </Section>
            )}
            {!!b.sources?.length && (
              <Section title="Izvori">
                <ul className="space-y-0.5 text-xs">
                  {b.sources.map((s, i) => (
                    <li key={i}>
                      <a
                        href={s}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="break-all text-slate-500 underline underline-offset-2"
                      >
                        {s}
                      </a>
                    </li>
                  ))}
                </ul>
              </Section>
            )}
          </div>
        </Card>
      )}

      {(lead.dm_final || lead.dm_draft || lead.permission_dm) && (
        <Card>
          <div className="space-y-4">
            {lead.dm_draft && (
              <Section title="DM (nacrt)">
                <p className="whitespace-pre-wrap text-sm text-slate-600">{lead.dm_draft}</p>
              </Section>
            )}
            {lead.dm_final && lead.dm_final !== lead.dm_draft && (
              <Section title="DM (poslano)">
                <p className="whitespace-pre-wrap text-sm">{lead.dm_final}</p>
              </Section>
            )}
            {lead.permission_dm && (
              <Section title="Permission DM">
                <p className="whitespace-pre-wrap text-sm">{lead.permission_dm}</p>
              </Section>
            )}
          </div>
        </Card>
      )}

      {/* Odgovor */}
      <Card>
        {lead.reply_text ? (
          <div className="space-y-3">
            <Section title={`Odgovor${lead.reply_sentiment ? ' · ' + lead.reply_sentiment : ''}`}>
              <p className="whitespace-pre-wrap rounded-lg bg-slate-50 px-3 py-2 text-sm">
                {lead.reply_text}
              </p>
            </Section>
            {lead.status !== 'call_booked' && lead.status !== 'not_interested' && (
              <div className="flex flex-wrap gap-2">
                <form action={markOutcome}>
                  <input type="hidden" name="id" value={lead.id} />
                  <input type="hidden" name="outcome" value="call_booked" />
                  <button className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
                    Call bukiran
                  </button>
                </form>
                <form action={markOutcome}>
                  <input type="hidden" name="id" value={lead.id} />
                  <input type="hidden" name="outcome" value="not_interested" />
                  <button className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50">
                    Nije zainteresiran
                  </button>
                </form>
              </div>
            )}
          </div>
        ) : (
          <form action={markReplied} className="space-y-2">
            <input type="hidden" name="id" value={lead.id} />
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Odgovorio</h3>
            <textarea
              name="reply_text"
              rows={3}
              placeholder="Zalijepi tekst odgovora"
              className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:border-teal-600"
            />
            <div className="flex flex-wrap items-center gap-2">
              <select
                name="reply_sentiment"
                defaultValue="neutralan"
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="pozitivan">pozitivan</option>
                <option value="neutralan">neutralan</option>
                <option value="negativan">negativan</option>
                <option value="ne_sad">ne sad</option>
              </select>
              <button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
                Spremi odgovor
              </button>
            </div>
          </form>
        )}
      </Card>

      <Card>
        <form action={updateNotes} className="space-y-2">
          <input type="hidden" name="id" value={lead.id} />
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Bilješke</h3>
          <textarea
            name="notes"
            rows={3}
            defaultValue={lead.notes ?? ''}
            className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:border-teal-600"
          />
          <button className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50">
            Spremi
          </button>
        </form>
      </Card>
    </div>
  );
}
