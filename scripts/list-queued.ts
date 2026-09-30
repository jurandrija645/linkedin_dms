/**
 * Svi leadovi sa statusom `queued`, redom za obradu.
 *   npx tsx scripts/list-queued.ts
 */
import { db, fullName } from './lib.js';

const { data, error } = await db()
  .from('mlo_leads')
  .select('id, first_name, last_name, headline_position, company, connected_on, linkedin_url, email')
  .eq('status', 'queued')
  .order('csv_order', { ascending: false, nullsFirst: true });

if (error) {
  console.error('Greška:', error.message);
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      count: data?.length ?? 0,
      leads: (data ?? []).map((l) => ({
        id: l.id,
        name: fullName(l),
        position: l.headline_position,
        company: l.company,
        linkedin_url: l.linkedin_url,
        connected_on: l.connected_on,
      })),
    },
    null,
    2
  )
);
