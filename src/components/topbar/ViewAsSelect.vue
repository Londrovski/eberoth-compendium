<template>
  <q-select
    v-model="value"
    :options="options"
    emit-value map-options
    dense outlined options-dense
    label="View as"
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

// Options driven by the entities store via allPlayers(). Computed so
// it stays reactive — when a new PC is added to Supabase, the dropdown
// updates without a refresh.
const options = computed(() =>
  allPlayers().map(p => ({ label: p.characterName, value: p.bucket }))
);
</script>
