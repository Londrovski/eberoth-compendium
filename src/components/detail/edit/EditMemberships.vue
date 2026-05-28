<template>
  <section class="edit-section">
    <div class="section-label">Factions</div>
    <div class="text-caption text-grey-7 q-mb-sm">
      One row per faction this entity belongs to. Role is shown next to their name in the faction column.
    </div>
    <div v-for="(m, idx) in local" :key="idx" class="row q-gutter-sm items-center q-mb-xs">
      <q-select
        v-model="m.faction_id"
        :options="factionOptions"
        emit-value map-options
        dense outlined
        label="Faction"
        style="min-width: 200px;"
        @update:model-value="emitChange"
      />
      <q-input
        v-model="m.role"
        dense filled
        label="Role"
        style="flex: 1;"
        @update:model-value="emitChange"
      />
      <q-btn flat round dense icon="close" size="sm" @click="remove(idx)" />
    </div>
    <q-btn
      flat dense no-caps icon="add"
      label="Add faction"
      class="text-grey-7"
      @click="addRow"
    />
  </section>
</template>

<script setup>
import { ref, watch, computed } from 'vue';

const props = defineProps({
  modelValue: { type: Array, required: true },
  factions:   { type: Array, required: true }
});
const emit = defineEmits(['update:modelValue']);

const local = ref(props.modelValue.map(m => ({ ...m })));

watch(() => props.modelValue, (v) => { local.value = v.map(m => ({ ...m })); }, { deep: true });

const factionOptions = computed(() =>
  props.factions.map(f => ({ label: f.short_name || f.name, value: f.id }))
);

function emitChange() {
  emit('update:modelValue', local.value.filter(m => m.faction_id));
}
function addRow() {
  local.value.push({ faction_id: null, role: '', sort_order: local.value.length });
}
function remove(idx) {
  local.value.splice(idx, 1);
  emitChange();
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
