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
import { onMounted } from 'vue';
import { useEntitiesStore } from 'src/stores/entities';
import { useAppSettingsStore } from 'src/stores/app-settings';
import PartyAndPersonalRow from 'components/home/PartyAndPersonalRow.vue';
import FactionsGrid from 'components/home/FactionsGrid.vue';

const entities = useEntitiesStore();
const appSettings = useAppSettingsStore();

onMounted(async () => {
  await Promise.all([entities.load(), appSettings.load()]);
  appSettings.subscribeRealtime();
  entities.subscribeRealtime();
});
</script>
