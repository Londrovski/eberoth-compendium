<template>
  <div class="ln-block" @click.stop>
    <div class="row-pair">
      <div class="row-pair-label">Thickness</div>
      <Stepper
        :value="thickness"
        :min="0" :max="8" :step="1"
        suffix="px"
        @change="onThickness"
      />
    </div>
    <div class="row-pair">
      <div class="row-pair-label">Line colour</div>
      <input
        type="color"
        class="swatch"
        :value="color"
        @input="onColor"
        :title="'Default border + divider colour'"
      />
    </div>
    <div class="row-pair">
      <div class="row-pair-label">Card spacing</div>
      <Stepper
        :value="spacing"
        :min="4" :max="40" :step="2"
        suffix="px"
        @change="onSpacing"
      />
    </div>
    <div class="row-pair">
      <div class="row-pair-label">Faction box opacity</div>
      <Stepper
        :value="boxOpacityPct"
        :min="0" :max="100" :step="5"
        suffix="%"
        @change="onBoxOpacity"
      />
    </div>
    <button class="reset-btn" @click="reset">Reset lines</button>
  </div>
</template>

<script setup>
import { h, computed } from 'vue';
import { useAppSettingsStore } from 'src/stores/app-settings';

const layout = useAppSettingsStore();
const thickness     = computed(() => layout.siteLines.thickness ?? 2);
const color         = computed(() => layout.siteLines.color || '#8a7544');
const spacing       = computed(() => layout.siteLines.spacing ?? 16);
const boxOpacityPct = computed(() => Math.round((layout.siteLines.boxOpacity ?? 1) * 100));

function onThickness(v)  { layout.setSiteLines({ thickness: v }); }
function onSpacing(v)    { layout.setSiteLines({ spacing: v }); }
function onBoxOpacity(v) { layout.setSiteLines({ boxOpacity: v / 100 }); }
function reset() {
  layout.setSiteLines({
    thickness: 2,
    color: '#8a7544',
    spacing: 16,
    boxOpacity: 1
  });
}

let colorTimer = null;
function onColor(e) {
  const next = e.target.value;
  layout.siteLines = { ...layout.siteLines, color: next };
  layout.applyCssVars();
  clearTimeout(colorTimer);
  colorTimer = setTimeout(() => layout.setSiteLines({ color: next }), 250);
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
.ln-block { display: flex; flex-direction: column; gap: 6px; }
.row-pair {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 8px;
}
.row-pair-label { font-size: 11px; color: var(--text-dim); }
.swatch {
  width: 26px; height: 22px;
  padding: 0;
  border: 1px solid var(--border);
  border-radius: 3px;
  background: transparent;
  cursor: pointer;
}
.swatch:hover { border-color: var(--gold-dim); }
:deep(.stepper) { display: inline-flex; align-items: center; gap: 2px; }
:deep(.step-btn) {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--gold-dim);
  width: 20px; height: 20px;
  font-size: 13px; line-height: 1;
  border-radius: 3px; cursor: pointer;
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
