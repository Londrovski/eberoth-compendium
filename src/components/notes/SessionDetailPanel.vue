<template>
  <q-dialog
    v-model="openModel"
    position="right"
    :maximized="$q.screen.lt.sm"
    transition-show="slide-left"
    transition-hide="slide-right"
  >
    <q-card class="session-card column">
      <header class="card-head">
        <q-btn flat round dense icon="close" class="close-btn" @click="close" />
        <div v-if="session" class="session-detail-number">Session {{ session.number }}</div>
        <h2 v-if="session" class="session-detail-title">{{ session.title || ('Session ' + session.number) }}</h2>
      </header>

      <q-scroll-area class="col">
        <div class="card-body">
          <div v-if="loading" class="text-center q-pa-md">
            <q-spinner size="24px" color="warning" />
          </div>

          <q-banner v-else-if="error" class="bg-negative text-white">
            Failed to load: {{ error.message }}
          </q-banner>

          <template v-else-if="session">
            <div v-if="session.row_summary" class="session-row-summary" v-html="session.row_summary"></div>

            <div v-if="full.body" class="player-body">
              <div class="player-body-label">For you</div>
              <div class="player-body-text" v-html="full.body"></div>
            </div>

            <div v-if="full.summary.length" class="session-summary-box">
              <div class="session-summary-label">Key Takeaways</div>
              <ul class="session-summary-list">
                <li v-for="line in full.summary" :key="line.id" v-html="line.line"></li>
              </ul>
            </div>

            <div v-for="part in full.parts" :key="part.id" class="part-block">
              <div class="session-detail-part-label">{{ part.label }}</div>
              <div v-for="b in part.blocks" :key="b.id" class="block">
                <p v-if="b.type === 'para' && b.text" class="session-block-para" v-html="b.text"></p>
                <div v-else-if="b.type === 'highlight' && b.text" class="session-block-highlight" v-html="b.text"></div>
                <div v-else-if="b.type === 'takeaway' && b.text" class="session-block-takeaway" v-html="b.text"></div>
                <div v-else-if="b.type === 'testimonies'" class="block-testimonies">
                  <p v-if="b.text" class="session-block-para" v-html="b.text"></p>
                  <ul class="session-block-testimonies">
                    <li v-for="t in b.testimonies" :key="t.id">
                      <span class="testimony-name">{{ t.name }}:</span>
                      <span v-html="' ' + t.text"></span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div v-if="!full.summary.length && !full.parts.length && !full.body" class="empty-note">
              No content yet.
            </div>
          </template>
        </div>
      </q-scroll-area>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import * as sessionsApi from 'src/api/sessions';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  session:    { type: Object, default: null }
});
const emit = defineEmits(['update:modelValue']);

const openModel = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
});

const loading = ref(false);
const error = ref(null);
const full = ref({ summary: [], parts: [], body: null });

function close() { emit('update:modelValue', false); }

watch(
  () => [props.modelValue, props.session?.id],
  async ([open, id]) => {
    if (!open || !id) return;
    loading.value = true;
    error.value = null;
    try {
      full.value = await sessionsApi.fetchFull(id);
    } catch (e) {
      error.value = e;
    } finally {
      loading.value = false;
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.session-card {
  width: 460px;
  max-width: 100vw;
  height: 100vh;
  background: var(--bg-panel);
  color: var(--text);
  border-left: 1px solid var(--border);
}

.card-head {
  position: relative;
  padding: 18px 48px 10px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-panel);
}
.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  color: var(--text-dim);
}
.close-btn:hover { color: var(--gold); }

.session-detail-number {
  font-size: 11px;
  color: var(--gold-dim);
  text-align: center;
}
.session-detail-title {
  text-align: center;
  font-size: 22px;
  font-weight: 400;
  color: var(--gold);
  margin: 6px 0 0;
}

.card-body { padding: 18px 22px 24px; }

.session-row-summary {
  color: var(--text-dim);
  font-style: italic;
  font-size: 13px;
  margin-bottom: 16px;
  text-align: center;
  line-height: 1.5;
}
.session-row-summary :deep(strong) { color: var(--gold-bright); font-style: normal; font-weight: 600; }

.player-body {
  border-left: 3px solid var(--gold);
  background: rgba(201,169,97,0.08);
  padding: 10px 12px;
  border-radius: 3px;
  margin-bottom: 16px;
}
.player-body-label {
  font-size: 10px;
  color: var(--gold-dim);
  margin-bottom: 6px;
}
.player-body-text { font-size: 13px; line-height: 1.55; color: var(--text); }
.player-body-text :deep(strong) { color: var(--gold-bright); font-weight: 600; }

.session-summary-box {
  background: rgba(201,169,97,0.05);
  border: 1px solid var(--border);
  border-left: 2px solid var(--gold-dim);
  border-radius: 3px;
  padding: 10px 12px;
  margin-bottom: 16px;
}
.session-summary-label {
  font-size: 10px;
  color: var(--gold-dim);
  margin-bottom: 6px;
}
.session-summary-list { list-style: none; display: flex; flex-direction: column; gap: 4px; padding: 0; margin: 0; }
.session-summary-list li {
  color: var(--text);
  font-size: 13px;
  line-height: 1.45;
  padding-left: 14px;
  position: relative;
}
.session-summary-list li::before { content: '—'; position: absolute; left: 0; color: var(--gold-dim); }
.session-summary-list li :deep(strong) { color: var(--gold-bright); font-weight: 600; }

.session-detail-part-label {
  font-size: 11px;
  color: var(--gold-dim);
  margin: 18px 0 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--border);
}
.session-block-para {
  color: var(--text);
  font-size: 14px;
  line-height: 1.65;
  margin: 0 0 9px 0;
}
.session-block-para :deep(strong) { color: var(--gold-bright); font-weight: 600; }
.session-block-highlight {
  color: var(--gold-bright);
  font-size: 14px;
  font-weight: 600;
  margin: 12px 0 6px;
}
.session-block-takeaway {
  color: var(--gold-bright);
  font-size: 13px;
  font-weight: 600;
  line-height: 1.55;
  padding-left: 14px;
  position: relative;
  margin-bottom: 6px;
}
.session-block-takeaway::before {
  content: '—';
  position: absolute;
  left: 0;
  color: var(--gold-dim);
  font-weight: 400;
}
.session-block-testimonies {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin: 0 0 9px;
  padding: 0;
}
.session-block-testimonies li {
  color: var(--text);
  font-size: 13px;
  line-height: 1.55;
}
.session-block-testimonies li :deep(strong) { color: var(--gold-bright); font-weight: 600; }
.testimony-name { color: var(--gold-bright); font-weight: 600; }

.empty-note { color: var(--text-dim); font-size: 13px; font-style: italic; text-align: center; padding: 16px 0; }
</style>
