<template>
  <div class="entity-avatar" :style="style">
    <img v-if="src" :src="src" :alt="alt" @error="onError" />
    <span v-else class="initials">{{ initials }}</span>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  entity: { type: Object, required: true },
  size:   { type: Number, default: 44 }
});

const errored = ref(false);
const src = computed(() => errored.value ? null : (props.entity.sigil || props.entity.image || null));
const alt = computed(() => props.entity.name || '');
const initials = computed(() => {
  const n = String(props.entity.short_name || props.entity.name || '?').trim();
  return n.split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
});
const style = computed(() => ({
  width:  props.size + 'px',
  height: props.size + 'px'
}));

function onError() { errored.value = true; }
</script>

<style scoped>
.entity-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3eee3;
  border: 1px solid #d8cfb8;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
}
.entity-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.initials {
  font-family: 'Cinzel', serif;
  font-weight: 500;
  color: #6b4f2e;
  font-size: 0.85em;
}
</style>
