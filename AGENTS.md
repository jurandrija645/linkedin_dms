# Mindaptive LinkedIn Loom Outreach — playbook

Ovo je trajni playbook. Čitaj ga na početku svake sesije. Mijenja se samo kroz `/analiza` i uz moju izričitu potvrdu.

---

## 1. Kontekst

Andrija (klijentima na engleskom **Andrew**), co-founder **Mindaptive.ai**, AI agencija iz Pule.

Što nudimo:
- AI inbound sekretar (voice agent, web chat, WhatsApp)
- speed-to-lead i missed call text-back
- follow-up na ponude i procjene
- reaktivacija starih leadova
- review requestovi
- outbound lead-gen (cold email, pay-per-outcome)
- custom n8n automatizacije

Vertikale: **HVAC, solar, roofing, dental, med spa, home services**. Klijenti uglavnom UK, SAD, EU.

200+ LinkedIn konekcija iz tih vertikala u zadnja 2 mjeseca. Svakoj relevantnoj snimam personalizirani Loom i šaljem DM.

Format videa: screen share. Otvorim njihovu stranicu, kažem što sam vidio, pokažem 1-2 n8n workflowa ili rezultat workflowa, pa CTA.

Cilj: navika bez trenja. Ujutro otvorim app, vidim koga snimam, jednim klikom otvorim LinkedIn + njihovu stranicu + workflowe, snimim, zalijepim Loom link, kopiram DM, pošaljem.

**Ne koristimo Codex API ni druge plaćene AI API-je.** Sve istraživanje radiš ti u Codex Codeu, web searchom i fetchanjem stranica.

---

## 2. LinkedIn podaci i cutoff

**Format CSV-a (`inputs/linkedin/Connections.csv`)**
- Na vrhu ima nekoliko redaka "Notes" prije headera. Parsiraj robusno: nađi red koji sadrži `First Name` i `URL`.
- Header: `First Name, Last Name, URL, Email Address, Company, Position, Connected On`
- Datum: `15 Jul 2026`
- Export je poredan od **najnovijih prema najstarijima**. Mi obrađujemo **od najstarijih prema najnovijima**. Originalni redoslijed spremi kao `csv_order` (0 = prvi red u CSV-u = najnoviji).

**Cutoff**
- Stao sam na **Ben Inzelbuch** (President at Nourra Pet, konektirani 15. srpnja 2026).
- On i svi **stariji** od njega (= veći `csv_order`) su već obrađeni → status `legacy`.
- Svi **noviji** (= manji `csv_order`) → status `new`.
- Više ljudi ima isti datum, zato cutoff ide **po poziciji u CSV-u**, ne po datumu.
- Prije importa uvijek pokaži 3 retka iznad i 3 ispod Bena i čekaj potvrdu.

**Ponovni import:** kod novog CSV-a dodaj samo nove osobe (dedupe po `linkedin_url`) i ne diraj postojeće retke.

**Sljedećih pet (prema gore od Bena)** — već pregledani u Codex.ai, koristi kao provjeru vlastitog rada:

| Osoba | Kontekst | Očekivano |
|---|---|---|
| Vladimir Janackovic | Marquis Intelligence, Beograd, HVAC/IAQ | **A**, snimati na našem jeziku, ponuda = outbound prema hotelima i arhitektima |
| Rafael Quizhpe | roofing, NJ | **A**, ali identitet firme nesiguran (više Rafaela Quizhpea u NJ roofingu) — potvrditi na profilu |
| Antonio Novta | valuations specialist | **SKIP** |
| Harvey Harris | InboxFlow, cold email infra | **C**, peer/partner DM bez videa |
| Ryan Willdig | The Solar House, vjerojatno Cardiff | **B ili A** ovisno o ulozi, ponuda = instant ROI procjena |

Ako se tvoj zaključak razlikuje, nemoj ga silom mijenjati — napiši zašto se razlikuje.

---

## 3. Kako istražuješ jednu osobu (`/obradi`)

Obrađuj **jednu po jednu, nikad paralelno**.

1. **Identitet.** Web search ime + firma + pozicija, nađi službenu stranicu firme. Ocijeni `identity_confidence`:
   - `high` — ime i firma potvrđeni na stranici ili u više izvora
   - `medium` — vjerojatno, ali nije potvrđeno
   - `low` — nesigurno; jasno napiši u `identity_note` što trebam provjeriti na LinkedIn profilu

   **Nikad ne izmišljaj firmu.**
2. **Firma.** Fetchaj početnu, usluge, kontakt, about. Zapiši konkretne stvari koje se mogu pokazati na ekranu:
   - formular za ponudu, broj telefona, radno vrijeme
   - ima li chat, online booking, španjolsku verziju
   - recenzije (Google ocjena ako je nađeš)
   - najnoviji blog ili postovi
3. **Osoba.** Uloga, je li donositelj odluka. Potraži javne LinkedIn postove (search `"ime prezime" linkedin posts`) za svjež hook.
4. **Opcionalno, Chrome.** Ako je dostupna Codex in Chrome integracija, smiješ otvoriti LinkedIn profil **samo za čitanje**. Nikad Connect, Message, Follow ni bilo što drugo. Max 15 profila po sesiji.
5. **Odluke.** Tier, ponuda, workflowi, hook, video, DM — po sekcijama 4-6 ovog dokumenta.
6. **Spremanje.** `data/briefs/YYYY-MM-DD_ime-prezime.json` → `npx tsx scripts/push-brief.ts <file>` → status `ready` ili `skipped`.
7. **Ispis.** Jedan redak: ime, tier, ponuda, confidence.

---

## 4. Tier pravila

- **A — snimi Loom.** Vlasnik, founder, GM ili head of sales/ops u ICP vertikali **i** vidiš konkretan propust. Primjeri propusta: nema chata, nema bookinga, samo formular, slabe recenzije, puno ponuda bez follow-upa.
- **B — prvo permission DM.** ICP, ali uloga, firma ili propust nisu jasni. Šaljem kratku poruku tipa "snimio bih ti 90 sek video kako bi X izgledao za [firma], da ti pošaljem?" i snimam tek kad kaže da.
- **C — bez videa, ljudski DM.** Peer, potencijalni partner, alat koji bi nama koristio, druga agencija.
- **SKIP.** Nije donositelj odluka, izvan vertikala, recruiter, student, ili prodaje nama. Uvijek napiši razlog u jednoj rečenici. **Skip je dobar ishod, ne neuspjeh.**

---

## 5. Loom pravila (Nick metoda + moje lekcije)

- **Trajanje:** 90 sekundi, max 2 minute.
- **Jedna ponuda po videu**, nikad dvije.
- **Prvih 5 sekundi:** njihova stranica na ekranu i njihovo ime. Otvaranje je konkretna tvrdnja vezana uz novac ili izgubljene poslove.
- **Pokaži rezultat, ne n8n canvas.** SMS koji homeowner dobije, email koji ode, kalendar s bukiranim terminom. Canvas samo par sekundi, kao dokaz da je stvarno izgrađeno.
- **Nikad izmišljene brojke ni izmišljeni klijenti.** Ne "naši klijenti imaju 40% više poslova". Benchmark smiješ koristiti **samo** ako je stvarna industrijska brojka iz izvora koji si našao, i u videu se mora reći da je to industrijski podatak. Izvor zapiši u `sources`.
- **Nikad "I hope this is your website"** ni slične fraze koje otkrivaju da nisam siguran.
- **Naš jezik:** kod konekcija s ex-Yu imenima i firmama iz regije preporuči snimanje na našem jeziku (`language: "hr"`). To je velika prednost.
- **Za svaki A lead:** `show_on_their_site` = što točno otvoriti na njihovoj stranici (s URL-om) i kojim redom.

Ako u `inputs/loom-transcripts/` ima transkripata, **pročitaj ih prije prve obrade u sesiji**. Preuzmi moj stil govora za hookove i točke, izbjegavaj greške koje ondje primijetiš. Ako na početku transkripta piše ishod (odgovorio / nije), uzmi ga u obzir.

---

## 6. Workflowi i DM stil

**Workflowi**
- Biraj iz `catalog/workflows.json`, **maksimalno 2**, uz svaki jedna rečenica zašto baš taj.
- Ako ništa iz kataloga ne paše, popuni `workflow_gap`: što bih trebao pokazati i točan pojam za pretragu na n8n.io/workflows (npr. `missed call text back twilio`).

**DM**
- Kratko, ljudski, peer-to-peer, **do ~350 znakova**.
- Bez sales fraza, **bez em dasheva**, bez uskličnika u nizu.
- Struktura: konkretna opaska o njima → priznaj da je poruka random → što video pokazuje u jednoj rečenici → "made it just for you" → [loom].
- Engleski za strance, hrvatski za naše. Na engleskom se potpisujem kao **Andrew**.
- Uz svaki DM napiši i **follow-up za 4 dana u dvije verzije**: `followup_viewed` (pogledao Loom) i `followup_not_viewed` (nije).
- **B tier** dobiva `permission_dm` umjesto Loom DM-a. **C tier** dobiva običan DM bez linka.

---

## 7. Brief JSON shema

Spremaš u `data/briefs/YYYY-MM-DD_ime-prezime.json` i u `leads.brief` (jsonb).

```json
{
  "name": "",
  "linkedin_url": "",
  "role": "",
  "company": "",
  "company_website": "",
  "location": "",
  "vertical": "hvac|solar|roofing|dental|med_spa|home_services|b2b_saas|agency|other",
  "identity_confidence": "high|medium|low",
  "identity_note": "",
  "tier": "A|B|C|SKIP",
  "tier_reason": "",
  "one_liner": "Sljedeci: ... Radi kao ... u ... Loom fokusiraj na ...",
  "summary": ["max 3 tocke o firmi i osobi"],
  "observed_on_site": ["konkretne stvari s njihove stranice"],
  "offer": "jedna ponuda",
  "hook_type": "missed_calls|speed_to_lead|estimate_followup|reactivation|reviews|outbound_pipeline|instant_quote|other",
  "hook_line": "",
  "video_beats": ["0-10s: ...", "10-60s: ...", "60-90s: CTA ..."],
  "show_on_their_site": [{"what": "", "url": ""}],
  "workflows": [{"id": "", "why": ""}],
  "workflow_gap": {"what_to_show": "", "n8n_search": ""},
  "language": "en|hr",
  "dm": "",
  "permission_dm": "",
  "followup_viewed": "",
  "followup_not_viewed": "",
  "avoid": ["sto ne reci ovoj osobi"],
  "sources": ["URL-ovi koje si koristio"]
}
```

Pravila polja:
- `tier: "SKIP"` → obavezan `tier_reason`, ostalo može biti prazno, status postaje `skipped`.
- `tier: "B"` → `permission_dm` obavezan, `dm` može biti prazan.
- `tier: "C"` → `dm` bez Loom linka, bez `video_beats`.
- `workflows` max 2. Ako je prazan, `workflow_gap` mora biti popunjen (osim za SKIP i C).
- `sources` nikad prazan osim za SKIP.

---

## 8. Opća pravila

- Piši mi **na hrvatskom, kratko, bez dugih uvoda**.
- Kad nisi siguran, reci da nisi siguran. **Bolje low confidence nego izmišljena firma.**
- **Nikome ništa ne šalješ.** Moj LinkedIn ne diraš, osim čitanja profila iz točke 3.4.
- Prije svakog deploya na produkciju pokreni build lokalno.
- Jedna osoba po obradi, nikad paralelno.
- Status `skipped` je jednako vrijedan ishod kao `ready`.

---

## 9. Tehničke bilješke

- `.env.local` u rootu: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL`, `N8N_BASE_URL`, `APP_PASSWORD`. Nikad u git.
- `web/.env.local` isto (za lokalni dev appa).
- Skripte se pokreću s `npx tsx scripts/<ime>.ts`:
  - `import-connections.ts` — CSV → Supabase
  - `push-brief.ts` — brief JSON → Supabase
  - `build-catalog.ts` — n8n JSON → `catalog/workflows.json` → Supabase
  - `list-next.ts` — sljedećih N sa statusom `new`
  - `queue.ts` — označi kao `queued`
  - `add-lead.ts` — ručno dodavanje
  - `stats.ts` — podaci za `/analiza`
- Tablice u Supabaseu imaju prefiks `mlo_`: `mlo_leads`, `mlo_workflows`, `mlo_activity_log`. Projekt je dijeljen sa starijim radom pa prefiks sprječava sudar imena.
- App: `web/`, Next.js App Router + Tailwind. Vercel root directory = `web`.
- Sav pristup bazi ide server-side sa service role ključem. Ključ nikad u klijent.
