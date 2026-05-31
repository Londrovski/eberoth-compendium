<template>
  <div class="mb-block" @click.stop>
    <!-- Diagnostic readout — tells the DM at a glance what mobile mode
         thinks the viewport is, and why isMobile is or isn't true.
         Updates live as the window resizes. -->
    <div class="diag" :class="{ active: viewport.isMobile }">
      <span class="diag-row">
        <span class="diag-k">Width</span>
        <span class="diag-v">{{ viewport.width }}px</span>
      </span>
      <span class="diag-row">
        <span class="diag-k">Breakpoint</span>
        <span class="diag-v">{{ viewport.breakpoint }}px</span>
      </span>
      <span class="diag-row">
        <span class="diag-k">Preview force</span>
        <span class="diag-v">{{ layout.mobilePreviewForce ? 'On' : 'Off' }}</span>
      </span>
      <span class="diag-row verdict">
        <span class="diag-k">Mobile mode</span>
        <span class="diag-v">{{ viewport.isMobile ? 'YES' : 'NO' }}</span>
      </span>
    </div>

    <div class="row-pair">
      <div class="row-pair-label">Preview mobile</div>
      <div class="row items-center q-gutter-xs">
        <button
          class="pill"
          :class="{ active:  layout.mobilePreviewForce }"
          @click="setPreview(true)"
          :title="'Force mobile layout on desktop for tuning'"
        >On</button>
        <button
          class="pill"
          :class="{ active: !layout.mobilePreviewForce }"
          @click="setPreview(false)"
        >Off</button>
      </div>
    </div>

    <div class="row-pair">
      <div class="row-pair-label">Breakpoint</div>
      <Stepper
        :value="breakpoint"
        :min="320" :max="1200" :step="20"
        suffix="px"
        @change="onBreakpoint"
      />
    </div>

    <div class="row-pair">
      <div class="row-pair-label">Card scale</div>
      <Stepper
        :value="cardScalePct"
        :min="30" :max="120" :step="5"
        suffix="%"
        @change="onCardScale"
      />
    </div>

    <div class="row-pair">
      <div class="row-pair-label">Card spacing</div>
      <Stepper
        :value="cardSpacing"
        :min="2" :max="40" :step="2"
        suffix="px"
        @change="onCardSpacing"
      />
    </div>

    <div class="row-pair">
      <div class="row-pair-label">Cards per row</div>
      <Stepper
        :value="cardsPerRow"
        :min="1" :max="5" :step="1"
        @change="onCardsPerRow"
      />
    </div>

    <div class="row-pair">
      <div class="row-pair-label">Topbar height</div>
      <Stepper
        :value="topbarHeight"
        :min="32" :max="80" :step="2"
        suffix="px"
        @change="onTopbarHeight"
      />
    </div>

    <div class="row-pair">
      <div class="row-pair-label">Wordmark size</div>
      <Stepper
        :value="wordmarkSize"
        :min="14" :max="40" :step="1"
        suffix="px"
        @change="onWordmarkSize"
      />
    </div>

    <div class="row-pair">
      <div class="row-pair-label">Card text</div>
      <Stepper
        :value="bodyCardSize"
        :min="9" :max="20" :step="1"
        suffix="px"
        @change="onBodyCardSize"
      />
    </div>

    <button class="reset-btn" @click="reset">Reset mobile</button>
  </div>
</template>

<script setup>
import { h, computed } from 'vue';
import { useAppSettingsStore } from 'src/stores/app-settings';
import { useViewport } from 'src/composables/useViewport';

const layout = useAppSettingsStore();
const viewport = useViewport();

const breakpoint    = computed(() => layout.mobile?.breakpoint ?? 600);
const cardScalePct  = computed(() => Math.round((layout.mobile?.cardScale ?? 0.55) * 100));
const cardSpacing   = computed(() => layout.mobile?.cardSpacing ?? 10);
const cardsPerRow   = computed(() => layout.mobile?.cardsPerRow ?? 3);
const topbarHeight  = computed(() => layout.mobile?.topbarHeight ?? 44);
const wordmarkSize  = computed(() => layout.mobile?.wordmarkSize ?? 22);
const bodyCardSize  = computed(() => layout.mobile?.bodyCardSize ?? 12);

function onBreakpoint(v)   { layout.setMobile({ breakpoint: v }); }
function onCardScale(v)    { layout.setMobile({ cardScale: v / 100 }); }
function onCardSpacing(v)  { layout.setMobile({ cardSpacing: v }); }
function onCardsPerRow(v)  { layout.setMobile({ cardsPerRow: v }); }
function onTopbarHeight(v) { layout.setMobile({ topbarHeight: v }); }
function onWordmarkSize(v) { layout.setMobile({ wordmarkSize: v }); }
function onBodyCardSize(v) { layout.setMobile({ bodyCardSize: v }); }
function reset()           { layout.resetMobile(); }
function setPreview(v)     { layout.setMobilePreviewForce(v); }

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
.mb-block { display: flex; flex-direction: column; gap: 6px; }

.diag {
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: var(--bg-panel-2);
  border: 1px solid var(--border);
  border-radius: 3px;
  padding: 6px 8px;
  margin-bottom: 4px;
  font-size: 10px;
  color: var(--text-dim);
}
.diag.active { border-color: var(--gold-dim); }
.diag-row {
  display: flex;
  justify-content: space-between;
}
.diag-k { color: var(--text-dim); }
.diag-v { color: var(--text); font-family: 'SF Mono', Menlo, monospace; }
.diag-row.verdict { margin-top: 3px; padding-top: 3px; border-top: 1px dashed var(--border); }
.diag-row.verdict .diag-k { color: var(--gold-dim); }
.diag-row.verdict .diag-v { color: var(--gold); }

.row-pair {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 8px;
}
.row-pair-label { font-size: 11px; color: var(--text-dim); }

.pill {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-dim);
  padding: 3px 10px;
  border-radius: 3px;
  font-family: inherit;
  font-size: 11px;
  cursor: pointer;
}
.pill:hover { color: var(--gold); border-color: var(--gold-dim); }
.pill.active {
  background: var(--gold-dim);
  border-color: var(--gold-dim);
  color: var(--bg);
}

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
