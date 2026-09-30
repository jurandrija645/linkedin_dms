import Link from 'next/link';
import { getOpenerQueue } from '@/lib/queries';
import { markOpenerSent } from '@/lib/actions';
import { fullName } from '@/lib/types';
import { Card, Empty, Section, TierBadge } from '@/components/ui';
import { CopyButton } from '@/components/LinkButtons';

export const dynamic = 'force-dynamic';

export default async function OpeneriPage() {
  const leads = await getOpenerQueue();

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold">Openeri</h1>
        <p className="mt-1 text-sm text-slate-500">
          Salje se dan prije Looma. Jedno pitanje, bez linka i bez spominjanja videa. Loom ide
          svejedno, odgovorili oni ili ne.
        </p>
      </header>

      {leads.length === 0 ? (
        <Empty>
          Nema openera koji cekaju. Svi su poslani, ili leadovi jos nemaju napisan opener.
        </Empty>
      ) : (
        leads.map((lead) => {
          const b = lead.brief ?? {};
          const opener = lead.opener ?? b.opener ?? '';
          const stack = lead.tech_stack ?? b.tech_stack ?? [];
          return (
            <Card key={lead.id}>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <TierBadge tier={lead.tier} />
                <span className="text-sm font-medium">{fullName(lead)}</span>
                <span className="text-sm text-slate-500">
                  {[b.role, lead.company ?? b.company].filter(Boolean).join(', ')}
                </span>
                <Link
                  href={`/leads/${lead.id}`}
                  className="ml-auto text-xs text-slate-400 hover:text-slate-600"
                >
                  detalj
                </Link>
              </div>

              {!!stack.length && (
                <Section title="Nadjeno u kodu njihove stranice">
                  <div className="flex flex-wrap gap-1.5">
                    {stack.map((t) => (
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

              <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm leading-relaxed ring-1 ring-slate-200">
                {opener || <span className="text-slate-400">Opener nije napisan.</span>}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                {opener && <CopyButton text={opener} label="Kopiraj opener" />}
                <a
                  href={lead.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-slate-50"
                >
                  Otvori LinkedIn
                </a>
                <form action={markOpenerSent} className="ml-auto">
                  <input type="hidden" name="id" value={lead.id} />
                  <button className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800">
                    Opener poslan
                  </button>
                </form>
              </div>
              <p className="mt-1 text-xs text-slate-400">{opener.length} znakova, cilj ~250</p>
            </Card>
          );
        })
      )}
    </div>
  );
}
