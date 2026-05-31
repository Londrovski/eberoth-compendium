<template>
  <q-header bordered class="eb-topbar">
    <q-toolbar class="q-px-md eb-toolbar">
      <div class="row items-center brand">
        <span class="eberoth">Eberoth</span>
      </div>

      <q-space />

      <!-- Desktop nav tabs -->
      <q-tabs dense no-caps inline-label align="center" class="eb-tabs gt-xs">
        <q-route-tab :to="{ name: 'home' }"  label="Home" />
        <q-route-tab :to="{ name: 'notes' }" label="Notes" />
        <q-route-tab v-if="viewer.isDM" :to="{ name: 'admin-usage' }" label="Admin" />
      </q-tabs>

      <q-space />

      <!-- Desktop right-hand controls -->
      <div class="row items-center q-gutter-sm gt-xs">
        <q-btn
          v-if="zoomUrl"
          flat dense no-caps
          icon="videocam"
          label="Zoom"
          class="ext-btn zoom-btn"
          :href="zoomUrl" target="_blank" rel="noopener"
        />
        <q-btn
          v-if="dndbeyondUrl"
          flat dense no-caps
          icon="casino"
          label="D&D Beyond"
          class="ext-btn dnd-btn"
          :href="dndbeyondUrl" target="_blank" rel="noopener"
        />
        <template v-if="viewer.isDM">
          <RealtimeDot />
          <DmToolsMenu />
          <ViewAsSelect />
        </template>
        <UserZoomControl class="user-zoom-control" />
        <q-chip dense outline class="role-chip">{{ roleLabel }}</q-chip>
        <q-btn flat dense no-caps icon="logout" label="Log out"
          class="logout-btn" :disable="signingOut" @click="onSignOut" />
      </div>

      <!-- Mobile: DM gear + hamburger -->
      <div class="row items-center q-gutter-xs lt-sm">
        <template v-if="viewer.isDM">
          <RealtimeDot />
          <q-btn flat dense round icon="settings" class="mobile-dm-btn"
            aria-label="DM controls" @click="dmPanelOpen = true" />
        </template>
        <q-btn flat dense round icon="menu" class="mobile-menu-btn"
          aria-label="Open navigation" @click="drawerOpen = true" />
      </div>
    </q-toolbar>
  </q-header>

  <!-- Mobile nav drawer (right) -->
  <q-drawer v-model="drawerOpen" side="right" overlay behavior="mobile" class="eb-drawer">
    <div class="drawer-header q-pa-md row items-center">
      <q-btn flat dense round icon="close" @click="drawerOpen = false" style="color:var(--text-dim)" />
      <q-space />
      <span class="eberoth drawer-title">Eberoth</span>
    </div>
    <q-separator style="background:var(--border)" />

    <q-list>
      <q-item clickable v-ripple :to="{ name: 'home' }" exact class="drawer-item" @click="drawerOpen = false">
        <q-item-section avatar><q-icon name="home" /></q-item-section>
        <q-item-section>Home</q-item-section>
      </q-item>
      <q-item clickable v-ripple :to="{ name: 'notes' }" class="drawer-item" @click="drawerOpen = false">
        <q-item-section avatar><q-icon name="menu_book" /></q-item-section>
        <q-item-section>Notes</q-item-section>
      </q-item>
      <q-item v-if="viewer.isDM" clickable v-ripple :to="{ name: 'admin-usage' }" class="drawer-item" @click="drawerOpen = false">
        <q-item-section avatar><q-icon name="admin_panel_settings" /></q-item-section>
        <q-item-section>Admin</q-item-section>
      </q-item>
    </q-list>

    <!-- External links: left-aligned, hug their content -->
    <q-separator style="background:var(--border); margin: 8px 0" />
    <div class="q-pa-sm ext-links" v-if="zoomUrl || dndbeyondUrl">
      <a v-if="zoomUrl"       :href="zoomUrl"       target="_blank" rel="noopener" class="drawer-ext-btn zoom-btn"><q-icon name="videocam" size="15px" /><span>Zoom</span></a>
      <a v-if="dndbeyondUrl" :href="dndbeyondUrl" target="_blank" rel="noopener" class="drawer-ext-btn dnd-btn"><q-icon name="casino"   size="15px" /><span>D&amp;D Beyond</span></a>
    </div>

    <q-separator v-if="viewer.isDM" style="background:var(--border); margin: 8px 0" />
    <div v-if="viewer.isDM" class="q-pa-sm">
      <div class="drawer-section-label">View as</div>
      <ViewAsSelect />
    </div>

    <q-separator style="background:var(--border); margin: 8px 0" />
    <div class="q-pa-md row items-center justify-between">
      <q-chip dense outline class="role-chip">{{ roleLabel }}</q-chip>
      <q-btn flat dense no-caps icon="logout" label="Log out"
        class="logout-btn" :disable="signingOut" @click="onSignOut" />
    </div>
  </q-drawer>

  <!-- Mobile DM panel (right) -->
  <q-drawer v-if="viewer.isDM" v-model="dmPanelOpen" side="right" overlay behavior="mobile" class="eb-drawer eb-dm-panel">
    <div class="drawer-header q-pa-md row items-center">
      <q-btn flat dense round icon="close" @click="dmPanelOpen = false" style="color:var(--text-dim)" />
      <q-space />
      <span class="dm-panel-title">DM Controls</span>
    </div>
    <q-separator style="background:var(--border)" />
    <div class="q-pa-md">
      <DmToolsMobile />
    </div>
  </q-drawer>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth';
import { useViewer } from 'src/composables/useViewer';
import { useAppSettingsStore } from 'src/stores/app-settings';
import { characterFromBucket } from 'src/config/players';
import ViewAsSelect   from 'components/topbar/ViewAsSelect.vue';
import DmToolsMenu    from 'components/topbar/DmToolsMenu.vue';
import DmToolsMobile  from 'components/topbar/DmToolsMobile.vue';
import UserZoomControl from 'components/topbar/UserZoomControl.vue';
import RealtimeDot    from 'components/topbar/RealtimeDot.vue';

const router = useRouter();
const auth = useAuthStore();
const viewer = useViewer();
const appSettings = useAppSettingsStore();
const signingOut = ref(false);
const drawerOpen = ref(false);
const dmPanelOpen = ref(false);

const roleLabel = computed(() => {
  if (!auth.actualBucket) return '-';
  if (auth.isViewingAs) return 'DM > ' + (characterFromBucket(auth.viewingAs) || auth.viewingAs);
  return characterFromBucket(auth.actualBucket) || auth.actualBucket;
});
const zoomUrl      = computed(() => appSettings.externalZoomUrl || '');
const dndbeyondUrl = computed(() => appSettings.dndbeyondUrlFor(auth.isViewingAs ? auth.viewingAs : auth.actualBucket));

async function onSignOut() {
  if (signingOut.value) return;
  signingOut.value = true;
  auth.viewingAs = null; auth.actualBucket = null; auth.user = null;
  router.replace({ name: 'landing' });
  auth.signOut().catch(() => {});
}
</script>

<style scoped>
.eb-topbar  { background: var(--bg-panel); color: var(--text); border-bottom: 1px solid var(--border); }
.eb-toolbar { min-height: 64px; }
.brand { gap: 16px; }
.eberoth {
  font-family: 'Cinzel Decorative', 'Cinzel', serif;
  font-weight: 700; font-size: 34px;
  color: var(--gold); letter-spacing: 0.05em; line-height: 1;
  text-shadow: 0 0 14px rgba(201,169,97,0.55), 0 0 26px rgba(201,169,97,0.25);
}
.eb-tabs :deep(.q-tab)         { color: var(--section-heading-color); font-size: var(--section-heading-size); letter-spacing: var(--section-heading-spacing); text-transform: uppercase; }
.eb-tabs :deep(.q-tab--active) { color: var(--gold); }
.eb-tabs :deep(.q-tab__indicator) { background: var(--gold) !important; }

.ext-btn   { font-size: 13px; letter-spacing: 0.04em; padding: 6px 12px; border-radius: 4px; border: 1px solid transparent; }
.zoom-btn  { color: #cfe1ff; background: #1f3a6b; border-color: #3a5da3; }
.zoom-btn:hover  { background: #2a4f8e; border-color: #4d76c1; color: #fff; }
.dnd-btn   { color: #ffd6d0; background: #6b2222; border-color: #a33a3a; }
.dnd-btn:hover   { background: #8a2a2a; border-color: #c34d4d; color: #fff; }

.role-chip   { color: var(--gold-dim); border-color: var(--gold-dim); font-size: 0.85rem; padding: 2px 12px; }
.logout-btn  { color: var(--gold-dim); font-size: 0.85rem; letter-spacing: 0.04em; padding: 6px 10px; }
.logout-btn:hover { color: var(--gold); }

@media (max-width: 600px) {
  .eb-toolbar { min-height: 52px; padding: 0 10px; }
  .eberoth    { font-size: 22px; }
}
.mobile-menu-btn { color: var(--gold); }
.mobile-dm-btn   { color: var(--gold-dim); }
.mobile-dm-btn:hover { color: var(--gold); }

/* Drawers */
.eb-drawer {
  background: var(--bg-panel) !important;
  border-left: 1px solid var(--border) !important;
}
.drawer-header  { border-bottom: 1px solid var(--border); min-height: 52px; }
.drawer-title   { font-family: 'Cinzel Decorative', 'Cinzel', serif; font-weight: 700; font-size: 18px; color: var(--gold); letter-spacing: 0.05em; }
.drawer-item    { color: var(--text) !important; min-height: 48px; }
.drawer-item :deep(.q-icon) { color: var(--gold-dim); }
.drawer-item.q-router-link--active { color: var(--gold) !important; border-right: 3px solid var(--gold); }
.drawer-section-label { font-size: 10px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px; }

/* External link buttons in drawer: left-aligned, hug content */
.ext-links { display: flex; flex-direction: column; align-items: flex-start; gap: 6px; }
.drawer-ext-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 12px;
  border-radius: 4px;
  border: 1px solid transparent;
  font-size: 13px;
  letter-spacing: 0.04em;
  text-decoration: none;
  font-family: inherit;
  cursor: pointer;
  /* No width: 100% — let it hug its content */
}
.drawer-ext-btn.zoom-btn { color: #cfe1ff; background: #1f3a6b; border-color: #3a5da3; }
.drawer-ext-btn.dnd-btn  { color: #ffd6d0; background: #6b2222; border-color: #a33a3a; }

.eb-dm-panel { border-left: 1px solid var(--gold-dim) !important; }
.dm-panel-title { font-size: 13px; font-weight: 600; color: var(--gold); letter-spacing: 0.06em; text-transform: uppercase; }
</style>
