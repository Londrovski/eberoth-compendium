<template>
  <q-layout view="hHh lpR fFf">
    <TopBar />
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
// Main layout. Topbar + a router-view. No drawer — the dense home
// page is the whole experience; notes/threads/sessions are top-nav pages.
import TopBar from 'components/topbar/TopBar.vue';
</script>
