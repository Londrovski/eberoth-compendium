<template>
  <div class="typo-block" @click.stop>
    <!-- Card body -->
    <div class="row-pair">
      <div class="row-pair-label">Body — cards</div>
      <input
        type="color"
        class="swatch"
        :value="layout.typography.bodyCard.color"
        @input="onColor('bodyCard', $event)"
        :title="'Card body colour'"
      />
      <Stepper
        :value="layout.typography.bodyCard.size"
        :min="10" :max="22"
        suffix="px"
        @change="(v) => layout.setBodyCard({ size: v })"
      />
    </div>

    <!-- Session body -->
    <div class="row-pair">
      <div class="row-pair-label">Body — sessions</div>
      <input
        type="color"
        class="swatch"
        :value="layout.typography.bodySession.color"
        @input="onColor('bodySession', $event)"
        :title="'Session body colour'"
      />
      <Stepper
        :value="layout.typography.bodySession.size"
        :min="11" :max="24"
        suffix="px"
        @change="(v) => layout.setBodySession({ size: v })"
      />
    </div>

    <!-- Bold accent -->
    <div class="row-pair">
      <div class="row-pair-label">Bold accent</div>
      <input
        type="color"
        class="swatch"
        :value="layout.typography.boldAccent.color"
        @input="onColor('boldAccent', $event)"
        :title="'Bold accent colour'"
      />
      <span class="placeholder">—</span>
    </div>

    <!-- Section heading -->
    <div class="row-pair">
      <div class="row-pair-label">Headings</div>
      <input
        type="color"
        class="swatch"
        :value="layout.typography.sectionHeading.color"
        @input="onColor('sectionHeading', $event)"
        :title="'Section heading colour'"
      />
      <Stepper
        :value="layout.typography.sectionHeading.size"
        :min="9" :max="20"
        suffix="px"
        @change="(v) => layout.setSectionHeading({ size: v })"
      />
    </div>

    <div class="row-pair">
      <div class="row-pair-label">Heading spacing</div>
      <span class="placeholder">—</span>
      <Stepper
        :value="layout.typography.sectionHeading.letterSpacing"
        :min="0" :max="8"
        suffix="px"
        @change="(v) => layout.setSectionHeading({ letterSpacing: v })"
      />
    </div>

    <button class="reset-btn" @click="layout.resetTypography()">Reset typography</button>
  </div>
</template>

<script setup>
import { h } from 'vue';
import { useAppSettingsStore } from 'src/stores/app-settings';

const layout = useAppSettingsStore();

// Debounce colour input so we don't hammer Supabase while the
// native picker is being scrubbed.
const colorTimers = {};
function onColor(field, e) {
  const color = e.target.value;
  // Update local immediately so the swatch UI keeps up.
  if (field === 'bodyCard')       layout.typography.bodyCard       = { ...layout.typography.bodyCard, color };
  if (field === 'bodySession')    layout.typography.bodySession    = { ...layout.typography.bodySession, color };
  if (field === 'boldAccent')     layout.typography.boldAccent     = { ...layout.typography.boldAccent, color };
  if (field === 'sectionHeading') layout.typography.sectionHeading = { ...layout.typography.sectionHeading, color };
  layout.applyCssVars();

  clearTimeout(colorTimers[field]);
  colorTimers[field] = setTimeout(() => {
    if (field === 'bodyCard')       layout.setBodyCard({ color });
    if (field === 'bodySession')    layout.setBodySession({ color });
    if (field === 'boldAccent')     layout.setBoldAccent({ color });
    if (field === 'sectionHeading') layout.setSectionHeading({ color });
  }, 250);
}

// Tiny inline stepper component (defined here to keep this skill self-contained).
const Stepper = {
  props: ['value', 'min', 'max', 'suffix'],
  emits: ['change'],
  setup(p, { emit }) {
    function dec() { emit('change', Math.max(p.min, p.value - 1)); }
    function inc() { emit('change', Math.min(p.max, p.value + 1)); }
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
.typo-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.row-pair {
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 8px;
}
.row-pair-label {
  font-size: 11px;
  color: var(--text-dim);
}
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
.placeholder {
  width: 26px;
  text-align: center;
  color: var(--text-dim);
  font-size: 11px;
}
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
  min-width: 38px;
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
