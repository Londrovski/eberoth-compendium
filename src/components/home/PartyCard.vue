<template>
  <div class="party-card" :class="[visClass, { 'is-glow': glow }]" :style="cardStyle" @click="open">
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
  background: var(--bg-card);
  border: 1px solid var(--gold-dim);
  border-radius: calc(6px * var(--scale, 1));
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
  box-shadow: 0 4px 14px rgba(201, 169, 97, 0.15);
}
.party-card:hover {
  border-color: var(--gold);
  box-shadow: 0 4px 14px rgba(201, 169, 97, 0.3);
}

.party-card.vis-restricted {
  background: rgba(74,107,145,0.14);
  border-color: var(--blue);
  box-shadow: 0 0 calc(8px * var(--scale, 1)) rgba(74,107,145,0.45);
}
.party-card.vis-dm-only {
  background: rgba(139,58,58,0.16);
  border-color: var(--red);
  box-shadow: 0 0 calc(8px * var(--scale, 1)) rgba(139,58,58,0.45);
}
.party-card.is-glow {
  background: rgba(201,169,97,0.12);
  border-color: var(--gold);
  box-shadow: 0 0 calc(10px * var(--scale, 1)) rgba(201,169,97,0.55);
}

.meta { display: flex; flex-direction: column; min-width: 0; }
.name {
  font-weight: 500;
  font-size: calc(0.85rem * var(--scale, 1));
  color: var(--gold-bright);
  line-height: 1.2;
}
.sub {
  font-size: calc(0.7rem * var(--scale, 1));
  color: var(--text-dim);
  line-height: 1.2;
}
</style>
