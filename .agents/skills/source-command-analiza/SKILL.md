---
name: "source-command-analiza"
description: "Analiziraj reply rate po tieru, vertikali, hooku i jeziku, pa predloži izmjene playbooka"
---

# source-command-analiza

Use this skill when the user asks to run the migrated source command `analiza`.

## Command Template

## Koraci

1. Pokreni `npx tsx scripts/stats.ts --json`. Vraća sve poslane leadove, odgovore, sentiment i vremena.
2. Izračunaj i ispiši:
   - **Funnel:** ready → recorded → sent → replied → call_booked, s postotcima konverzije između koraka
   - **Reply rate po tieru** (A / B / C)
   - **Reply rate po vertikali**
   - **Reply rate po `hook_type`**
   - **Reply rate po jeziku** (hr vs en)
   - **Video vs bez videa** (ima `loom_url` vs nema)
   - **Prosječan broj dana do odgovora**
   - **Sentiment breakdown** odgovora
3. Uz svaku brojku napiši veličinu uzorka. **Ako je n < 10, izričito napiši da je uzorak premalen za zaključak.** Ne izvlači pravila iz 2-3 odgovora.
4. Pročitaj `reply_text` svih odgovora. Traži obrasce:
   - koje formulacije u DM-u prethode pozitivnim odgovorima
   - na što se ljudi bune (predugo, previše sales, kriva firma, kriv trenutak)
   - gdje je `identity_confidence` bio kriv (odgovori tipa "to nije moja firma")
   - razlika između `dm_draft` i `dm_final` — što Andrija stalno mijenja rukom (to je najjači signal, to znači da playbook griješi)
5. Predloži **konkretne** izmjene `AGENTS.md`: navedi sekciju, postojeći tekst i novi tekst. Max 5 prijedloga, poredani po uvjerljivosti dokaza.
6. **Čekaj potvrdu.** Tek kad Andrija kaže koje prihvaća, editiraj `AGENTS.md`. Na dnu `AGENTS.md` vodi kratki changelog: datum + što je promijenjeno + na temelju kojeg broja odgovora.

## Pravila

- Ne mijenjaj `AGENTS.md` bez izričite potvrde.
- Razlikuj korelaciju od uzroka. Ako je A tier imao bolji reply rate, moguće je da su to jednostavno bolji leadovi, ne bolji video.
