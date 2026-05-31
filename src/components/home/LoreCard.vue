<template>
  <div class="lore-card" :class="[visClass, { 'is-glow': glow }]" :style="cardStyle" @click="open">
    <div class="img-wrap">
      <EntityAvatar :entity="entity" fill />
      <ReorderArrows
        v-if="viewer.isDM && reorderable"
        :disable-up="isFirst"
        :disable-down="isLast"
        :vertical="false"
        class="arrows-overlay"
        @up="$emit('move-up')"
        @down="$emit('move-down')"
      />
    </div>
    <div class="footer">
      <div class="name">{{ entity.short_name || entity.name }}</div>
      <div class="sub" v-if="entity.sub">{{ entity.sub }}</div>
    </div>
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

const cardStyle = computed(() => ({
  '--scale': layout.cardScale,
  width: Math.round(180 * layout.cardScale) + 'px'
}));

function open() { detail.open(props.entity.id); }
</script>

<style scoped>
.lore-card {
  position: relative;
  display: block;
  width: 180px;
  aspect-ratio: 3 / 4;
  background: var(--bg-card);
  border: 1px solid var(--gold-dim);
  border-radius: calc(4px * var(--scale, 1));
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.2s ease, transform 0.18s ease, box-shadow 0.2s ease;
}
.lore-card:hover {
  border-color: var(--gold);
  transform: translateY(-3px);
  box-shadow: 0 6px 22px rgba(201,169,97,0.2);
}

.lore-card.vis-restricted {
  background: rgba(74,107,145,0.10);
  border-color: var(--blue);
  box-shadow: 0 0 calc(8px * var(--scale, 1)) rgba(74,107,145,0.35);
}
.lore-card.vis-dm-only {
  background: rgba(139,58,58,0.12);
  border-color: var(--red);
  box-shadow: 0 0 calc(8px * var(--scale, 1)) rgba(139,58,58,0.35);
}
.lore-card.is-glow {
  background: rgba(201,169,97,0.10);
  border-color: var(--gold);
  box-shadow: 0 0 calc(12px * var(--scale, 1)) rgba(201,169,97,0.5);
}

.img-wrap {
  position: absolute;
  inset: 0;
  background: var(--bg);
  overflow: hidden;
}
.img-wrap :deep(.entity-avatar) {
  width: 100%;
  height: 100%;
  aspect-ratio: auto;
  border: none;
  border-radius: 0;
}
.img-wrap :deep(img) { opacity: 0.9; transition: opacity 0.2s, transform 0.3s; }
.lore-card:hover .img-wrap :deep(img) { opacity: 1; transform: scale(1.04); }

.arrows-overlay {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(11,9,5,0.6);
  border-radius: 3px;
  z-index: 1;
}

.footer {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-panel);
  border-top: 1px solid var(--border);
  padding: calc(8px * var(--scale, 1)) calc(10px * var(--scale, 1));
  text-align: center;
  min-height: calc(36px * var(--scale, 1));
}
.name {
  font-size: var(--body-card-size);
  color: var(--gold);
  letter-spacing: 0.04em;
  line-height: 1.2;
}
.sub {
  font-size: calc(var(--body-card-size) - 3px);
  color: var(--text-dim);
  font-style: italic;
  line-height: 1.3;
  margin-top: 2px;
}
</style>
