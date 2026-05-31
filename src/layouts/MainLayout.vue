<template>
  <q-layout view="hHh lpR fFf" class="app-shell">
    <!-- Two-layer background:
         1. solid colour painted to the whole viewport (DM-configurable)
         2. optional image, centred in the area BELOW the topbar
         The image layer respects opacity, gets centred down by
         half the topbar height so its centre sits at the midpoint
         of the visible area below the toolbar. -->
    <div
      class="bg-color-layer"
      :style="{ background: bg.bgColor || '#000000' }"
      aria-hidden="true"
    ></div>
    <div
      v-if="bg.mode !== 'none'"
      class="bg-image-layer"
      :class="'mode-' + bg.mode"
      :style="bgImageStyle"
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

const TOPBAR_H = 64;  // px — keep in sync with .eb-toolbar min-height

const HORIZON_URL = 'https://raw.githubusercontent.com/Londrovski/eberoth/main/The%20Descending%20Horizon.png';
const LOGO_URL    = 'https://raw.githubusercontent.com/Londrovski/eberoth/main/eberoth%20logo.png';

const bg = computed(() => appSettings.siteBackground);

const bgImageStyle = computed(() => {
  const opacity = Math.max(0, Math.min(1, bg.value.opacity ?? 0.35));
  // Shift the image's vertical centre down by half the topbar so the
  // image is centred on the area BELOW the topbar instead of the
  // whole viewport.
  const yOffset = `calc(50% + ${TOPBAR_H / 2}px)`;
  if (bg.value.mode === 'horizon') {
    return {
      backgroundImage: `url("${HORIZON_URL}")`,
      backgroundSize: 'cover',
      backgroundPosition: `center ${yOffset}`,
      backgroundRepeat: 'no-repeat',
      opacity: String(opacity)
    };
  }
  if (bg.value.mode === 'logo') {
    const pct = Math.round((bg.value.size ?? 0.8) * 100);
    // For the logo we want the size based on the smaller VISIBLE
    // dimension below the topbar — width is unchanged, but height
    // available is `100vh - TOPBAR_H`.
    return {
      backgroundImage: `url("${LOGO_URL}")`,
      backgroundSize: `min(${pct}vw, calc(${pct}vh - ${(TOPBAR_H * pct) / 100}px))`,
      backgroundPosition: `center ${yOffset}`,
      backgroundRepeat: 'no-repeat',
      opacity: String(opacity)
    };
  }
  return {};
});

const zoomStyle = computed(() => ({ zoom: String(userPrefs.userZoom || 1) }));

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
  background: transparent;
  color: var(--text);
}

.bg-color-layer,
.bg-image-layer {
  position: fixed;
  inset: 0;
  pointer-events: none;
}
.bg-color-layer { z-index: 0; }
.bg-image-layer { z-index: 0; }

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
