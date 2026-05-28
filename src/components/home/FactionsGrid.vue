<template>
  <section class="factions-section">
    <div class="section-head">
      <div class="section-label">Factions</div>
      <q-btn
        v-if="viewer.isDM"
        flat dense no-caps
        icon="add"
        label="New faction"
        size="sm"
        class="text-grey-7"
        @click="onNewFaction"
      />
    </div>
    <div class="grid">
      <FactionColumn v-for="f in orderedFactions" :key="f.id" :faction="f" />
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { useEntitiesStore } from 'src/stores/entities';
import { useLayoutStore } from 'src/stores/layout';
import { useViewer } from 'src/composables/useViewer';
import { useQuasar } from 'quasar';
import FactionColumn from 'components/home/FactionColumn.vue';

const entities = useEntitiesStore();
const layout   = useLayoutStore();
const viewer   = useViewer();
const $q       = useQuasar();

const orderedFactions = computed(() => {
  const byId = Object.fromEntries(entities.factions.map(f => [f.id, f]));
  const ordered = [];
  layout.factionOrder.forEach(fid => {
    if (byId[fid]) {
      ordered.push(byId[fid]);
      delete byId[fid];
    }
  });
  const rest = Object.values(byId).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  return [...ordered, ...rest];
});

function onNewFaction() {
  $q.notify({ type: 'info', message: 'New-faction form ships in Q5.' });
}
</script>

<style scoped>
.factions-section {
  padding: 14px 0 4px;
}
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.section-label {
  font-size: 0.7rem;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: #8a7148;
}
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
@media (max-width: 900px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 600px) {
  .grid { grid-template-columns: 1fr; }
}
</style>
