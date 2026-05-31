<!-- Card image aspect-ratio picker -->
<template>
  <div class="ctrl-section">
    <div class="ctrl-label">Card image ratio</div>
    <div class="row items-center q-gutter-xs">
      <button
        v-for="r in ratios"
        :key="r.value"
        class="pill"
        :class="{ active: modelValue === r.value }"
        @click="$emit('update:modelValue', r.value)"
      >{{ r.label }}</button>
    </div>
    <div class="ctrl-hint">Taller = more portrait art</div>
  </div>
</template>

<script setup>
defineProps({ modelValue: { type: String, required: true } });
defineEmits(['update:modelValue']);

const ratios = [
  { label: 'Square', value: '100%' },
  { label: '4:3',    value: '133%' },
  { label: 'Tall',   value: '150%' },
  { label: 'Port.',  value: '175%' },
];
</script>

<style scoped>
.ctrl-section { margin-bottom: 2px; }
.ctrl-label { font-size: 10px; color: var(--gold-dim); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px; }
.ctrl-hint  { font-size: 10px; color: var(--text-dim); font-style: italic; margin-top: 4px; }
.pill {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-dim);
  padding: 5px 10px;
  border-radius: 3px;
  font-family: inherit;
  font-size: 12px;
  cursor: pointer;
}
.pill:hover { color: var(--gold); border-color: var(--gold-dim); }
.pill.active { background: var(--gold-dim); border-color: var(--gold-dim); color: var(--bg); }
</style>
