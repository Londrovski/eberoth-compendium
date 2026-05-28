<template>
  <div class="identity column items-center text-center q-mb-md">
    <EntityAvatar :entity="entity" :size="120" />
    <div class="name q-mt-sm">{{ entity.name }}</div>
    <div class="sub q-mt-xs" v-if="entity.sub">{{ entity.sub }}</div>
    <div class="kind q-mt-xs">{{ kindLabel }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import EntityAvatar from 'components/shared/EntityAvatar.vue';

const props = defineProps({
  entity: { type: Object, required: true }
});

const KIND_LABEL = {
  player:  'Player Character',
  faction: 'Faction',
  npc:     'Person',
  lore:    'Lore'
};
const kindLabel = computed(() => KIND_LABEL[props.entity.kind] || props.entity.kind);
</script>

<style scoped>
.identity { padding: 8px 0; }
.name {
  font-family: 'Cinzel Decorative', 'Cinzel', serif;
  font-size: 1.6rem;
  font-weight: 500;
  line-height: 1.2;
  color: var(--gold);
  letter-spacing: 0.03em;
}
.sub {
  font-size: 0.95rem;
  color: var(--text-dim);
  font-style: italic;
  max-width: 100%;
}
.kind {
  font-family: 'Cinzel', serif;
  font-size: 0.7rem;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: var(--gold-dim);
}
</style>
