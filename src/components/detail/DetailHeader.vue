<template>
  <div class="detail-header row items-center q-pa-sm">
    <q-btn
      v-if="viewer.isDM && entity && !editing"
      flat dense no-caps icon="edit"
      label="Edit"
      class="action-btn"
      @click="$emit('edit')"
    />
    <q-btn
      v-else-if="viewer.isDM && entity && editing"
      flat dense no-caps icon="arrow_back"
      label="Back"
      class="action-btn"
      @click="$emit('cancel-edit')"
    />
    <q-space />
    <q-btn flat round dense icon="close" class="action-btn" @click="$emit('close')" />
  </div>
</template>

<script setup>
import { useViewer } from 'src/composables/useViewer';

defineProps({
  entity:  { type: Object, default: null },
  editing: { type: Boolean, default: false }
});
defineEmits(['close', 'edit', 'cancel-edit']);

const viewer = useViewer();
</script>

<style scoped>
.detail-header {
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
  background: var(--bg-panel);
}
.action-btn {
  color: var(--text-dim);
  font-family: 'Cinzel', serif;
  letter-spacing: 1px;
}
.action-btn:hover { color: var(--gold); }
</style>
