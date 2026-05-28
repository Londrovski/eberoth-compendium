<template>
  <section class="body-section q-mb-md">
    <div class="shared" v-if="entity.shared_body">
      <p v-for="(para, i) in sharedParas" :key="i" v-html="para"></p>
    </div>

    <div class="viewer-body q-mt-md" v-if="entity.viewerBody">
      <div class="section-label">Just for you</div>
      <p v-for="(para, i) in viewerParas" :key="i" v-html="para"></p>
    </div>

    <div v-if="viewer.isDM && otherBodies.length" class="dm-other-bodies q-mt-md">
      <div class="section-label">Other player views</div>
      <q-expansion-item
        v-for="row in otherBodies"
        :key="row.viewer"
        :label="row.label"
        dense dense-toggle
        header-class="other-body-header"
      >
        <div class="other-body-content q-pa-sm">
          <p v-for="(para, i) in row.paras" :key="i" v-html="para"></p>
        </div>
      </q-expansion-item>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useViewer } from 'src/composables/useViewer';
import * as fullBodiesApi from 'src/api/full-bodies';

const props = defineProps({
  entity: { type: Object, required: true }
});
const viewer = useViewer();

function paragraphsOf(text) {
  if (!text) return [];
  return String(text).split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
}

const sharedParas = computed(() => paragraphsOf(props.entity.shared_body));
const viewerParas = computed(() => paragraphsOf(props.entity.viewerBody));

const VIEWER_LABEL = {
  baker:   'Kalvorn',
  butcher: 'Dirk',
  charlie: 'Azrael'
};

const allBodies = ref({});

async function loadBodies(id) {
  if (!viewer.isDM.value || !id) { allBodies.value = {}; return; }
  allBodies.value = await fullBodiesApi.fetchAllBodiesFor(id);
}

watch(() => props.entity.id, (id) => { loadBodies(id); }, { immediate: false });
onMounted(() => loadBodies(props.entity.id));

const otherBodies = computed(() => {
  if (!viewer.isDM.value) return [];
  return ['baker', 'butcher', 'charlie']
    .filter(v => allBodies.value[v] && allBodies.value[v].trim())
    .map(v => ({
      viewer: v,
      label:  VIEWER_LABEL[v],
      paras:  paragraphsOf(allBodies.value[v])
    }));
});
</script>

<style scoped>
.section-label {
  font-family: 'Cinzel', serif;
  font-size: 0.7rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--gold-dim);
  margin-bottom: 6px;
}
.shared p, .viewer-body p, .other-body-content p {
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--text);
  margin: 0 0 0.8em 0;
}
.shared :deep(strong),
.viewer-body :deep(strong),
.other-body-content :deep(strong) { color: var(--gold-bright); font-weight: 600; }
.viewer-body {
  padding: 10px 12px;
  background: rgba(201,169,97,0.08);
  border-left: 3px solid var(--gold);
  border-radius: 4px;
}
.viewer-body p { font-style: italic; }
.other-body-content {
  background: var(--bg-panel-2);
  border: 1px solid var(--border);
  border-radius: 4px;
}
:deep(.other-body-header) { color: var(--text-dim); }
:deep(.other-body-header:hover) { color: var(--gold); }
</style>
