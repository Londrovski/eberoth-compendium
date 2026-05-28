<template>
  <section class="edit-section">
    <div class="section-label">Per-player bodies</div>
    <div class="text-caption text-grey-7 q-mb-sm">
      Optional. Shown to each viewer in addition to the shared body. Empty = no row written.
    </div>
    <q-expansion-item
      v-for="p in players"
      :key="p.bucket"
      :label="p.characterName"
      :caption="local[p.bucket] ? '' : 'Empty'"
      dense dense-toggle
      header-class="text-grey-8"
    >
      <q-input
        v-model="local[p.bucket]"
        type="textarea"
        autogrow filled dense
        class="q-ma-sm"
        :placeholder="'Body just for ' + p.characterName"
        @update:model-value="emitChange"
      />
    </q-expansion-item>
  </section>
</template>

<script setup>
import { reactive, watch, computed } from 'vue';
import { allPlayers } from 'src/config/players';

const props = defineProps({
  modelValue: { type: Object, required: true }
});
const emit = defineEmits(['update:modelValue']);

const players = computed(() => allPlayers());

const local = reactive({ ...props.modelValue });

watch(() => props.modelValue, (v) => { Object.assign(local, v); }, { deep: true });

function emitChange() { emit('update:modelValue', { ...local }); }
</script>

<style scoped>
.edit-section { margin-bottom: 1.25rem; }
.section-label {
  font-size: 0.7rem;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: #8a7148;
  margin-bottom: 8px;
}
</style>
