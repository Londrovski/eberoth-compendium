<template>
  <q-layout view="hHh lpR fFf" class="app-shell">
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
import { computed, onMounted, watch, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import TopBar from 'components/topbar/TopBar.vue';
import DetailPanel from 'components/detail/DetailPanel.vue';
import SessionDetailPanel from 'components/notes/SessionDetailPanel.vue';
import DmHighlightBanner from 'components/banner/DmHighlightBanner.vue';
import { useDmHighlightStore } from 'src/stores/dm-highlight';
import { useEntitiesStore } from 'src/stores/entities';
import { useAppSettingsStore } from 'src/stores/app-settings';
import { useAuthStore } from 'src/stores/auth';
import { useUserPrefsStore } from 'src/stores/user-prefs';
import { useViewport } from 'src/composables/useViewport';
import { track } from 'src/composables/useUsageTracker';

const dmHighlight = useDmHighlightStore();
const entities    = useEntitiesStore();
const appSettings = useAppSettingsStore();
const auth        = useAuthStore();
const userPrefs   = useUserPrefsStore();
const viewport    = useViewport();
const route       = useRoute();

const TOPBAR_H_DESKTOP = 64;
const TOPBAR_H_MOBILE_DEFAULT = 44;

const HORIZON_URL = 'https://raw.githubusercontent.com/Londrovski/eberoth/main/The%20Descending%20Horizon.png';
const LOGO_URL    = 'https://raw.githubusercontent.com/Londrovski/eberoth/main/eberoth%20logo.png';

const bg = computed(() => appSettings.siteBackground);

const topbarH = computed(() => {
  return viewport.isMobile
    ? (appSettings.mobile?.topbarHeight ?? TOPBAR_H_MOBILE_DEFAULT)
    : TOPBAR_H_DESKTOP;
});

const bgImageStyle = computed(() => {
  const opacity = Math.max(0, Math.min(1, bg.value.opacity ?? 0.35));
  const yOffset = `calc(50% + ${topbarH.value / 2}px)`;
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
    return {
      backgroundImage: `url("${LOGO_URL}")`,
      backgroundSize: `min(${pct}vw, calc(${pct}vh - ${(topbarH.value * pct) / 100}px))`,
      backgroundPosition: `center ${yOffset}`,
      backgroundRepeat: 'no-repeat',
      opacity: String(opacity)
    };
  }
  return {};
});

const zoomStyle = computed(() => {
  const z = viewport.isMobile
    ? (userPrefs.userZoomMobile || 1)
    : (userPrefs.userZoom || 1);
  return { zoom: String(z) };
});

// Toggle html.is-mobile so the scoped SCSS rules in app.scss activate.
watchEffect(() => {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('is-mobile', viewport.isMobile);
});

watch(() => auth.user?.email, () => { userPrefs.load(); });

watch(() => route.name, (name) => {
  if (!name) return;
  track('page_view', name, { path: route.path });
}, { immediate: true });

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
