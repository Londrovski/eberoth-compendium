<template>
  <div class="bg-block" @click.stop>
    <div class="row-pair">
      <div class="row-pair-label">Mode</div>
      <select class="select" :value="bg.mode" @change="onMode($event)">
        <option value="none">None (plain)</option>
        <option value="horizon">Descending Horizon</option>
        <option value="logo">Eberoth logo</option>
      </select>
    </div>

    <div class="row-pair">
      <div class="row-pair-label">Base colour</div>
      <input
        type="color"
        class="swatch"
        :value="bg.bgColor || '#000000'"
        @input="onColor($event)"
        :title="'Colour painted behind the image'"
      />
    </div>

    <div class="row-pair" v-if="bg.mode !== 'none'">
      <div class="row-pair-label">Opacity</div>
      <Stepper
        :value="opacityPct"
        :min="5" :max="100" :step="5"
        suffix="%"
        @change="onOpacity"
      />
    </div>

    <div class="row-pair" v-if="bg.mode === 'logo'">
      <div class="row-pair-label">Logo size</div>
      <Stepper
        :value="sizePct"
        :min="20" :max="100" :step="5"
        suffix="%"
        @change="onSize"
      />
    </div>

    <button class="reset-btn" @click="reset">Reset background</button>
  </div>
</template>

<script setup>
import { h, computed } from 'vue';
import { useAppSettingsStore } from 'src/stores/app-settings';

const layout = useAppSettingsStore();
const bg = computed(() => layout.siteBackground);

const opacityPct = computed(() => Math.round((bg.value.opacity ?? 0.35) * 100));
const sizePct    = computed(() => Math.round((bg.value.size    ?? 0.80) * 100));

function onMode(e)    { layout.setSiteBackground({ mode: e.target.value }); }
function onOpacity(v) { layout.setSiteBackground({ opacity: v / 100 }); }
function onSize(v)    { layout.setSiteBackground({ size: v / 100 }); }
function reset()      { layout.setSiteBackground({ mode: 'none', opacity: 0.35, size: 0.8, bgColor: '#000000' }); }

// Debounced colour writes so the native picker scrubbing doesn't
// hammer Supabase.
let colorTimer = null;
function onColor(e) {
  const next = e.target.value;
  // Update local immediately so the swatch UI keeps up.
  layout.siteBackground = { ...layout.siteBackground, bgColor: next };
  clearTimeout(colorTimer);
  colorTimer = setTimeout(() => layout.setSiteBackground({ bgColor: next }), 250);
}

const Stepper = {
  props: ['value', 'min', 'max', 'step', 'suffix'],
  emits: ['change'],
  setup(p, { emit }) {
    const step = p.step || 1;
    function dec() { emit('change', Math.max(p.min, p.value - step)); }
    function inc() { emit('change', Math.min(p.max, p.value + step)); }
    return () =>
      h('div', { class: 'stepper' }, [
        h('button', { class: 'step-btn', onClick: dec }, '−'),
        h('span', { class: 'step-val' }, `${p.value}${p.suffix || ''}`),
        h('button', { class: 'step-btn', onClick: inc }, '+')
      ]);
  }
};
</script>

<style scoped>
.bg-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.row-pair {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 8px;
}
.row-pair-label {
  font-size: 11px;
  color: var(--text-dim);
}
.select {
  background: var(--bg-panel-2);
  color: var(--gold);
  border: 1px solid var(--border);
  border-radius: 3px;
  font-family: inherit;
  font-size: 11px;
  padding: 3px 6px;
}
.select:focus { outline: none; border-color: var(--gold-dim); }
.swatch {
  width: 26px;
  height: 22px;
  padding: 0;
  border: 1px solid var(--border);
  border-radius: 3px;
  background: transparent;
  cursor: pointer;
}
.swatch:hover { border-color: var(--gold-dim); }
:deep(.stepper) {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}
:deep(.step-btn) {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--gold-dim);
  width: 20px;
  height: 20px;
  font-size: 13px;
  line-height: 1;
  border-radius: 3px;
  cursor: pointer;
  font-family: inherit;
}
:deep(.step-btn:hover) { color: var(--gold); border-color: var(--gold-dim); }
:deep(.step-val) {
  font-size: 11px;
  color: var(--text);
  min-width: 42px;
  text-align: center;
}
.reset-btn {
  margin-top: 6px;
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-dim);
  padding: 4px 8px;
  border-radius: 3px;
  font-family: inherit;
  font-size: 11px;
  cursor: pointer;
}
.reset-btn:hover { color: var(--gold); border-color: var(--gold-dim); }
</style>
