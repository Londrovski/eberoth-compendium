<template>
  <section class="personal-to q-mb-md">
    <div class="section-label">Personal to</div>
    <div class="chip" @click="open(personalTo.player.id)">
      <EntityAvatar :entity="personalTo.player" :size="28" />
      <div class="meta">
        <div class="name">{{ personalTo.player.short_name || personalTo.player.name }}</div>
        <div class="role" v-if="personalTo.relationship">{{ personalTo.relationship }}</div>
      </div>
    </div>
  </section>
</template>

<script setup>
import EntityAvatar from 'components/shared/EntityAvatar.vue';
import { useEntityDetail } from 'src/composables/useEntityDetail';

defineProps({
  entity:     { type: Object, required: true },
  personalTo: { type: Object, required: true }
});

const detail = useEntityDetail();
function open(id) { detail.open(id); }
</script>

<style scoped>
.section-label {
  font-size: 0.7rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--gold-dim);
  margin-bottom: 8px;
}
.chip {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px 6px 6px;
  background: rgba(201,169,97,0.10);
  border: 1px solid var(--gold-dim);
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
}
.chip:hover {
  background: rgba(201,169,97,0.18);
  border-color: var(--gold);
}
.meta { display: flex; flex-direction: column; min-width: 0; }
.name { font-weight: 500; font-size: 0.85rem; color: var(--gold-bright); }
.role { font-size: 0.7rem; color: var(--text-dim); font-style: italic; }
</style>
