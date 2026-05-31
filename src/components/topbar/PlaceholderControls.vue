<template>
  <div class="ph-block" @click.stop>
    <div class="row-pair">
      <div class="row-pair-label">Enabled</div>
      <div class="row items-center q-gutter-xs">
        <button
          class="pill"
          :class="{ active:  enabled }"
          @click="setEnabled(true)"
        >On</button>
        <button
          class="pill"
          :class="{ active: !enabled }"
          @click="setEnabled(false)"
        >Off</button>
      </div>
    </div>

    <div class="field">
      <label>Notepad</label>
      <textarea
        v-model="local.notepad"
        rows="2"
        :disabled="!enabled"
        @blur="commit('notepad')"
        :title="'Shown when the Notepad is empty'"
      />
    </div>

    <div class="field">
      <label>Thread</label>
      <textarea
        v-model="local.thread"
        rows="2"
        :disabled="!enabled"
        @blur="commit('thread')"
        :title="'Shown when a thread row is empty'"
      />
    </div>

    <div class="field">
      <label>Entity notes</label>
      <textarea
        v-model="local.detail_notes"
        rows="2"
        :disabled="!enabled"
        @blur="commit('detail_notes')"
        :title="'Shown in the Your notes box inside an entity panel'"
      />
    </div>

    <button class="reset-btn" @click="reset">Reset placeholders</button>
  </div>
</template>

<script setup>
import { reactive, computed, watch } from 'vue';
import { useAppSettingsStore } from 'src/stores/app-settings';

const layout = useAppSettingsStore();

const enabled = computed(() => layout.editorPlaceholders?.enabled !== false);

const local = reactive({
  notepad:      layout.editorPlaceholders?.notepad || '',
  thread:       layout.editorPlaceholders?.thread || '',
  detail_notes: layout.editorPlaceholders?.detail_notes || ''
});

// Realtime updates from other clients should reflect in the textareas
// without clobbering an active edit. Sync only when the field differs
// AND nothing in here is focused.
watch(
  () => [
    layout.editorPlaceholders?.notepad,
    layout.editorPlaceholders?.thread,
    layout.editorPlaceholders?.detail_notes
  ],
  ([n, t, d]) => {
    const focused = document.activeElement && document.activeElement.tagName === 'TEXTAREA';
    if (focused) return;
    if (n !== undefined && n !== local.notepad)      local.notepad      = n || '';
    if (t !== undefined && t !== local.thread)       local.thread       = t || '';
    if (d !== undefined && d !== local.detail_notes) local.detail_notes = d || '';
  }
);

function commit(field) {
  const value = local[field];
  if (value === layout.editorPlaceholders?.[field]) return;
  layout.setEditorPlaceholders({ [field]: value });
}

function setEnabled(v) {
  layout.setEditorPlaceholders({ enabled: !!v });
}

function reset() {
  layout.resetEditorPlaceholders().then(() => {
    local.notepad      = layout.editorPlaceholders.notepad;
    local.thread       = layout.editorPlaceholders.thread;
    local.detail_notes = layout.editorPlaceholders.detail_notes;
  });
}
</script>

<style scoped>
.ph-block { display: flex; flex-direction: column; gap: 8px; }
.row-pair {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 8px;
}
.row-pair-label { font-size: 11px; color: var(--text-dim); }

.field { display: flex; flex-direction: column; gap: 3px; }
.field label {
  font-size: 10px;
  color: var(--gold-dim);
  letter-spacing: 0.04em;
}
.field textarea {
  background: var(--bg-panel-2);
  border: 1px solid var(--border);
  color: var(--text);
  border-radius: 3px;
  padding: 6px 8px;
  font-family: inherit;
  font-size: 12px;
  line-height: 1.4;
  resize: vertical;
  outline: none;
}
.field textarea:focus { border-color: var(--gold-dim); }
.field textarea:disabled { opacity: 0.5; cursor: not-allowed; }

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

.reset-btn {
  margin-top: 4px;
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
