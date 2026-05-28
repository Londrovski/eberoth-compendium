<template>
  <div class="notepad-panel column">
    <div class="tab-row row items-center no-wrap">
      <q-tabs
        v-model="state.activeId"
        dense inline-label
        align="left"
        narrow-indicator
        indicator-color="primary"
        class="col text-grey-8"
      >
        <q-tab
          v-for="tab in state.tabs"
          :key="tab.id"
          :name="tab.id"
          no-caps
        >
          <span class="tab-label" @dblclick.stop="onRename(tab)">{{ tab.label }}</span>
        </q-tab>
      </q-tabs>
      <q-btn flat dense size="sm" icon="add" :title="'New tab'" @click="onAdd" />
      <q-btn
        v-if="activeTab && state.tabs.length > 1"
        flat dense size="sm" icon="delete_outline"
        :title="'Delete this tab'"
        @click="onDelete(activeTab)"
      />
    </div>

    <q-tab-panels
      v-model="state.activeId"
      keep-alive
      class="col tab-panels"
    >
      <q-tab-panel
        v-for="tab in state.tabs"
        :key="tab.id"
        :name="tab.id"
        class="q-pa-none notepad-pane"
      >
        <q-input
          v-model="tab.html"
          type="textarea"
          filled
          placeholder="Write whatever you like…"
          input-class="notepad-textarea"
          :disable="!authed"
          @blur="flush"
          @update:model-value="onChange"
        />
      </q-tab-panel>
    </q-tab-panels>

    <div class="status q-px-sm q-py-xs row items-center" :class="{ saving }">
      <span v-if="!authed" class="text-caption">Sign in to take notes.</span>
      <span v-else-if="saving">Saving…</span>
      <span v-else-if="lastSavedAt">Saved · {{ relativeSaved }}</span>
      <span v-else>&nbsp;</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch, onMounted } from 'vue';
import { useAuthStore } from 'src/stores/auth';
import { fetchNotepad, saveNotepad, newTab } from 'src/api/notepad';

const auth = useAuthStore();
const authed = computed(() => !!auth.user);

const state = reactive({ tabs: [], activeId: null });
const saving = ref(false);
const lastSavedAt = ref(null);
let saveTimer = null;

const activeTab = computed(() => state.tabs.find(t => t.id === state.activeId) || null);

async function flush() {
  if (!authed.value) return;
  if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
  saving.value = true;
  await saveNotepad({ tabs: state.tabs, activeId: state.activeId });
  saving.value = false;
  lastSavedAt.value = new Date();
}

function onChange() {
  if (!authed.value) return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(flush, 1200);
}

watch(() => state.activeId, () => { flush(); });

function onAdd() {
  const t = newTab('New tab');
  state.tabs.push(t);
  state.activeId = t.id;
  flush();
}

function onRename(tab) {
  const next = window.prompt('Tab name', tab.label);
  if (next && next.trim()) {
    tab.label = next.trim();
    flush();
  }
}

function onDelete(tab) {
  if (!window.confirm('Delete "' + tab.label + '"?')) return;
  const idx = state.tabs.findIndex(t => t.id === tab.id);
  state.tabs = state.tabs.filter(t => t.id !== tab.id);
  if (!state.tabs.length) {
    state.tabs.push(newTab('Notes'));
  }
  const fallback = state.tabs[Math.max(0, idx - 1)] || state.tabs[0];
  state.activeId = fallback.id;
  flush();
}

const relativeSaved = computed(() => {
  if (!lastSavedAt.value) return '';
  const sec = Math.round((Date.now() - lastSavedAt.value.getTime()) / 1000);
  if (sec < 5) return 'just now';
  if (sec < 60) return sec + 's ago';
  const min = Math.round(sec / 60);
  if (min < 60) return min + 'm ago';
  return 'a while ago';
});

onMounted(async () => {
  if (!authed.value) return;
  const loaded = await fetchNotepad();
  state.tabs = loaded.tabs;
  state.activeId = loaded.activeId;
});
</script>

<style scoped>
.notepad-panel {
  height: 100%;
  background: #fdfaf2;
}
.tab-row {
  border-bottom: 1px solid #e7dcc4;
  background: #f3ead6;
  min-height: 32px;
}
.tab-label { font-size: 0.85rem; }
.tab-panels { background: #fdfaf2; }
.notepad-pane { height: 100%; }
:deep(.notepad-textarea) {
  font-family: 'Cinzel', serif;
  font-size: 0.95rem;
  line-height: 1.45;
  min-height: 200px;
}
.status {
  font-size: 0.7rem;
  color: #8a7148;
  min-height: 1.4em;
  border-top: 1px solid #efe6cf;
}
.status.saving { color: #c08a2b; }
</style>
