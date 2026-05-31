<template>
  <div class="detail-header row items-center q-pa-sm">
    <q-btn
      v-if="detail.canGoBack.value && !editing"
      flat dense no-caps icon="arrow_back"
      label="Back"
      class="action-btn"
      :title="'Previous entry'"
      @click="detail.back()"
    />
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
    <q-btn
      v-if="viewer.isDM && entity && !editing"
      flat dense no-caps icon="auto_awesome"
      label="Highlight"
      class="highlight-btn"
      :title="'Send this card to all players'"
      @click="onHighlight"
    />
    <q-btn flat round dense icon="close" class="action-btn" @click="$emit('close')" />
  </div>
</template>

<script setup>
import { useViewer } from 'src/composables/useViewer';
import { useEntityDetail } from 'src/composables/useEntityDetail';
import { useDmHighlightStore } from 'src/stores/dm-highlight';

const props = defineProps({
  entity:  { type: Object, default: null },
  editing: { type: Boolean, default: false }
});
defineEmits(['close', 'edit', 'cancel-edit']);

const viewer = useViewer();
const detail = useEntityDetail();
const dmHighlight = useDmHighlightStore();

function onHighlight() {
  if (!props.entity) return;
  dmHighlight.setEntity(props.entity);
}
</script>

<style scoped>
.detail-header {
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
  background: var(--bg-panel);
}
.action-btn {
  color: var(--text-dim);
  letter-spacing: 1px;
}
.action-btn:hover { color: var(--gold); }

.highlight-btn {
  color: var(--gold-dim);
  letter-spacing: 1px;
}
.highlight-btn:hover { color: var(--gold-bright); }
</style>
