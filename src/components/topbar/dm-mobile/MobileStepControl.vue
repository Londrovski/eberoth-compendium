<!-- Reusable − value + step control used by DmToolsMobile -->
<template>
  <div class="ctrl-section">
    <div class="ctrl-label">{{ label }}</div>
    <div class="row items-center q-gutter-xs">
      <button class="step-btn" @click="decrement" :disabled="modelValue <= min">−</button>
      <span class="ctrl-val">{{ display }}</span>
      <button class="step-btn" @click="increment" :disabled="modelValue >= max">+</button>
    </div>
    <div v-if="hint" class="ctrl-hint">{{ hint }}</div>
  </div>
</template>

<script setup>
const props = defineProps({
  label:      { type: String,  required: true },
  modelValue: { type: Number,  required: true },
  min:        { type: Number,  default: 0 },
  max:        { type: Number,  default: 100 },
  step:       { type: Number,  default: 1 },
  display:    { type: String,  default: '' },   // formatted display string
  hint:       { type: String,  default: '' }
});
const emit = defineEmits(['update:modelValue']);

function increment() {
  const next = Math.round((props.modelValue + props.step) * 1000) / 1000;
  emit('update:modelValue', Math.min(props.max, next));
}
function decrement() {
  const next = Math.round((props.modelValue - props.step) * 1000) / 1000;
  emit('update:modelValue', Math.max(props.min, next));
}
</script>

<style scoped>
.ctrl-section { margin-bottom: 2px; }
.ctrl-label { font-size: 10px; color: var(--gold-dim); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px; }
.ctrl-hint  { font-size: 10px; color: var(--text-dim); font-style: italic; margin-top: 4px; }
.ctrl-val   { font-size: 13px; color: var(--text); min-width: 46px; text-align: center; display: inline-block; }
.step-btn {
  width: 32px; height: 32px;
  background: var(--bg-panel-2);
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text);
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-family: inherit;
}
.step-btn:hover:not(:disabled) { border-color: var(--gold-dim); color: var(--gold); }
.step-btn:disabled { opacity: 0.35; cursor: default; }
</style>
