<template>
  <div class="reorder-arrows" :class="{ vertical }">
    <q-btn
      flat dense round size="xs"
      icon="keyboard_arrow_up"
      :disable="disableUp"
      @click.stop="$emit('up')"
      title="Move up"
    />
    <q-btn
      flat dense round size="xs"
      icon="keyboard_arrow_down"
      :disable="disableDown"
      @click.stop="$emit('down')"
      title="Move down"
    />
  </div>
</template>

<script setup>
// Generic up/down arrow pair. Caller wires the events to whatever
// sort_order swap makes sense. DM-only — caller gates rendering.
//
// vertical: stack up + down (default). false = side-by-side (for
// horizontal lists like the personals row).
defineProps({
  disableUp:   { type: Boolean, default: false },
  disableDown: { type: Boolean, default: false },
  vertical:    { type: Boolean, default: true }
});
defineEmits(['up', 'down']);
</script>

<style scoped>
.reorder-arrows {
  display: inline-flex;
  align-items: center;
  gap: 1px;
}
.reorder-arrows.vertical {
  flex-direction: column;
}
.reorder-arrows :deep(.q-btn) {
  min-height: 18px;
  padding: 0;
  color: #8a7148;
}
.reorder-arrows :deep(.q-btn:hover) {
  color: #6b4f2e;
}
.reorder-arrows :deep(.q-btn--disable) {
  opacity: 0.3;
}
</style>
