<template>
  <q-page class="notes-page">
    <div class="notes-layout">
      <aside class="drawer" :style="{ width: drawerWidth + 'px' }">
        <section class="drawer-section threads">
          <ThreadsPanel />
        </section>
        <section class="drawer-section notes">
          <NotepadPanel />
        </section>
      </aside>

      <div
        class="resizer"
        :class="{ dragging }"
        @mousedown="onDragStart"
        @dblclick="resetWidth"
        :title="'Drag to resize · double-click to reset'"
      >
        <div class="resizer-grip" aria-hidden="true"></div>
      </div>

      <main class="main-pane">
        <div class="main-head">
          <span class="head-label">Sessions</span>
          <span class="head-sub">A record of what has passed.</span>
        </div>
        <div class="main-scroll">
          <SessionsListPanel />
        </div>
      </main>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import ThreadsPanel from 'components/notes/ThreadsPanel.vue';
import NotepadPanel from 'components/notes/NotepadPanel.vue';
import SessionsListPanel from 'components/notes/SessionsListPanel.vue';
import { useUserPrefsStore } from 'src/stores/user-prefs';

const DEFAULT_WIDTH = 340;
const MIN = 240;
const ABS_MAX = 1200;

const prefs = useUserPrefsStore();
const dragging = ref(false);

function dynamicMax() {
  if (typeof window === 'undefined') return ABS_MAX;
  return Math.min(ABS_MAX, Math.floor(window.innerWidth * 0.60));
}
function clamp(v) { return Math.max(MIN, Math.min(dynamicMax(), v)); }

const drawerWidth = computed(() => clamp(prefs.notesDrawerWidth || DEFAULT_WIDTH));

let startX = 0;
let startW = 0;

function onDragStart(e) {
  dragging.value = true;
  startX = e.clientX;
  startW = drawerWidth.value;
  document.body.style.cursor = 'col-resize';
  document.body.style.userSelect = 'none';
  window.addEventListener('mousemove', onDragMove);
  window.addEventListener('mouseup', onDragEnd);
}

function onDragMove(e) {
  const next = clamp(startW + (e.clientX - startX));
  prefs.setNotesDrawerWidth(next);
}

function onDragEnd() {
  dragging.value = false;
  document.body.style.cursor = '';
  document.body.style.userSelect = '';
  window.removeEventListener('mousemove', onDragMove);
  window.removeEventListener('mouseup', onDragEnd);
}

function resetWidth() {
  prefs.setNotesDrawerWidth(DEFAULT_WIDTH);
}

function onWindowResize() {
  const next = clamp(prefs.notesDrawerWidth || DEFAULT_WIDTH);
  if (next !== prefs.notesDrawerWidth) prefs.setNotesDrawerWidth(next);
}

onMounted(() => {
  prefs.load();
  window.addEventListener('resize', onWindowResize);
});
onBeforeUnmount(() => {
  window.removeEventListener('mousemove', onDragMove);
  window.removeEventListener('mouseup', onDragEnd);
  window.removeEventListener('resize', onWindowResize);
});

watch(() => prefs.notesDrawerWidth, () => onWindowResize());
</script>

<style scoped>
.notes-page {
  height: calc(100vh - 64px);
  padding: 0;
  background: transparent;
}
.notes-layout {
  display: flex;
  height: 100%;
  width: 100%;
}

.drawer {
  flex-shrink: 0;
  background: var(--bg-panel);
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.drawer-section {
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.drawer-section.threads { flex: 0 0 auto; max-height: 45%; }
.drawer-section.notes   { flex: 1 1 auto; border-top: 1px solid var(--border); min-height: 0; }

.resizer {
  flex: 0 0 6px;
  cursor: col-resize;
  background: transparent;
  border-left: 1px solid var(--border);
  position: relative;
  transition: background 0.15s ease, border-color 0.15s ease;
}
.resizer::before {
  content: '';
  position: absolute;
  inset: 0 -3px;
}
.resizer:hover,
.resizer.dragging {
  background: rgba(201, 169, 97, 0.10);
  border-left-color: var(--gold-dim);
}
.resizer-grip {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 2px;
  height: 32px;
  background: var(--border);
  border-radius: 1px;
  pointer-events: none;
  transition: background 0.15s ease;
}
.resizer:hover .resizer-grip,
.resizer.dragging .resizer-grip { background: var(--gold-dim); }

.main-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: var(--bg);
}
.main-head {
  padding: 14px 18px 10px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-panel);
  display: flex;
  align-items: baseline;
  gap: 14px;
}
.head-label {
  font-size: var(--section-heading-size);
  letter-spacing: var(--section-heading-spacing);
  text-transform: uppercase;
  color: var(--section-heading-color);
}
.head-sub {
  font-size: 12px;
  color: var(--text-dim);
  font-style: italic;
}
.main-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 12px 14px 24px;
}

@media (max-width: 700px) {
  .notes-layout { flex-direction: column; }
  .drawer { width: 100% !important; max-height: 50vh; }
  .drawer-section.threads { max-height: 35%; }
  .resizer { display: none; }
}
</style>
