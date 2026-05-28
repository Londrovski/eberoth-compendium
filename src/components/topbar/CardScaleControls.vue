<template>
  <div class="row items-center q-gutter-xs">
    <q-btn flat round dense icon="remove" size="sm" @click="dec" />
    <span class="text-caption text-grey-7" style="min-width: 30px; text-align: center;">{{ pct }}%</span>
    <q-btn flat round dense icon="add"    size="sm" @click="inc" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useLayoutStore } from 'src/stores/layout';

const layout = useLayoutStore();
const STEP = 0.05;
const MIN  = 0.6;
const MAX  = 1.6;

const pct = computed(() => Math.round(layout.cardScale * 100));

function clamp(v) { return Math.max(MIN, Math.min(MAX, Math.round(v * 100) / 100)); }
function inc() { layout.setCardScale(clamp(layout.cardScale + STEP)); }
function dec() { layout.setCardScale(clamp(layout.cardScale - STEP)); }
</script>
