<template>
  <section class="notes-section q-mt-md">
    <div class="section-label">Your notes</div>
    <textarea
      class="notes-input"
      v-model="text"
      :disabled="!authed"
      placeholder="Personal notes about this entity. Only you can see these."
      rows="4"
      @blur="flush"
    ></textarea>
    <div class="status" :class="{ saving }">
      <span v-if="saving">Saving...</span>
      <span v-else-if="lastSavedAt">Saved {{ relativeSaved }}</span>
      <span v-else-if="!authed">Sign in to take notes</span>
    </div>
  </section>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import { useAuthStore } from 'src/stores/auth';
import * as notesApi from 'src/api/notes';

const props = defineProps({
  entityId: { type: String, required: true }
});

const auth = useAuthStore();
const authed = computed(() => !!auth.user);

const text = ref('');
const saving = ref(false);
const lastSavedAt = ref(null);
let saveTimer = null;
let loadedFor = null;

async function load(id) {
  if (!authed.value) return;
  loadedFor = id;
  const html = await notesApi.fetch(id);
  if (loadedFor === id) {
    text.value = html || '';
    lastSavedAt.value = html ? new Date() : null;
  }
}

async function flush() {
  if (!authed.value) return;
  if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
  saving.value = true;
  await notesApi.save(props.entityId, text.value || '');
  saving.value = false;
  lastSavedAt.value = new Date();
}

function debouncedSave() {
  if (!authed.value) return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(flush, 1500);
}

watch(() => props.entityId, async (id) => {
  text.value = '';
  lastSavedAt.value = null;
  if (id) await load(id);
}, { immediate: false });

watch(text, () => {
  if (loadedFor === props.entityId) debouncedSave();
});

onMounted(() => { if (props.entityId) load(props.entityId); });

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
  font-size: 0.7rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--gold-dim);
  margin-bottom: 6px;
}
.notes-input {
  width: 100%;
  min-height: 90px;
  background: var(--bg-panel-2);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 10px 12px;
  color: var(--text);
  font-size: 14px;
  line-height: 1.55;
  outline: none;
  resize: vertical;
}
.notes-input::placeholder {
  color: var(--text-dim);
  font-style: italic;
}
.notes-input:focus { border-color: var(--gold-dim); }
.status {
  font-size: 0.7rem;
  color: var(--text-dim);
  margin-top: 4px;
  min-height: 1em;
}
.status.saving { color: var(--gold); }
</style>
