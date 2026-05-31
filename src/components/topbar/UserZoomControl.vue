<template>
  <div class="zoom-row" :title="title">
    <q-btn flat dense round icon="zoom_out" size="sm" class="step-btn" @click="dec" />
    <span class="pct">{{ pct }}%</span>
    <q-btn flat dense round icon="zoom_in" size="sm" class="step-btn" @click="inc" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useUserPrefsStore } from 'src/stores/user-prefs';
import { useViewport } from 'src/composables/useViewport';

const prefs = useUserPrefsStore();
const viewport = useViewport();
const STEP = 0.05;

// Mobile and desktop zoom are independent prefs so a player can tune
// each to their device without affecting the other.
const range = computed(() => viewport.isMobile
  ? { min: 0.7, max: 1.5 }
  : { min: 0.6, max: 1.6 });

const current = computed(() => viewport.isMobile
  ? (prefs.userZoomMobile || 1)
  : (prefs.userZoom || 1));

const pct = computed(() => Math.round(current.value * 100));
const title = computed(() => viewport.isMobile
  ? 'Mobile zoom (saved to your account)'
  : 'Page zoom (saved to your account)');

function clamp(v) {
  const { min, max } = range.value;
  return Math.max(min, Math.min(max, Math.round(v * 100) / 100));
}
function dec() {
  const next = clamp(current.value - STEP);
  if (viewport.isMobile) prefs.setUserZoomMobile(next);
  else prefs.setUserZoom(next);
}
function inc() {
  const next = clamp(current.value + STEP);
  if (viewport.isMobile) prefs.setUserZoomMobile(next);
  else prefs.setUserZoom(next);
}
</script>

<style scoped>
.zoom-row {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--gold-dim);
}
.step-btn { color: var(--gold-dim); }
.step-btn:hover { color: var(--gold); }
.pct {
  font-size: 0.8rem;
  color: var(--gold);
  min-width: 42px;
  text-align: center;
}
</style>
