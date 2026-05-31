<!--
  DmToolsMobile — root panel rendered inside the TopBar DM slide-out.
  Each control is a small focused sub-component in ./dm-mobile/.

  Controls:
    • Party cards per row   (1 / 2 / 3)  → --mobile-party-cols
    • Faction cards per row (1 / 2 / 3)  → --mobile-faction-cols
    • Card gap              (2–24 px)     → --mobile-card-spacing
    • Card image ratio      (4 presets)   → --mobile-card-ratio
    • Personal cards        (Show / Hide)
    • Background opacity    (0–100 %)
    • Quick add             (faction / NPC / lore)

  All layout prefs are stored in localStorage and applied instantly as
  CSS custom properties on :root so every card responds without a reload.

  NOTE: "card scale" (cardScale in app-settings) is intentionally NOT
  exposed here. On mobile the card width is driven entirely by the
  column-count CSS formula, which ignores cardScale. If cardScale was
  changed via the old desktop slider and saved to the DB, cards would
  look different sizes because the formula divides 100% by the col count
  but the individual card's --desktop-w is still computed from cardScale.
  To guarantee uniform sizing across the party section, DmToolsMobile
  resets cardScale to 1 on mount when running on a mobile viewport.
-->
<template>
  <div class="dm-mobile">

    <MobileColControl
      label="Party cards per row"
      v-model="mobilePartyCols"
      @update:modelValue="setPartyCols"
    />
    <div class="sep" />

    <MobileColControl
      label="Faction cards per row"
      v-model="mobileFactionCols"
      @update:modelValue="setFactionCols"
    />
    <div class="sep" />

    <MobileStepControl
      label="Card gap"
      v-model="cardSpacing"
      :min="2" :max="24" :step="2"
      :display="cardSpacing + 'px'"
      @update:modelValue="setSpacing"
    />
    <div class="sep" />

    <MobileRatioControl
      v-model="cardRatio"
      @update:modelValue="setRatio"
    />
    <div class="sep" />

    <MobileToggleControl
      label="Personal cards"
      :modelValue="layout.showPersonals"
      @update:modelValue="layout.setShowPersonals"
    />
    <div class="sep" />

    <MobileStepControl
      label="Background opacity"
      v-model="bgOpacityPct"
      :min="0" :max="100" :step="5"
      :display="bgOpacityPct + '%'"
      @update:modelValue="setOpacity"
    />
    <div class="sep" />

    <MobileQuickAdd @add="openAdd" />

  </div>

  <NewEntityDialog v-if="adding" :kind="adding" @close="adding = null" />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAppSettingsStore } from 'src/stores/app-settings';
import NewEntityDialog      from 'components/topbar/NewEntityDialog.vue';
import MobileColControl     from 'components/topbar/dm-mobile/MobileColControl.vue';
import MobileStepControl    from 'components/topbar/dm-mobile/MobileStepControl.vue';
import MobileToggleControl  from 'components/topbar/dm-mobile/MobileToggleControl.vue';
import MobileRatioControl   from 'components/topbar/dm-mobile/MobileRatioControl.vue';
import MobileQuickAdd       from 'components/topbar/dm-mobile/MobileQuickAdd.vue';

const layout = useAppSettingsStore();
const adding = ref(null);

function css(name, value) {
  if (typeof document !== 'undefined')
    document.documentElement.style.setProperty(name, String(value));
}

// ── Party cols ──────────────────────────────────────────────────────────────
const PARTY_KEY = 'eb_mobile_party_cols';
const mobilePartyCols = ref(parseInt(localStorage.getItem(PARTY_KEY) || '3', 10));
function setPartyCols(n) {
  mobilePartyCols.value = n;
  localStorage.setItem(PARTY_KEY, String(n));
  css('--mobile-party-cols', n);
}

// ── Faction cols ────────────────────────────────────────────────────────────
const FACTION_KEY = 'eb_mobile_faction_cols';
const mobileFactionCols = ref(parseInt(localStorage.getItem(FACTION_KEY) || '3', 10));
function setFactionCols(n) {
  mobileFactionCols.value = n;
  localStorage.setItem(FACTION_KEY, String(n));
  css('--mobile-faction-cols', n);
}

// ── Card gap ────────────────────────────────────────────────────────────────
const SPACING_KEY = 'eb_mobile_card_spacing';
const cardSpacing = ref(parseInt(localStorage.getItem(SPACING_KEY) || '6', 10));
function setSpacing(n) {
  cardSpacing.value = n;
  localStorage.setItem(SPACING_KEY, String(n));
  css('--mobile-card-spacing', n + 'px');
}

// ── Card ratio ──────────────────────────────────────────────────────────────
const RATIO_KEY = 'eb_mobile_card_ratio';
const cardRatio = ref(localStorage.getItem(RATIO_KEY) || '133%');
function setRatio(v) {
  cardRatio.value = v;
  localStorage.setItem(RATIO_KEY, v);
  css('--mobile-card-ratio', v);
}

// ── Background opacity ──────────────────────────────────────────────────────
const bgOpacityPct = computed({
  get: () => Math.round((layout.siteBackground?.opacity ?? 0.35) * 100),
  set: () => {}
});
function setOpacity(pct) { layout.setSiteBackground({ opacity: pct / 100 }); }

// ── Quick add ───────────────────────────────────────────────────────────────
function openAdd(kind) { adding.value = kind; }

// ── Apply stored values on mount + reset cardScale to 1 on mobile ───────────
onMounted(() => {
  css('--mobile-party-cols',   mobilePartyCols.value);
  css('--mobile-faction-cols', mobileFactionCols.value);
  css('--mobile-card-spacing', cardSpacing.value + 'px');
  css('--mobile-card-ratio',   cardRatio.value);

  // Reset cardScale to 1 so all mobile cards have the same base size.
  // The CSS column-count formula determines actual width; cardScale only
  // matters on desktop where the JS-computed --desktop-w is used.
  if (layout.cardScale !== 1) {
    layout.setCardScale(1);
  }
});
</script>

<style scoped>
.dm-mobile { color: var(--text); }
.sep { height: 1px; background: var(--border); margin: 12px 0; }
</style>
