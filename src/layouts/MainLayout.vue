<template>
  <q-layout view="hHh lpR fFf" class="app-shell">
    <!-- Fixed full-viewport background. Sits below everything via z-index.
         Doesn't scroll, fills via cover (horizon) or % of smaller dim (logo). -->
    <div
      v-if="bg.mode !== 'none'"
      class="bg-layer"
      :class="'mode-' + bg.mode"
      :style="bgStyle"
      aria-hidden="true"
    ></div>

    <TopBar />
    <q-page-container class="page-container">
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
// Also paints the optional DM-controlled background layer behind
// everything. The pages set a transparent background (`q-page`
// override below) so the bg shows through; cards remain solid so
// they read as panels floating over the image.
import { computed, onMounted } from 'vue';
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

const HORIZON_URL = 'https://raw.githubusercontent.com/Londrovski/eberoth/main/The%20Descending%20Horizon.png';
const LOGO_URL    = 'https://raw.githubusercontent.com/Londrovski/eberoth/main/eberoth%20logo.png';

const bg = computed(() => appSettings.siteBackground);

const bgStyle = computed(() => {
  const opacity = Math.max(0, Math.min(1, bg.value.opacity ?? 0.35));
  if (bg.value.mode === 'horizon') {
    // `cover` scales the image so it fills the smaller dimension and
    // overflows the larger one, guaranteeing no black bars. Fixed
    // attachment keeps the bg locked while the page scrolls.
    return {
      backgroundImage: `url("${HORIZON_URL}")`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      opacity: String(opacity)
    };
  }
  if (bg.value.mode === 'logo') {
    // For the logo we use the smaller viewport dimension as the basis
    // and apply the size %. `contain`-equivalent behaviour by setting
    // both background-size and centering.
    const pct = Math.round((bg.value.size ?? 0.8) * 100);
    return {
      backgroundImage: `url("${LOGO_URL}")`,
      // Size based on the smaller dim: use min(Wvw, Hvh) via two
      // declarations — `min()` works in modern browsers.
      backgroundSize: `min(${pct}vw, ${pct}vh)`,
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      opacity: String(opacity)
    };
  }
  return {};
});

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
.app-shell {
  background: var(--bg);
  color: var(--text);
}

.bg-layer {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  /* Hard-coded against the page background so the opacity stays
     true even when the image has transparency. */
  background-color: var(--bg);
}
.bg-layer.mode-horizon,
.bg-layer.mode-logo {
  /* The inline style overrides image / size / position / opacity. */
}

/* Pages need to be transparent for the bg-layer to show through. */
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
