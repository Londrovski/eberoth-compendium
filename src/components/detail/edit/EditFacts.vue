<template>
  <section class="edit-section">
    <div class="section-label">Known facts</div>
    <div class="text-caption text-grey-7 q-mb-sm">
      Bulleted list shown in the detail panel.
    </div>
    <div v-for="(fact, idx) in local" :key="idx" class="row q-gutter-sm items-center q-mb-xs">
      <q-input
        v-model="local[idx]"
        dense filled
        :placeholder="'Fact ' + (idx + 1)"
        style="flex: 1;"
        @update:model-value="emitChange"
      />
      <q-btn flat round dense icon="close" size="sm" @click="remove(idx)" />
    </div>
    <q-btn
      flat dense no-caps icon="add"
      label="Add fact"
      class="text-grey-7"
      @click="addRow"
    />
  </section>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({ modelValue: { type: Array, required: true } });
const emit = defineEmits(['update:modelValue']);

const local = ref([...props.modelValue]);

watch(() => props.modelValue, (v) => { local.value = [...v]; }, { deep: true });

function emitChange() {
  emit('update:modelValue', local.value.filter(f => f && f.trim()));
}
function addRow() { local.value.push(''); }
function remove(idx) { local.value.splice(idx, 1); emitChange(); }
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
