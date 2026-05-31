<template>
  <section class="edit-section">
    <div class="section-label">Special to (glow)</div>
    <div class="text-caption text-grey-7 q-mb-sm">
      Cards glow for these players wherever they appear.
    </div>
    <div class="row q-gutter-md">
      <q-checkbox
        v-for="p in playerOptions"
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

// Tags only apply to PCs, never DM.
const playerOptions = computed(() => allPlayers().filter(p => p.bucket !== 'dm'));

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
  color: #8a7148;
  margin-bottom: 8px;
}
</style>
