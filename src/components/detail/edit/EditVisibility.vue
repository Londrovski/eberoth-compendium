<template>
  <section class="edit-section">
    <div class="section-label">Visibility</div>
    <div class="text-caption text-grey-7 q-mb-sm">
      Who can see this entity. Tick * for everyone.
    </div>
    <div class="row q-gutter-md">
      <q-checkbox
        :model-value="modelValue.includes('*')"
        label="Everyone"
        @update:model-value="(v) => toggle('*', v)"
      />
      <q-checkbox
        v-for="p in players"
        :key="p.bucket"
        :model-value="modelValue.includes(p.bucket)"
        :label="p.characterName"
        @update:model-value="(v) => toggle(p.bucket, v)"
      />
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { allPlayers } from 'src/config/players';

const props = defineProps({ modelValue: { type: Array, required: true } });
const emit  = defineEmits(['update:modelValue']);

// Drive labels from the canonical players.js so they can't drift.
const players = computed(() => allPlayers());

function toggle(value, checked) {
  const next = new Set(props.modelValue);
  if (checked) next.add(value); else next.delete(value);
  emit('update:modelValue', [...next]);
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
