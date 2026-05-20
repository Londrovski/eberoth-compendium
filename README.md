# Eberoth Compendium

The player-facing compendium for the campaign. A static GitHub Pages site — no build step, no framework. Push to `main`, deploys in ~30 seconds.

---

## What this is

A single-page web app that displays campaign content to the players: party members, houses and factions, shared lore, session log, and per-player private notes locked behind a passphrase.

**Spoiler rules:**
- No DM-only lore, no future hooks, no patron/villain identity confirmations
- The word "Eberoth" must not appear anywhere in user-facing content (the world has no in-universe name)
- Per-player private content stays locked behind passphrases

---

## Architecture

Content is split into small files in `data/`, each declaring a single global constant. The top-level `data.js` assembles those constants into the arrays `app.js` expects. `index.html` loads files in dependency order via script tags.

```
eberoth-compendium/
├── index.html              ← loads everything in order
├── app.js                  ← renderer (untouched by content changes)
├── styles.css
├── data.js                 ← assembly file (small)
├── data/
│   ├── factions/
│   │   ├── crown.js
│   │   ├── corvath.js
│   │   ├── voss.js
│   │   ├── gorrund.js
│   │   └── halvorn.js
│   ├── players/
│   │   ├── kalvorn.js
│   │   ├── azrael.js
│   │   └── dirk.js
│   ├── lore/
│   │   ├── stillmarks.js
│   │   ├── tessaly.js
│   │   ├── daven-halvorn.js
│   │   ├── jorik.js
│   │   └── byren-holt.js
│   ├── sessions/
│   │   ├── session-1.js
│   │   ├── session-2.js
│   │   ├── session-3.js
│   │   └── session-4.js
│   └── personal/
│       ├── kalvorn/
│       │   ├── _index.js
│       │   ├── meta.js
│       │   ├── compendium/{...}.js
│       │   └── notes/{...}.js
│       ├── azrael/
│       │   ├── _index.js
│       │   ├── meta.js
│       │   ├── compendium/{...}.js
│       │   └── notes/{...}.js
│       └── dirk/
│           ├── _index.js
│           ├── meta.js
│           ├── compendium/{...}.js
│           └── notes/{...}.js
└── [image files at root level]
```

---

## How content loads

`index.html` loads scripts in this order, and order matters:

1. **Leaf files** — every file in `data/factions/`, `data/players/`, `data/lore/`, `data/sessions/`, and the deepest files inside `data/personal/{player}/` (meta, compendium entries, notes).
2. **Player `_index.js`** — each `data/personal/{player}/_index.js` assembles that player's pieces into a single `{PLAYER}_PERSONAL` constant.
3. **`data.js`** — assembles top-level arrays: `FACTIONS`, `PLAYERS`, `LORE`, `SESSIONS`, `PERSONAL_NOTES`, `PARTY_NOTES`.
4. **`app.js`** — reads those arrays and renders the UI.

If a script can't find a constant, the load order is wrong.

---

## Naming conventions

- **Constants** are `UPPER_SNAKE_CASE`. Each file declares exactly one.
- **Player-prefixed constants** for anything specific to a player: `KALVORN_ALDUS_CORVATH`, `DIRK_ALDUS_CORVATH`. This avoids collisions when two players have entries for the same NPC.
- **File names** are lowercase kebab-case, e.g. `byren-holt.js`, `the-arm.js`.
- **Folder names** under `personal/` are the player's id (kalvorn, azrael, dirk), matching the `playerId` in their `meta.js`.

---

## How to add things

### Add a new session
1. Create `data/sessions/session-N.js` declaring `const SESSION_N = { ... }`
2. Add `SESSION_N` to the `SESSIONS` array in `data.js`
3. Add a `<script src="data/sessions/session-N.js"></script>` line to `index.html`, before `data.js`

### Add a new NPC to a player's personal compendium
1. Create `data/personal/{player}/compendium/npc-name.js` declaring `const {PLAYER}_NPC_NAME = { ... }`
2. Add the constant to that player's `_index.js` `compendium` array
3. Add a script tag to `index.html` before the player's `_index.js`

### Add a new note to a player
1. Create `data/personal/{player}/notes/note-name.js` declaring `const {PLAYER}_NOTE_NAME = { ... }`
2. Add the constant to that player's `_index.js` `notes` array
3. Add a script tag to `index.html`

### Add a new shared lore entry
1. Create `data/lore/entry-name.js` declaring `const ENTRY_NAME = { ... }`
2. Add `ENTRY_NAME` to the `LORE` array in `data.js`
3. Add a script tag to `index.html`

---

## Session block format

Each session has `parts`, and each part has either an `events` array (legacy, only Session 1's older format — now retired) or a `blocks` array. Use `blocks` for all new sessions.

Available block types:

- `{ type: 'para', text: '...' }` — paragraph; supports `<strong>` for bolded names
- `{ type: 'highlight', text: '...' }` — yellow line, used for emphasis (e.g. "Your testimonies:" or a key question the DM ended on)
- `{ type: 'testimonies', items: [{ name, text }] }` — named-bullet list, used originally for player testimonies in Session 2
- `{ type: 'takeaway', text: '...' }` — yellow bullet, used in the final "Key Takeaways" part of each session

A session can also have:
- `rowSummary: '...'` — short italic line shown under the title on the session list row
- `summary: ['...', '...']` — bullet list shown at the top of the expanded session detail popup

---

## Deployment

GitHub Pages auto-deploys on push to `main`. Typical lag: 30 seconds. No build step, no CI to wait for. If a page won't load, check `index.html` script tags for typos or wrong order.

---

## What NOT to do

- Don't introduce DM-only content into compendium files
- Don't use the word "Eberoth" in user-facing strings
- Don't put files in subfolders like `images/` — all images sit at repo root because GitHub Pages serves them from there and existing references assume root paths
- Don't break the script load order in `index.html` — leaf files must load before the files that reference them
- Don't rewrite `app.js` to chase content changes; the renderer is generic and content-driven
