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
  padding: 8px 12px;
  border-radius: 6px;
  background: #f3eee3;
  border: 1px solid #d8cfb8;
}
.dm-info.state-everyone {
  background: #f3eee3;
  border-color: #d8cfb8;
}
.dm-info.state-restricted {
  background: #ecf1f8;
  border-color: #7d9bc1;
}
.dm-info.state-dm-only {
  background: #f8ecec;
  border-color: #c17d7d;
}

.section-label {
  font-size: 0.65rem;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: #8a7148;
  margin-bottom: 4px;
}
.info-block { min-width: 0; }
.info-label {
  font-size: 0.65rem;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: #6b5b3f;
  margin-bottom: 2px;
}
.info-value {
  font-size: 0.9rem;
  color: #1f1b16;
  font-weight: 500;
}
.tag-text { color: #6b4f2e; }
</style>
