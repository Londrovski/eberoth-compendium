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
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: #8a7148;
  margin-bottom: 8px;
}
.chip {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px 6px 6px;
  background: #fff8e0;
  border: 1px solid #c08a2b;
  border-radius: 6px;
  cursor: pointer;
}
.chip:hover { background: #fdefc4; }
.meta { display: flex; flex-direction: column; min-width: 0; }
.name { font-weight: 500; font-size: 0.85rem; }
.role { font-size: 0.7rem; color: #6b5b3f; font-style: italic; }
</style>
