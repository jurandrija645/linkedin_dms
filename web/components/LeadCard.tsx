import Link from 'next/link';
import type { Lead, Workflow } from '@/lib/types';
import { fullName } from '@/lib/types';
import {
  markDemoBuilt,
  markOpenerSent,
  markRecorded,
  markSent,
  markSkipped,
} from '@/lib/actions';
import { TierBadge, ConfidenceBadge, Card, Section } from './ui';
import { OpenAll, CopyButton, EditableMessage, type Target } from './LinkButtons';

const LINK =
  'rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-slate-50';

export default function LeadCard({
  lead,
  workflows,
  index,
}: {
  lead: Lead;
  workflows: Workflow[];
  index: number;
}) {
  const b = lead.brief ?? {};
  const name = fullName(lead);
  const site = b.company_website ?? null;
  const isA = lead.tier === 'A';
  const wd = b.website_demo;
  const isDemo = (lead.asset_type ?? b.asset_type) === 'website_demo';
  const demoUrl = lead.demo_url || wd?.demo_url || null;

  const targets: Target[] = [
    { label: 'LinkedIn', url: lead.linkedin_url },
    ...(site ? [{ label: 'Web stranica', url: site }] : []),
    ...(demoUrl ? [{ label: 'Demo', url: demoUrl }] : []),
    ...workflows.filter((w) => w.n8n_url).map((w) => ({ label: w.name, url: w.n8n_url! })),
  ];

  const opener = lead.opener ?? b.opener ?? '';

  const message = lead.tier === 'B' ? (lead.permission_dm ?? '') : (lead.dm_final ?? lead.dm_draft ?? '');

  const fillLinks = (text: string) => {
    let out = text;
    if (lead.loom_url) out = out.replace('[loom]', lead.loom_url);
    if (demoUrl) out = out.replace('[demo]', demoUrl);
    return out;
  };

  return (
    <Card>
      {/* zaglavlje */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-400">#{index + 1}</span>
        <TierBadge tier={lead.tier} />
        <ConfidenceBadge level={lead.identity_confidence} />
        {isDemo && (
          <span className="rounded-md bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700 ring-1 ring-violet-200">
            website demo
          </span>
        )}
        {lead.language === 'hr' && (
          <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-blue-200">
            snimaj na našem jeziku
          </span>
        )}
        {lead.opener_sent_at && (
          <span className="rounded-md bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700 ring-1 ring-teal-200">
            opener poslan {new Date(lead.opener_sent_at).toLocaleDateString('hr-HR')}
          </span>
        )}
        {lead.loom_url && (
          <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
            snimljeno
          </span>
        )}
        <Link href={`/leads/${lead.id}`} className="ml-auto text-xs text-slate-400 hover:text-slate-600">
          detalj
        </Link>
      </div>

      <p className="text-[15px] font-medium leading-snug">
        {b.one_liner || `Sljedeći: ${name}. ${lead.headline_position ?? ''} ${lead.company ? 'u ' + lead.company : ''}`}
      </p>

      {/* Kratki pregled: tko je, gdje je, i sto mu treba. Ostalo je u <details>. */}
      <p className="mt-2 text-sm text-slate-600">
        {[b.role, lead.company ?? b.company, b.location].filter(Boolean).join(' · ')}
      </p>
      {b.offer && (
        <p className="mt-2 text-sm">
          <span className="font-semibold text-slate-500">Treba mu: </span>
          {b.offer}
        </p>
      )}
      {/* linkovi */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <a href={lead.linkedin_url} target="_blank" rel="noopener noreferrer" className={LINK}>
          LinkedIn
        </a>
        {site && (
          <a href={site} target="_blank" rel="noopener noreferrer" className={LINK}>
            Web stranica
          </a>
        )}
        {demoUrl && (
          <a
            href={demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-violet-300 bg-violet-50 px-3 py-1.5 text-sm font-medium text-violet-800 hover:bg-violet-100"
          >
            Demo stranica
          </a>
        )}
        {workflows.map((w) =>
          w.n8n_url ? (
            <a key={w.id} href={w.n8n_url} target="_blank" rel="noopener noreferrer" className={LINK}>
              {w.name}
            </a>
          ) : null
        )}
      </div>
      <div className="mt-2">
        <OpenAll targets={targets} />
      </div>      {/* Opener se salje dan prije Looma, zato stoji iznad svega ostalog. */}
      {opener && (
        <div className="mt-4 rounded-xl bg-teal-50/60 p-3 ring-1 ring-teal-200">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-teal-800">
              Opener, salje se dan prije
            </h3>
            {lead.opener_sent_at && (
              <span className="rounded-md bg-teal-700 px-2 py-0.5 text-xs font-medium text-white">
                poslan {new Date(lead.opener_sent_at).toLocaleDateString('hr-HR')}
              </span>
            )}
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-800">{opener}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <CopyButton text={opener} label="Kopiraj opener" />
            {!lead.opener_sent_at && (
              <form action={markOpenerSent}>
                <input type="hidden" name="id" value={lead.id} />
                <button className="rounded-lg bg-teal-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-800">
                  Opener poslan
                </button>
              </form>
            )}
            <span className="text-xs text-slate-500">{opener.length} znakova</span>
          </div>
        </div>
      )}

      {/* Sve ostalo je skupljeno da se kartice mogu skrolati. Native <details>,
          bez JS-a, pa radi i kad ekstenzije razbiju hidraciju. */}
      <details className="group mt-4">
        <summary className="cursor-pointer select-none rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200">
          <span className="group-open:hidden">Prikazi sve o leadu</span>
          <span className="hidden group-open:inline">Sakrij detalje</span>
        </summary>
        <div className="mt-3">
      {/* Tko je osoba. Bez ovoga si pred snimanjem gledao samo jednu recenicu. */}
      <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm ring-1 ring-slate-200">
        {!!b.summary?.length && (
          <ul className="list-inside list-disc space-y-0.5 text-slate-700">
            {b.summary.map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ul>
        )}
        {(b.tier_reason || b.asset_reason) && (
          <details className="mt-1">
            <summary className="cursor-pointer text-xs text-slate-400 hover:text-slate-600">
              Zasto ovaj tier i ovaj asset
            </summary>
            <div className="mt-1 space-y-1 text-xs text-slate-600">
              {b.tier_reason && <p>Tier: {b.tier_reason}</p>}
              {b.asset_reason && <p>Asset: {b.asset_reason}</p>}
            </div>
          </details>
        )}
      </div>
      {b.identity_note && (
        <p
          className={`mt-2 rounded-lg px-3 py-2 text-sm ring-1 ${
            lead.identity_confidence === 'high'
              ? 'bg-slate-50 text-slate-600 ring-slate-200'
              : 'bg-red-50 text-red-700 ring-red-200'
          }`}
        >
          <strong>Identitet:</strong> {b.identity_note}
        </p>
      )}
      {/* sadržaj */}
      <div className="mt-5 space-y-4 border-t border-slate-100 pt-4">
        {b.offer && (
          <Section title="Ponuda">
            <p className="text-sm">{b.offer}</p>
          </Section>
        )}

        {b.hook_line && (
          <Section title={`Hook${lead.hook_type ? ' · ' + lead.hook_type : ''}`}>
            <p className="text-sm italic text-slate-700">{b.hook_line}</p>
          </Section>
        )}

        {!!b.video_beats?.length && isA && (
          <Section title="Video (90 sek)">
            <ol className="space-y-1 text-sm text-slate-700">
              {b.video_beats.map((v, i) => (
                <li key={i} className="rounded-lg bg-slate-50 px-3 py-1.5">
                  {v}
                </li>
              ))}
            </ol>
          </Section>
        )}

        {!!b.show_on_their_site?.length && (
          <Section title="Otvori na njihovoj stranici, ovim redom">
            <ol className="list-inside list-decimal space-y-1 text-sm">
              {b.show_on_their_site.map((s, i) => (
                <li key={i}>
                  {s.url ? (
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-700 underline underline-offset-2"
                    >
                      {s.what}
                    </a>
                  ) : (
                    s.what
                  )}
                </li>
              ))}
            </ol>
          </Section>
        )}

        {isDemo && wd && (
          <Section title="Website demo">
            <div className="space-y-2 rounded-lg bg-violet-50 px-3 py-2 text-sm text-violet-950 ring-1 ring-violet-200">
              {wd.why && <p>{wd.why}</p>}
              {!!wd.current_site_problems?.length && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">
                    Problemi na trenutnoj stranici
                  </p>
                  <ul className="list-inside list-disc">
                    {wd.current_site_problems.map((x, i) => (
                      <li key={i}>{x}</li>
                    ))}
                  </ul>
                </div>
              )}
              {!!wd.pages_to_build?.length && <p>Stranice: {wd.pages_to_build.join(', ')}</p>}
              {wd.inquiry_flow && <p>Inquiry flow: {wd.inquiry_flow}</p>}
              {wd.ai_widget && <p>AI asistent: {wd.ai_widget}</p>}
              {!!wd.seo_fixes?.length && <p>SEO: {wd.seo_fixes.join(', ')}</p>}
            </div>
          </Section>
        )}

        {!!workflows.length && (
          <Section title="Workflowi">
            <ul className="space-y-1 text-sm">
              {workflows.map((w) => {
                const why = b.workflows?.find((x) => x.id === w.id)?.why;
                return (
                  <li key={w.id}>
                    <span className="font-medium">{w.name}</span>
                    {why && <span className="text-slate-600"> — {why}</span>}
                    {w.demo_tip && <div className="text-xs text-slate-500">Pokaži: {w.demo_tip}</div>}
                  </li>
                );
              })}
            </ul>
          </Section>
        )}

        {b.workflow_gap?.what_to_show && (
          <Section title="Nedostaje workflow">
            <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900 ring-1 ring-amber-200">
              <p>{b.workflow_gap.what_to_show}</p>
              {b.workflow_gap.n8n_search && (
                <p className="mt-1 text-xs">
                  Traži na n8n.io:{' '}
                  <a
                    className="underline"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`https://n8n.io/workflows/?search=${encodeURIComponent(b.workflow_gap.n8n_search)}`}
                  >
                    {b.workflow_gap.n8n_search}
                  </a>
                </p>
              )}
            </div>
          </Section>
        )}

        {!!b.observed_on_site?.length && (
          <Section title="Viđeno na stranici">
            <ul className="list-inside list-disc space-y-0.5 text-sm text-slate-600">
              {b.observed_on_site.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </Section>
        )}

        {!!(lead.tech_stack ?? b.tech_stack)?.length && (
          <Section title="Alati na njihovoj stranici">
            <div className="flex flex-wrap gap-1.5">
              {(lead.tech_stack ?? b.tech_stack ?? []).map((t) => (
                <span
                  key={t}
                  className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
                >
                  {t}
                </span>
              ))}
            </div>
          </Section>
        )}

        {!!b.sources?.length && (
          <Section title="Izvori">
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
              {b.sources.map((u, i) => (
                <a
                  key={i}
                  href={u}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-500 underline underline-offset-2 hover:text-slate-700"
                >
                  {(() => {
                    try {
                      return new URL(u).hostname.replace(/^www\./, '');
                    } catch {
                      return u;
                    }
                  })()}
                </a>
              ))}
            </div>
          </Section>
        )}

        {!!b.avoid?.length && (
          <Section title="Ne spominji">
            <ul className="list-inside list-disc space-y-0.5 text-sm text-slate-600">
              {b.avoid.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </Section>
        )}
      </div>

        </div>
      </details>
      {/* akcije: DM i Poslano su uvijek dostupni, nista ih ne blokira */}
      <div className="mt-5 space-y-4 border-t border-slate-100 pt-4">
        {/* Loom i demo URL su neobavezni. Sluze samo da se [loom] i [demo]
            u DM-u zamijene pravim linkovima, i da se zna sto je snimljeno. */}
        <div className="flex flex-wrap gap-2">
          <form action={markRecorded} className="flex min-w-[240px] flex-1 items-center gap-2">
            <input type="hidden" name="id" value={lead.id} />
            <input
              name="loom_url"
              required
              defaultValue={lead.loom_url ?? ''}
              placeholder="Loom URL"
              className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-teal-600"
            />
            <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-50">
              Spremi
            </button>
          </form>
          {isDemo && (
            <form action={markDemoBuilt} className="flex min-w-[240px] flex-1 items-center gap-2">
              <input type="hidden" name="id" value={lead.id} />
              <input
                name="demo_url"
                required
                defaultValue={demoUrl ?? ''}
                placeholder="Demo URL"
                className="min-w-0 flex-1 rounded-lg border border-violet-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-violet-600"
              />
              <button className="rounded-lg border border-violet-300 px-3 py-1.5 text-sm font-medium text-violet-800 hover:bg-violet-50">
                Spremi
              </button>
            </form>
          )}
        </div>

        <form action={markSent} className="space-y-2">
          <input type="hidden" name="id" value={lead.id} />
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {lead.tier === 'B' ? 'Permission DM' : 'DM'}
          </h3>
          <EditableMessage name="dm_final" defaultValue={fillLinks(message)} hint="cilj ~350" />
          <div className="flex flex-wrap items-center gap-3">
            <button className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800">
              Poslano, idi na follow-up
            </button>
            <label className="flex items-center gap-1.5 text-sm text-slate-600">
              <input type="checkbox" name="yesterday" className="h-4 w-4 accent-teal-700" />
              poslano jucer
            </label>
          </div>
        </form>

        <details className="text-sm">
          <summary className="cursor-pointer text-slate-400 hover:text-slate-600">Preskoči</summary>
          <form action={markSkipped} className="mt-2 flex flex-wrap items-center gap-2">
            <input type="hidden" name="id" value={lead.id} />
            <input
              name="skip_reason"
              required
              placeholder="Razlog"
              className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
            <button className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50">
              Preskoči
            </button>
          </form>
        </details>
      </div>
    </Card>
  );
}
