<template>
  <q-header bordered class="eb-topbar" :class="{ 'is-mobile': viewport.isMobile }">
    <q-toolbar class="q-px-md eb-toolbar">
      <div class="row items-center brand">
        <span class="eberoth">Eberoth</span>
      </div>

      <q-space />

      <q-tabs
        dense no-caps inline-label align="center"
        class="eb-tabs"
        :indicator-color="'gold'"
      >
        <q-route-tab :to="{ name: 'home' }"  :label="viewport.isMobile ? '' : 'Home'"  :icon="viewport.isMobile ? 'home' : undefined" />
        <q-route-tab :to="{ name: 'notes' }" :label="viewport.isMobile ? '' : 'Notes'" :icon="viewport.isMobile ? 'edit_note' : undefined" />
        <q-route-tab
          v-if="viewer.isDM"
          :to="{ name: 'admin-usage' }"
          :label="viewport.isMobile ? '' : 'Admin'"
          :icon="viewport.isMobile ? 'shield' : undefined"
        />
      </q-tabs>

      <q-space />

      <div class="row items-center q-gutter-sm tb-right">
        <!-- Desktop: full button strip. Mobile: tucks into an overflow menu. -->
        <template v-if="!viewport.isMobile">
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
            <RealtimeDot />
            <DmToolsMenu />
            <ViewAsSelect />
          </template>
          <UserZoomControl />
          <q-chip dense outline class="role-chip">{{ roleLabel }}</q-chip>
          <q-btn
            flat dense no-caps
            icon="logout"
            label="Log out"
            class="logout-btn"
            :title="'Sign out'"
            :disable="signingOut"
            @click="onSignOut"
          />
        </template>

        <template v-else>
          <!-- Mobile: the only persistent control is the overflow menu.
               DM Tools menu is shown directly so the DM can still adjust live. -->
          <DmToolsMenu v-if="viewer.isDM" mobile />
          <q-btn flat dense round icon="more_vert" class="more-btn" :title="'Menu'">
            <q-menu auto-close>
              <q-list dense style="min-width: 180px">
                <q-item v-if="zoomUrl" clickable :href="zoomUrl" target="_blank" rel="noopener">
                  <q-item-section avatar><q-icon name="videocam" color="blue-2" /></q-item-section>
                  <q-item-section>Zoom call</q-item-section>
                </q-item>
                <q-item v-if="dndbeyondUrl" clickable :href="dndbeyondUrl" target="_blank" rel="noopener">
                  <q-item-section avatar><q-icon name="casino" color="red-3" /></q-item-section>
                  <q-item-section>D&D Beyond</q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable>
                  <q-item-section avatar><q-icon name="zoom_in" /></q-item-section>
                  <q-item-section>
                    <UserZoomControl />
                  </q-item-section>
                </q-item>
                <q-item v-if="viewer.isDM">
                  <q-item-section avatar><q-icon name="visibility" /></q-item-section>
                  <q-item-section>
                    <ViewAsSelect />
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section avatar><q-icon name="account_circle" /></q-item-section>
                  <q-item-section>{{ roleLabel }}</q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable :disable="signingOut" @click="onSignOut">
                  <q-item-section avatar><q-icon name="logout" /></q-item-section>
                  <q-item-section>Log out</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </template>
      </div>
    </q-toolbar>
  </q-header>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth';
import { useViewer } from 'src/composables/useViewer';
import { useAppSettingsStore } from 'src/stores/app-settings';
import { useViewport } from 'src/composables/useViewport';
import { characterFromBucket } from 'src/config/players';
import ViewAsSelect from 'components/topbar/ViewAsSelect.vue';
import DmToolsMenu from 'components/topbar/DmToolsMenu.vue';
import UserZoomControl from 'components/topbar/UserZoomControl.vue';
import RealtimeDot from 'components/topbar/RealtimeDot.vue';

const router = useRouter();
const auth = useAuthStore();
const viewer = useViewer();
const appSettings = useAppSettingsStore();
const viewport = useViewport();
const signingOut = ref(false);

const roleLabel = computed(() => {
  if (!auth.actualBucket) return '-';
  if (auth.isViewingAs) {
    return 'DM > ' + (characterFromBucket(auth.viewingAs) || auth.viewingAs);
  }
  return characterFromBucket(auth.actualBucket) || auth.actualBucket;
});

const zoomUrl = computed(() => appSettings.externalZoomUrl || '');

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
  if (signingOut.value) return;
  signingOut.value = true;
  auth.viewingAs = null;
  auth.actualBucket = null;
  auth.user = null;
  router.replace({ name: 'landing' });
  auth.signOut().catch(() => {});
}
</script>

<style scoped>
.eb-topbar {
  background: var(--bg-panel);
  color: var(--text);
  border-bottom: 1px solid var(--border);
}
.eb-toolbar { min-height: 64px; }
.eb-topbar.is-mobile .eb-toolbar {
  min-height: var(--topbar-h-mobile);
  padding: 0 8px;
}

.brand { gap: 16px; }
.eberoth {
  font-family: 'Cinzel Decorative', 'Cinzel', serif;
  font-weight: 700;
  font-size: 34px;
  color: var(--gold);
  letter-spacing: 0.05em;
  line-height: 1;
  text-shadow:
    0 0 14px rgba(201,169,97,0.55),
    0 0 26px rgba(201,169,97,0.25);
}
.eb-topbar.is-mobile .eberoth {
  font-size: var(--wordmark-size-mobile);
  text-shadow:
    0 0 8px rgba(201,169,97,0.45),
    0 0 14px rgba(201,169,97,0.20);
}

.eb-tabs :deep(.q-tab) {
  color: var(--section-heading-color);
  font-size: var(--section-heading-size);
  letter-spacing: var(--section-heading-spacing);
  text-transform: uppercase;
}
.eb-topbar.is-mobile .eb-tabs :deep(.q-tab) {
  min-height: 32px;
  padding: 0 6px;
}
.eb-tabs :deep(.q-tab--active) { color: var(--gold); }
.eb-tabs :deep(.q-tab__indicator) { background: var(--gold) !important; }

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
.zoom-btn:hover { background: #2a4f8e; border-color: #4d76c1; color: #fff; }
.dnd-btn {
  color: #ffd6d0;
  background: #6b2222;
  border-color: #a33a3a;
}
.dnd-btn:hover { background: #8a2a2a; border-color: #c34d4d; color: #fff; }

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

.more-btn {
  color: var(--gold-dim);
}
.more-btn:hover { color: var(--gold); }
</style>
