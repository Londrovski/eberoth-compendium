<template>
  <div class="personal-card" :class="[visClass, { 'is-glow': glow }]" :style="cardStyle" @click="open">
    <EntityAvatar :entity="entity" :size="avatarSize" />
    <div class="meta">
      <div class="name">{{ entity.short_name || entity.name }}</div>
      <div class="sub" v-if="relationship">{{ relationship }}</div>
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
  entity:       { type: Object, required: true },
  relationship: { type: String, default: '' },
  reorderable:  { type: Boolean, default: false },
  isFirst:      { type: Boolean, default: false },
  isLast:       { type: Boolean, default: false }
});
defineEmits(['move-up', 'move-down']);

const layout = useAppSettingsStore();
const viewer = useViewer();
const detail = useEntityDetail();
const glow   = useGlow(props.entity.id);
const visClass = useVisibilityIndicator(props.entity.id);

const avatarSize = computed(() => Math.round(44 * layout.cardScale));
const cardStyle = computed(() => ({
  '--scale': layout.cardScale,
  padding: (8 * layout.cardScale) + 'px ' + (12 * layout.cardScale) + 'px'
}));

function open() { detail.open(props.entity.id); }
</script>

<style scoped>
.personal-card {
  display: flex;
  align-items: center;
  gap: calc(10px * var(--scale, 1));
  background: #f3eee3;
  border: 1px solid #d8cfb8;
  border-radius: calc(8px * var(--scale, 1));
  cursor: pointer;
  transition: background 0.15s ease;
}
.personal-card:hover { background: #ede4d1; }

.personal-card.vis-restricted {
  background: #ecf1f8;
  border-color: #7d9bc1;
  box-shadow: 0 0 calc(8px * var(--scale, 1)) rgba(74, 107, 145, 0.35);
}
.personal-card.vis-dm-only {
  background: #f8ecec;
  border-color: #c17d7d;
  box-shadow: 0 0 calc(8px * var(--scale, 1)) rgba(156, 42, 42, 0.35);
}

.personal-card.is-glow {
  background: #fff8e0;
  border-color: #c08a2b;
  box-shadow: 0 0 calc(8px * var(--scale, 1)) rgba(192, 138, 43, 0.5);
}

.meta { display: flex; flex-direction: column; min-width: 0; }
.name { font-weight: 500; font-size: calc(0.85rem * var(--scale, 1)); color: #1f1b16; line-height: 1.2; }
.sub  { font-size: calc(0.7rem * var(--scale, 1)); color: #6b5b3f; font-style: italic; line-height: 1.2; }
</style>
