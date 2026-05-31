<template>
  <div class="zoom-row" :title="'Page zoom (saved to your account)'">
    <q-btn flat dense round icon="zoom_out" size="sm" class="step-btn" @click="dec" />
    <span class="pct">{{ pct }}%</span>
    <q-btn flat dense round icon="zoom_in" size="sm" class="step-btn" @click="inc" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useUserPrefsStore } from 'src/stores/user-prefs';

const prefs = useUserPrefsStore();
const STEP = 0.05;
const MIN = 0.6;
const MAX = 1.6;

const pct = computed(() => Math.round((prefs.userZoom || 1) * 100));

function clamp(v) { return Math.max(MIN, Math.min(MAX, Math.round(v * 100) / 100)); }
function dec() { prefs.setUserZoom(clamp((prefs.userZoom || 1) - STEP)); }
function inc() { prefs.setUserZoom(clamp((prefs.userZoom || 1) + STEP)); }
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
