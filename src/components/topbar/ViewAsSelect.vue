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
import { PLAYERS } from 'src/config/players';

const auth = useAuthStore();
const entities = useEntitiesStore();

const value = computed({
  get: () => auth.viewingAs || 'dm',
  set: (v) => {
    auth.setViewingAs(v);
    entities.load();
  }
});

// Drive options from the canonical PLAYERS table so View-As, role chip,
// group chips and glow all agree.
const options = PLAYERS.map(p => ({ label: p.characterName, value: p.bucket }));
</script>
