<template>
  <div class="usage-overview">
    <div class="controls">
      <label class="ctrl">
        <span>Window</span>
        <select v-model.number="days" @change="refresh">
          <option :value="1">Last 24h</option>
          <option :value="7">Last 7 days</option>
          <option :value="14">Last 14 days</option>
          <option :value="30">Last 30 days</option>
        </select>
      </label>
      <button class="refresh-btn" :disabled="loading" @click="refresh">
        {{ loading ? 'Loading...' : 'Refresh' }}
      </button>
    </div>

    <div v-if="error" class="error">Failed to load: {{ error.message }}</div>

    <div v-else class="grid">
      <section class="card">
        <header>By event type</header>
        <table>
          <tr v-for="row in byType" :key="row.type">
            <td class="label">{{ formatType(row.type) }}</td>
            <td class="count">{{ row.count }}</td>
          </tr>
          <tr v-if="!byType.length"><td colspan="2" class="empty">No events yet.</td></tr>
        </table>
      </section>

      <section class="card">
        <header>Daily activity</header>
        <table>
          <tr class="hd">
            <th>Day</th><th class="num">Viewers</th><th class="num">Events</th>
          </tr>
          <tr v-for="d in daily" :key="d.date">
            <td class="label">{{ d.date }}</td>
            <td class="count">{{ d.viewerCount }}</td>
            <td class="count">{{ d.eventCount }}</td>
          </tr>
          <tr v-if="!daily.length"><td colspan="3" class="empty">No activity in window.</td></tr>
        </table>
      </section>

      <section class="card span-2">
        <header>Top opened entities</header>
        <table>
          <tr v-for="t in topEntities" :key="t.target_id">
            <td class="label mono">{{ labelFor(t.target_id) }}</td>
            <td class="count">{{ t.count }}</td>
          </tr>
          <tr v-if="!topEntities.length"><td colspan="2" class="empty">Nothing opened yet.</td></tr>
        </table>
      </section>

      <section class="card span-2">
        <header>Top opened sessions</header>
        <table>
          <tr v-for="t in topSessions" :key="t.target_id">
            <td class="label mono">{{ t.target_id }}</td>
            <td class="count">{{ t.count }}</td>
          </tr>
          <tr v-if="!topSessions.length"><td colspan="2" class="empty">Nothing opened yet.</td></tr>
        </table>
      </section>

      <section class="card span-2">
        <header>Per viewer</header>
        <table>
          <tr class="hd">
            <th>Viewer</th><th>Role</th><th class="num">Events</th><th>Last seen</th>
          </tr>
          <tr v-for="v in perViewerRows" :key="v.viewer">
            <td class="label">{{ v.viewer }}</td>
            <td class="label">{{ v.bucket }}</td>
            <td class="count">{{ v.eventCount }}</td>
            <td class="label">{{ formatLastSeen(v.lastSeen) }}</td>
          </tr>
          <tr v-if="!perViewerRows.length"><td colspan="4" class="empty">No viewers in window.</td></tr>
        </table>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as analytics from 'src/api/usage-analytics';
import { useEntitiesStore } from 'src/stores/entities';

const entities = useEntitiesStore();

const days = ref(14);
const loading = ref(false);
const error = ref(null);

const byType = ref([]);
const daily = ref([]);
const topEntities = ref([]);
const topSessions = ref([]);
const perViewerRows = ref([]);

async function refresh() {
  loading.value = true;
  error.value = null;
  try {
    [byType.value, daily.value, topEntities.value, topSessions.value, perViewerRows.value] =
      await Promise.all([
        analytics.countByType({ days: days.value }),
        analytics.dailyActives({ days: days.value }),
        analytics.topTargets({ type: 'entity_open',  days: days.value, limit: 12 }),
        analytics.topTargets({ type: 'session_open', days: days.value, limit: 12 }),
        analytics.perViewer({ days: days.value })
      ]);
  } catch (e) {
    error.value = e;
  } finally {
    loading.value = false;
  }
}

function formatType(t) {
  return String(t || '').replace(/_/g, ' ');
}

function labelFor(id) {
  const e = entities.byId?.[id];
  return e ? (e.short_name || e.name || id) : id;
}

function formatLastSeen(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const sec = Math.round((Date.now() - d.getTime()) / 1000);
  if (sec < 60) return sec + 's ago';
  const min = Math.round(sec / 60);
  if (min < 60) return min + 'm ago';
  const hr = Math.round(min / 60);
  if (hr < 24) return hr + 'h ago';
  return Math.round(hr / 24) + 'd ago';
}

onMounted(refresh);
</script>

<style scoped>
.usage-overview { display: flex; flex-direction: column; gap: 14px; }

.controls { display: flex; align-items: center; gap: 12px; }
.ctrl { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-dim); }
.ctrl select {
  background: var(--bg-panel-2);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 3px;
  padding: 3px 6px;
  font-family: inherit;
  font-size: 12px;
}
.refresh-btn {
  background: transparent;
  border: 1px solid var(--gold-dim);
  color: var(--gold);
  padding: 4px 12px;
  border-radius: 3px;
  font-family: inherit;
  font-size: 12px;
  cursor: pointer;
}
.refresh-btn:hover:not(:disabled) { background: var(--gold-dim); color: var(--bg); }
.refresh-btn:disabled { opacity: 0.5; cursor: default; }

.error {
  color: var(--red);
  padding: 8px 12px;
  background: rgba(195,77,77,0.08);
  border: 1px solid rgba(195,77,77,0.3);
  border-radius: 3px;
  font-size: 13px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 14px;
}
.span-2 { grid-column: span 2; }

.card {
  background: var(--bg-panel);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 10px 12px;
}
.card header {
  font-size: var(--section-heading-size);
  letter-spacing: var(--section-heading-spacing);
  text-transform: uppercase;
  color: var(--section-heading-color);
  margin-bottom: 8px;
}

table { width: 100%; border-collapse: collapse; font-size: 12px; }
tr.hd th {
  text-align: left;
  font-weight: normal;
  color: var(--gold-dim);
  border-bottom: 1px solid var(--border);
  padding: 2px 4px;
  font-size: 10px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
td { padding: 3px 4px; border-bottom: 1px dashed rgba(138,117,68,0.15); vertical-align: top; }
td.label { color: var(--text); }
td.label.mono { font-family: 'SF Mono', Menlo, monospace; font-size: 11px; }
td.count { color: var(--gold); text-align: right; min-width: 50px; }
.num { text-align: right; }
.empty { color: var(--text-dim); font-style: italic; text-align: center; padding: 10px 4px; }
</style>
