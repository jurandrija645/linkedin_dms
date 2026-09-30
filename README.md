# Mindaptive Loom Outreach

Sustav za personalizirani LinkedIn Loom outreach. Claude Code istražuje leadove, web app vodi kroz dnevnu rutinu.

## Dnevna rutina

1. Otvori app → ekran **Danas**
2. Za prvog leada klikni **Otvori sve tabove** (LinkedIn + njihova stranica + workflowi)
3. Snimi Loom po `video_beats` s kartice
4. **Snimljeno** → zalijepi Loom URL
5. Kopiraj DM (možeš ga prije toga urediti), pošalji na LinkedInu
6. **Poslano** → follow-up se automatski zakazuje za 4 dana

Cilj: 3 dnevno.

## Tjedna rutina

```
/sljedeci 10      → pregledaj listu, reci "može" ili koje izbaciti
/obradi           → Claude istraži svakog i napravi brief + DM
```

Ekran **Follow-up** kad dođu na red. Ekran **Statistika** za pregled.

## Slash komande

| Komanda | Što radi |
|---|---|
| `/sljedeci [N]` | Prikaže sljedećih N `new` leadova, čeka potvrdu, pa ih stavi u queue |
| `/obradi` | Istraži sve `queued` i napravi brief, DM i Loom plan |
| `/dodaj <url> [ime, firma, pozicija]` | Ručno doda osobu |
| `/import` | Import ili merge `Connections.csv` |
| `/katalog` | Napravi `catalog/workflows.json` iz n8n exporta |
| `/analiza` | Reply rate po tieru/vertikali/hooku/jeziku + prijedlozi izmjena playbooka |
| `/deploy` | Build lokalno pa redeploy na Vercel |

## Gdje što ide

| Folder | Što |
|---|---|
| `inputs/linkedin/` | `Connections.csv` iz LinkedIn exporta. **Nikad u git.** |
| `inputs/n8n-workflows/` | JSON exporti n8n workflowa |
| `inputs/loom-transcripts/` | `.txt` transkripti dosadašnjih Loomova |
| `inputs/notes/` | Ponude, cjenici, ideje |
| `data/briefs/` | Generirani briefovi, jedan JSON po osobi (backup baze) |
| `catalog/workflows.json` | Generirani katalog workflowa |

## Setup od nule

```bash
npm install
cp .env.example .env.local     # pa popuni
npx tsx scripts/apply-schema.ts    # kreira tablice u Supabaseu
cd web && npm install && npm run dev
```

`CLAUDE.md` je playbook — pravila za tier, Loom i DM. Mijenja se kroz `/analiza`.
