<template>
  <div class="threads-panel column">
    <div class="panel-title row items-center q-px-sm q-py-xs">
      <span class="text-subtitle2">Threads</span>
      <q-space />
      <span class="text-caption text-grey-7" v-if="openCount">{{ openCount }} open</span>
    </div>

    <div v-if="!authed" class="text-grey-7 q-pa-md text-caption">
      Sign in to track threads.
    </div>

    <template v-else>
      <div class="add-row q-px-sm q-py-xs">
        <q-input
          v-model="draft"
          dense outlined
          placeholder="A new thread to chase…"
          @keyup.enter="add"
        >
          <template #append>
            <q-btn flat dense round icon="add" size="sm" :disable="!draft.trim()" @click="add" />
          </template>
        </q-input>
      </div>

      <q-scroll-area class="col">
        <q-list dense>
          <q-item v-for="t in threads" :key="t.id" class="thread-row">
            <q-item-section side>
              <q-checkbox dense v-model="t.done" @update:model-value="persist" />
            </q-item-section>
            <q-item-section>
              <q-input
                v-model="t.text"
                dense borderless
                :class="{ 'thread-done': t.done }"
                @blur="persist"
                @keyup.enter="$event.target.blur()"
              />
            </q-item-section>
            <q-item-section side>
              <q-btn flat round dense size="sm" icon="close" @click="remove(t)" />
            </q-item-section>
          </q-item>
          <q-item v-if="!threads.length">
            <q-item-section class="text-grey-7 text-caption">Nothing on the line.</q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from 'src/stores/auth';
import { fetchThreads, saveThreads } from 'src/api/threads';

const auth = useAuthStore();
const authed = computed(() => !!auth.user);

const threads = ref([]);
const draft = ref('');

let saveTimer = null;
function persist() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    threads.value.forEach((t, i) => { t.position = i; });
    await saveThreads(threads.value);
  }, 300);
}

function add() {
  const t = draft.value.trim();
  if (!t) return;
  threads.value.push({
    id: randomId(),
    text: t,
    done: false,
    position: threads.value.length
  });
  draft.value = '';
  persist();
}

function remove(thread) {
  threads.value = threads.value.filter(x => x.id !== thread.id);
  persist();
}

const openCount = computed(() => threads.value.filter(t => !t.done).length);

function randomId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'th_' + Math.random().toString(36).slice(2, 10);
}

onMounted(async () => {
  if (authed.value) threads.value = await fetchThreads();
});
</script>

<style scoped>
.threads-panel { height: 100%; }
.panel-title {
  border-bottom: 1px solid #e7dcc4;
  background: #f3ead6;
}
.thread-row { padding-left: 4px; padding-right: 4px; }
.thread-done :deep(input) { text-decoration: line-through; color: #998860; }
</style>
