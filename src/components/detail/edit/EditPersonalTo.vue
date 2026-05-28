<template>
  <section class="edit-section">
    <div class="section-label">Personal to</div>
    <div class="text-caption text-grey-7 q-mb-sm">
      Place this entity in a player's personal top-row.
    </div>
    <div class="row q-gutter-sm items-center">
      <q-select
        :model-value="modelValue ? modelValue.player_id : null"
        :options="playerOptions"
        emit-value map-options
        dense outlined
        label="Player"
        clearable
        style="min-width: 180px;"
        @update:model-value="onPlayerChange"
      />
      <q-input
        v-if="modelValue"
        :model-value="modelValue.relationship"
        dense filled
        label="Relationship (e.g. Patron)"
        style="flex: 1;"
        @update:model-value="onRelationshipChange"
      />
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: { type: Object, default: null },
  players:    { type: Array, required: true }
});
const emit = defineEmits(['update:modelValue']);

const playerOptions = computed(() =>
  props.players.map(p => ({ label: p.short_name || p.name, value: p.id }))
);

function onPlayerChange(playerId) {
  if (!playerId) { emit('update:modelValue', null); return; }
  emit('update:modelValue', {
    player_id: playerId,
    relationship: props.modelValue ? props.modelValue.relationship : ''
  });
}

function onRelationshipChange(rel) {
  if (!props.modelValue) return;
  emit('update:modelValue', { ...props.modelValue, relationship: rel || '' });
}
</script>

<style scoped>
.edit-section { margin-bottom: 1.25rem; }
.section-label {
  font-size: 0.7rem;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: #8a7148;
  margin-bottom: 8px;
}
</style>
