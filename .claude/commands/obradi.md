---
description: Istraži sve queued leadove i napravi brief, DM i Loom plan za svakog
allowed-tools: Bash, Read, Write, WebSearch, WebFetch, Glob, Grep
---

Obradi sve leadove sa statusom `queued`, **jednog po jednog, nikad paralelno**.

## Prije prve obrade u sesiji

1. Pročitaj `CLAUDE.md` sekcije 3-7.
2. Pročitaj `catalog/workflows.json`. Ako ne postoji, reci Andriji da pokrene `/katalog` i nastavi bez workflowa (svaki brief onda dobiva `workflow_gap`).
3. Ako `inputs/loom-transcripts/` ima `.txt` fajlova, pročitaj ih sve. Izvuci njegov stil govora (tipične fraze, ritam, kako otvara i zatvara) i greške koje treba izbjeći. Ako transkript na vrhu ima `ISHOD:`, teži stilu onih koji su dobili odgovor.
4. Ako `inputs/notes/` ima fajlova, pročitaj ih (ponude, cjenici, formulacije).
5. Dohvati listu: `npx tsx scripts/list-queued.ts`.
6. **`linkedin_url` u brief uvijek kopiraj doslovno iz te liste.** Nikad ga ne sastavljaj iz imena. LinkedIn URL-ovi cesto imaju nastavak (`-975ab22a`), pa pogodjeni URL napravi duplikat leada umjesto da nadje postojeceg.

## Za svaku osobu

Slijedi `CLAUDE.md` sekciju 3 (Identitet → Firma → Osoba → Odluke → Spremanje → Ispis).

Konkretno:

1. **Identitet.** WebSearch `"Ime Prezime" "Firma"` i `"Firma" + grad/vertikala`. Nađi službenu stranicu. Postavi `identity_confidence` (`high`/`medium`/`low`) i `identity_note` ako nije `high`. **Nikad ne izmišljaj firmu.** Ako ne nađeš ništa pouzdano, `low` + jasna uputa što provjeriti na LinkedIn profilu.
2. **Firma.** WebFetch početne stranice, pa usluge/kontakt/about ako postoje. Zapiši u `observed_on_site` samo konkretno provjerljive stvari (formular, telefon, radno vrijeme, chat da/ne, booking da/ne, jezične verzije, recenzije s ocjenom, zadnji blog post s datumom).
3. **Osoba.** Uloga i je li donositelj odluka. WebSearch `"Ime Prezime" linkedin post` za svjež hook. Ako ništa, ne forsiraj.
4. **Tier** po `CLAUDE.md` sekciji 4. SKIP je dobar ishod.
5. **Alati.** Pokreni `npx tsx scripts/detect-stack.ts <njihov-url>`. Prepozna CRM, chat, booking, pracenje poziva, recenzije, analitiku, oglase i platformu iz izvornog koda stranice. Rezultat u `tech_stack`. Ako skripta ne prodje (403, stranica blokira botove), ostavi `tech_stack` prazan i zabiljezi to.
6. **Asset** po `CLAUDE.md` sekciji 5b. Prođi pravila 1-5 redom i u `asset_reason` napiši koje je pogodilo. Ako ispadne `website_demo`, popuni cijeli `website_demo` blok i `demo_status: "todo"`. Ako ispadne `n8n_loom`, biraj workflowe kao i prije.
7. **Opener** po sekciji 5c. Jedno pitanje koje otvara ono sto si nasao u `tech_stack` ili u odsutnosti alata. Do ~250 znakova, bez linka, bez spominjanja videa. Obavezan za tier A i B.
8. **Ponuda, hook, video beats, DM** po sekcijama 5, 5b i 6. DM do ~350 znakova, bez em dasheva, bez sales fraza. Follow-up u obje verzije. Kod `website_demo` DM sadrži i `[loom]` i `[demo]` placeholder, video beats prate raspored iz 5b.
9. **Spremi brief** u `data/briefs/YYYY-MM-DD_ime-prezime.json` (današnji datum, ime lowercase s crticama, bez dijakritike) po shemi iz `CLAUDE.md` sekcije 7.
10. **Pushaj:** `npx tsx scripts/push-brief.ts data/briefs/<file>.json`. Skripta postavlja status `ready`, `needs_demo` (website demo koji još nije izgrađen) ili `skipped` (tier SKIP) i loga u `activity_log`.
11. **Ispiši jedan redak:** `Ime | tier | asset | ponuda | confidence`.

## Na kraju

- Tablica sažetka: ime, tier, asset, vertikala, ponuda, confidence, jezik.
- Koliko ih je `ready`, koliko `needs_demo`, koliko `skipped`.
- Popis demo stranica koje treba izgraditi prije snimanja.
- Popis leadova s `identity_confidence: low` i što treba provjeriti.
- Link na app (iz `.env.local` `APP_URL`, ako postoji).

## Pravila

- Jedna osoba u isto vrijeme. Ne pokrećeš subagente za ovo.
- Nikad izmišljene brojke, klijenti ni case studyji. Benchmark samo uz stvarni izvor u `sources`.
- Nikad ne otvaraj LinkedIn za pisanje. Samo čitanje, i samo ako je dostupna Chrome integracija, max 15 profila po sesiji.
- Ako te nešto zaustavi (stranica ne radi, identitet nemoguć), zapiši to u brief i nastavi na sljedećeg, ne staj.
