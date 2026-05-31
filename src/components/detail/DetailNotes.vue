<template>
  <section class="notes-section q-mt-md">
    <div class="section-label">Your notes</div>
    <div
      class="notes-input"
      :contenteditable="authed"
      spellcheck="true"
      v-html="html"
      ref="bodyEl"
      data-placeholder="Personal notes about this entity. Only you can see these."
      @blur="flush"
    ></div>
    <div class="status" :class="{ saving }">
      <span v-if="saving">Saving...</span>
      <span v-else-if="lastSavedAt">Saved {{ relativeSaved }}</span>
      <span v-else-if="!authed">Sign in to take notes</span>
    </div>
    <MentionPicker :picker="picker" />
  </section>
</template>

<script setup>
import { ref, watch, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useAuthStore } from 'src/stores/auth';
import * as notesApi from 'src/api/notes';
import { useMentionPicker } from 'src/composables/useMentionPicker';
import MentionPicker from 'components/shared/MentionPicker.vue';

const props = defineProps({
  entityId: { type: String, required: true }
});

const auth = useAuthStore();
const authed = computed(() => !!auth.user);

const html = ref('');
const saving = ref(false);
const lastSavedAt = ref(null);
const bodyEl = ref(null);
let saveTimer = null;
let loadedFor = null;

const picker = useMentionPicker({
  onInput(el) {
    html.value = el.innerHTML;
    debouncedSave();
  }
});

async function load(id) {
  if (!authed.value) return;
  loadedFor = id;
  const v = await notesApi.fetch(id);
  if (loadedFor === id) {
    html.value = v || '';
    lastSavedAt.value = v ? new Date() : null;
    await nextTick();
    if (bodyEl.value) bodyEl.value.innerHTML = html.value;
  }
}

async function flush() {
  if (!authed.value) return;
  if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
  // Pull the latest html in case the picker just inserted a mention
  // after the last keystroke.
  if (bodyEl.value) html.value = bodyEl.value.innerHTML;
  saving.value = true;
  await notesApi.save(props.entityId, html.value || '');
  saving.value = false;
  lastSavedAt.value = new Date();
}

function debouncedSave() {
  if (!authed.value) return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(flush, 1500);
}

watch(() => props.entityId, async (id) => {
  html.value = '';
  lastSavedAt.value = null;
  if (id) await load(id);
}, { immediate: false });

onMounted(async () => {
  if (props.entityId) await load(props.entityId);
  await nextTick();
  if (bodyEl.value) picker.bind(bodyEl.value);
});
onBeforeUnmount(() => {
  if (bodyEl.value) picker.unbind(bodyEl.value);
});

const relativeSaved = computed(() => {
  if (!lastSavedAt.value) return '';
  const sec = Math.round((Date.now() - lastSavedAt.value.getTime()) / 1000);
  if (sec < 5) return 'just now';
  if (sec < 60) return sec + 's ago';
  const min = Math.round(sec / 60);
  if (min < 60) return min + 'm ago';
  return 'a while ago';
});
</script>

<style scoped>
.section-label {
  font-size: var(--section-heading-size);
  letter-spacing: var(--section-heading-spacing);
  text-transform: uppercase;
  color: var(--section-heading-color);
  margin-bottom: 6px;
}
.notes-input {
  width: 100%;
  min-height: 90px;
  background: var(--bg-panel-2);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 10px 12px;
  color: var(--body-card-color);
  font-size: var(--body-card-size);
  line-height: 1.55;
  outline: none;
  overflow-y: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}
.notes-input:empty:before {
  content: attr(data-placeholder);
  color: var(--text-dim);
  font-style: italic;
  pointer-events: none;
}
.notes-input:focus { border-color: var(--gold-dim); }
.notes-input :deep(a.mention) {
  color: var(--bold-accent-color);
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  padding: 0 2px;
  border-radius: 2px;
}
.notes-input :deep(a.mention:hover) {
  background: rgba(216,201,138,0.12);
  text-decoration: underline;
}
.status {
  font-size: 0.7rem;
  color: var(--text-dim);
  margin-top: 4px;
  min-height: 1em;
}
.status.saving { color: var(--gold); }
</style>
