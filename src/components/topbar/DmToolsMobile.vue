<!--
  DmToolsMobile — root panel, wires up all sub-controls.
  Sub-components live in ./dm-mobile/ — edit each one independently.

  Controls:
    • Party cards per row          (1/2/3)     → --mobile-party-cols
    • Faction cards per row        (1/2/3)     → --mobile-faction-cols
    • Faction header size          (40–150%)   → --mobile-faction-header-scale
    • Card gap                     (2–24 px)   → --mobile-card-spacing
    • Card image ratio             (4 presets) → --mobile-card-ratio
    • Personal cards               (Show/Hide)
    • Background opacity           (0–100 %)
    • Quick add                    (faction/NPC/lore)

  cardScale is reset to 1 on mount so all party-section cards have
  a uniform base size (the CSS column formula overrides JS sizing).
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

    <MobileFactionHeaderControl
      v-model="factionHeaderScale"
      @update:modelValue="setFactionHeaderScale"
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
import NewEntityDialog           from 'components/topbar/NewEntityDialog.vue';
import MobileColControl          from 'components/topbar/dm-mobile/MobileColControl.vue';
import MobileStepControl         from 'components/topbar/dm-mobile/MobileStepControl.vue';
import MobileToggleControl       from 'components/topbar/dm-mobile/MobileToggleControl.vue';
import MobileRatioControl        from 'components/topbar/dm-mobile/MobileRatioControl.vue';
import MobileQuickAdd            from 'components/topbar/dm-mobile/MobileQuickAdd.vue';
import MobileFactionHeaderControl from 'components/topbar/dm-mobile/MobileFactionHeaderControl.vue';

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

// ── Faction header scale ──────────────────────────────────────────────────────
const HEADER_SCALE_KEY = 'eb_mobile_faction_header_scale';
const factionHeaderScale = ref(
  parseFloat(localStorage.getItem(HEADER_SCALE_KEY) || '0.7')
);
function setFactionHeaderScale(v) {
  factionHeaderScale.value = v;
  localStorage.setItem(HEADER_SCALE_KEY, String(v));
  css('--mobile-faction-header-scale', v);
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

// ── Apply all stored values on mount ──────────────────────────────────────
onMounted(() => {
  css('--mobile-party-cols',          mobilePartyCols.value);
  css('--mobile-faction-cols',        mobileFactionCols.value);
  css('--mobile-faction-header-scale', factionHeaderScale.value);
  css('--mobile-card-spacing',        cardSpacing.value + 'px');
  css('--mobile-card-ratio',          cardRatio.value);

  // Normalise cardScale to 1: the CSS col-count formula drives mobile
  // card width, so JS-computed scaling would make cards unequal sizes.
  if (layout.cardScale !== 1) layout.setCardScale(1);
});
</script>

<style scoped>
.dm-mobile { color: var(--text); }
.sep { height: 1px; background: var(--border); margin: 12px 0; }
</style>
