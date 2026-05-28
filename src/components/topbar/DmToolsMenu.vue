<template>
  <q-btn-dropdown
    flat dense no-caps
    icon="settings"
    label="DM Tools"
    class="text-grey-7"
    content-class="dm-tools-menu"
  >
    <div class="q-pa-md" style="min-width: 300px;" @click.stop>

      <div class="section-label">Card scale</div>
      <div class="section-hint">Everywhere — cards, members, lore.</div>
      <CardScaleControls which="card" />

      <q-separator class="q-my-md" />

      <div class="section-label">Faction scale</div>
      <div class="section-hint">Faction headers only — sigil + name.</div>
      <CardScaleControls which="faction" />

      <q-separator class="q-my-md" />

      <div class="section-label">View</div>
      <q-toggle
        :model-value="layout.showPersonals"
        label="Show player personals"
        dense
        @update:model-value="onTogglePersonals"
      />
      <div class="section-hint" style="margin-top: 2px;">
        Turn off to declutter your DM view. View-As still shows them.
      </div>

      <q-separator class="q-my-md" />

      <div class="section-label">Quick add</div>
      <div class="section-hint">Creates DM-only. Set visibility from the detail panel.</div>
      <div class="column q-gutter-xs q-mt-xs">
        <q-btn flat dense no-caps align="left" icon="add" label="New faction" @click="openAdd('faction')" />
        <q-btn flat dense no-caps align="left" icon="add" label="New NPC"     @click="openAdd('npc')" />
        <q-btn flat dense no-caps align="left" icon="add" label="New lore"    @click="openAdd('lore')" />
      </div>
    </div>
  </q-btn-dropdown>

  <NewEntityDialog v-if="adding" :kind="adding" @close="adding = null" />
</template>

<script setup>
import { ref } from 'vue';
import CardScaleControls from 'components/topbar/CardScaleControls.vue';
import NewEntityDialog from 'components/topbar/NewEntityDialog.vue';
import { useAppSettingsStore } from 'src/stores/app-settings';

const layout = useAppSettingsStore();

const adding = ref(null);  // null | 'faction' | 'npc' | 'lore'
function openAdd(kind) { adding.value = kind; }

function onTogglePersonals(v) { layout.setShowPersonals(v); }
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
