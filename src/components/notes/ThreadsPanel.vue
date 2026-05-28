<template>
  <div class="threads-panel">
    <header class="drawer-header">
      <span>Active Threads</span>
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
          <button class="del" :title="'Remove'" @click="remove(t)">✕</button>
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
  font-size: 11px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--gold);
  font-weight: bold;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  font-family: 'Cinzel', serif;
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
  p