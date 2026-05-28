<template>
  <q-layout view="hHh lpR fFf">
    <TopBar />
    <q-page-container>
      <router-view />
    </q-page-container>
    <DetailPanel />
  </q-layout>
</template>

<script setup>
// Main layout. Topbar + a router-view + the global DetailPanel
// mounted once so any component can call useEntityDetail.open(id).
import TopBar from 'components/topbar/TopBar.vue';
import DetailPanel from 'components/detail/DetailPanel.vue';
</script>
