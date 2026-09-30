---
name: "source-command-import"
description: "Importaj ili mergeaj LinkedIn Connections.csv u Supabase"
---

# source-command-import

Use this skill when the user asks to run the migrated source command `import`.

## Command Template

Importaj `inputs/linkedin/Connections.csv` po `AGENTS.md` sekciji 2.

## Koraci

1. Provjeri postoji li fajl. Ako ne postoji, reci gdje ga staviti (`inputs/linkedin/Connections.csv`) i stani.
2. **Dry run:** `npx tsx scripts/import-connections.ts --dry-run`

   Skripta:
   - preskače "Notes" retke i nalazi pravi header
   - parsira datum iz formata `15 Jul 2026`
   - dodjeljuje `csv_order` po originalnom redoslijedu (0 = prvi red = najnoviji)
   - nalazi cutoff osobu (default `Ben Inzelbuch`, override s `--cutoff "Ime Prezime"`)
   - ispisuje 3 retka iznad i 3 ispod cutoffa
   - ispisuje broj `legacy` (cutoff i stariji) i broj `new` (noviji)
   - kod merge-a: ispisuje koliko je novih, koliko već postoji

3. **Pokaži Andriji** tablicu od 7 redaka oko cutoffa i brojke. **Čekaj potvrdu.**
4. Tek nakon potvrde: `npx tsx scripts/import-connections.ts`
5. Dopiši u `data/import-log.md` redak: datum, ime fajla, ukupno redaka, novih, legacy, preskočenih duplikata.
6. Ispiši: koliko ih je sada `new` i predloži `/sljedeci`.

## Pravila

- Dedupe ide po `linkedin_url`. Postojeće retke **nikad** ne diraš (ne mijenjaš status, tier ni brief).
- Cutoff ide po poziciji u CSV-u, ne po datumu.
- `Connections.csv` nikad ne commitaš i nikad ne kopiraš u `web/`.
