<template>
  <q-header bordered class="eb-topbar">
    <q-toolbar class="q-px-md eb-toolbar">
      <div class="row items-center q-gutter-md brand">
        <img class="logo" :src="LOGO" alt="Eberoth" />
        <span class="eberoth">Eberoth</span>
      </div>

      <q-space />

      <q-tabs dense no-caps inline-label align="center" class="eb-tabs">
        <q-route-tab :to="{ name: 'home' }"  label="Home" />
        <q-route-tab :to="{ name: 'notes' }" label="Notes" />
      </q-tabs>

      <q-space />

      <div class="row items-center q-gutter-sm">
        <q-btn
          v-if="zoomUrl"
          flat dense no-caps
          icon="videocam"
          label="Zoom"
          class="ext-btn zoom-btn"
          :title="'Open the campaign Zoom call'"
          :href="zoomUrl"
          target="_blank"
          rel="noopener"
        />
        <q-btn
          v-if="dndbeyondUrl"
          flat dense no-caps
          icon="casino"
          label="D&D Beyond"
          class="ext-btn dnd-btn"
          :title="dndbeyondTitle"
          :href="dndbeyondUrl"
          target="_blank"
          rel="noopener"
        />
        <template v-if="viewer.isDM">
          <DmToolsMenu />
          <ViewAsSelect />
        </template>
        <q-chip dense outline class="role-chip">{{ roleLabel }}</q-chip>
        <q-btn
          flat dense no-caps
          icon="logout"
          label="Log out"
          class="logout-btn"
          :title="'Sign out'"
          @click="onSignOut"
        />
      </div>
    </q-toolbar>
  </q-header>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth';
import { useViewer } from 'src/composables/useViewer';
import { useAppSettingsStore } from 'src/stores/app-settings';
import { characterFromBucket } from 'src/config/players';
import ViewAsSelect from 'components/topbar/ViewAsSelect.vue';
import DmToolsMenu from 'components/topbar/DmToolsMenu.vue';

const LOGO = 'https://raw.githubusercontent.com/Londrovski/eberoth/main/eberoth%20logo.png';

const router = useRouter();
const auth = useAuthStore();
const viewer = useViewer();
const appSettings = useAppSettingsStore();

const roleLabel = computed(() => {
  if (!auth.actualBucket) return '-';
  if (auth.isViewingAs) {
    return 'DM > ' + (characterFromBucket(auth.viewingAs) || auth.viewingAs);
  }
  return characterFromBucket(auth.actualBucket) || auth.actualBucket;
});

const zoomUrl = computed(() => appSettings.externalZoomUrl || '');

// D&D Beyond URL follows the viewed-as bucket if the DM is previewing,
// otherwise the actual bucket. Falls back to the DM campaign URL.
const dndbeyondUrl = computed(() => {
  const bucket = auth.isViewingAs ? auth.viewingAs : auth.actualBucket;
  return appSettings.dndbeyondUrlFor(bucket);
});

const dndbeyondTitle = computed(() => {
  if (viewer.isDM && !auth.isViewingAs) return 'Open campaign on D&D Beyond';
  const name = characterFromBucket(auth.isViewingAs ? auth.viewingAs : auth.actualBucket);
  return name ? `Open ${name}'s D&D Beyond sheet` : 'Open D&D Beyond';
});

async function onSignOut() {
  await auth.signOut();
  router.push({ name: 'landing' });
}
</script>

<style scoped>
.eb-topbar {
  background: var(--bg-panel);
  color: var(--text);
  border-bottom: 1px solid var(--border);
}
.eb-toolbar {
  min-height: 84px;
}
.brand { gap: 16px; }
.logo {
  width: 64px;
  height: 64px;
  object-fit: contain;
  filter: drop-shadow(0 0 14px rgba(201,169,97,0.55));
}
.eberoth {
  font-family: 'Cinzel Decorative', 'Cinzel', serif;
  font-weight: 700;
  font-size: 44px;
  color: var(--gold);
  letter-spacing: 0.05em;
  line-height: 1;
  text-shadow:
    0 0 16px rgba(201,169,97,0.6),
    0 0 30px rgba(201,169,97,0.3);
}
.eb-tabs :deep(.q-tab) {
  color: var(--section-heading-color);
  font-size: var(--section-heading-size);
  letter-spacing: var(--section-heading-spacing);
  text-transform: uppercase;
}
.eb-tabs :deep(.q-tab--active) { color: var(--gold); }
.eb-tabs :deep(.q-tab__indicator) { background: var(--gold) !important; }

/* External nav buttons */
.ext-btn {
  font-size: 13px;
  letter-spacing: 0.04em;
  padding: 6px 12px;
  border-radius: 4px;
  border: 1px solid transparent;
}
.zoom-btn {
  color: #cfe1ff;
  background: #1f3a6b;
  border-color: #3a5da3;
}
.zoom-btn:hover {
  background: #2a4f8e;
  border-color: #4d76c1;
  color: #fff;
}
.dnd-btn {
  color: #ffd6d0;
  background: #6b2222;
  border-color: #a33a3a;
}
.dnd-btn:hover {
  background: #8a2a2a;
  border-color: #c34d4d;
  color: #fff;
}

.role-chip {
  color: var(--gold-dim);
  border-color: var(--gold-dim);
  font-size: 0.85rem;
  padding: 2px 12px;
}
.logout-btn {
  color: var(--gold-dim);
  font-size: 0.85rem;
  letter-spacing: 0.04em;
  padding: 6px 10px;
}
.logout-btn:hover { color: var(--gold); }
</style>
