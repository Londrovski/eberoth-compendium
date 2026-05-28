<template>
  <div class="row items-center q-gutter-xs" :title="title">
    <span class="text-caption text-grey-7" style="min-width: 30px;">{{ label }}</span>
    <q-btn flat round dense icon="remove" size="sm" @click="dec" />
    <span class="text-caption text-grey-7" style="min-width: 38px; text-align: center;">{{ pct }}%</span>
    <q-btn flat round dense icon="add" size="sm" @click="inc" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useLayoutStore } from 'src/stores/layout';

const props = defineProps({
  which: { type: String, default: 'card' }   // 'card' | 'faction'
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
