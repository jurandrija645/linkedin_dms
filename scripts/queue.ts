/**
 * Oznaci leadove kao `queued`.
 *   npx tsx scripts/queue.ts <id> <id> ...
 */
import { db, log, fullName } from './lib.js';

const ids = process.argv.slice(2).filter((a) => !a.startsWith('--'));
if (!ids.length) {
  console.error('Uporaba: npx tsx scripts/queue.ts <lead_id> [<lead_id> ...]');
  process.exit(1);
}

const { data, error } = await db()
  .from('mlo_leads')
  .update({ status: 'queued' })
  .in('id', ids)
  .eq('status', 'new')
  .select('id, first_name, last_name');

if (error) {
  console.error('Greška:', error.message);
  process.exit(1);
}

for (const l of data ?? []) await log(l.id, 'queued');

console.log(`U queueu: ${data?.length ?? 0}`);
(data ?? []).forEach((l) => console.log(`  ${fullName(l)}`));
if ((data?.length ?? 0) !== ids.length) {
  console.log(`Napomena: ${ids.length - (data?.length ?? 0)} lead(ova) nije bilo u statusu new i nisu dirnuti.`);
}
