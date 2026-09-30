---
description: Ručno dodaj osobu u bazu sa statusom new
argument-hint: "<linkedin_url> [ime, firma, pozicija]"
allowed-tools: Bash
---

Argument: `$ARGUMENTS`

Format: `<linkedin_url> [Ime Prezime, Firma, Pozicija]` — sve nakon URL-a je opcionalno, razdvojeno zarezima.

## Koraci

1. Izvuci `linkedin_url` (prvi token koji počinje s `http` ili `linkedin.com`). Normaliziraj: `https://www.linkedin.com/in/slug`, bez query stringa i bez zadnje kose crte.
2. Ako je Andrija dao ime, firmu i poziciju, koristi ih. Ako nije, pokušaj izvući ime iz slug-a URL-a i to jasno označi kao pretpostavku.
3. Pokreni:

   ```
   npx tsx scripts/add-lead.ts --url "<url>" --first "<ime>" --last "<prezime>" --company "<firma>" --position "<pozicija>"
   ```

   Skripta dodaje s `status = new`, `csv_order = null` (ručno dodani idu na vrh queuea) i dedupe po `linkedin_url`.
4. Ako lead već postoji, reci koji je njegov trenutni status i ne mijenjaj ga.
5. Potvrdi jednim retkom: ime, URL, status.

Ne radiš istraživanje ovdje. Istraživanje ide kroz `/sljedeci` pa `/obradi`.
