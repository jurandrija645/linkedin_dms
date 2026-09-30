---
description: Prikaži sljedećih N leadova sa statusom new i čekaj potvrdu prije stavljanja u queue
argument-hint: "[N] (default 10)"
allowed-tools: Bash, Read
---

Argument: `$ARGUMENTS` (broj leadova, ako je prazno koristi 10).

## Koraci

1. Pokreni `npx tsx scripts/list-next.ts <N>` iz roota projekta. Skripta vraća JSON s leadovima statusa `new`, sortirano od najstarijih (`csv_order DESC`).
2. Ispiši markdown tablicu sa stupcima:

   | # | Ime | Pozicija | Firma | Konektirani | Brza procjena |

   `Brza procjena` je tvoja ocjena **samo iz headlinea/pozicije**, bez ikakvog searcha. Jedna od tri vrijednosti:
   - `obećavajuće` — vlasnik/founder/GM/head of sales ili ops u HVAC, solar, roofing, dental, med spa, home services
   - `upitno` — nejasna uloga ili vertikala izvan ICP-a ali blizu
   - `vjerojatno skip` — recruiter, student, prodaje nama, jasno izvan vertikala

   Uz svaku procjenu dodaj najviše 4-5 riječi obrazloženja.
3. **Stani.** Nemoj ništa mijenjati u bazi. Napiši: "Reci 'može' ili koje brojeve izbaciti."
4. Kad Andrija potvrdi, pokreni `npx tsx scripts/queue.ts <id1> <id2> ...` s onima koje je ostavio. Skripta ih prebacuje u `queued` i loga u `activity_log`.
5. Potvrdi jednim retkom: koliko ih je u queueu i da može `/obradi`.

## Pravila

- Nikad ne preskači korak 3. Potvrda je obavezna.
- Ako nema leadova sa statusom `new`, reci to i predloži `/import` ili `/dodaj`.
