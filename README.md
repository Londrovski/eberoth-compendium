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

Content lives as small files in `data/`. Each file **self-registers** by pushing its entry onto a global array (`FACTIONS`, `PLAYERS`, `LORE`, `SESSIONS`, `PERSONAL_NOTES`).

Each folder has a `_manifest.js` listing the files in that folder. A single `loader.js` reads every manifest at runtime and injects the right `<script>` tags in the right order.

The upshot: **`index.html` is static** and only loads `loader.js`. Adding new content is one new file + one new line in one manifest. No `index.html` edit, no `data.js` edit.

```
eberoth-compendium/
├── index.html              ← loads loader.js (and nothing else dynamic)
├── loader.js               ← reads manifests, loads everything in order
├── app.js                  ← renderer (untouched by content changes)
├── styles.css
├── data.js                 ← finaliser: ensures arrays exist + sorts sessions
├── data/
│   ├── factions/
│   │   ├── _manifest.js        ← ordered list of filenames in this folder
│   │   └── {name}.js           → pushes into FACTIONS
│   ├── players/
│   │   ├── _manifest.js
│   │   └── {name}.js           → pushes into PLAYERS
│   ├── lore/
│   │   ├── _manifest.js        ← also controls Notes-page display order
│   │   └── {name}.js           → pushes into LORE
│   ├── sessions/
│   │   ├── _manifest.js
│   │   └── session-N.js        → pushes into SESSIONS
│   └── personal/
│       ├── kalvorn/
│       │   ├── _manifest.js    ← leaves first, _index LAST
│       │   ├── _index.js       ← wires this player's content into PERSONAL_NOTES
│       │   ├── compendium/{name}.js     → pushes into KALVORN_COMPENDIUM
│       │   └── notes/{name}.js          → pushes into KALVORN_NOTES
│       ├── azrael/
│       │   ├── _manifest.js
│       │   ├── _index.js
│       │   └── compendium/{name}.js     → pushes into AZRAEL_COMPENDIUM
│       └── dirk/
│           ├── _manifest.js
│           ├── _index.js
│           ├── compendium/{name}.js     → pushes into DIRK_COMPENDIUM
│           └── notes/{name}.js          → pushes into DIRK_NOTES
└── [image files at root level]
```

---

## How the loader works

1. `index.html` loads `loader.js`.
2. `loader.js` walks its `FOLDERS` list in order. For each folder:
   - Loads `{folder}/_manifest.js`, which sets `window.MANIFEST` to an array of filenames
   - Injects `<script>` tags for each listed file, in order, waiting for each to load
3. After all folders are processed, loads `data.js` (finaliser).
4. Finally loads `app.js` (renderer).

If the loader encounters a missing file or broken manifest, it logs the error to the console and stops. Check the browser console if the site renders blank.

---

## How to add things

### Add a new session
1. Create `data/sessions/session-N.js` with `(window.SESSIONS = window.SESSIONS || []).push({ ... })`
2. Add `'session-N'` to `data/sessions/_manifest.js`
3. Done. (No `index.html` or `data.js` edit. Sessions are sorted by their `number` field at finalisation.)

### Add a new shared lore entry
1. Create `data/lore/entry-name.js` with `(window.LORE = window.LORE || []).push({ ... })`
2. Add `'entry-name'` to `data/lore/_manifest.js` (the order here is the display order on the Notes page)
3. Done.

### Add a new NPC to a player's personal compendium
1. Create `data/personal/{player}/compendium/npc-name.js` with `(window.{PLAYER}_COMPENDIUM = window.{PLAYER}_COMPENDIUM || []).push({ ... })`
2. Add `'compendium/npc-name'` to that player's `_manifest.js`, BEFORE the `'_index'` entry
3. Done.

### Add a new private note to a player
Same as above with `notes/note-name.js` pushing into `window.{PLAYER}_NOTES`.

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

Files are independent. Within a category (factions, lore, etc.), display order is controlled by the order of names in the relevant `_manifest.js` — except sessions, which always sort by `number`.

---

## Personal player manifests — important

Each player's `_manifest.js` MUST list `_index` last. The leaf compendium/notes files push into player-specific arrays (e.g. `KALVORN_COMPENDIUM`); `_index.js` reads those arrays and registers the player's entry into `PERSONAL_NOTES`. If `_index.js` loads first, the arrays are empty when it reads them.

---

## Session block format

Each session has `parts`, and each part has a `blocks` array.

Available block types:

- `{ type: 'para', text: '...' }` — paragraph; supports `<strong>` for bolded names
- `{ type: 'highlight', text: '...' }` — yellow line for emphasis
- `{ type: 'testimonies', items: [{ name, text }] }` — named-bullet list
- `{ type: 'takeaway', text: '...' }` — yellow bullet, used in the final "Key Takeaways" part

A session also has:
- `rowSummary: '...'` — short italic line shown under the title on the session list row
- `summary: ['...', '...']` — bullet list shown at the top of the expanded session detail popup

Legacy sessions may use an `events` array on a part instead of `blocks`. The renderer handles both, but new sessions should use `blocks`.

---

## Deployment

GitHub Pages auto-deploys on push to `main`. Typical lag: 30 seconds. No build step.

If the page is blank, open the browser console — the loader logs the failing file path.

---

## What NOT to do

- Don't introduce DM-only content into compendium files
- Don't use the word "Eberoth" in user-facing strings
- Don't put files in subfolders like `images/` — images sit at repo root
- Don't put leaves in a folder without updating that folder's `_manifest.js`
- Don't reorder a personal-player `_manifest.js` so `_index` isn't last
- Don't list constants in `data.js`. It's now a finaliser; leaf files self-register
