<template>
  <transition name="slide-down">
    <div v-if="visible" class="dm-highlight-banner">
      <span class="banner-spark">✦</span>
      <span class="banner-text" v-if="viewer.isDM.value">
        You have highlighted <strong>{{ store.targetLabel }}</strong> for the players
      </span>
      <span class="banner-text" v-else>
        The DM is highlighting <strong>{{ store.targetLabel }}</strong>
      </span>
      <q-btn
        v-if="!viewer.isDM.value"
        flat dense no-caps
        label="View"
        class="banner-btn"
        @click="onView"
      />
      <q-btn
        flat round dense
        icon="close"
        class="banner-close"
        :title="'Dismiss'"
        @click="onDismiss"
      />
    </div>
  </transition>
</template>

<script setup>
import { computed, ref, watch, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useDmHighlightStore } from 'src/stores/dm-highlight';
import { useViewer } from 'src/composables/useViewer';
import { useEntityDetail } from 'src/composables/useEntityDetail';
import { useSessionDetail } from 'src/composables/useSessionDetail';
import * as sessionsApi from 'src/api/sessions';

const store    = useDmHighlightStore();
const viewer   = useViewer();
const detail   = useEntityDetail();
const sessions = useSessionDetail();
const router   = useRouter();
const route    = useRoute();

const dismissedKey = ref(null);
const timeoutFired = ref(null);
let timer = null;

const highlightKey = computed(() => store.createdAt || null);

const visible = computed(() => {
  if (!store.isActive) return false;
  if (dismissedKey.value === highlightKey.value) return false;
  if (timeoutFired.value === highlightKey.value) return false;
  return true;
});

watch(highlightKey, (k) => {
  if (timer) { clearTimeout(timer); timer = null; }
  if (!k) return;
  timer = setTimeout(() => { timeoutFired.value = k; timer = null; }, 30000);
}, { immediate: true });

onUnmounted(() => { if (timer) clearTimeout(timer); });

function onDismiss() {
  dismissedKey.value = highlightKey.value;
}

async function onView() {
  const k = highlightKey.value;

  if (store.kind === 'entity') {
    // Make sure the user is on the home page when the entity panel
    // opens so the context behind it makes sense. The DetailPanel is
    // global so it would technically open from /notes too, but the
    // brief flicker of routing keeps the UX consistent.
    if (route.name !== 'home') {
      await router.push({ name: 'home' });
    }
    detail.open(store.targetId);
  } else if (store.kind === 'session') {
    // Session panel is now globally mounted in MainLayout so we don't
    // *need* to be on /notes, but it makes the player's surrounding
    // context match the content.
    if (route.name !== 'notes') {
      await router.push({ name: 'notes' });
    }
    const all = await sessionsApi.fetchAll();
    const s = all.find(x => x.id === store.targetId);
    if (s) sessions.open(s);
  }

  dismissedKey.value = k;
}
</script>

<style scoped>
.dm-highlight-banner {
  position: fixed;
  top: 96px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2000;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 16px 10px 18px;
  background: var(--bg-panel);
  border: 1px solid var(--gold-dim);
  border-radius: 6px;
  box-shadow:
    0 10px 32px rgba(0,0,0,0.5),
    0 0 18px rgba(201,169,97,0.35);
  max-width: min(560px, 92vw);
}
.banner-spark {
  font-size: 18px;
  color: var(--gold-bright);
  text-shadow: 0 0 12px rgba(201,169,97,0.7);
  line-height: 1;
}
.banner-text {
  color: var(--text);
  font-size: 14px;
  line-height: 1.3;
}
.banner-text strong {
  color: var(--gold-bright);
  font-weight: 600;
  margin-left: 2px;
}
.banner-btn {
  color: var(--gold);
  border: 1px solid var(--gold-dim);
  padding: 2px 12px;
  border-radius: 3px;
  font-size: 12px;
  letter-spacing: 0.08em;
}
.banner-btn:hover {
  color: var(--bg);
  background: var(--gold);
}
.banner-close { color: var(--text-dim); }
.banner-close:hover { color: var(--gold); }

.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform 0.25s ease, opacity 0.25s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  transform: translate(-50%, -120%);
  opacity: 0;
}
</style>
