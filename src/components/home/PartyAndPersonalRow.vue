<template>
  <section class="party-section" :class="{ 'is-mobile': viewport.isMobile }" :style="sectionStyle">
    <div class="section-label">The Party &amp; Lore</div>

    <!-- Desktop: original single-row flex with vertical dividers -->
    <div v-if="!viewport.isMobile" class="row-wrap">
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
                :player-id="pc.id"
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
            :player-id="ownPlayerId"
          />
        </template>
      </template>

      <template v-if="orphanCards.length">
        <div class="divider" aria-hidden="true"></div>
        <LoreCard
          v-for="(l, idx) in orphanCards"
          :key="'lore-' + l.id"
          :entity="l"
          :reorderable="true"
          :is-first="idx === 0"
          :is-last="idx === orphanCards.length - 1"
          @move-up="onLoreMoveUp(idx)"
          @move-down="onLoreMoveDown(idx)"
        />
      </template>
    </div>

    <!-- Mobile: grouped by player, each player+their personals stacked.
         Players go in a 3-up row at the top; each player block below
         lists their personals horizontally. -->
    <div v-else class="mobile-stack">
      <div class="mobile-row players-row">
        <PartyCard v-for="pc in players" :key="'m-' + pc.id" :entity="pc" />
      </div>

      <template v-if="hasAnyPersonals && showGroupedView">
        <div
          v-for="pc in players"
          :key="'mp-' + pc.id"
          class="player-block"
        >
          <template v-if="personalsOf(pc.id).length">
            <div class="player-label">{{ pc.short_name || pc.name }}</div>
            <div class="mobile-row personals-row">
              <PersonalCard
                v-for="(row, idx) in personalsOf(pc.id)"
                :key="'mpr-' + pc.id + '-' + row.entity.id"
                :entity="row.entity"
                :relationship="row.relationship"
                :player-id="pc.id"
                :reorderable="false"
                :is-first="idx === 0"
                :is-last="idx === personalsOf(pc.id).length - 1"
              />
            </div>
          </template>
        </div>
      </template>

      <template v-else-if="hasAnyPersonals">
        <!-- Player viewer: just their own personals as one row. -->
        <div class="player-block">
          <div class="mobile-row personals-row">
            <PersonalCard
              v-for="row in myPersonals"
              :key="'mo-' + row.entity.id"
              :entity="row.entity"
              :relationship="row.relationship"
              :player-id="ownPlayerId"
            />
          </div>
        </div>
      </template>

      <template v-if="orphanCards.length">
        <div class="hr-divider" aria-hidden="true"></div>
        <div class="mobile-row orphans-row">
          <LoreCard
            v-for="(l, idx) in orphanCards"
            :key="'mlore-' + l.id"
            :entity="l"
            :reorderable="false"
            :is-first="idx === 0"
            :is-last="idx === orphanCards.length - 1"
          />
        </div>
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
import { useViewport } from 'src/composables/useViewport';
import { playerIdFromBucket } from 'src/config/players';
import { swapPersonalOrder, swapEntitySortOrder } from 'src/api/reorder';
import PartyCard from 'components/home/PartyCard.vue';
import PersonalCard from 'components/home/PersonalCard.vue';
import LoreCard from 'components/home/LoreCard.vue';

const entities = useEntitiesStore();
const viewer   = useViewer();
const auth     = useAuthStore();
const layout   = useAppSettingsStore();
const viewport = useViewport();

const showGroupedView = computed(() => viewer.isDM && !viewer.isViewingAs);

const players = computed(() =>
  [...entities.players].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
);

function personalsOf(playerId) { return entities.personalsOf(playerId); }

const ownPlayerId = computed(() => playerIdFromBucket(auth.effectiveBucket) || '');

const myPersonals = computed(() => {
  if (!ownPlayerId.value) return [];
  return entities.personalsOf(ownPlayerId.value);
});

const personalEntityIds = computed(() => {
  const set = new Set();
  if (showGroupedView.value) {
    players.value.forEach(p => {
      personalsOf(p.id).forEach(row => set.add(row.entity.id));
    });
  } else {
    myPersonals.value.forEach(row => set.add(row.entity.id));
  }
  return set;
});

const factionMemberIds = computed(() => {
  const set = new Set();
  entities.memberships.forEach(m => set.add(m.entity_id));
  return set;
});

const orphanCards = computed(() => {
  return entities.all
    .filter(e => {
      if (!e) return false;
      if (e.kind !== 'lore' && e.kind !== 'npc') return false;
      if (personalEntityIds.value.has(e.id)) return false;
      if (e.kind === 'npc' && factionMemberIds.value.has(e.id)) return false;
      return true;
    })
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
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

async function onLoreMoveUp(idx) {
  if (idx <= 0) return;
  await swapEntitySortOrder(orphanCards.value[idx].id, orphanCards.value[idx - 1].id);
}
async function onLoreMoveDown(idx) {
  if (idx >= orphanCards.value.length - 1) return;
  await swapEntitySortOrder(orphanCards.value[idx].id, orphanCards.value[idx + 1].id);
}
</script>

<style scoped>
.party-section {
  padding: calc(14px * var(--scale, 1)) 0 calc(20px * var(--scale, 1));
  border-bottom: var(--line-thickness) solid var(--line-color);
}
.party-section.is-mobile { padding: 10px 0 14px; }

.section-label {
  font-size: var(--section-heading-size);
  letter-spacing: var(--section-heading-spacing);
  text-transform: uppercase;
  color: var(--section-heading-color);
  margin-bottom: calc(14px * var(--scale, 1));
}
.party-section.is-mobile .section-label { margin-bottom: 8px; padding: 0 10px; }

/* Desktop layout (unchanged) */
.row-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: var(--card-spacing);
  align-items: flex-start;
}
.divider {
  width: var(--line-thickness);
  align-self: stretch;
  background: var(--line-color);
  margin: 0 calc(8px * var(--scale, 1));
}
.group-chip {
  align-self: flex-start;
  font-size: calc(0.7rem * var(--scale, 1));
  font-weight: 500;
  color: var(--gold-dim);
  padding: calc(4px * var(--scale, 1)) calc(8px * var(--scale, 1));
  background: var(--bg-panel-2);
  border: var(--line-thickness) solid var(--line-color);
  border-radius: calc(4px * var(--scale, 1));
  white-space: nowrap;
  margin-top: calc(80px * var(--scale, 1));
}

/* Mobile layout — vertically stacked, each row wraps to 3-up. */
.mobile-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 8px;
}
.mobile-row {
  display: grid;
  grid-template-columns: repeat(var(--cards-per-row-mobile, 3), 1fr);
  gap: var(--card-spacing-mobile);
  width: 100%;
}
.player-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.player-label {
  font-size: 10px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--gold-dim);
  padding-left: 2px;
}
.hr-divider {
  height: var(--line-thickness);
  background: var(--line-color);
  margin: 6px 0;
}
</style>
