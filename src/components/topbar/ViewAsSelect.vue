<template>
  <q-select
    v-model="value"
    :options="options"
    emit-value map-options
    dense outlined options-dense
    label="View as"
    class="view-as-select"
    popup-content-class="view-as-popup"
    style="min-width: 130px;"
  />
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from 'src/stores/auth';
import { useEntitiesStore } from 'src/stores/entities';
import { allPlayers } from 'src/config/players';

const auth = useAuthStore();
const entities = useEntitiesStore();

const value = computed({
  get: () => auth.viewingAs || 'dm',
  set: (v) => {
    auth.setViewingAs(v);
    entities.load();
  }
});

const options = computed(() =>
  allPlayers().map(p => ({ label: p.characterName, value: p.bucket }))
);
</script>

<style scoped>
.view-as-select {
  font-family: 'Cinzel', serif;
}
.view-as-select :deep(.q-field__control) {
  background: var(--bg-panel-2);
  color: var(--text);
  border-color: var(--gold-dim);
}
.view-as-select :deep(.q-field__label) {
  color: var(--gold-dim);
  font-size: 11px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
}
.view-as-select :deep(.q-field__native),
.view-as-select :deep(.q-field__input) { color: var(--gold); }
.view-as-select :deep(.q-icon) { color: var(--gold-dim); }
</style>
