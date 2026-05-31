<template>
  <q-layout view="hHh lpR fFf" class="app-shell">
    <div
      v-if="bg.mode !== 'none'"
      class="bg-layer"
      :class="'mode-' + bg.mode"
      :style="bgStyle"
      aria-hidden="true"
    ></div>

    <TopBar />
    <q-page-container class="page-container" :style="zoomStyle">
      <router-view />
    </q-page-container>
    <DetailPanel />
    <SessionDetailPanel />
    <DmHighlightBanner />
  </q-layout>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue';
import TopBar from 'components/topbar/TopBar.vue';
import DetailPanel from 'components/detail/DetailPanel.vue';
import SessionDetailPanel from 'components/notes/SessionDetailPanel.vue';
import DmHighlightBanner from 'components/banner/DmHighlightBanner.vue';
import { useDmHighlightStore } from 'src/stores/dm-highlight';
import { useEntitiesStore } from 'src/stores/entities';
import { useAppSettingsStore } from 'src/stores/app-settings';
import { useAuthStore } from 'src/stores/auth';
import { useUserPrefsStore } from 'src/stores/user-prefs';

const dmHighlight = useDmHighlightStore();
const entities    = useEntitiesStore();
const appSettings = useAppSettingsStore();
const auth        = useAuthStore();
const userPrefs   = useUserPrefsStore();

const HORIZON_URL = 'https://raw.githubusercontent.com/Londrovski/eberoth/main/The%20Descending%20Horizon.png';
const LOGO_URL    = 'https://raw.githubusercontent.com/Londrovski/eberoth/main/eberoth%20logo.png';

const bg = computed(() => appSettings.siteBackground);

const bgStyle = computed(() => {
  const opacity = Math.max(0, Math.min(1, bg.value.opacity ?? 0.35));
  if (bg.value.mode === 'horizon') {
    return {
      backgroundImage: `url("${HORIZON_URL}")`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      opacity: String(opacity)
    };
  }
  if (bg.value.mode === 'logo') {
    const pct = Math.round((bg.value.size ?? 0.8) * 100);
    return {
      backgroundImage: `url("${LOGO_URL}")`,
      backgroundSize: `min(${pct}vw, ${pct}vh)`,
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      opacity: String(opacity)
    };
  }
  return {};
});

// Per-user zoom. Apply via the non-standard `zoom` CSS property —
// works in Chromium and Safari, the players' actual browsers. Falls
// back to no-op in Firefox without breaking layout.
const zoomStyle = computed(() => ({
  zoom: String(userPrefs.userZoom || 1)
}));

// Reload prefs whenever the auth user changes (sign in, sign out,
// view-as is irrelevant here because viewingAs doesn't change `user`).
watch(() => auth.user?.email, () => { userPrefs.load(); });

onMounted(async () => {
  await Promise.all([
    entities.load(),
    appSettings.load(),
    dmHighlight.load(),
    userPrefs.load()
  ]);
  entities.subscribeRealtime();
  appSettings.subscribeRealtime();
  dmHighlight.subscribeRealtime();
});
</script>

<style scoped>
.app-shell {
  background: var(--bg);
  color: var(--text);
}

.bg-layer {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-color: var(--bg);
}

.page-container {
  position: relative;
  z-index: 1;
}
:deep(.q-page) {
  background: transparent !important;
}
:deep(.q-page-container) {
  background: transparent;
}
</style>
