<template>
  <router-view />
</template>

<script setup>
// Root component. Layouts handle the chrome, pages handle content.
// We hook in just enough here to keep the DM-tunable typography
// CSS vars on :root in sync with the Pinia store.
import { onMounted, watch } from 'vue';
import { useAppSettingsStore } from 'src/stores/app-settings';

const layout = useAppSettingsStore();

onMounted(() => {
  // Settings are usually loaded inside auth bootstrapping, but apply
  // whatever the store currently has so :root vars are set before
  // any component reads them.
  layout.applyCssVars();
});

watch(
  () => layout.typography,
  () => layout.applyCssVars(),
  { deep: true }
);
</script>
