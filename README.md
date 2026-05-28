# Eberoth Compendium — Quasar app

Phase Q rebuild of the Eberoth Compendium. Dense single-page dashboard powered by Supabase.

## Dev

```bash
npm install
cp .env.example .env   # add your Supabase URL + anon key
npm run dev
```

Open http://localhost:9000.

## Architecture

See `phase-q-kickoff.md` in the workspace root.

Small files, one concern each:
- `src/boot/` — Supabase client + auth bootstrap
- `src/stores/` — Pinia stores (auth, entities, layout)
- `src/composables/` — cross-cutting reactive helpers
- `src/api/` — Supabase read/write functions, one file per table group
- `src/components/` — Vue components by section (topbar, home, detail, shared)
- `src/pages/` — top-level page views
