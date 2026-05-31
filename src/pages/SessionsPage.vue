<template>
  <q-page padding>
    <div class="page-title text-h6 q-mb-sm">Sessions</div>
    <div class="text-caption text-grey-7 q-mb-md">A record of what has passed.</div>

    <q-banner v-if="error" class="bg-negative text-white q-mb-md">
      Failed to load sessions: {{ error.message }}
    </q-banner>

    <div v-if="loading" class="text-center q-pa-xl">
      <q-spinner size="32px" />
    </div>

    <q-list separator v-else-if="sessions.length">
      <q-item
        v-for="s in sessions"
        :key="s.id"
        clickable
        @click="open(s.id)"
      >
        <q-item-section avatar>
          <div class="session-number">{{ s.number }}</div>
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ s.title || ('Session ' + s.number) }}</q-item-label>
          <q-item-label caption v-if="s.row_summary || s.date">
            {{ s.row_summary || s.date }}
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" />
        </q-item-section>
      </q-item>
    </q-list>

    <div v-else class="text-center text-grey-7 q-pa-xl">No sessions yet.</div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as sessionsApi from 'src/api/sessions';
import { useEntityDetail } from 'src/composables/useEntityDetail';

const sessions = ref([]);
const loading  = ref(true);
const error    = ref(null);
const detail   = useEntityDetail();

onMounted(async () => {
  try {
    sessions.value = await sessionsApi.fetchAll();
  } catch (e) {
    error.value = e;
  } finally {
    loading.value = false;
  }
});

function open(sessionId) {
  detail.open(sessionId);
}
</script>

<style scoped>
.session-number {
  font-size: 1.4rem;
  color: #6b4f2e;
  min-width: 40px;
  text-align: center;
}
</style>
