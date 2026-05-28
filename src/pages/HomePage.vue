<template>
  <q-page padding>
    <q-banner v-if="entities.error" class="bg-negative text-white q-mb-md">
      Failed to load: {{ entities.error.message }}
    </q-banner>

    <div v-if="entities.loading" class="text-center q-pa-xl">
      <q-spinner size="40px" />
    </div>

    <template v-else>
      <div class="text-h6 q-mb-sm">Scaffold OK</div>
      <div class="text-body2 text-grey-7 q-mb-md">
        Phase Q2 complete. The home dashboard components ship in Q3.
      </div>
      <div class="text-caption text-grey-6">
        Entities loaded: {{ entities.all.length }} ·
        Factions: {{ entities.factions.length }} ·
        Players: {{ entities.players.length }} ·
        Memberships: {{ entities.memberships.length }} ·
        Personals: {{ entities.personals.length }}
      </div>
    </template>
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue';
import { useEntitiesStore } from 'src/stores/entities';
import { useLayoutStore } from 'src/stores/layout';

const entities = useEntitiesStore();
const layout = useLayoutStore();

onMounted(async () => {
  await Promise.all([entities.load(), layout.load()]);
});
</script>
