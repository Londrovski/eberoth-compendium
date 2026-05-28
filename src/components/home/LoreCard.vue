<template>
  <div class="lore-card" :class="[visClass, { 'is-glow': glow }]" :style="cardStyle" @click="open">
    <EntityAvatar :entity="entity" :size="avatarSize" />
    <div class="meta">
      <div class="name">{{ entity.short_name || entity.name }}</div>
      <div class="sub" v-if="entity.sub">{{ entity.sub }}</div>
    </div>
    <ReorderArrows
      v-if="viewer.isDM && reorderable"
      :disable-up="isFirst"
      :disable-down="isLast"
      :vertical="false"
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
import { useViewer } from 'src/composables/useViewer';
import { useEntityDetail } from 'src/composables/useEntityDetail';
import { useGlow } from 'src/composables/useGlow';
import { useVisibilityIndicator } from 'src/composables/useVisibilityIndicator';

const props = defineProps({
  entity:      { type: Object, required: true },
  reorderable: { type: Boolean, default: false },
  isFirst:     { type: Boolean, default: false },
  isLast:      { type: Boolean, default: false }
});
defineEmits(['move-up', 'move-down']);

const layout = useAppSettingsStore();
const viewer = useViewer();
const detail = useEntityDetail();
const glow   = useGlow(props.entity.id);
const visClass = useVisibilityIndicator(props.entity.id);

const avatarSize = computed(() => Math.round(36 * layout.cardScale));
const cardStyle = computed(() => ({
  '--scale': layout.cardScale,
  padding: (6 * layout.cardScale) + 'px ' + (12 * layout.cardScale) + 'px 6px 6px'
}));

function open() { detail.open(props.entity.id); }
</script>

<style scoped>
.lore-card {
  display: flex;
  align-items: center;
  gap: calc(8px * var(--scale, 1));
  background: var(--bg-card);
  border: 1px solid var(--gold-dim);
  border-radius: calc(6px * var(--scale, 1));
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
}
.lore-card:hover { border-color: var(--gold); }

.lore-card.vis-restricted {
  background: rgba(74,107,145,0.12);
  border-color: var(--blue);
  box-shadow: 0 0 calc(6px * var(--scale, 1)) rgba(74,107,145,0.35);
}
.lore-card.vis-dm-only {
  background: rgba(139,58,58,0.14);
  border-color: var(--red);
  box-shadow: 0 0 calc(6px * var(--scale, 1)) rgba(139,58,58,0.35);
}
.lore-card.is-glow {
  background: rgba(201,169,97,0.10);
  border-color: var(--gold);
  box-shadow: 0 0 calc(8px * var(--scale, 1)) rgba(201,169,97,0.5);
}

.meta { min-width: 0; flex: 1; }
.name { font-weight: 500; font-size: calc(0.85rem * var(--scale, 1)); color: var(--text); line-height: 1.2; }
.sub  { font-size: calc(0.7rem * var(--scale, 1)); color: var(--text-dim); line-height: 1.2; }
</style>
