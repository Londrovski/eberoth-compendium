<template>
  <q-page class="admin-page">
    <header class="admin-head">
      <div class="head-row">
        <span class="head-label">DM Admin</span>
        <span class="head-sub">Visible only to you.</span>
      </div>
      <nav class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="tab"
          :class="{ active: active === tab.id }"
          @click="active = tab.id"
        >{{ tab.label }}</button>
      </nav>
    </header>

    <div class="admin-body">
      <!-- Tabs are gated by id so future panels can drop in below
           without touching anything else. Each panel lives in its
           own component under src/components/admin/. -->
      <UsageOverview v-if="active === 'usage'" />
      <div v-else class="placeholder">Nothing here yet.</div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import UsageOverview from 'components/admin/UsageOverview.vue';

// Add new admin sections here. Each id maps to a v-if branch above
// and a future component under src/components/admin/.
const tabs = [
  { id: 'usage', label: 'Usage' }
  // { id: 'pulses', label: 'Pulse history' },   // future
  // { id: 'notes',  label: 'Notes overview' },  // future
];

const active = ref('usage');
</script>

<style scoped>
.admin-page {
  padding: 18px 22px 32px;
  min-height: calc(100vh - 64px);
}
.admin-head {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 18px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}
.head-row { display: flex; align-items: baseline; gap: 14px; }
.head-label {
  font-size: 14px;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: var(--gold);
}
.head-sub { color: var(--text-dim); font-style: italic; font-size: 12px; }

.tabs { display: flex; gap: 4px; }
.tab {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-dim);
  padding: 5px 14px;
  border-radius: 3px;
  cursor: pointer;
  font-family: inherit;
  font-size: 12px;
  letter-spacing: 0.04em;
}
.tab:hover { color: var(--gold); border-color: var(--gold-dim); }
.tab.active {
  background: var(--gold-dim);
  color: var(--bg);
  border-color: var(--gold-dim);
}

.placeholder {
  color: var(--text-dim);
  font-style: italic;
  padding: 20px;
  text-align: center;
}
</style>
