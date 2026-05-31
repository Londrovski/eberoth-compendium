<template>
  <q-layout view="hHh lpR fFf" class="app-shell">
    <TopBar />
    <q-page-container>
      <router-view />
    </q-page-container>
    <DetailPanel />
    <SessionDetailPanel />
    <DmHighlightBanner />
  </q-layout>
</template>

<script setup>
// Main layout. Topbar + a router-view + global panels mounted once so
// any component (including the DM Highlight banner) can open them
// regardless of which page the user is currently on.
//
// We also bootstrap entities + app-settings stores here so a player
// who lands directly on /notes still has them loaded — the previous
// setup loaded them in HomePage onMounted, which meant entity
// highlights wouldn't render until they visited Home.
import { onMounted } from 'vue';
import TopBar from 'components/topbar/TopBar.vue';
import DetailPanel from 'components/detail/DetailPanel.vue';
import SessionDetailPanel from 'components/notes/SessionDetailPanel.vue';
import DmHighlightBanner from 'components/banner/DmHighlightBanner.vue';
import { useDmHighlightStore } from 'src/stores/dm-highlight';
import { useEntitiesStore } from 'src/stores/entities';
import { useAppSettingsStore } from 'src/stores/app-settings';

const dmHighlight = useDmHighlightStore();
const entities    = useEntitiesStore();
const appSettings = useAppSettingsStore();

onMounted(async () => {
  await Promise.all([
    entities.load(),
    appSettings.load(),
    dmHighlight.load()
  ]);
  entities.subscribeRealtime();
  appSettings.subscribeRealtime();
  dmHighlight.subscribeRealtime();
});
</script>

<style scoped>
.app-shell { background: var(--bg); color: var(--text); }
</style>
