<template>
  <q-header bordered class="eb-topbar">
    <q-toolbar class="q-px-md">
      <div class="row items-center q-gutter-sm brand">
        <span class="text-h6 app-title">Eberoth</span>
        <span class="text-caption sub">The Compendium</span>
      </div>

      <q-space />

      <q-tabs dense no-caps inline-label align="center" class="eb-tabs">
        <q-route-tab :to="{ name: 'home' }"  label="Home" />
        <q-route-tab :to="{ name: 'notes' }" label="Notes" />
      </q-tabs>

      <q-space />

      <div class="row items-center q-gutter-sm">
        <template v-if="viewer.isDM">
          <DmToolsMenu />
          <ViewAsSelect />
        </template>
        <q-chip dense outline class="role-chip">{{ roleLabel }}</q-chip>
        <q-btn flat round dense icon="lock" class="lock-btn" :title="'Sign out'" @click="onSignOut" />
      </div>
    </q-toolbar>
  </q-header>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth';
import { useViewer } from 'src/composables/useViewer';
import { characterFromBucket } from 'src/config/players';
import ViewAsSelect from 'components/topbar/ViewAsSelect.vue';
import DmToolsMenu from 'components/topbar/DmToolsMenu.vue';

const router = useRouter();
const auth = useAuthStore();
const viewer = useViewer();

const roleLabel = computed(() => {
  if (!auth.actualBucket) return '-';
  if (auth.isViewingAs) {
    return 'DM > ' + (characterFromBucket(auth.viewingAs) || auth.viewingAs);
  }
  return characterFromBucket(auth.actualBucket) || auth.actualBucket;
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
.brand .app-title {
  font-family: 'Cinzel Decorative', 'Cinzel', serif;
  color: var(--gold);
  letter-spacing: 0.08em;
}
.brand .sub {
  color: var(--gold-dim);
  letter-spacing: 0.3em;
  text-transform: uppercase;
  font-size: 0.65rem;
}
.eb-tabs :deep(.q-tab) {
  color: var(--text-dim);
  font-family: 'Cinzel', serif;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  font-size: 0.7rem;
}
.eb-tabs :deep(.q-tab--active) { color: var(--gold); }
.eb-tabs :deep(.q-tab__indicator) { background: var(--gold) !important; }

.role-chip {
  color: var(--gold-dim);
  border-color: var(--gold-dim);
  letter-spacing: 0.15em;
  text-transform: uppercase;
  font-size: 0.65rem;
}
.lock-btn { color: var(--gold-dim); }
.lock-btn:hover { color: var(--gold); }
</style>
