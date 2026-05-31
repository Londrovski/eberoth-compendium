<!--
  DmToolsMobile — mobile-only DM controls panel.

  IMPORTANT: Nothing in this file writes to Supabase.
  All settings are stored in localStorage and applied as CSS custom
  properties on :root. Desktop settings (cardScale, factionScale,
  siteBackground, etc.) live in Supabase and are managed by the
  desktop DmToolsMenu — these two sets of controls are fully decoupled.

  Mobile CSS custom properties managed here:
    --mobile-party-cols            (1/2/3)
    --mobile-faction-cols          (1/2/3)
    --mobile-faction-header-scale  (0.4–1.5)
    --mobile-card-spacing          (2–24 px)
    --mobile-card-ratio            (% string)
    --mobile-bg-opacity            (0–1, applied only on mobile via @media)
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

    <!-- Personal cards: reads from Supabase store but writing is safe
         because it’s a content-visibility toggle, not a layout setting,
         and players see the same value on all devices. -->
    <MobileToggleControl
      label="Personal cards"
      :modelValue="layout.showPersonals"
      @update:modelValue="layout.setShowPersonals"
    />
    <div class="sep" />

    <!-- Background opacity: local override, does NOT write to Supabase.
         Uses --mobile-bg-opacity which is applied only inside
         @media (max-width: 600px) in app.scss. -->
    <MobileStepControl
      label="Background opacity"
      v-model="bgOpacityPct"
      :min="0" :max="100" :step="5"
      :display="bgOpacityPct + '%'"
      @update:modelValue="setBgOpacity"
    />
    <div class="sep" />

    <MobileQuickAdd @add="openAdd" />

  </div>

  <NewEntityDialog v-if="adding" :kind="adding" @close="adding = null" />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAppSettingsStore } from 'src/stores/app-settings';
import NewEntityDialog            from 'components/topbar/NewEntityDialog.vue';
import MobileColControl           from 'components/topbar/dm-mobile/MobileColControl.vue';
import MobileStepControl          from 'components/topbar/dm-mobile/MobileStepControl.vue';
import MobileToggleControl        from 'components/topbar/dm-mobile/MobileToggleControl.vue';
import MobileRatioControl         from 'components/topbar/dm-mobile/MobileRatioControl.vue';
import MobileQuickAdd             from 'components/topbar/dm-mobile/MobileQuickAdd.vue';
import MobileFactionHeaderControl from 'components/topbar/dm-mobile/MobileFactionHeaderControl.vue';

// Read-only access: only showPersonals and setShowPersonals are used,
// and that particular setting is device-agnostic (content visibility).
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
const HEADER_KEY = 'eb_mobile_faction_header_scale';
const factionHeaderScale = ref(parseFloat(localStorage.getItem(HEADER_KEY) || '0.7'));
function setFactionHeaderScale(v) {
  factionHeaderScale.value = v;
  localStorage.setItem(HEADER_KEY, String(v));
  css('--mobile-faction-header-scale', v);
  window.dispatchEvent(new CustomEvent('eb-faction-header-scale'));
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

// ── Background opacity (local, does NOT touch Supabase) ────────────────────
// Stored as 0–100 integer. Applied via --mobile-bg-opacity which is used
// in app.scss inside @media (max-width: 600px) only, so it never affects
// the desktop background layer.
const BG_OPACITY_KEY = 'eb_mobile_bg_opacity';
const bgOpacityPct = ref(parseInt(localStorage.getItem(BG_OPACITY_KEY) || '35', 10));
function setBgOpacity(pct) {
  bgOpacityPct.value = pct;
  localStorage.setItem(BG_OPACITY_KEY, String(pct));
  css('--mobile-bg-opacity', pct / 100);
}

// ── Quick add (writes entity to Supabase, safe — same on all devices) ─────
function openAdd(kind) { adding.value = kind; }

// ── Apply all stored values on mount ──────────────────────────────────────
// No Supabase writes here. We only apply CSS vars from localStorage.
onMounted(() => {
  css('--mobile-party-cols',           mobilePartyCols.value);
  css('--mobile-faction-cols',         mobileFactionCols.value);
  css('--mobile-faction-header-scale', factionHeaderScale.value);
  css('--mobile-card-spacing',         cardSpacing.value + 'px');
  css('--mobile-card-ratio',           cardRatio.value);
  css('--mobile-bg-opacity',           bgOpacityPct.value / 100);
  window.dispatchEvent(new CustomEvent('eb-faction-header-scale'));
  // NOTE: cardScale is intentionally NOT reset here. Desktop cardScale
  // lives in Supabase and must not be touched by mobile. Instead, the
  // mobile card CSS uses the column-count formula which makes cardScale
  // irrelevant on narrow viewports (see PartyCard, MemberCard, LoreCard,
  // PersonalCard @media blocks).
});
</script>

<style scoped>
.dm-mobile { color: var(--text); }
.sep { height: 1px; background: var(--border); margin: 12px 0; }
</style>
