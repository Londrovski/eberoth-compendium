<!-- Step control specifically for faction header size on mobile.
     Uses a percentage display (50%–150%) and writes --mobile-faction-header-scale. -->
<template>
  <div class="ctrl-section">
    <div class="ctrl-label">Faction header size</div>
    <div class="row items-center q-gutter-xs">
      <button class="step-btn" @click="decrement" :disabled="modelValue <= 0.4">−</button>
      <span class="ctrl-val">{{ Math.round(modelValue * 100) }}%</span>
      <button class="step-btn" @click="increment" :disabled="modelValue >= 1.5">+</button>
    </div>
    <div class="ctrl-hint">Avatar, name &amp; padding of each faction box header</div>
  </div>
</template>

<script setup>
const props = defineProps({ modelValue: { type: Number, required: true } });
const emit  = defineEmits(['update:modelValue']);
const STEP  = 0.1;
function increment() { emit('update:modelValue', Math.round(Math.min(1.5, props.modelValue + STEP) * 10) / 10); }
function decrement() { emit('update:modelValue', Math.round(Math.max(0.4, props.modelValue - STEP) * 10) / 10); }
</script>

<style scoped>
.ctrl-section { margin-bottom: 2px; }
.ctrl-label { font-size: 10px; color: var(--gold-dim); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px; }
.ctrl-hint  { font-size: 10px; color: var(--text-dim); font-style: italic; margin-top: 4px; }
.ctrl-val   { font-size: 13px; color: var(--text); min-width: 42px; text-align: center; display: inline-block; }
.step-btn {
  width: 32px; height: 32px;
  background: var(--bg-panel-2);
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text); font-size: 18px; line-height: 1;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  font-family: inherit;
}
.step-btn:hover:not(:disabled) { border-color: var(--gold-dim); color: var(--gold); }
.step-btn:disabled { opacity: 0.35; cursor: default; }
</style>
