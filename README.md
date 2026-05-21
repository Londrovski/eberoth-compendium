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

Content is split into small files in `data/`. Each file **self-registers** by pushing its entry onto a global array (`FACTIONS`, `PLAYERS`, `LORE`, `SESSIONS`, `PERSONAL_NOTES`). The top-level `data.js` just ensures those arrays exist and applies any final ordering. `index.html` loads files via script tags.

This means adding a new session or NPC is **one new file + one new script tag in `index.html`**. The top-level `data.js` is not touched.

```
eberoth-compendium/
├── index.html              ← loads everything (one script tag per leaf file)
├── app.js                  ← renderer (untouched by content changes)
├── styles.css
├── data.js                 ← finaliser: ensures arrays exist + sorts sessions
├── data/
│   ├── factions/{name}.js          → pushes into FACTIONS
│   ├── players/{name}.js           → pushes into PLAYERS
│   ├── lore/{name}.js              → pushes into LORE
│   ├── sessions/session-N.js       → pushes into SESSIONS
│   └── personal/
│       ├── kalvorn/
│       │   ├── _index.js                ← pushes into PERSONAL_NOTES, wiring this player's content
│       │   ├── compendium/{name}.js     → pushes into KALVORN_COMPENDIUM
│       │   └── notes/{name}.js          → pushes into KALVORN_NOTES
│       ├── azrael/
│       │   ├── _index.js                → pushes into PERSONAL_NOTES
│       │   └── compendium/{name}.js     → pushes into AZRAEL_COMPENDIUM
│       └── dirk/
│           ├── _index.js                → pushes into PERSONAL_NOTES
│           ├── compendium/{name}.js     → pushes into DIRK_COMPENDIUM
│           └── notes/{name}.js          → pushes into DIRK_NOTES
└── [image files at root level]
```

---

## How content loads

`index.html` loads scripts top-to-bottom. The only ordering rule is:

1. **Per-player compendium and note leaf files** must load **before** that player's `_index.js`. Each `_index.js` references its player-specific globals when it registers, so the leaves need to have pushed first.
2. **All leaf files** must load **before** `data.js`. The finaliser sorts sessions and ensures arrays exist; it doesn't add data.
3. **`app.js`** loads last and reads the assembled globals.

Within a single category (factions, lore, sessions), order doesn't matter — sessions get sorted by `number` in `data.js`.

---

## How to add things

### Add a new session
1. Create `data/sessions/session-N.js` with `(window.SESSIONS = window.SESSIONS || []).push({ ... })`
2. Add `<script src="data/sessions/session-N.js"></script>` to `index.html`
3. That's it. No edit to `data.js` needed.

### Add a new shared lore entry
1. Create `data/lore/entry-name.js` with `(window.LORE = window.LORE || []).push({ ... })`
2. Add a `<script>` tag to `index.html`
3. Done.

### Add a new NPC to a player's personal compendium
1. Create `data/personal/{player}/compendium/npc-name.js` with `(window.{PLAYER}_COMPENDIUM = window.{PLAYER}_COMPENDIUM || []).push({ ... })`
2. Add a `<script>` tag in `index.html` BEFORE that player's `_index.js`
3. Done.

### Add a new private note to a player
Same as above but `notes/note-name.js` pushing into `window.{PLAYER}_NOTES`.

### Edit existing content
Open the one file for that entry, edit, push. No other files affected.

---

## Self-registration pattern

Every leaf file looks like this:

```js
(window.LORE = window.LORE || []).push({
  id: 'thing-id',
  name: 'Thing Name',
  // ...
});
```

The `(window.X = window.X || [])` idiom creates the global array on first push, then pushes onto the existing one for every subsequent file. Files are independent and order within a category doesn't matter.

---

## Session block format

Each session has `parts`, and each part has a `blocks` array.

Available block types:

- `{ type: 'para', text: '...' }` — paragraph; supports `<strong>` for bolded names
- `{ type: 'highlight', text: '...' }` — yellow line, used for emphasis (e.g. "Your testimonies:" or a key question the DM ended on)
- `{ type: 'testimonies', items: [{ name, text }] }` — named-bullet list, used originally for player testimonies in Session 2
- `{ type: 'takeaway', text: '...' }` — yellow bullet, used in the final "Key Takeaways" part of each session

A session also has:
- `rowSummary: '...'` — short italic line shown under the title on the session list row
- `summary: ['...', '...']` — bullet list shown at the top of the expanded session detail popup

Legacy sessions may use an `events` array on a part instead of `blocks`. The renderer handles both, but new sessions should use `blocks`.

---

## Deployment

GitHub Pages auto-deploys on push to `main`. Typical lag: 30 seconds. No build step, no CI to wait for. If a page won't load, check `index.html` script tags for typos or wrong load order (per-player leaves before their `_index.js`; everything before `data.js`).

---

## What NOT to do

- Don't introduce DM-only content into compendium files
- Don't use the word "Eberoth" in user-facing strings
- Don't put files in subfolders like `images/` — all images sit at repo root because GitHub Pages serves them from there and existing references assume root paths
- Don't break the load order: per-player compendium/notes files must load before that player's `_index.js`, and everything must load before `data.js`
- Don't rewrite `app.js` to chase content changes; the renderer is generic and content-driven
- Don't put a leaf file's data into `data.js`. `data.js` is now just a finaliser; if you find yourself listing constants in it, you're working against the architecture
