<template>
  <section class="facts-section q-mb-md">
    <div class="section-label">Known</div>
    <ul class="facts-list">
      <li v-for="(fact, i) in facts" :key="i">{{ fact }}</li>
    </ul>
  </section>
</template>

<script setup>
defineProps({
  facts: { type: Array, required: true }
});
</script>

<style scoped>
.section-label {
  font-size: 0.7rem;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: #8a7148;
  margin-bottom: 6px;
}
.facts-list {
  margin: 0;
  padding-left: 20px;
}
.facts-list li {
  font-size: 0.9rem;
  line-height: 1.5;
  color: #1f1b16;
  margin-bottom: 4px;
}
</style>
