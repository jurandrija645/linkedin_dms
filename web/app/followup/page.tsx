import { getFollowupLeads, getFollowupUpcoming } from '@/lib/queries';
import { Empty } from '@/components/ui';
import FollowupCard from '@/components/FollowupCard';

export const dynamic = 'force-dynamic';

export default async function FollowupPage() {
  const [leads, upcoming] = await Promise.all([getFollowupLeads(), getFollowupUpcoming()]);

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold">Follow-up</h1>
        <p className="mt-1 text-sm text-slate-500">
          {leads.length === 0
            ? upcoming > 0
              ? `Ništa za danas. ${upcoming} čeka svoj datum.`
              : 'Ništa za danas.'
            : `${leads.length} na redu${upcoming > 0 ? `, još ${upcoming} kasnije` : ''}.`}
        </p>
      </header>

      {leads.length === 0 ? (
        <Empty>Nema follow-upova kojima je prošao rok.</Empty>
      ) : (
        leads.map((lead) => <FollowupCard key={lead.id} lead={lead} />)
      )}
    </div>
  );
}
