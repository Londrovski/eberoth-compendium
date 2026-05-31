<!-- Reusable 1/2/3 column-count picker used by DmToolsMobile -->
<template>
  <div class="ctrl-section">
    <div class="ctrl-label">{{ label }}</div>
    <div class="row items-center q-gutter-xs">
      <button
        v-for="n in [1,2,3]"
        :key="n"
        class="pill"
        :class="{ active: modelValue === n }"
        @click="$emit('update:modelValue', n)"
      >{{ n }}</button>
    </div>
    <div v-if="hint" class="ctrl-hint">{{ hint }}</div>
  </div>
</template>

<script setup>
defineProps({
  label:      { type: String, required: true },
  modelValue: { type: Number, required: true },
  hint:       { type: String, default: '' }
});
defineEmits(['update:modelValue']);
</script>

<style scoped>
.ctrl-section { margin-bottom: 2px; }
.ctrl-label {
  font-size: 10px;
  color: var(--gold-dim);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 6px;
}
.ctrl-hint { font-size: 10px; color: var(--text-dim); font-style: italic; margin-top: 4px; }
.pill {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-dim);
  padding: 5px 18px;
  border-radius: 3px;
  font-family: inherit;
  font-size: 12px;
  cursor: pointer;
}
.pill:hover { color: var(--gold); border-color: var(--gold-dim); }
.pill.active { background: var(--gold-dim); border-color: var(--gold-dim); color: var(--bg); }
</style>
