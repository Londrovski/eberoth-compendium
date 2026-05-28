<template>
  <section class="memberships q-mb-md">
    <div class="section-label">Factions</div>
    <div class="list">
      <div
        v-for="row in memberships"
        :key="row.faction.id"
        class="row-item"
        @click="open(row.faction.id)"
      >
        <EntityAvatar :entity="row.faction" :size="28" />
        <div class="meta">
          <div class="name">{{ row.faction.short_name || row.faction.name }}</div>
          <div class="role" v-if="row.role">{{ row.role }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import EntityAvatar from 'components/shared/EntityAvatar.vue';
import { useEntityDetail } from 'src/composables/useEntityDetail';

defineProps({
  entity:      { type: Object, required: true },
  memberships: { type: Array,  required: true }
});

const detail = useEntityDetail();
function open(id) { detail.open(id); }
</script>

<style scoped>
.section-label {
  font-family: 'Cinzel', serif;
  font-size: 0.7rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--gold-dim);
  margin-bottom: 8px;
}
.list { display: flex; flex-direction: column; gap: 6px; }
.row-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px;
  background: var(--bg-panel-2);
  border: 1px solid var(--border);
  border-left: 2px solid var(--gold-dim);
  border-radius: 4px;
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;
}
.row-item:hover { border-color: var(--gold-dim); background: var(--bg-card); }
.meta { display: flex; flex-direction: column; min-width: 0; }
.name { font-weight: 500; font-size: 0.85rem; color: var(--text); }
.role { font-size: 0.7rem; color: var(--text-dim); font-style: italic; }
</style>
