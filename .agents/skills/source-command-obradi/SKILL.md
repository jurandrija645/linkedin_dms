---
name: "source-command-obradi"
description: "Istraži sve queued leadove i napravi brief, DM i Loom plan za svakog"
---

# source-command-obradi

Use this skill when the user asks to run the migrated source command `obradi`.

## Command Template

Obradi sve leadove sa statusom `queued`, **jednog po jednog, nikad paralelno**.

## Prije prve obrade u sesiji

1. Pročitaj `AGENTS.md` sekcije 3-7.
2. Pročitaj `catalog/workflows.json`. Ako ne postoji, reci Andriji da pokrene `/katalog` i nastavi bez workflowa (svaki brief onda dobiva `workflow_gap`).
3. Ako `inputs/loom-transcripts/` ima `.txt` fajlova, pročitaj ih sve. Izvuci njegov stil govora (tipične fraze, ritam, kako otvara i zatvara) i greške koje treba izbjeći. Ako transkript na vrhu ima `ISHOD:`, teži stilu onih koji su dobili odgovor.
4. Ako `inputs/notes/` ima fajlova, pročitaj ih (ponude, cjenici, formulacije).
5. Dohvati listu: `npx tsx scripts/list-queued.ts`.

## Za svaku osobu

Slijedi `AGENTS.md` sekciju 3 (Identitet → Firma → Osoba → Odluke → Spremanje → Ispis).

Konkretno:

1. **Identitet.** WebSearch `"Ime Prezime" "Firma"` i `"Firma" + grad/vertikala`. Nađi službenu stranicu. Postavi `identity_confidence` (`high`/`medium`/`low`) i `identity_note` ako nije `high`. **Nikad ne izmišljaj firmu.** Ako ne nađeš ništa pouzdano, `low` + jasna uputa što provjeriti na LinkedIn profilu.
2. **Firma.** WebFetch početne stranice, pa usluge/kontakt/about ako postoje. Zapiši u `observed_on_site` samo konkretno provjerljive stvari (formular, telefon, radno vrijeme, chat da/ne, booking da/ne, jezične verzije, recenzije s ocjenom, zadnji blog post s datumom).
3. **Osoba.** Uloga i je li donositelj odluka. WebSearch `"Ime Prezime" linkedin post` za svjež hook. Ako ništa, ne forsiraj.
4. **Tier** po `AGENTS.md` sekciji 4. SKIP je dobar ishod.
5. **Ponuda, hook, video beats, workflowi, DM** po sekcijama 5-6. Max 2 workflowa, DM do ~350 znakova, bez em dasheva, bez sales fraza. Follow-up u obje verzije.
6. **Spremi brief** u `data/briefs/YYYY-MM-DD_ime-prezime.json` (današnji datum, ime lowercase s crticama, bez dijakritike) po shemi iz `AGENTS.md` sekcije 7.
7. **Pushaj:** `npx tsx scripts/push-brief.ts data/briefs/<file>.json`. Skripta postavlja status `ready` ili `skipped` (ako je tier SKIP) i loga u `activity_log`.
8. **Ispiši jedan redak:** `Ime | tier | ponuda | confidence`.

## Na kraju

- Tablica sažetka: ime, tier, vertikala, ponuda, confidence, jezik.
- Koliko ih je `ready`, koliko `skipped`.
- Popis leadova s `identity_confidence: low` i što treba provjeriti.
- Link na app (iz `.env.local` `APP_URL`, ako postoji).

## Pravila

- Jedna osoba u isto vrijeme. Ne pokrećeš subagente za ovo.
- Nikad izmišljene brojke, klijenti ni case studyji. Benchmark samo uz stvarni izvor u `sources`.
- Nikad ne otvaraj LinkedIn za pisanje. Samo čitanje, i samo ako je dostupna Chrome integracija, max 15 profila po sesiji.
- Ako te nešto zaustavi (stranica ne radi, identitet nemoguć), zapiši to u brief i nastavi na sljedećeg, ne staj.
