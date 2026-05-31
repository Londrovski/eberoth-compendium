<template>
  <div class="faction-column" :style="colStyle">
    <div class="faction-header" :class="visClass">
      <div class="header-main" @click="openFaction">
        <EntityAvatar :entity="faction" :size="headerSize" class="faction-avatar" />
        <div class="faction-name">{{ faction.short_name || faction.name }}</div>
      </div>
      <ReorderArrows
        v-if="viewer.isDM"
        :disable-up="isFirst"
        :disable-down="isLast"
        @up="$emit('move-up', faction.id)"
        @down="$emit('move-down', faction.id)"
      />
    </div>
    <div class="member-grid" v-if="members.length">
      <MemberCard
        v-for="(row, idx) in members"
        :key="row.entity.id"
        :entity="row.entity"
        :role="row.role"
        :faction-id="faction.id"
        :is-first="idx === 0"
        :is-last="idx === members.length - 1"
        @move-up="onMemberMoveUp(idx)"
        @move-down="onMemberMoveDown(idx)"
      />
    </div>
    <div class="empty" v-else>No members yet.</div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import EntityAvatar from 'components/shared/EntityAvatar.vue';
import MemberCard from 'components/home/MemberCard.vue';
import ReorderArrows from 'components/shared/ReorderArrows.vue';
import { useEntitiesStore } from 'src/stores/entities';
import { useAppSettingsStore } from 'src/stores/app-settings';
import { useViewer } from 'src/composables/useViewer';
import { useEntityDetail } from 'src/composables/useEntityDetail';
import { useVisibilityIndicator } from 'src/composables/useVisibilityIndicator';
import { swapMembershipOrder } from 'src/api/reorder';

const props = defineProps({
  faction: { type: Object, required: true },
  isFirst: { type: Boolean, default: false },
  isLast:  { type: Boolean, default: false }
});
defineEmits(['move-up', 'move-down']);

const entities = useEntitiesStore();
const layout   = useAppSettingsStore();
const viewer   = useViewer();
const detail   = useEntityDetail();
const visClass = useVisibilityIndicator(props.faction.id);

const members    = computed(() => entities.membersOf(props.faction.id));
// Desktop: avatar size driven by factionScale.
// Mobile: avatar size driven by --mobile-faction-header-scale (set by DmToolsMobile).
const headerSize = computed(() => Math.round(40 * layout.factionScale));
const colStyle   = computed(() => ({
  '--faction-scale':  layout.factionScale,
  '--scale':          layout.cardScale,
  '--cards-per-row':  layout.factionCardsPerRow || 2
}));

function openFaction() { detail.open(props.faction.id); }

async function onMemberMoveUp(idx) {
  if (idx <= 0) return;
  await swapMembershipOrder(props.faction.id,
    members.value[idx].entity.id, members.value[idx - 1].entity.id);
}
async function onMemberMoveDown(idx) {
  if (idx >= members.value.length - 1) return;
  await swapMembershipOrder(props.faction.id,
    members.value[idx].entity.id, members.value[idx + 1].entity.id);
}
</script>

<style scoped>
.faction-column {
  --col-pad-x: calc(14px * var(--scale, 1));
  --col-pad-y: calc(12px * var(--scale, 1));
  --inner-w: calc(
    var(--cards-per-row, 2) * var(--card-w, 180px)
    + (var(--cards-per-row, 2) - 1) * var(--card-spacing)
  );
  width: calc(var(--inner-w) + 2 * var(--col-pad-x) + 4px);
  flex: 0 0 auto;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: calc(12px * var(--scale, 1));
  background: var(--faction-box-bg);
  border: var(--line-thickness) solid var(--line-color);
  border-radius: 4px;
  padding: var(--col-pad-y) var(--col-pad-x);
  transition: background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}
.faction-column:has(.faction-header.vis-restricted) {
  background: var(--faction-box-bg-restricted);
  border-color: var(--blue);
  box-shadow: 0 0 calc(12px * var(--scale, 1)) rgba(74,107,145,0.30);
}
.faction-column:has(.faction-header.vis-dm-only) {
  background: var(--faction-box-bg-dm);
  border-color: var(--red);
  box-shadow: 0 0 calc(12px * var(--scale, 1)) rgba(139,58,58,0.35);
}

.faction-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: calc(10px * var(--faction-scale, 1));
  padding: calc(8px * var(--faction-scale, 1)) calc(10px * var(--faction-scale, 1));
  border-bottom: var(--line-thickness) solid var(--line-color);
  border-radius: calc(3px * var(--scale, 1));
  background: transparent;
  min-width: 0;
}
.faction-header.vis-restricted { background: #1f2c3a; border-bottom-color: var(--blue); }
.faction-header.vis-dm-only    { background: #3a1f1f; border-bottom-color: var(--red); }

.header-main {
  display: flex;
  align-items: center;
  gap: calc(10px * var(--faction-scale, 1));
  cursor: pointer;
  flex: 1 1 auto;
  min-width: 0;
}
.header-main:hover .faction-name { color: var(--gold-bright); }
.faction-avatar { flex: 0 0 auto; }
.faction-name {
  font-weight: 500;
  font-size: calc(1.05rem * var(--faction-scale, 1));
  color: var(--gold);
  line-height: 1.2;
  letter-spacing: 0.04em;
  flex: 1 1 auto;
  min-width: 0;
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: normal;
  hyphens: auto;
}

.member-grid {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: var(--card-spacing);
  align-items: flex-start;
  justify-content: flex-start;
}
.empty {
  font-size: calc(0.75rem * var(--scale, 1));
  color: var(--text-dim);
  font-style: italic;
  padding: calc(6px * var(--scale, 1)) calc(8px * var(--scale, 1));
}

/*
  Mobile overrides.
  --mobile-faction-header-scale controls the header size independently
  of the card grid. Defaults to 0.7 (smaller than desktop) but the DM
  can step it up/down via DmToolsMobile.
*/
@media (max-width: 600px) {
  .faction-column {
    width: 100% !important;
    min-width: unset !important;
    max-width: 100% !important;
    flex: 0 0 100%;
    gap: var(--mobile-card-spacing, 6px);
    padding: 8px;
  }

  /* Header: scale avatar, font, and padding by --mobile-faction-header-scale */
  .faction-header {
    gap:     calc(6px  * var(--mobile-faction-header-scale, 0.7));
    padding: calc(6px  * var(--mobile-faction-header-scale, 0.7))
             calc(8px  * var(--mobile-faction-header-scale, 0.7));
  }
  .faction-avatar :deep(img),
  .faction-avatar :deep(.entity-avatar) {
    width:  calc(40px * var(--mobile-faction-header-scale, 0.7)) !important;
    height: calc(40px * var(--mobile-faction-header-scale, 0.7)) !important;
  }
  .faction-name {
    font-size: calc(0.95rem * var(--mobile-faction-header-scale, 0.7)) !important;
  }

  /* Member grid */
  .member-grid {
    gap: var(--mobile-card-spacing, 6px);
  }
  .member-grid :deep(.member-card) {
    width: calc(
      (100% - (var(--mobile-faction-cols, 3) - 1) * var(--mobile-card-spacing, 6px))
      / var(--mobile-faction-cols, 3)
    ) !important;
    height: auto !important;
    flex-shrink: 0;
  }
  .member-grid :deep(.img-wrap) {
    position: relative !important;
    height: 0 !important;
    padding-bottom: var(--mobile-card-ratio, 133%) !important;
  }
  .member-grid :deep(.img-wrap .entity-avatar) {
    position: absolute !important;
    inset: 0 !important;
  }
  .member-grid :deep(.footer) {
    position: relative !important;
    min-height: unset !important;
    padding: 5px 6px !important;
  }
}
</style>
