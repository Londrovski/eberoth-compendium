<template>
  <q-page padding>
    <q-banner v-if="entities.error" class="bg-negative text-white q-mb-md">
      Failed to load: {{ entities.error.message }}
    </q-banner>

    <div v-if="entities.loading" class="text-center q-pa-xl">
      <q-spinner size="40px" />
    </div>

    <template v-else>
      <PartyAndPersonalRow />
      <FactionsGrid />
    </template>
  </q-page>
</template>

<script setup>
// Bootstrap (entities + app-settings load + realtime) is done in
// MainLayout so it covers all routes. This page just renders.
import { useEntitiesStore } from 'src/stores/entities';
import PartyAndPersonalRow from 'components/home/PartyAndPersonalRow.vue';
import FactionsGrid from 'components/home/FactionsGrid.vue';

const entities = useEntitiesStore();
</script>
