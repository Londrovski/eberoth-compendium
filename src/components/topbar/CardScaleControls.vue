<template>
  <div class="row items-center q-gutter-xs scale-row" :title="title">
    <span class="lbl" style="min-width: 46px;">{{ label }}</span>
    <q-btn flat round dense icon="remove" size="sm" class="step-btn" @click="dec" />
    <span class="pct" style="min-width: 38px; text-align: center;">{{ pct }}%</span>
    <q-btn flat round dense icon="add" size="sm" class="step-btn" @click="inc" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useLayoutStore } from 'src/stores/layout';

const props = defineProps({
  which: { type: String, default: 'card' }
});

const layout = useLayoutStore();
const STEP = 0.05;
const MIN  = 0.6;
const MAX  = 2.0;

const label = computed(() => props.which === 'faction' ? 'Faction' : 'Card');
const title = computed(() =>
  props.which === 'faction'
    ? 'Scale faction headers (DM-only)'
    : 'Scale all cards + text (DM-only)'
);

const value = computed(() =>
  props.which === 'faction' ? layout.factionScale : layout.cardScale
);
const pct = computed(() => Math.round(value.value * 100));

function clamp(v) { return Math.max(MIN, Math.min(MAX, Math.round(v * 100) / 100)); }
function inc() {
  const next = clamp(value.value + STEP);
  if (props.which === 'faction') layout.setFactionScale(next);
  else                            layout.setCardScale(next);
}
function dec() {
  const next = clamp(value.value - STEP);
  if (props.which === 'faction') layout.setFactionScale(next);
  else                            layout.setCardScale(next);
}
</script>

<style scoped>
.scale-row { color: var(--text); }
.lbl {
  font-family: 'Cinzel', serif;
  font-size: 11px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--text-dim);
}
.pct {
  font-family: 'Cinzel', serif;
  font-size: 12px;
  color: var(--gold);
}
.step-btn { color: var(--gold-dim); }
.step-btn:hover { color: var(--gold); }
</style>
