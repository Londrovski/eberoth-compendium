<template>
  <div class="member-card" :class="{ 'is-glow': glow }" :style="cardStyle" @click="open">
    <EntityAvatar :entity="entity" :size="size" />
    <div class="meta">
      <div class="name">{{ entity.short_name || entity.name }}</div>
      <div class="role" v-if="role">{{ role }}</div>
    </div>
    <div class="badge" v-if="otherCount > 0" :title="otherFactionsTitle">+{{ otherCount }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import EntityAvatar from 'components/shared/EntityAvatar.vue';
import { useLayoutStore } from 'src/stores/layout';
import { useEntitiesStore } from 'src/stores/entities';
import { useEntityDetail } from 'src/composables/useEntityDetail';
import { useGlow } from 'src/composables/useGlow';

const props = defineProps({
  entity:    { type: Object, required: true },
  role:      { type: String, default: '' },
  factionId: { type: String, required: true }
});

const layout   = useLayoutStore();
const entities = useEntitiesStore();
const detail   = useEntityDetail();
const glow     = useGlow(props.entity.id);

const size = computed(() => Math.round(36 * layout.cardScale));
const cardStyle = computed(() => ({
  padding: (6 * layout.cardScale) + 'px ' + (8 * layout.cardScale) + 'px'
}));

const otherFactions = computed(() =>
  entities.factionsOfEntity(props.entity.id).filter(f => f.id !== props.factionId)
);
const otherCount = computed(() => otherFactions.value.length);
const otherFactionsTitle = computed(() =>
  'Also in: ' + otherFactions.value.map(f => f.name).join(', ')
);

function open() { detail.open(props.entity.id); }
</script>

<style scoped>
.member-card {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f3eee3;
  border: 1px solid #d8cfb8;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s ease;
}
.member-card:hover { background: #ede4d1; }
.member-card.is-glow {
  background: #fff8e0;
  border-color: #c08a2b;
  box-shadow: 0 0 6px rgba(192, 138, 43, 0.45);
}
.meta { flex: 1; min-width: 0; }
.name { font-weight: 500; font-size: 0.78rem; color: #1f1b16; }
.role { font-size: 0.65rem; color: #6b5b3f; }
.badge {
  font-size: 0.65rem;
  color: #6b5b3f;
  padding: 2px 6px;
  background: #ede4d1;
  border-radius: 4px;
  flex-shrink: 0;
}
</style>
