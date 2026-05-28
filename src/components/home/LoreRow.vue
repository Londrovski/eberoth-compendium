<template>
  <section class="lore-section" v-if="lore.length">
    <div class="section-label">Lore</div>
    <div class="row-wrap">
      <LoreCard v-for="l in lore" :key="l.id" :entity="l" />
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { useEntitiesStore } from 'src/stores/entities';
import LoreCard from 'components/home/LoreCard.vue';

const entities = useEntitiesStore();

const lore = computed(() =>
  [...entities.lore].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
);
</script>

<style scoped>
.lore-section {
  padding: 18px 0 4px;
  border-top: 1px solid #d8cfb8;
  margin-top: 16px;
}
.section-label {
  font-size: 0.7rem;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: #8a7148;
  margin-bottom: 10px;
}
.row-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
