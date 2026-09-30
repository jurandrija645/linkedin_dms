---
description: Napravi catalog/workflows.json iz n8n exporta i pushaj u Supabase
allowed-tools: Bash, Read, Write, Glob
---

## Koraci

1. Nađi sve `.json` fajlove u `inputs/n8n-workflows/`. Ako ih nema, reci Andriji gdje ih staviti i stani.
2. Pročitaj svaki. Iz svakog izvuci:
   - `id` — iz polja `id` u exportu; ako ga nema, slugificiraj `name`
   - `name` — iz polja `name`
   - `trigger` — tip prvog trigger nodea (webhook, schedule, form, chat, manual...), ljudski opisan
   - `integrations` — jedinstveni servisi iz `nodes[].type` (twilio, gmail, openai, google-sheets, hubspot...), bez n8n internih nodeova (set, if, code, merge, noOp)
3. Ti sam napiši, ne skripta:
   - `what_it_does` — **jedna** rečenica, na hrvatskom, što workflow zapravo radi iz perspektive klijenta
   - `best_for_verticals` — podskup od `hvac, solar, roofing, dental, med_spa, home_services, b2b_saas, agency`
   - `demo_tip` — što točno pokazati u 10 sekundi na ekranu. **Rezultat, ne canvas.** Npr. "otvori Twilio log i pokaži SMS koji homeowner dobije 45 sekundi nakon propuštenog poziva".
4. Zapiši `catalog/workflows.json` kao array objekata s poljima: `id`, `name`, `n8n_url`, `what_it_does`, `trigger`, `integrations`, `best_for_verticals`, `demo_tip`.
   - `n8n_url` = `${N8N_BASE_URL}/workflow/<id>` (N8N_BASE_URL iz `.env.local`)
5. **Pokaži Andriji tablicu** (name, what_it_does, best_for_verticals, demo_tip) i čekaj potvrdu.
6. Nakon potvrde: `npx tsx scripts/build-catalog.ts --push` — upsertira u tablicu `workflows`.

## Pravila

- Ako workflow ima nejasno ime i ne možeš pouzdano reći što radi, napiši to umjesto da izmišljaš.
- Ako se katalog već generirao prije, zadrži postojeće `what_it_does` i `demo_tip` za nepromijenjene workflowe, ne prepisuj ih.
