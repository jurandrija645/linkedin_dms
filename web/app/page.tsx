import LeadCard from '@/components/LeadCard';
import { Empty } from '@/components/ui';
import {
  getReadyLeads,
  getTodayAndStreak,
  getWorkflows,
  getFollowupLeads,
  getOpenerQueue,
} from '@/lib/queries';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const GOAL = 3;

export default async function DanasPage() {
  const [leads, { today, streak }, followups, openers] = await Promise.all([
    getReadyLeads(),
    getTodayAndStreak(),
    getFollowupLeads(),
    getOpenerQueue(),
  ]);

  const demoQueue = leads.filter((l) => l.status === 'needs_demo').length;

  const wfIds = [...new Set(leads.flatMap((l) => (l.brief?.workflows ?? []).map((w) => w.id)))];
  const workflows = await getWorkflows(wfIds);
  const byId = new Map(workflows.map((w) => [w.id, w]));

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold">Bog Andrija</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
          <span
            className={`rounded-lg px-2.5 py-1 font-medium ${
              today >= GOAL ? 'bg-emerald-100 text-emerald-800' : 'bg-white ring-1 ring-slate-200'
            }`}
          >
            danas poslano {today} / cilj {GOAL}
          </span>
          <span className="rounded-lg bg-white px-2.5 py-1 font-medium ring-1 ring-slate-200">
            {streak > 0 ? `${streak} ${streak === 1 ? 'dan' : 'dana'} zaredom` : 'streak prekinut'}
          </span>
          {openers.length > 0 && (
            <Link
              href="/openeri"
              className="rounded-lg bg-teal-100 px-2.5 py-1 font-medium text-teal-900 hover:bg-teal-200"
            >
              {openers.length} opener{openers.length === 1 ? '' : 'a'} za poslati
            </Link>
          )}
          {demoQueue > 0 && (
            <span className="rounded-lg bg-violet-100 px-2.5 py-1 font-medium text-violet-900">
              {demoQueue} demo{demoQueue === 1 ? '' : 'a'} za izradu
            </span>
          )}
          {followups.length > 0 && (
            <Link
              href="/followup"
              className="rounded-lg bg-amber-100 px-2.5 py-1 font-medium text-amber-900 hover:bg-amber-200"
            >
              {followups.length} follow-up{followups.length === 1 ? '' : 'a'} čeka
            </Link>
          )}
        </div>
      </header>

      {leads.length === 0 ? (
        <Empty>
          Nema spremnih leadova. U Claude Codeu pokreni <code className="font-mono">/sljedeci 10</code> pa{' '}
          <code className="font-mono">/obradi</code>.
        </Empty>
      ) : (
        leads.map((lead, i) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            index={i}
            workflows={(lead.brief?.workflows ?? [])
              .map((w) => byId.get(w.id))
              .filter(Boolean) as NonNullable<ReturnType<typeof byId.get>>[]}
          />
        ))
      )}
    </div>
  );
}
