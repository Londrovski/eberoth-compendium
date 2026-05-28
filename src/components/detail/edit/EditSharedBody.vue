<template>
  <section class="edit-section">
    <div class="section-label">Shared body</div>
    <div class="text-caption text-grey-7 q-mb-xs">
      Shown to everyone who can see the card.
    </div>
    <q-input
      :model-value="modelValue"
      @update:model-value="(v) => $emit('update:modelValue', v)"
      type="textarea"
      autogrow filled dense
      placeholder="The main description everyone sees."
    />
  </section>
</template>

<script setup>
defineProps({ modelValue: { type: String, default: '' } });
defineEmits(['update:modelValue']);
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
