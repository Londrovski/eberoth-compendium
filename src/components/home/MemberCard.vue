<template>
  <div class="member-card" :class="[visClass, { 'is-glow': glow }]" :style="cardStyle" @click="open">
    <EntityAvatar :entity="entity" :size="avatarSize" />
    <div class="meta">
      <div class="name">{{ entity.short_name || entity.name }}</div>
      <div class="role" v-if="role">{{ role }}</div>
    </div>
    <div class="badge" v-if="otherCount > 0" :title="otherFactionsTitle">+{{ otherCount }}</div>
    <ReorderArrows
      v-if="viewer.isDM"
      :disable-up="isFirst"
      :disable-down="isLast"
      @up="$emit('move-up')"
      @down="$emit('move-down')"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import EntityAvatar from 'components/shared/EntityAvatar.vue';
import ReorderArrows from 'components/shared/ReorderArrows.vue';
import { useAppSettingsStore } from 'src/stores/app-settings';
import { useEntitiesStore } from 'src/stores/entities';
import { useViewer } from 'src/composables/useViewer';
import { useEntityDetail } from 'src/composables/useEntityDetail';
import { useGlow } from 'src/composables/useGlow';
import { useVisibilityIndicator } from 'src/composables/useVisibilityIndicator';

const props = defineProps({
  entity:    { type: Object, required: true },
  role:      { type: String, default: '' },
  factionId: { type: String, required: true },
  isFirst:   { type: Boolean, default: false },
  isLast:    { type: Boolean, default: false }
});
defineEmits(['move-up', 'move-down']);

const layout   = useAppSettingsStore();
const entities = useEntitiesStore();
const viewer   = useViewer();
const detail   = useEntityDetail();
const glow     = useGlow(props.entity.id);
const visClass = useVisibilityIndicator(props.entity.id);

const avatarSize = computed(() => Math.round(36 * layout.cardScale));
const cardStyle = computed(() => ({
  '--scale': layout.cardScale,
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
  gap: calc(8px * var(--scale, 1));
  background: var(--bg-panel-2);
  border: 1px solid var(--border);
  border-left: 2px solid var(--gold-dim);
  border-radius: calc(4px * var(--scale, 1));
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;
}
.member-card:hover { border-color: var(--gold-dim); background: var(--bg-card); }

.member-card.vis-restricted {
  border-left-color: var(--blue);
  border-color: rgba(74,107,145,0.5);
  box-shadow: 0 0 calc(6px * var(--scale, 1)) rgba(74,107,145,0.3);
}
.member-card.vis-dm-only {
  border-left-color: var(--red);
  border-color: rgba(139,58,58,0.5);
  box-shadow: 0 0 calc(6px * var(--scale, 1)) rgba(139,58,58,0.3);
}
.member-card.is-glow {
  border-color: var(--gold);
  border-left-color: var(--gold);
  box-shadow: 0 0 calc(8px * var(--scale, 1)) rgba(201,169,97,0.45);
}

.meta { flex: 1; min-width: 0; }
.name {
  font-weight: 500;
  font-size: calc(0.85rem * var(--scale, 1));
  color: var(--text);
  line-height: 1.2;
}
.role {
  font-size: calc(0.7rem * var(--scale, 1));
  color: var(--text-dim);
  line-height: 1.2;
}
.badge {
  font-size: calc(0.65rem * var(--scale, 1));
  color: var(--gold);
  padding: 2px calc(6px * var(--scale, 1));
  background: rgba(201,169,97,0.12);
  border: 1px solid var(--gold-dim);
  border-radius: calc(4px * var(--scale, 1));
  flex-shrink: 0;
}
</style>
