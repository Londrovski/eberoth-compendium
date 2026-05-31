<template>
  <section class="lore-section" v-if="lore.length" :style="sectionStyle">
    <div class="section-label">Lore</div>
    <div class="row-wrap">
      <LoreCard
        v-for="(l, idx) in lore"
        :key="l.id"
        :entity="l"
        :reorderable="true"
        :is-first="idx === 0"
        :is-last="idx === lore.length - 1"
        @move-up="onMoveUp(idx)"
        @move-down="onMoveDown(idx)"
      />
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { useEntitiesStore } from 'src/stores/entities';
import { useAppSettingsStore } from 'src/stores/app-settings';
import { swapEntitySortOrder } from 'src/api/reorder';
import LoreCard from 'components/home/LoreCard.vue';

const entities = useEntitiesStore();
const layout   = useAppSettingsStore();

const lore = computed(() =>
  [...entities.lore].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
);

const sectionStyle = computed(() => ({
  '--scale': layout.cardScale
}));

async function onMoveUp(idx) {
  if (idx <= 0) return;
  await swapEntitySortOrder(lore.value[idx].id, lore.value[idx - 1].id);
}
async function onMoveDown(idx) {
  if (idx >= lore.value.length - 1) return;
  await swapEntitySortOrder(lore.value[idx].id, lore.value[idx + 1].id);
}
</script>

<style scoped>
.lore-section {
  padding: calc(20px * var(--scale, 1)) 0 calc(8px * var(--scale, 1));
  border-top: 1px solid var(--border);
  margin-top: calc(16px * var(--scale, 1));
}
.section-label {
  font-size: var(--section-heading-size);
  letter-spacing: var(--section-heading-spacing);
  text-transform: uppercase;
  color: var(--section-heading-color);
  margin-bottom: calc(14px * var(--scale, 1));
}
.row-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: calc(16px * var(--scale, 1));
  align-items: flex-start;
}
</style>
