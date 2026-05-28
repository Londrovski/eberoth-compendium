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
      <LoreRow />
    </template>
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue';
import { useEntitiesStore } from 'src/stores/entities';
import { useLayoutStore } from 'src/stores/layout';
import PartyAndPersonalRow from 'components/home/PartyAndPersonalRow.vue';
import FactionsGrid from 'components/home/FactionsGrid.vue';
import LoreRow from 'components/home/LoreRow.vue';

const entities = useEntitiesStore();
const layout = useLayoutStore();

onMounted(async () => {
  await Promise.all([entities.load(), layout.load()]);
});
</script>
