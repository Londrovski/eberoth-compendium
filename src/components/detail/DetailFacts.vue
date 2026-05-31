<template>
  <section class="facts-section q-mb-md">
    <div class="section-label">Known</div>
    <ul class="facts-list">
      <li v-for="(fact, i) in facts" :key="i" v-html="fact"></li>
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
  font-size: var(--section-heading-size);
  letter-spacing: var(--section-heading-spacing);
  text-transform: uppercase;
  color: var(--section-heading-color);
  margin-bottom: 8px;
}
.facts-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.facts-list li {
  font-size: var(--body-card-size);
  line-height: 1.5;
  color: var(--body-card-color);
  padding-left: 14px;
  position: relative;
}
.facts-list li::before {
  content: '—';
  position: absolute;
  left: 0;
  color: var(--gold-dim);
}
.facts-list li :deep(strong) { color: var(--bold-accent-color); font-weight: 600; }
</style>
