/**
 * Ubaci ili obrisi 2 lazna leada za lokalni test appa.
 *   npx tsx scripts/seed-test.ts           -> ubaci
 *   npx tsx scripts/seed-test.ts --clean   -> obrisi
 *
 * Lazni leadovi imaju linkedin_url koji pocinje s https://www.linkedin.com/in/test-.
 */
import { db, flag, log } from './lib.js';

const MARKER = 'https://www.linkedin.com/in/test-';

const client = db();

if (flag('clean')) {
  const { data, error } = await client
    .from('mlo_leads')
    .delete()
    .like('linkedin_url', `${MARKER}%`)
    .select('id');
  if (error) {
    console.error('Greška:', error.message);
    process.exit(1);
  }
  console.log(`Obrisano ${data?.length ?? 0} test leadova.`);
  process.exit(0);
}

const rows = [
  {
    linkedin_url: MARKER + 'ana-anic',
    first_name: 'Ana',
    last_name: 'Anić',
    headline_position: 'Owner',
    company: 'Test Klima d.o.o.',
    connected_on: '2026-08-01',
    csv_order: 2,
    status: 'ready',
    tier: 'A',
    identity_confidence: 'high',
    vertical: 'hvac',
    language: 'hr',
    hook_type: 'missed_calls',
    offer: 'Missed call text-back, da propušteni pozivi ne odu konkurenciji.',
    dm_draft:
      'Ana, vidio sam da na stranici imate samo formular i broj, bez chata. Znam da je poruka random. Snimio sam 90 sek videa gdje pokazujem što se dogodi kad netko nazove izvan radnog vremena. Made it just for you. [loom]',
    followup_viewed: 'Ana, vidim da si pogledala. Vrijedi li ti ovo pogledati zajedno na 15 min?',
    followup_not_viewed: 'Ana, bumpam ovo gore za slučaj da se izgubilo. Video je 90 sek.',
    brief: {
      name: 'Ana Anić',
      role: 'Owner',
      company: 'Test Klima d.o.o.',
      company_website: 'https://example.com',
      location: 'Pula',
      vertical: 'hvac',
      identity_confidence: 'high',
      tier: 'A',
      tier_reason: 'Vlasnica u ICP vertikali, nema chata ni bookinga.',
      one_liner: 'Sljedeći: Ana Anić. Vlasnica je Test Klima d.o.o. u Puli. Loom fokusiraj na propuštene pozive.',
      summary: ['HVAC servis, 4 zaposlena', 'Samo formular i telefon na stranici'],
      observed_on_site: ['Formular za ponudu na početnoj', 'Telefon u headeru', 'Nema chata', 'Nema online bookinga'],
      offer: 'Missed call text-back, da propušteni pozivi ne odu konkurenciji.',
      hook_type: 'missed_calls',
      hook_line: 'Svaki poziv koji propustite nakon 17h vjerojatno završi kod konkurencije.',
      video_beats: [
        '0-10s: njihova početna, ime, tvrdnja o propuštenim pozivima',
        '10-60s: pokaži SMS koji vlasnik kuće dobije 45 sek nakon propuštenog poziva',
        '60-90s: CTA, 15 min poziv',
      ],
      show_on_their_site: [{ what: 'Formular za ponudu na početnoj', url: 'https://example.com' }],
      workflows: [],
      workflow_gap: { what_to_show: 'SMS koji ide nakon propuštenog poziva', n8n_search: 'missed call text back twilio' },
      language: 'hr',
      avoid: ['Ne spominjati cijenu u videu'],
      sources: ['https://example.com'],
    },
  },
  {
    linkedin_url: MARKER + 'john-testerson',
    first_name: 'John',
    last_name: 'Testerson',
    headline_position: 'Founder',
    company: 'Testerson Solar Ltd',
    connected_on: '2026-08-02',
    csv_order: 1,
    status: 'ready',
    tier: 'B',
    identity_confidence: 'low',
    vertical: 'solar',
    language: 'en',
    hook_type: 'instant_quote',
    offer: 'Instant ROI estimate on the site instead of a callback form.',
    permission_dm:
      'John, saw Testerson Solar still runs quotes through a callback form. Random message, I know. I would record you a 90 sec video showing what an instant ROI estimate would look like on your site. Want me to send it?',
    followup_viewed: 'John, saw you had a look. Happy to send the full version if useful.',
    followup_not_viewed: 'John, bumping this once in case it got buried. Yes or no is fine.',
    brief: {
      name: 'John Testerson',
      role: 'Founder',
      company: 'Testerson Solar Ltd',
      company_website: 'https://example.org',
      location: 'Cardiff',
      vertical: 'solar',
      identity_confidence: 'low',
      identity_note: 'Postoji više Testerson Solar firmi u UK. Provjeri na LinkedIn profilu je li ovo Cardiff ili Bristol.',
      tier: 'B',
      tier_reason: 'ICP je, ali nije potvrđeno da je ovo prava firma.',
      one_liner: 'Sljedeći: John Testerson. Founder je u Testerson Solar Ltd. Prvo permission DM, identitet nije potvrđen.',
      summary: ['Solar instalater, UK', 'Callback formular umjesto instant procjene'],
      observed_on_site: ['Callback formular', 'Nema kalkulatora uštede'],
      offer: 'Instant ROI estimate on the site instead of a callback form.',
      hook_type: 'instant_quote',
      hook_line: 'A callback form asks for trust before it gives anything back.',
      video_beats: [],
      show_on_their_site: [{ what: 'Callback formular', url: 'https://example.org' }],
      workflows: [],
      workflow_gap: { what_to_show: 'Instant procjena uštede poslana na email', n8n_search: 'solar roi calculator form email' },
      language: 'en',
      avoid: ['Ne tvrditi da znaš koliko instalacija rade'],
      sources: ['https://example.org'],
    },
  },
];

const { data, error } = await client.from('mlo_leads').insert(rows).select('id, first_name');
if (error) {
  console.error('Greška:', error.message);
  process.exit(1);
}
for (const l of data ?? []) await log(l.id, 'ready', { test: true });
console.log(`Ubačeno ${data?.length ?? 0} test leadova. Obriši ih s: npx tsx scripts/seed-test.ts --clean`);
