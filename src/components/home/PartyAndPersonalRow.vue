<template>
  <section class="party-section" :style="sectionStyle">
    <div class="section-label">The Party &amp; Personal</div>
    <div class="row-wrap">
      <PartyCard v-for="pc in players" :key="pc.id" :entity="pc" />

      <template v-if="hasAnyPersonals">
        <div class="divider" aria-hidden="true"></div>

        <template v-if="showGroupedView">
          <template v-for="pc in players" :key="'g-' + pc.id">
            <template v-if="personalsOf(pc.id).length">
              <div class="group-chip">{{ pc.short_name || pc.name }}:</div>
              <PersonalCard
                v-for="(row, idx) in personalsOf(pc.id)"
                :key="pc.id + '-' + row.entity.id"
                :entity="row.entity"
                :relationship="row.relationship"
                :reorderable="true"
                :is-first="idx === 0"
                :is-last="idx === personalsOf(pc.id).length - 1"
                @move-up="onPersonalMoveUp(pc.id, idx)"
                @move-down="onPersonalMoveDown(pc.id, idx)"
              />
            </template>
          </template>
        </template>

        <template v-else>
          <PersonalCard
            v-for="row in myPersonals"
            :key="row.entity.id"
            :entity="row.entity"
            :relationship="row.relationship"
          />
        </template>
      </template>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { useEntitiesStore } from 'src/stores/entities';
import { useViewer } from 'src/composables/useViewer';
import { useAuthStore } from 'src/stores/auth';
import { useAppSettingsStore } from 'src/stores/app-settings';
import { playerIdFromBucket } from 'src/config/players';
import { swapPersonalOrder } from 'src/api/reorder';
import PartyCard from 'components/home/PartyCard.vue';
import PersonalCard from 'components/home/PersonalCard.vue';

const entities = useEntitiesStore();
const viewer   = useViewer();
const auth     = useAuthStore();
const layout   = useAppSettingsStore();

const showGroupedView = computed(() => viewer.isDM && !viewer.isViewingAs);

const players = computed(() =>
  [...entities.players].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
);

function personalsOf(playerId) { return entities.personalsOf(playerId); }

const myPersonals = computed(() => {
  const pid = playerIdFromBucket(auth.effectiveBucket);
  if (!pid) return [];
  return entities.personalsOf(pid);
});

const hasAnyPersonals = computed(() => {
  if (showGroupedView.value) {
    if (!layout.showPersonals) return false;
    return players.value.some(p => personalsOf(p.id).length > 0);
  }
  return myPersonals.value.length > 0;
});

const sectionStyle = computed(() => ({
  '--scale': layout.cardScale
}));

async function onPersonalMoveUp(playerId, idx) {
  const rows = personalsOf(playerId);
  if (idx <= 0) return;
  await swapPersonalOrder(playerId, rows[idx].entity.id, rows[idx - 1].entity.id);
}
async function onPersonalMoveDown(playerId, idx) {
  const rows = personalsOf(playerId);
  if (idx >= rows.length - 1) return;
  await swapPersonalOrder(playerId, rows[idx].entity.id, rows[idx + 1].entity.id);
}
</script>

<style scoped>
.party-section {
  padding: calc(14px * var(--scale, 1)) 0 calc(20px * var(--scale, 1));
  border-bottom: 1px solid var(--border);
}
.section-label {
  font-size: calc(0.7rem * var(--scale, 1));
  letter-spacing: 3px;
  text-transform: uppercase;
  color: var(--gold-dim);
  margin-bottom: calc(14px * var(--scale, 1));
}
.row-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: calc(16px * var(--scale, 1));
  align-items: flex-start;
}
.divider {
  width: 1px;
  align-self: stretch;
  background: var(--border);
  margin: 0 calc(8px * var(--scale, 1));
}
.group-chip {
  align-self: flex-start;
  font-size: calc(0.7rem * var(--scale, 1));
  font-weight: 500;
  color: var(--gold-dim);
  padding: calc(4px * var(--scale, 1)) calc(8px * var(--scale, 1));
  background: var(--bg-panel-2);
  border: 1px solid var(--border);
  border-radius: calc(4px * var(--scale, 1));
  white-space: nowrap;
  margin-top: calc(80px * var(--scale, 1));
}
</style>
