<template>
  <div class="detail-header row items-center q-pa-sm">
    <q-btn
      v-if="viewer.isDM && entity"
      flat dense no-caps icon="edit"
      label="Edit"
      class="text-grey-7"
      @click="onEdit"
    />
    <q-space />
    <q-btn flat round dense icon="close" @click="$emit('close')" />
  </div>
</template>

<script setup>
import { useViewer } from 'src/composables/useViewer';
import { useQuasar } from 'quasar';

defineProps({
  entity: { type: Object, default: null }
});
defineEmits(['close']);

const viewer = useViewer();
const $q     = useQuasar();

function onEdit() {
  $q.notify({ type: 'info', message: 'Edit form ships in Q5.' });
}
</script>

<style scoped>
.detail-header {
  border-bottom: 1px solid #d8cfb8;
  flex-shrink: 0;
}
</style>
