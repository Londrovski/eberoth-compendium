<template>
  <section class="edit-section">
    <div class="section-label">Special to (glow)</div>
    <div class="text-caption text-grey-7 q-mb-sm">
      Cards glow for these players wherever they appear.
    </div>
    <div class="row q-gutter-md">
      <q-checkbox v-for="opt in OPTS" :key="opt.value"
        :model-value="modelValue.includes(opt.value)"
        :label="opt.label"
        @update:model-value="(v) => toggle(opt.value, v)"
      />
    </div>
  </section>
</template>

<script setup>
const OPTS = [
  { value: 'baker',   label: 'Kalvorn' },
  { value: 'butcher', label: 'Dirk' },
  { value: 'charlie', label: 'Azrael' }
];

const props = defineProps({ modelValue: { type: Array, required: true } });
const emit  = defineEmits(['update:modelValue']);

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
