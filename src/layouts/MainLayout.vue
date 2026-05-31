<template>
  <q-layout view="hHh lpR fFf" class="app-shell">
    <TopBar />
    <q-page-container>
      <router-view />
    </q-page-container>
    <DetailPanel />
    <DmHighlightBanner />
  </q-layout>
</template>

<script setup>
// Main layout. Topbar + a router-view + the global DetailPanel
// mounted once so any component can call useEntityDetail.open(id).
// Also mounts DmHighlightBanner for players (it self-hides for DM).
import { onMounted } from 'vue';
import TopBar from 'components/topbar/TopBar.vue';
import DetailPanel from 'components/detail/DetailPanel.vue';
import DmHighlightBanner from 'components/banner/DmHighlightBanner.vue';
import { useDmHighlightStore } from 'src/stores/dm-highlight';

const dmHighlight = useDmHighlightStore();

onMounted(async () => {
  await dmHighlight.load();
  dmHighlight.subscribeRealtime();
});
</script>

<style scoped>
.app-shell { background: var(--bg); color: var(--text); }
</style>
