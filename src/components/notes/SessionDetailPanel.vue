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
        <q-btn
          v-if="sessionDetail.canGoBack.value"
          flat dense no-caps
          icon="arrow_back"
          label="Back"
          class="back-btn"
          :title="'Previous session'"
          @click="sessionDetail.back()"
        />
        <q-btn
          v-if="viewer.isDM && session"
          flat dense no-caps
          icon="auto_awesome"
          :label="isHighlighted ? 'Highlighted' : 'Highlight'"
          class="highlight-btn"
          :class="{ active: isHighlighted }"
          :title="isHighlighted ? 'This is currently highlighted to players' : 'Push this session to all players'"
          @click="onHighlight"
        />
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
import { useSessionDetail } from 'src/composables/useSessionDetail';
import { useViewer } from 'src/composables/useViewer';
import { useDmHighlightStore } from 'src/stores/dm-highlight';

const sessionDetail = useSessionDetail();
const viewer        = useViewer();
const dmHighlight   = useDmHighlightStore();

const openModel = computed({
  get: () => sessionDetail.isOpen.value,
  set: (v) => { if (!v) close(); }
});

const session = computed(() => sessionDetail.currentSession.value);

const loading = ref(false);
const error = ref(null);
const full = ref({ summary: [], parts: [], body: null });

const isHighlighted = computed(() =>
  dmHighlight.isActive &&
  dmHighlight.kind === 'session' &&
  dmHighlight.targetId === session.value?.id
);

function close() { sessionDetail.close(); }

function onHighlight() {
  if (!session.value) return;
  if (isHighlighted.value) dmHighlight.clear();
  else dmHighlight.setSession(session.value);
}

watch(
  () => session.value?.id,
  async (id) => {
    if (!id) {
      full.value = { summary: [], parts: [], body: null };
      return;
    }
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
/* Reading colour + size are driven by the DM Typography panel via
   --body-session-color / --body-session-size and --bold-accent-color. */
.session-card {
  width: 460px;
  max-width: 100vw;
  height: 100vh;
  background: var(--bg-panel);
  color: var(--body-session-color);
  border-left: 1px solid var(--border);
}

.card-head {
  position: relative;
  padding: 18px 48px 10px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-panel);
}
.back-btn {
  position: absolute;
  top: 10px;
  left: 10px;
  color: var(--text-dim);
  letter-spacing: 1px;
}
.back-btn:hover { color: var(--gold); }
.highlight-btn {
  position: absolute;
  top: 10px;
  left: 96px;
  color: var(--gold-dim);
  letter-spacing: 1px;
}
.highlight-btn:hover { color: var(--gold-bright); }
.highlight-btn.active {
  color: var(--gold-bright);
  background: rgba(201,169,97,0.14);
  border-radius: 3px;
}
.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  color: var(--text-dim);
}
.close-btn:hover { color: var(--gold); }

.session-detail-number {
  font-size: var(--section-heading-size);
  letter-spacing: var(--section-heading-spacing);
  text-transform: uppercase;
  color: var(--section-heading-color);
  text-align: center;
}
.session-detail-title {
  text-align: center;
  font-size: 22px;
  font-weight: 400;
  color: var(--gold);
  margin: 6px 0 0;
}

.card-body { padding: 20px 24px 28px; }

.session-row-summary {
  color: var(--text-dim);
  font-style: italic;
  font-size: calc(var(--body-session-size) - 1px);
  margin-bottom: 18px;
  text-align: center;
  line-height: 1.65;
}
.session-row-summary :deep(strong) { color: var(--bold-accent-color); font-style: normal; font-weight: 600; }

.player-body {
  border-left: 3px solid var(--gold-dim);
  background: rgba(201,169,97,0.05);
  padding: 12px 14px;
  border-radius: 3px;
  margin-bottom: 18px;
}
.player-body-label {
  font-size: var(--section-heading-size);
  letter-spacing: var(--section-heading-spacing);
  text-transform: uppercase;
  color: var(--section-heading-color);
  margin-bottom: 6px;
}
.player-body-text {
  font-size: var(--body-session-size);
  line-height: 1.75;
  color: var(--body-session-color);
}
.player-body-text :deep(strong) { color: var(--bold-accent-color); font-weight: 600; }

.session-summary-box {
  background: rgba(201,169,97,0.04);
  border: 1px solid var(--border);
  border-left: 2px solid var(--gold-dim);
  border-radius: 3px;
  padding: 12px 14px;
  margin-bottom: 18px;
}
.session-summary-label {
  font-size: var(--section-heading-size);
  letter-spacing: var(--section-heading-spacing);
  text-transform: uppercase;
  color: var(--section-heading-color);
  margin-bottom: 6px;
}
.session-summary-list { list-style: none; display: flex; flex-direction: column; gap: 6px; padding: 0; margin: 0; }
.session-summary-list li {
  color: var(--body-session-color);
  font-size: var(--body-session-size);
  line-height: 1.65;
  padding-left: 14px;
  position: relative;
}
.session-summary-list li::before { content: '—'; position: absolute; left: 0; color: var(--gold-dim); }
.session-summary-list li :deep(strong) { color: var(--bold-accent-color); font-weight: 600; }

.session-detail-part-label {
  font-size: var(--section-heading-size);
  letter-spacing: var(--section-heading-spacing);
  text-transform: uppercase;
  color: var(--section-heading-color);
  margin: 22px 0 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--border);
}
.session-block-para {
  color: var(--body-session-color);
  font-size: var(--body-session-size);
  line-height: 1.85;
  margin: 0 0 12px 0;
}
.session-block-para :deep(strong) { color: var(--bold-accent-color); font-weight: 600; }
.session-block-highlight {
  color: var(--bold-accent-color);
  font-size: var(--body-session-size);
  font-weight: 600;
  line-height: 1.6;
  margin: 14px 0 8px;
}
.session-block-takeaway {
  color: var(--bold-accent-color);
  font-size: calc(var(--body-session-size) - 1px);
  font-weight: 600;
  line-height: 1.7;
  padding-left: 14px;
  position: relative;
  margin-bottom: 8px;
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
  gap: 7px;
  margin: 0 0 12px;
  padding: 0;
}
.session-block-testimonies li {
  color: var(--body-session-color);
  font-size: calc(var(--body-session-size) - 1px);
  line-height: 1.7;
}
.session-block-testimonies li :deep(strong) { color: var(--bold-accent-color); font-weight: 600; }
.testimony-name { color: var(--bold-accent-color); font-weight: 600; }

.empty-note { color: var(--text-dim); font-size: 13px; font-style: italic; text-align: center; padding: 16px 0; }
</style>
