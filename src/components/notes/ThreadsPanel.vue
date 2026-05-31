<template>
  <div class="threads-panel">
    <header class="drawer-header">
      <span class="hdr-title">Active Threads</span>
      <button class="hdr-btn" :disabled="!authed" :title="'Add thread'" @click="add">+</button>
    </header>

    <div class="threads-list" ref="listEl">
      <div v-if="!authed" class="threads-empty">Sign in to track threads.</div>

      <template v-else>
        <div
          v-for="(t, i) in threads"
          :key="t.id"
          class="thread"
          :class="{ done: t.done }"
        >
          <input
            type="checkbox"
            v-model="t.done"
            class="thread-check"
            @change="persist"
          />
          <span
            class="text"
            contenteditable="true"
            spellcheck="false"
            v-html="t.text"
            :data-idx="i"
            @blur="onTextBlur(i, $event)"
            @keydown.enter.prevent="$event.target.blur()"
          ></span>
          <button class="del" :title="'Remove'" @click="remove(t)">x</button>
        </div>
        <div v-if="!threads.length" class="threads-empty">
          No active threads. Tap + to add one.
        </div>
      </template>
    </div>

    <MentionPicker :picker="picker" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';
import { useAuthStore } from 'src/stores/auth';
import { fetchThreads, saveThreads } from 'src/api/threads';
import { useMentionPicker } from 'src/composables/useMentionPicker';
import MentionPicker from 'components/shared/MentionPicker.vue';

const auth = useAuthStore();
const authed = computed(() => !!auth.user);

const threads = ref([]);
const listEl = ref(null);

let saveTimer = null;
function persist() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    threads.value.forEach((t, i) => { t.position = i; });
    await saveThreads(threads.value);
  }, 300);
}

// Shared mention picker for whichever .text span the user is in.
const picker = useMentionPicker({
  onInput(el) {
    const idx = parseInt(el.getAttribute('data-idx'), 10);
    if (Number.isInteger(idx) && threads.value[idx]) {
      threads.value[idx].text = el.innerHTML;
      persist();
    }
  }
});

function onTextBlur(i, e) {
  const v = (e.target.innerHTML || '').trim() || '(untitled)';
  threads.value[i].text = v;
  e.target.innerHTML = v;
  persist();
}

function add() {
  if (!authed.value) return;
  threads.value.push({
    id: randomId(),
    text: 'New thread',
    done: false,
    position: threads.value.length
  });
  persist();
  nextTick(() => bindAll());
}

function remove(thread) {
  threads.value = threads.value.filter(x => x.id !== thread.id);
  persist();
  nextTick(() => bindAll());
}

function randomId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'th_' + Math.random().toString(36).slice(2, 10);
}

// We bind the mention picker to each .text span. Re-bind whenever
// threads change so newly-created rows participate.
let boundEls = [];
function bindAll() {
  unbindAll();
  if (!listEl.value) return;
  boundEls = Array.from(listEl.value.querySelectorAll('.text'));
  boundEls.forEach(el => picker.bind(el));
}
function unbindAll() {
  boundEls.forEach(el => picker.unbind(el));
  boundEls = [];
}

watch(() => threads.value.length, () => { nextTick(() => bindAll()); });

onMounted(async () => {
  if (authed.value) threads.value = await fetchThreads();
  await nextTick();
  bindAll();
});
onBeforeUnmount(() => { unbindAll(); });
</script>

<style scoped>
.threads-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-panel);
}

.drawer-header {
  padding: 12px 14px 8px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}
.hdr-title {
  font-size: var(--section-heading-size);
  letter-spacing: var(--section-heading-spacing);
  text-transform: uppercase;
  color: var(--section-heading-color);
  font-weight: bold;
}
.hdr-btn {
  background: transparent;
  border: 1px solid var(--gold-dim);
  color: var(--gold);
  width: 22px;
  height: 22px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  font-family: inherit;
}
.hdr-btn:hover:not(:disabled) { background: var(--gold-dim); color: var(--bg); }
.hdr-btn:disabled { opacity: 0.4; cursor: default; }

.threads-list {
  overflow-y: auto;
  padding: 8px 10px;
  flex: 1;
  min-height: 0;
}
.thread {
  background: var(--bg-panel-2);
  border: 1px solid var(--border);
  border-left: 3px solid var(--gold-dim);
  padding: 8px 10px;
  margin-bottom: 6px;
  border-radius: 3px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 14px;
  transition: border-color 0.15s ease;
}
.thread:focus-within { border-color: var(--gold-dim); }
.thread.done .text { color: var(--text-dim); text-decoration: line-through; }
.thread-check {
  margin-top: 3px;
  accent-color: var(--gold-dim);
  cursor: pointer;
  width: 14px;
  height: 14px;
}
.thread .text {
  flex: 1;
  outline: none;
  color: var(--text);
  cursor: text;
  min-height: 18px;
  word-wrap: break-word;
}
.thread .text:focus { color: var(--gold-bright); }
.thread .text :deep(a.mention) {
  color: var(--bold-accent-color);
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  padding: 0 2px;
  border-radius: 2px;
}
.thread .text :deep(a.mention:hover) {
  background: rgba(216,201,138,0.12);
  text-decoration: underline;
}
.thread .del {
  background: transparent;
  border: none;
  color: var(--text-dim);
  cursor: pointer;
  font-size: 13px;
  padding: 0 4px;
  font-family: inherit;
}
.thread .del:hover { color: var(--red); }

.threads-empty {
  color: var(--text-dim);
  font-style: italic;
  text-align: center;
  padding: 12px;
  font-size: 13px;
}
</style>
