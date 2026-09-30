---
name: "source-command-deploy"
description: "Lokalni build pa redeploy appa na Vercel"
---

# source-command-deploy

Use this skill when the user asks to run the migrated source command `deploy`.

## Command Template

## Koraci

1. `cd web && npm run build`
2. Ako build padne, **stani**, pokaži grešku i popravi je. Nikad ne deployaš slomljen build.
3. Ako je build prošao: `cd web && npx vercel --prod`
4. Ispiši produkcijski URL.

## Pravila

- Uvijek build prije deploya, bez iznimke.
- Ako si dodao novu env varijablu, prvo `npx vercel env add <IME> production` pa tek onda deploy.
- Nikad ne commitaš `.env*` ni `inputs/linkedin/`.
