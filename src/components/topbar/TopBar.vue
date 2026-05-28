<template>
  <q-header bordered class="bg-white text-dark">
    <q-toolbar class="q-px-md">
      <div class="row items-center q-gutter-sm">
        <span class="text-h6 app-title">Eberoth</span>
        <span class="text-caption text-grey-7">The Compendium</span>
      </div>

      <q-space />

      <q-tabs dense no-caps inline-label align="center" class="text-grey-8">
        <q-route-tab :to="{ name: 'home' }"     label="Home" />
        <q-route-tab :to="{ name: 'sessions' }" label="Sessions" />
        <q-route-tab :to="{ name: 'notes' }"    label="Notes" />
        <q-route-tab :to="{ name: 'threads' }"  label="Threads" />
      </q-tabs>

      <q-space />

      <div class="row items-center q-gutter-sm">
        <template v-if="viewer.isDM">
          <DmToolsMenu />
          <ViewAsSelect />
        </template>
        <q-chip dense outline color="grey-7">{{ roleLabel }}</q-chip>
        <q-btn flat round dense icon="lock" :title="'Sign out'" @click="onSignOut" />
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
  if (!auth.actualBucket) return '—';
  if (auth.isViewingAs) {
    return 'DM → ' + (characterFromBucket(auth.viewingAs) || auth.viewingAs);
  }
  return characterFromBucket(auth.actualBucket) || auth.actualBucket;
});

async function onSignOut() {
  await auth.signOut();
  router.push({ name: 'landing' });
}
</script>
