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

const auth = useAuthStore();
const entities = useEntitiesStore();

const value = computed({
  get: () => auth.viewingAs || 'dm',
  set: (v) => {
    auth.setViewingAs(v);
    entities.load();
  }
});

const options = [
  { label: 'DM',      value: 'dm' },
  { label: 'Kalvorn', value: 'baker' },
  { label: 'Azrael',  value: 'charlie' },
  { label: 'Dirk',    value: 'butcher' }
];
</script>
