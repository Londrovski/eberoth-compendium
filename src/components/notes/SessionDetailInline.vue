<template>
  <div class="session-detail q-pa-md">
    <div v-if="loading" class="text-center q-pa-md">
      <q-spinner size="24px" />
    </div>

    <q-banner v-else-if="error" class="bg-negative text-white">
      Failed to load: {{ error.message }}
    </q-banner>

    <template v-else>
      <div v-if="full.body" class="player-body q-mb-md">
        <div class="player-body-label">For you</div>
        <div class="player-body-text">{{ full.body }}</div>
      </div>

      <div v-if="full.summary.length" class="summary-block q-mb-md">
        <div class="block-label">Summary</div>
        <ul class="summary-list">
          <li v-for="line in full.summary" :key="line.id">{{ line.line }}</li>
        </ul>
      </div>

      <div v-for="part in full.parts" :key="part.id" class="part-block q-mb-md">
        <div class="part-label">{{ part.label }}</div>
        <div v-for="b in part.blocks" :key="b.id" class="block">
          <p v-if="b.type === 'para' && b.text" class="block-para">{{ b.text }}</p>
          <div v-else-if="b.type === 'highlight' && b.text" class="block-highlight">{{ b.text }}</div>
          <div v-else-if="b.type === 'takeaway' && b.text" class="block-takeaway">
            <q-icon name="auto_awesome" size="14px" class="q-mr-xs" />
            <span>{{ b.text }}</span>
          </div>
          <div v-else-if="b.type === 'testimonies'" class="block-testimonies">
            <p v-if="b.text" class="block-para">{{ b.text }}</p>
            <div v-for="t in b.testimonies" :key="t.id" class="testimony">
              <span class="testimony-name">{{ t.name }}:</span>
              <span class="testimony-text">{{ t.text }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!full.summary.length && !full.parts.length && !full.body" class="text-grey-7 text-caption">
        No content yet.
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as sessionsApi from 'src/api/sessions';

const props = defineProps({
  session: { type: Object, required: true }
});

const loading = ref(true);
const error = ref(null);
const full = ref({ summary: [], parts: [], body: null });

onMounted(async () => {
  try {
    full.value = await sessionsApi.fetchFull(props.session.id);
  } catch (e) {
    error.value = e;
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.session-detail { color: #1f1b16; }

.player-body {
  border-left: 3px solid #c08a2b;
  background: #fff5dc;
  padding: 8px 12px;
  border-radius: 4px;
}
.player-body-label {
  font-size: 0.75rem;
  color: #8a6017;
  margin-bottom: 4px;
}
.player-body-text { font-size: 0.95rem; line-height: 1.5; }

.block-label, .part-label {
  font-size: 0.85rem;
  color: #6b4f2e;
  margin-bottom: 6px;
}

.summary-list {
  margin: 0;
  padding-left: 18px;
}
.summary-list li { margin-bottom: 4px; font-size: 0.95rem; line-height: 1.4; }

.block { margin-bottom: 8px; }
.block-para { margin: 0 0 6px 0; font-size: 0.95rem; line-height: 1.5; }
.block-highlight {
  background: #f3ead6;
  border-left: 3px solid #b08c3a;
  padding: 6px 10px;
  font-style: italic;
  margin-bottom: 6px;
}
.block-takeaway {
  background: #fdf3d6;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 0.95rem;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
}

.block-testimonies { margin-bottom: 6px; }
.testimony {
  background: #f8efd2;
  padding: 6px 10px;
  margin-bottom: 4px;
  border-radius: 4px;
  font-size: 0.9rem;
  line-height: 1.4;
}
.testimony-name { font-weight: 600; color: #6b4f2e; margin-right: 6px; }
</style>
