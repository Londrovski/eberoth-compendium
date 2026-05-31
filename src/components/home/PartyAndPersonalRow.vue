<template>
  <section class="party-section" :style="sectionStyle">
    <div class="section-label">The Party &amp; Lore</div>

    <!--
      Desktop: party cards, then a divider, then personal/lore cards with group labels.
      Mobile: everything flows into one continuous grid — no dividers, no group chips.
      The v-if / class toggles are driven purely by CSS via .mobile-hide / .mobile-show.
    -->
    <div class="row-wrap">

      <!-- Party cards -->
      <PartyCard v-for="pc in players" :key="pc.id" :entity="pc" />

      <!-- Divider between party and personals — hidden on mobile -->
      <div v-if="hasAnyPersonals" class="divider mobile-hide" aria-hidden="true"></div>

      <template v-if="hasAnyPersonals">
        <!-- DM grouped view: player name chip + their personals -->
        <template v-if="showGroupedView">
          <template v-for="pc in players" :key="'g-' + pc.id">
            <template v-if="personalsOf(pc.id).length">
              <!-- group chip: hidden on mobile -->
              <div class="group-chip mobile-hide">{{ pc.short_name || pc.name }}:</div>
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

        <!-- Player's own personal cards (non-DM view) -->
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

      <!-- Divider before orphan lore — hidden on mobile -->
      <div v-if="orphanCards.length" class="divider mobile-hide" aria-hidden="true"></div>

      <!-- Orphan lore cards -->
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
import { swapPersonalOrder, swapEntitySortOrder } from 'src/api/reorder';
import PartyCard    from 'components/home/PartyCard.vue';
import PersonalCard from 'components/home/PersonalCard.vue';
import LoreCard     from 'components/home/LoreCard.vue';

const entities = useEntitiesStore();
const viewer   = useViewer();
const auth     = useAuthStore();
const layout   = useAppSettingsStore();

const showGroupedView = computed(() => viewer.isDM && !viewer.isViewingAs);
const players = computed(() =>
  [...entities.players].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
);
function personalsOf(playerId) { return entities.personalsOf(playerId); }
const ownPlayerId = computed(() => playerIdFromBucket(auth.effectiveBucket) || '');
const myPersonals = computed(() =>
  ownPlayerId.value ? entities.personalsOf(ownPlayerId.value) : []
);
const personalEntityIds = computed(() => {
  const set = new Set();
  if (showGroupedView.value) players.value.forEach(p => personalsOf(p.id).forEach(r => set.add(r.entity.id)));
  else myPersonals.value.forEach(r => set.add(r.entity.id));
  return set;
});
const factionMemberIds = computed(() => {
  const set = new Set();
  entities.memberships.forEach(m => set.add(m.entity_id));
  return set;
});
const orphanCards = computed(() =>
  entities.all
    .filter(e => e && (e.kind === 'lore' || e.kind === 'npc')
      && !personalEntityIds.value.has(e.id)
      && !(e.kind === 'npc' && factionMemberIds.value.has(e.id)))
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
);
const hasAnyPersonals = computed(() => {
  if (showGroupedView.value) {
    if (!layout.showPersonals) return false;
    return players.value.some(p => personalsOf(p.id).length > 0);
  }
  return myPersonals.value.length > 0;
});
const sectionStyle = computed(() => ({ '--scale': layout.cardScale }));

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
.section-label {
  font-size: var(--section-heading-size);
  letter-spacing: var(--section-heading-spacing);
  text-transform: uppercase;
  color: var(--section-heading-color);
  margin-bottom: calc(14px * var(--scale, 1));
}
.row-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: var(--card-spacing);
  align-items: flex-start;
}
/* Desktop vertical divider */
.divider {
  width: var(--line-thickness);
  align-self: stretch;
  background: var(--line-color);
  margin: 0 calc(8px * var(--scale, 1));
}
/* Desktop group label */
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

@media (max-width: 600px) {
  /* All cards in one continuous grid — no breaks, no labels */
  .row-wrap {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: var(--mobile-card-spacing, 6px);
  }
  /* Hide dividers and group chips entirely on mobile */
  .mobile-hide { display: none !important; }
}
</style>
