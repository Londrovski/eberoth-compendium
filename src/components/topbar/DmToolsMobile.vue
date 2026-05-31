<!--
  DmToolsMobile — root panel rendered inside the TopBar DM slide-out.
  Broken into small sub-components in ./dm-mobile/ so each control
  can be edited independently.

  Controls included:
    • Party cards per row      (1 / 2 / 3)
    • Faction cards per row    (1 / 2 / 3)
    • Card gap                 (step 2–24 px)
    • Card image ratio         (Square / 4:3 / Tall / Portrait)
    • Personal cards           (Show / Hide)
    • Background opacity       (step 0–100%)
    • Quick add                (faction / NPC / lore)

  All layout prefs are persisted to localStorage and applied immediately
  as CSS custom properties on :root so card components react without
  any rebuild or navigation.
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
import NewEntityDialog from 'components/topbar/NewEntityDialog.vue';
import MobileColControl    from 'components/topbar/dm-mobile/MobileColControl.vue';
import MobileStepControl   from 'components/topbar/dm-mobile/MobileStepControl.vue';
import MobileToggleControl from 'components/topbar/dm-mobile/MobileToggleControl.vue';
import MobileRatioControl  from 'components/topbar/dm-mobile/MobileRatioControl.vue';
import MobileQuickAdd      from 'components/topbar/dm-mobile/MobileQuickAdd.vue';

const layout = useAppSettingsStore();
const adding = ref(null);

// ── CSS custom property helper ─────────────────────────────────────────────
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
  set: () => {} // writes go through setOpacity
});
function setOpacity(pct) {
  layout.setSiteBackground({ opacity: pct / 100 });
}

// ── Quick add ───────────────────────────────────────────────────────────────
function openAdd(kind) { adding.value = kind; }

// ── Apply stored values on first mount ──────────────────────────────────────
onMounted(() => {
  css('--mobile-party-cols',   mobilePartyCols.value);
  css('--mobile-faction-cols', mobileFactionCols.value);
  css('--mobile-card-spacing', cardSpacing.value + 'px');
  css('--mobile-card-ratio',   cardRatio.value);
});
</script>

<style scoped>
.dm-mobile { color: var(--text); }
.sep { height: 1px; background: var(--border); margin: 12px 0; }
</style>
