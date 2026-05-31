<template>
  <section class="factions-section" :class="{ 'is-mobile': viewport.isMobile }" :style="sectionStyle">
    <div class="section-head">
      <div class="section-label">Factions</div>
    </div>
    <div class="grid" :class="{ 'mobile-grid': viewport.isMobile }">
      <FactionColumn
        v-for="(f, idx) in orderedFactions"
        :key="f.id"
        :faction="f"
        :is-first="idx === 0"
        :is-last="idx === orderedFactions.length - 1"
        @move-up="onMoveUp"
        @move-down="onMoveDown"
      />
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { useEntitiesStore } from 'src/stores/entities';
import { useAppSettingsStore } from 'src/stores/app-settings';
import { useViewport } from 'src/composables/useViewport';
import FactionColumn from 'components/home/FactionColumn.vue';

const entities = useEntitiesStore();
const layout   = useAppSettingsStore();
const viewport = useViewport();

const orderedFactions = computed(() => {
  const byId = Object.fromEntries(entities.factions.map(f => [f.id, f]));
  const ordered = [];
  layout.factionOrder.forEach(fid => {
    if (byId[fid]) {
      ordered.push(byId[fid]);
      delete byId[fid];
    }
  });
  const rest = Object.values(byId).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  return [...ordered, ...rest];
});

const sectionStyle = computed(() => ({
  '--scale': layout.cardScale,
  '--faction-scale': layout.factionScale
}));

function onMoveUp(id)   { layout.moveFactionUp(id);   }
function onMoveDown(id) { layout.moveFactionDown(id); }
</script>

<style scoped>
.factions-section { padding: calc(14px * var(--scale, 1)) 0 calc(4px * var(--scale, 1)); }
.factions-section.is-mobile { padding: 10px 8px 14px; }

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: calc(12px * var(--scale, 1));
}
.factions-section.is-mobile .section-head { margin-bottom: 6px; }

.section-label {
  font-size: var(--section-heading-size);
  letter-spacing: var(--section-heading-spacing);
  text-transform: uppercase;
  color: var(--section-heading-color);
}

/* Desktop: flex-wrap, intrinsic column widths, centred. */
.grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--card-spacing);
}

/* Mobile: one faction per row, full width. */
.grid.mobile-grid {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
</style>
