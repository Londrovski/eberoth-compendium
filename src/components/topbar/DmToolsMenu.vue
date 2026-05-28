<template>
  <q-btn-dropdown
    flat dense no-caps
    icon="settings"
    label="DM Tools"
    class="text-grey-7"
    content-class="dm-tools-menu"
  >
    <div class="q-pa-md" style="min-width: 280px;" @click.stop>
      <div class="section-label">Card scale</div>
      <div class="section-hint">Everywhere — cards, members, lore.</div>
      <CardScaleControls which="card" />

      <q-separator class="q-my-md" />

      <div class="section-label">Faction scale</div>
      <div class="section-hint">Faction headers only — sigil + name.</div>
      <CardScaleControls which="faction" />

      <q-separator class="q-my-md" />
      <div class="section-hint text-grey-6" style="font-style: italic;">
        More tools land here (reorder, push to players, set home…).
      </div>
    </div>
  </q-btn-dropdown>
</template>

<script setup>
import CardScaleControls from 'components/topbar/CardScaleControls.vue';
</script>

<style scoped>
.section-label {
  font-size: 0.7rem;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: #8a7148;
  margin-bottom: 2px;
}
.section-hint {
  font-size: 0.7rem;
  color: #8a7148;
  margin-bottom: 8px;
}
</style>
