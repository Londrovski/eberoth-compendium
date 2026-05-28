<template>
  <section class="memberships q-mb-md">
    <div class="section-label">Memberships</div>
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
  font-size: 0.7rem;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: #8a7148;
  margin-bottom: 8px;
}
.list { display: flex; flex-direction: column; gap: 6px; }
.row-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px;
  background: #f3eee3;
  border: 1px solid #d8cfb8;
  border-radius: 6px;
  cursor: pointer;
}
.row-item:hover { background: #ede4d1; }
.meta { display: flex; flex-direction: column; min-width: 0; }
.name { font-weight: 500; font-size: 0.85rem; }
.role { font-size: 0.7rem; color: #6b5b3f; }
</style>
