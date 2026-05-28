<template>
  <section class="edit-section">
    <div class="section-label">Identity</div>
    <q-input v-model="local.name"       label="Name" dense filled class="q-mb-sm" @update:model-value="emitChange" />
    <q-input v-model="local.sub"        label="Sub-line (e.g. role, descriptor)" dense filled class="q-mb-sm" @update:model-value="emitChange" />
    <q-input v-model="local.image"      label="Image URL (optional)" dense filled class="q-mb-sm" @update:model-value="emitChange" />
    <q-input v-model="local.cluster_id" label="Cluster (legacy)" dense filled @update:model-value="emitChange" />
  </section>
</template>

<script setup>
import { reactive, watch } from 'vue';

const props = defineProps({
  modelValue: { type: Object, required: true }
});
const emit = defineEmits(['update:modelValue']);

const local = reactive({ ...props.modelValue });

watch(() => props.modelValue, (v) => { Object.assign(local, v); }, { deep: true });

function emitChange() { emit('update:modelValue', { ...local }); }
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
