<template>
  <div class="threads-panel">
    <header class="drawer-header">
      <span class="hdr-title">Active Threads</span>
      <button class="hdr-btn" :disabled="!authed" :title="'Add thread'" @click="add">+</button>
    </header>

    <div class="threads-list">
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
            @blur="onTextBlur(i, $event)"
            @keydown.enter.prevent="$event.target.blur()"
          >{{ t.text }}</span>
          <button class="del" :title="'Remove'" @click="remove(t)">x</button>
        </div>
        <div v-if="!threads.length" class="threads-empty">
          No active threads. Tap + to add one.
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from 'src/stores/auth';
import { fetchThreads, saveThreads } from 'src/api/threads';

const auth = useAuthStore();
const authed = computed(() => !!auth.user);

const threads = ref([]);

let saveTimer = null;
function persist() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    threads.value.forEach((t, i) => { t.position = i; });
    await saveThreads(threads.value);
  }, 300);
}

function onTextBlur(i, e) {
  const v = (e.target.innerText || '').trim() || '(untitled)';
  threads.value[i].text = v;
  e.target.innerText = v;
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
}

function remove(thread) {
  threads.value = threads.value.filter(x => x.id !== thread.id);
  persist();
}

function randomId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'th_' + Math.random().toString(36).slice(2, 10);
}

onMounted(async () => {
  if (authed.value) threads.value = await fetchThreads();
});
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
  accent-color: var(--gold);
  cursor: pointer;
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
