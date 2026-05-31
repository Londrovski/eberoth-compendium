<template>
  <q-header bordered class="eb-topbar">
    <q-toolbar class="q-px-md">
      <div class="row items-center q-gutter-sm brand">
        <img class="logo" :src="LOGO" alt="Eberoth" />
        <div class="brand-text">
          <span class="eberoth">Eberoth</span>
          <span class="sub">The Compendium</span>
        </div>
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

const LOGO = 'https://raw.githubusercontent.com/Londrovski/eberoth/main/eberoth%20logo.png';

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
.brand { gap: 10px; }
.logo {
  width: 32px;
  height: 32px;
  object-fit: contain;
  filter: drop-shadow(0 0 10px rgba(201,169,97,0.45));
}
.brand-text { display: flex; flex-direction: column; line-height: 1; }
.eberoth {
  font-family: 'Cinzel Decorative', 'Cinzel', serif;
  font-weight: 700;
  font-size: 20px;
  color: var(--gold);
  letter-spacing: 0.04em;
  text-shadow:
    0 0 12px rgba(201,169,97,0.55),
    0 0 22px rgba(201,169,97,0.25);
}
.sub {
  color: var(--gold-dim);
  font-size: 0.6rem;
  margin-top: 2px;
}
.eb-tabs :deep(.q-tab) {
  color: var(--section-heading-color);
  font-size: var(--section-heading-size);
  letter-spacing: var(--section-heading-spacing);
  text-transform: uppercase;
}
.eb-tabs :deep(.q-tab--active) { color: var(--gold); }
.eb-tabs :deep(.q-tab__indicator) { background: var(--gold) !important; }

.role-chip {
  color: var(--gold-dim);
  border-color: var(--gold-dim);
  font-size: 0.65rem;
}
.lock-btn { color: var(--gold-dim); }
.lock-btn:hover { color: var(--gold); }
</style>
