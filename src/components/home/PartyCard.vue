<template>
  <div class="party-card" :class="[visClass, { 'is-glow': glow }]" :style="cardStyle" @click="open">
    <div class="img-wrap">
      <EntityAvatar :entity="entity" fill />
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

const W = 180;
const FOOTER = 44;

const cardStyle = computed(() => {
  const w = W * layout.cardScale;
  const imgH = w * 4 / 3;
  return {
    '--scale': layout.cardScale,
    width: Math.round(w) + 'px',
    height: Math.round(imgH + FOOTER * layout.cardScale) + 'px',
    '--img-h': Math.round(imgH) + 'px',
    '--footer-h': Math.round(FOOTER * layout.cardScale) + 'px'
  };
});

function open() { detail.open(props.entity.id); }
</script>

<style scoped>
.party-card {
  position: relative;
  display: block;
  background: var(--bg-card);
  border: var(--line-thickness) solid var(--line-color);
  border-radius: calc(4px * var(--scale, 1));
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.2s ease, transform 0.18s ease, box-shadow 0.2s ease;
  box-shadow: 0 4px 14px rgba(201, 169, 97, 0.12);
}
.party-card:hover {
  border-color: var(--gold);
  transform: translateY(-3px);
  box-shadow: 0 8px 28px rgba(201, 169, 97, 0.25);
}

/* Glow / visibility states override only colour, not thickness. */
.party-card.vis-restricted {
  background: rgba(74,107,145,0.10);
  border-color: var(--blue);
  box-shadow: 0 0 calc(10px * var(--scale, 1)) rgba(74,107,145,0.4);
}
.party-card.vis-dm-only {
  background: rgba(139,58,58,0.12);
  border-color: var(--red);
  box-shadow: 0 0 calc(10px * var(--scale, 1)) rgba(139,58,58,0.4);
}
.party-card.is-glow {
  background: rgba(201,169,97,0.10);
  border-color: var(--gold);
  box-shadow: 0 0 calc(14px * var(--scale, 1)) rgba(201,169,97,0.55);
}

.img-wrap {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: var(--img-h);
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
.img-wrap :deep(img) { opacity: 0.92; transition: opacity 0.2s, transform 0.3s; }
.party-card:hover .img-wrap :deep(img) { opacity: 1; transform: scale(1.04); }

.footer {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  min-height: var(--footer-h);
  background: var(--bg-panel);
  border-top: var(--line-thickness) solid var(--line-color);
  padding: calc(6px * var(--scale, 1)) calc(10px * var(--scale, 1));
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.party-card.is-glow .footer        { background: #3a2f17; border-top-color: var(--gold-dim); }
.party-card.vis-restricted .footer { background: #1f2c3a; border-top-color: var(--blue); }
.party-card.vis-dm-only .footer    { background: #3a1f1f; border-top-color: var(--red); }

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
