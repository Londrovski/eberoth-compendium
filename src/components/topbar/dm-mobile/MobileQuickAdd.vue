<!-- Quick-add buttons for DM: faction / NPC / lore -->
<template>
  <div class="ctrl-section">
    <div class="ctrl-label">Quick add</div>
    <div class="column q-gutter-xs">
      <button class="add-row" @click="$emit('add', 'faction')">+ New faction</button>
      <button class="add-row" @click="$emit('add', 'npc')">+ New NPC</button>
      <button class="add-row" @click="$emit('add', 'lore')">+ New lore</button>
    </div>
  </div>
</template>

<script setup>
defineEmits(['add']);
</script>

<style scoped>
.ctrl-section { margin-bottom: 2px; }
.ctrl-label { font-size: 10px; color: var(--gold-dim); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px; }
.add-row {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--gold-dim);
  padding: 6px 10px;
  border-radius: 3px;
  text-align: left;
  font-family: inherit;
  font-size: 12px;
  cursor: pointer;
  width: 100%;
}
.add-row:hover { color: var(--gold); border-color: var(--gold-dim); background: var(--bg-panel-2); }
</style>
