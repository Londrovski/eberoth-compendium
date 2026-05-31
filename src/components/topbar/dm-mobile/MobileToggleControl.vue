<!-- Reusable Show/Hide (or custom labels) binary toggle -->
<template>
  <div class="ctrl-section">
    <div class="ctrl-label">{{ label }}</div>
    <div class="row items-center q-gutter-xs">
      <button
        class="pill"
        :class="{ active: modelValue }"
        @click="$emit('update:modelValue', true)"
      >{{ onLabel }}</button>
      <button
        class="pill"
        :class="{ active: !modelValue }"
        @click="$emit('update:modelValue', false)"
      >{{ offLabel }}</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  label:    { type: String,  required: true },
  modelValue: { type: Boolean, required: true },
  onLabel:  { type: String,  default: 'Show' },
  offLabel: { type: String,  default: 'Hide' }
});
defineEmits(['update:modelValue']);
</script>

<style scoped>
.ctrl-section { margin-bottom: 2px; }
.ctrl-label { font-size: 10px; color: var(--gold-dim); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px; }
.pill {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-dim);
  padding: 5px 14px;
  border-radius: 3px;
  font-family: inherit;
  font-size: 12px;
  cursor: pointer;
}
.pill:hover { color: var(--gold); border-color: var(--gold-dim); }
.pill.active { background: var(--gold-dim); border-color: var(--gold-dim); color: var(--bg); }
</style>
