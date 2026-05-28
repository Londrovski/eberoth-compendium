<template>
  <div class="sessions-list">
    <q-banner v-if="error" class="bg-negative text-white q-mb-md">
      Failed to load sessions: {{ error.message }}
    </q-banner>

    <div v-if="loading" class="text-center q-pa-xl">
      <q-spinner size="32px" />
    </div>

    <q-list separator v-else-if="sessions.length" class="session-list">
      <template v-for="s in sessions" :key="s.id">
        <q-item
          clickable
          :active="expandedId === s.id"
          active-class="session-active"
          @click="toggle(s.id)"
        >
          <q-item-section avatar>
            <div class="session-number">{{ s.number }}</div>
          </q-item-section>
          <q-item-section>
            <q-item-label class="session-title">
              {{ s.title || ('Session ' + s.number) }}
            </q-item-label>
            <q-item-label caption v-if="s.row_summary">{{ s.row_summary }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon :name="expandedId === s.id ? 'expand_less' : 'expand_more'" />
          </q-item-section>
        </q-item>
        <q-slide-transition>
          <div v-show="expandedId === s.id" class="session-detail-wrap">
            <SessionDetailInline v-if="expandedId === s.id" :session="s" />
          </div>
        </q-slide-transition>
      </template>
    </q-list>

    <div v-else class="text-center text-grey-7 q-pa-xl">No sessions yet.</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as sessionsApi from 'src/api/sessions';
import SessionDetailInline from 'components/notes/SessionDetailInline.vue';

const sessions = ref([]);
const loading  = ref(true);
const error    = ref(null);
const expandedId = ref(null);

function toggle(id) {
  expandedId.value = expandedId.value === id ? null : id;
}

onMounted(async () => {
  try {
    sessions.value = await sessionsApi.fetchAll();
  } catch (e) {
    error.value = e;
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.session-list { background: #fdfaf2; }
.session-number {
  font-family: 'Cinzel Decorative', serif;
  font-size: 1.4rem;
  color: #6b4f2e;
  min-width: 40px;
  text-align: center;
}
.session-title { font-weight: 500; }
.session-active { background: #f5ebcf; }
.session-detail-wrap {
  background: #fffaee;
  border-bottom: 1px solid #e7dcc4;
}
</style>
