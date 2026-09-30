/**
 * Sljedecih N leadova sa statusom `new`, od najstarijih (najveci csv_order).
 * Rucno dodani (csv_order = null) idu prvi.
 *   npx tsx scripts/list-next.ts 10
 */
import { db, fullName } from './lib.js';

const n = Number(process.argv.find((a) => /^\d+$/.test(a)) ?? 10);

const { data, error } = await db()
  .from('mlo_leads')
  .select('id, first_name, last_name, headline_position, company, connected_on, linkedin_url, csv_order')
  .eq('status', 'new')
  .order('csv_order', { ascending: false, nullsFirst: true })
  .limit(n);

if (error) {
  console.error('Greška:', error.message);
  process.exit(1);
}

if (!data?.length) {
  console.log(JSON.stringify({ count: 0, leads: [] }, null, 2));
  console.error('\nNema leadova sa statusom new. Pokreni /import ili /dodaj.');
  process.exit(0);
}

console.log(
  JSON.stringify(
    {
      count: data.length,
      leads: data.map((l, i) => ({
        n: i + 1,
        id: l.id,
        name: fullName(l),
        position: l.headline_position,
        company: l.company,
        connected_on: l.connected_on,
        linkedin_url: l.linkedin_url,
        csv_order: l.csv_order,
      })),
    },
    null,
    2
  )
);
