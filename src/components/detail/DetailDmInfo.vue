<template>
  <section class="dm-info q-mb-md" :class="stateClass">
    <div class="section-label">DM info</div>
    <div class="row q-gutter-md items-start">
      <div class="info-block">
        <div class="info-label">Visible to</div>
        <div class="info-value">{{ visibilityText }}</div>
      </div>
      <div v-if="tagNames.length" class="info-block">
        <div class="info-label">Special to</div>
        <div class="info-value tag-text">{{ tagNames.join(', ') }}</div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { allPlayers } from 'src/config/players';

const props = defineProps({
  entity: { type: Object, required: true }
});

const PLAYER_BUCKETS = computed(() => allPlayers().filter(p => p.bucket !== 'dm'));

const visibility = computed(() => {
  const vis = props.entity.visible_to;
  if (!vis || vis.size === 0) return { state: 'dm-only', names: ['DM only'] };
  if (vis.has('*'))            return { state: 'everyone', names: ['Everyone'] };

  const names = [];
  if (vis.has('dm')) names.push('DM');
  PLAYER_BUCKETS.value.forEach(p => {
    if (vis.has(p.bucket)) names.push(p.characterName);
  });

  const playerCount = names.filter(n => n !== 'DM').length;
  if (playerCount === 0) return { state: 'dm-only', names };
  return { state: 'restricted', names };
});

const visibilityText = computed(() => visibility.value.names.join(', '));
const stateClass = computed(() => 'state-' + visibility.value.state);

const tagNames = computed(() => {
  const t = props.entity.tagged_viewers;
  if (!t || t.size === 0) return [];
  return PLAYER_BUCKETS.value
    .filter(p => t.has(p.bucket))
    .map(p => p.characterName);
});
</script>

<style scoped>
.dm-info {
  padding: 10px 14px;
  border-radius: 4px;
  background: var(--bg-panel-2);
  border: 1px solid var(--border);
  border-left: 2px solid var(--gold-dim);
}
.dm-info.state-everyone {
  border-left-color: var(--gold-dim);
}
.dm-info.state-restricted {
  border-left-color: var(--blue);
  background: rgba(74,107,145,0.08);
}
.dm-info.state-dm-only {
  border-left-color: var(--red);
  background: rgba(139,58,58,0.10);
}

.section-label {
  font-size: 0.65rem;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: var(--gold-dim);
  margin-bottom: 6px;
}
.info-block { min-width: 0; }
.info-label {
  font-size: 0.65rem;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--text-dim);
  margin-bottom: 2px;
}
.info-value {
  font-size: 0.9rem;
  color: var(--text);
  font-weight: 500;
}
.tag-text { color: var(--gold-bright); }
</style>
