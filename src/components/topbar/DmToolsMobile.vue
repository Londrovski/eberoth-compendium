<template>
  <div class="dm-mobile">

    <!-- Card size -->
    <div class="ctrl-section">
      <div class="ctrl-label">Card size</div>
      <div class="row items-center q-gutter-xs">
        <button class="step-btn" @click="adjustCard(-0.1)" :disabled="layout.cardScale <= 0.3">−</button>
        <span class="ctrl-val">{{ pct(layout.cardScale) }}</span>
        <button class="step-btn" @click="adjustCard(+0.1)" :disabled="layout.cardScale >= 2">+</button>
      </div>
      <div class="ctrl-hint">Affects all cards site-wide</div>
    </div>

    <div class="ctrl-sep" />

    <!-- Party cards per row -->
    <div class="ctrl-section">
      <div class="ctrl-label">Party cards per row</div>
      <div class="row items-center q-gutter-xs">
        <button
          v-for="n in [1,2,3]"
          :key="n"
          class="pill"
          :class="{ active: mobilePartyCols === n }"
          @click="setPartyCols(n)"
        >{{ n }}</button>
      </div>
    </div>

    <div class="ctrl-sep" />

    <!-- Faction member cards per row -->
    <div class="ctrl-section">
      <div class="ctrl-label">Faction cards per row</div>
      <div class="row items-center q-gutter-xs">
        <button
          v-for="n in [1,2,3]"
          :key="n"
          class="pill"
          :class="{ active: mobileFactionCols === n }"
          @click="setFactionCols(n)"
        >{{ n }}</button>
      </div>
    </div>

    <div class="ctrl-sep" />

    <!-- Card spacing -->
    <div class="ctrl-section">
      <div class="ctrl-label">Card gap</div>
      <div class="row items-center q-gutter-xs">
        <button class="step-btn" @click="adjustSpacing(-2)" :disabled="cardSpacing <= 2">−</button>
        <span class="ctrl-val">{{ cardSpacing }}px</span>
        <button class="step-btn" @click="adjustSpacing(+2)" :disabled="cardSpacing >= 24">+</button>
      </div>
    </div>

    <div class="ctrl-sep" />

    <!-- Card aspect ratio -->
    <div class="ctrl-section">
      <div class="ctrl-label">Card image ratio</div>
      <div class="row items-center q-gutter-xs">
        <button
          v-for="r in ratios"
          :key="r.label"
          class="pill"
          :class="{ active: cardRatio === r.value }"
          @click="setRatio(r.value)"
        >{{ r.label }}</button>
      </div>
      <div class="ctrl-hint">Taller = more portrait art</div>
    </div>

    <div class="ctrl-sep" />

    <!-- Personal cards -->
    <div class="ctrl-section">
      <div class="ctrl-label">Personal cards</div>
      <div class="row items-center q-gutter-xs">
        <button class="pill" :class="{ active: layout.showPersonals }"  @click="layout.setShowPersonals(true)">Show</button>
        <button class="pill" :class="{ active: !layout.showPersonals }" @click="layout.setShowPersonals(false)">Hide</button>
      </div>
    </div>

    <div class="ctrl-sep" />

    <!-- Background opacity -->
    <div class="ctrl-section">
      <div class="ctrl-label">Background opacity</div>
      <div class="row items-center q-gutter-xs">
        <button class="step-btn" @click="adjustOpacity(-0.05)" :disabled="bgOpacity <= 0">−</button>
        <span class="ctrl-val">{{ Math.round(bgOpacity * 100) }}%</span>
        <button class="step-btn" @click="adjustOpacity(+0.05)" :disabled="bgOpacity >= 1">+</button>
      </div>
    </div>

    <div class="ctrl-sep" />

    <!-- Quick add -->
    <div class="ctrl-section">
      <div class="ctrl-label">Quick add</div>
      <div class="column q-gutter-xs">
        <button class="add-row" @click="openAdd('faction')">+ New faction</button>
        <button class="add-row" @click="openAdd('npc')">+ New NPC</button>
        <button class="add-row" @click="openAdd('lore')">+ New lore</button>
      </div>
    </div>

  </div>

  <NewEntityDialog v-if="adding" :kind="adding" @close="adding = null" />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAppSettingsStore } from 'src/stores/app-settings';
import NewEntityDialog from 'components/topbar/NewEntityDialog.vue';

const layout = useAppSettingsStore();
const adding = ref(null);

// ── CSS custom property helpers ───────────────────────────────────────
function setCSSVar(name, value) {
  if (typeof document !== 'undefined')
    document.documentElement.style.setProperty(name, String(value));
}

// ── Per-column counts (1 / 2 / 3) ────────────────────────────────────
const PARTY_COLS_KEY   = 'eb_mobile_party_cols';
const FACTION_COLS_KEY = 'eb_mobile_faction_cols';

const mobilePartyCols   = ref(parseInt(localStorage.getItem(PARTY_COLS_KEY)   || '2', 10));
const mobileFactionCols = ref(parseInt(localStorage.getItem(FACTION_COLS_KEY) || '2', 10));

function setPartyCols(n) {
  mobilePartyCols.value = n;
  localStorage.setItem(PARTY_COLS_KEY, String(n));
  setCSSVar('--mobile-party-cols', n);
}
function setFactionCols(n) {
  mobileFactionCols.value = n;
  localStorage.setItem(FACTION_COLS_KEY, String(n));
  setCSSVar('--mobile-faction-cols', n);
}

// ── Card gap ──────────────────────────────────────────────────────────
const SPACING_KEY = 'eb_mobile_card_spacing';
const cardSpacing = ref(parseInt(localStorage.getItem(SPACING_KEY) || '8', 10));

function adjustSpacing(delta) {
  const next = Math.min(24, Math.max(2, cardSpacing.value + delta));
  cardSpacing.value = next;
  localStorage.setItem(SPACING_KEY, String(next));
  setCSSVar('--mobile-card-spacing', next + 'px');
}

// ── Card image aspect ratio ───────────────────────────────────────────
const RATIO_KEY = 'eb_mobile_card_ratio';
const ratios = [
  { label: 'Square', value: '100%'  },
  { label: '4:3',    value: '133%'  },
  { label: 'Tall',   value: '150%'  },
  { label: 'Port.',  value: '175%'  },
];
const cardRatio = ref(localStorage.getItem(RATIO_KEY) || '133%');

function setRatio(v) {
  cardRatio.value = v;
  localStorage.setItem(RATIO_KEY, v);
  setCSSVar('--mobile-card-ratio', v);
}

// ── Card scale ────────────────────────────────────────────────────────
function adjustCard(delta) {
  const next = Math.round((layout.cardScale + delta) * 10) / 10;
  layout.setCardScale(Math.min(2, Math.max(0.3, next)));
}
function pct(v) { return Math.round(v * 100) + '%'; }

// ── Background opacity ────────────────────────────────────────────────
const bgOpacity = computed(() => layout.siteBackground?.opacity ?? 0.35);
function adjustOpacity(delta) {
  const next = Math.round((bgOpacity.value + delta) * 100) / 100;
  layout.setSiteBackground({ opacity: Math.min(1, Math.max(0, next)) });
}

// ── Quick add ─────────────────────────────────────────────────────────
function openAdd(kind) { adding.value = kind; }

// ── Apply all stored values on mount ─────────────────────────────────
onMounted(() => {
  setCSSVar('--mobile-party-cols',   mobilePartyCols.value);
  setCSSVar('--mobile-faction-cols', mobileFactionCols.value);
  setCSSVar('--mobile-card-spacing', cardSpacing.value + 'px');
  setCSSVar('--mobile-card-ratio',   cardRatio.value);
});
</script>

<style scoped>
.dm-mobile { color: var(--text); }

.ctrl-section { margin-bottom: 2px; }
.ctrl-label {
  font-size: 10px;
  color: var(--gold-dim);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 6px;
}
.ctrl-hint {
  font-size: 10px;
  color: var(--text-dim);
  font-style: italic;
  margin-top: 4px;
}
.ctrl-val {
  font-size: 13px;
  color: var(--text);
  min-width: 46px;
  text-align: center;
  display: inline-block;
}
.ctrl-sep {
  height: 1px;
  background: var(--border);
  margin: 12px 0;
}

.step-btn {
  width: 32px;
  height: 32px;
  background: var(--bg-panel-2);
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text);
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
}
.step-btn:hover:not(:disabled) { border-color: var(--gold-dim); color: var(--gold); }
.step-btn:disabled { opacity: 0.35; cursor: default; }

.pill {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-dim);
  padding: 5px 14px;
  border-radius: 3px;
  font-family: inherit;
  font-size: 12px;
  cursor: pointer;
}
.pill:hover { color: var(--gold); border-color: var(--gold-dim); }
.pill.active {
  background: var(--gold-dim);
  border-color: var(--gold-dim);
  color: var(--bg);
}

.add-row {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--gold-dim);
  padding: 6px 10px;
  border-radius: 3px;
  text-align: left;
  font-family: inherit;
  font-size: 12px;
  cursor: pointer;
  width: 100%;
}
.add-row:hover { color: var(--gold); border-color: var(--gold-dim); background: var(--bg-panel-2); }
</style>
