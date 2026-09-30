/**
 * Primjenjuje supabase/schema.sql na Supabase preko direktne pg konekcije.
 *   npx tsx scripts/apply-schema.ts
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import pg from 'pg';
import { ROOT, env } from './lib.js';

const sql = readFileSync(path.join(ROOT, 'supabase', 'schema.sql'), 'utf8');
const connectionString = env('SUPABASE_DB_URL');

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  await client.query(sql);
  const { rows } = await client.query(
    `select table_name from information_schema.tables
     where table_schema = 'public' and table_name in ('leads','workflows','activity_log')
     order by table_name`
  );
  console.log('Tablice:', rows.map((r) => r.table_name).join(', '));
  console.log('Schema primijenjena.');
} catch (e) {
  console.error('Greška:', (e as Error).message);
  console.error('\nAko konekcija ne prolazi, otvori Supabase SQL Editor i zalijepi supabase/schema.sql.');
  process.exit(1);
} finally {
  await client.end().catch(() => {});
}
