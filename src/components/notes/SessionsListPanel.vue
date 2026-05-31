<template>
  <div class="sessions-list">
    <q-banner v-if="error" class="bg-negative text-white q-mb-md">
      Failed to load sessions: {{ error.message }}
    </q-banner>

    <div v-if="loading" class="text-center q-pa-xl">
      <q-spinner size="32px" color="warning" />
    </div>

    <div v-else-if="sessions.length" class="session-rows">
      <button
        v-for="s in sessions"
        :key="s.id"
        class="session-row"
        @click="open(s)"
      >
        <span class="session-row-number">{{ s.number }}</span>
        <span class="session-row-body">
          <span class="session-row-title">{{ s.title || ('Session ' + s.number) }}</span>
          <span v-if="s.row_summary" class="session-row-sub">{{ s.row_summary }}</span>
        </span>
        <span class="session-row-arrow">&gt;</span>
      </button>
    </div>

    <div v-else class="sessions-empty">No sessions yet.</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as sessionsApi from 'src/api/sessions';
import { useSessionDetail } from 'src/composables/useSessionDetail';

const sessions = ref([]);
const loading  = ref(true);
const error    = ref(null);

const sessionDetail = useSessionDetail();

function open(s) {
  sessionDetail.open(s);
}

onMounted(async () => {
  try {
    sessions.value = await sessionsApi.fetchAll();
  } catch (e) {
    error.value = e;
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.sessions-list { display: flex; flex-direction: column; gap: 0; }

.session-rows { display: flex; flex-direction: column; gap: 6px; }
.session-row {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--bg-panel-2);
  border: 1px solid var(--border);
  border-left: 2px solid var(--gold-dim);
  border-radius: 3px;
  padding: 10px 12px;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  color: var(--text);
  width: 100%;
  transition: border-color 0.15s ease, transform 0.12s ease;
}
.session-row:hover {
  border-color: var(--gold-dim);
  transform: translateX(2px);
}
.session-row-number {
  font-size: 20px;
  color: var(--gold);
  min-width: 28px;
  text-align: center;
  line-height: 1;
}
.session-row-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.session-row-title { font-size: 14px; color: var(--text); }
.session-row-sub {
  font-size: 11px;
  color: var(--text-dim);
  font-style: italic;
  line-height: 1.35;
}
.session-row-arrow { color: var(--gold-dim); font-size: 14px; line-height: 1; }

.sessions-empty {
  text-align: center;
  font-style: italic;
  color: var(--text-dim);
  padding: 24px 0;
  font-size: 13px;
}
</style>
