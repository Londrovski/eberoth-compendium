<template>
  <div class="party-card" :class="[{ 'is-glow': glow }, visClass]" :style="cardStyle" @click="open">
    <EntityAvatar :entity="entity" :size="avatarSize" />
    <div class="meta">
      <div class="name">{{ entity.short_name || entity.name }}</div>
      <div class="sub" v-if="entity.sub">{{ entity.sub }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import EntityAvatar from 'components/shared/EntityAvatar.vue';
import { useAppSettingsStore } from 'src/stores/app-settings';
import { useEntityDetail } from 'src/composables/useEntityDetail';
import { useGlow } from 'src/composables/useGlow';
import { useVisibilityIndicator } from 'src/composables/useVisibilityIndicator';

const props = defineProps({
  entity: { type: Object, required: true }
});

const layout = useAppSettingsStore();
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
.party-card {
  display: flex;
  align-items: center;
  gap: calc(10px * var(--scale, 1));
  background: #f3eee3;
  border: 1px solid #d8cfb8;
  border-radius: calc(8px * var(--scale, 1));
  cursor: pointer;
  transition: background 0.15s ease;
}
.party-card:hover { background: #ede4d1; }
.party-card.is-glow {
  background: #fff8e0;
  border-color: #c08a2b;
  box-shadow: 0 0 calc(8px * var(--scale, 1)) rgba(192, 138, 43, 0.5);
}
.party-card.vis-restricted {
  outline: 2px solid rgba(74, 107, 145, 0.55);
  outline-offset: 1px;
}
.party-card.vis-dm-only {
  outline: 2px solid rgba(156, 42, 42, 0.55);
  outline-offset: 1px;
}
.meta { display: flex; flex-direction: column; min-width: 0; }
.name { font-weight: 500; font-size: calc(0.85rem * var(--scale, 1)); color: #1f1b16; line-height: 1.2; }
.sub  { font-size: calc(0.7rem * var(--scale, 1)); color: #6b5b3f; line-height: 1.2; }
</style>
