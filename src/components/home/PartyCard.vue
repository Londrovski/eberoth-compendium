<template>
  <div class="party-card" :class="{ 'is-glow': glow }" :style="cardStyle" @click="open">
    <EntityAvatar :entity="entity" :size="size" />
    <div class="meta">
      <div class="name">{{ entity.short_name || entity.name }}</div>
      <div class="sub" v-if="entity.sub">{{ entity.sub }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import EntityAvatar from 'components/shared/EntityAvatar.vue';
import { useLayoutStore } from 'src/stores/layout';
import { useEntityDetail } from 'src/composables/useEntityDetail';
import { useGlow } from 'src/composables/useGlow';

const props = defineProps({
  entity: { type: Object, required: true }
});

const layout = useLayoutStore();
const detail = useEntityDetail();
const glow   = useGlow(props.entity.id);

const size = computed(() => Math.round(44 * layout.cardScale));
const cardStyle = computed(() => ({
  padding: (8 * layout.cardScale) + 'px ' + (12 * layout.cardScale) + 'px'
}));

function open() { detail.open(props.entity.id); }
</script>

<style scoped>
.party-card {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f3eee3;
  border: 1px solid #d8cfb8;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s ease;
}
.party-card:hover { background: #ede4d1; }
.party-card.is-glow {
  background: #fff8e0;
  border-color: #c08a2b;
  box-shadow: 0 0 8px rgba(192, 138, 43, 0.5);
}
.meta { display: flex; flex-direction: column; min-width: 0; }
.name { font-weight: 500; font-size: 0.85rem; color: #1f1b16; }
.sub  { font-size: 0.7rem; color: #6b5b3f; }
</style>
