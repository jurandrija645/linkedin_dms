import Link from 'next/link';
import { getAllLeads, getVerticals } from '@/lib/queries';
import { fullName, STATUS_LABEL, type Status } from '@/lib/types';
import { Empty } from '@/components/ui';

export const dynamic = 'force-dynamic';

const STATUSES: Status[] = [
  'new', 'queued', 'ready', 'recorded', 'sent', 'followed_up',
  'replied', 'call_booked', 'not_interested', 'skipped', 'legacy',
];

const PILL = 'rounded-lg px-2.5 py-1 text-xs font-medium ring-1 ring-slate-200 bg-white hover:bg-slate-50';
const PILL_ON = 'rounded-lg px-2.5 py-1 text-xs font-medium bg-teal-700 text-white';

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; tier?: string; vertical?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const [leads, verticals] = await Promise.all([getAllLeads(sp), getVerticals()]);

  const link = (patch: Record<string, string | undefined>) => {
    const next = { ...sp, ...patch };
    const qs = new URLSearchParams(
      Object.entries(next).filter(([, v]) => v) as [string, string][]
    ).toString();
    return `/leads${qs ? '?' + qs : ''}`;
  };

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-baseline gap-3">
        <h1 className="text-2xl font-semibold">Svi leadovi</h1>
        <span className="text-sm text-slate-500">{leads.length} prikazano</span>
      </header>

      <form className="flex gap-2">
        {sp.status && <input type="hidden" name="status" value={sp.status} />}
        {sp.tier && <input type="hidden" name="tier" value={sp.tier} />}
        {sp.vertical && <input type="hidden" name="vertical" value={sp.vertical} />}
        <input
          name="q"
          defaultValue={sp.q ?? ''}
          placeholder="Traži po imenu ili firmi"
          className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-600"
        />
        <button className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50">
          Traži
        </button>
      </form>

      <div className="space-y-2">
        <div className="flex flex-wrap gap-1.5">
          <Link href={link({ status: undefined })} className={sp.status ? PILL : PILL_ON}>
            svi statusi
          </Link>
          {STATUSES.map((s) => (
            <Link key={s} href={link({ status: s })} className={sp.status === s ? PILL_ON : PILL}>
              {STATUS_LABEL[s]}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Link href={link({ tier: undefined })} className={sp.tier ? PILL : PILL_ON}>
            svi tierovi
          </Link>
          {['A', 'B', 'C', 'SKIP'].map((t) => (
            <Link key={t} href={link({ tier: t })} className={sp.tier === t ? PILL_ON : PILL}>
              {t}
            </Link>
          ))}
        </div>
        {verticals.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <Link href={link({ vertical: undefined })} className={sp.vertical ? PILL : PILL_ON}>
              sve vertikale
            </Link>
            {verticals.map((v) => (
              <Link key={v} href={link({ vertical: v })} className={sp.vertical === v ? PILL_ON : PILL}>
                {v}
              </Link>
            ))}
          </div>
        )}
      </div>

      {leads.length === 0 ? (
        <Empty>Nema leadova za ove filtere.</Empty>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-3 py-2 font-semibold">Ime</th>
                <th className="px-3 py-2 font-semibold">Firma</th>
                <th className="px-3 py-2 font-semibold">Tier</th>
                <th className="px-3 py-2 font-semibold">Vertikala</th>
                <th className="px-3 py-2 font-semibold">Status</th>
                <th className="px-3 py-2 font-semibold">Poslano</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-3 py-2">
                    <Link href={`/leads/${l.id}`} className="font-medium text-teal-800 hover:underline">
                      {fullName(l)}
                    </Link>
                    <div className="text-xs text-slate-400">{l.headline_position}</div>
                  </td>
                  <td className="px-3 py-2 text-slate-600">{l.company ?? '-'}</td>
                  <td className="px-3 py-2">{l.tier ?? '-'}</td>
                  <td className="px-3 py-2 text-slate-600">{l.vertical ?? '-'}</td>
                  <td className="px-3 py-2">{STATUS_LABEL[l.status]}</td>
                  <td className="px-3 py-2 text-slate-500">
                    {l.sent_at ? new Date(l.sent_at).toLocaleDateString('hr-HR') : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
