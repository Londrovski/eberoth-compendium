<template>
  <div class="faction-column" :style="colStyle">
    <div class="faction-header" :class="visClass">
      <div class="header-main" @click="openFaction">
        <EntityAvatar :entity="faction" :size="headerSize" />
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

const members = computed(() => entities.membersOf(props.faction.id));
const headerSize = computed(() => Math.round(40 * layout.factionScale));
const colStyle = computed(() => ({
  '--faction-scale': layout.factionScale,
  '--scale': layout.cardScale
}));

function openFaction() { detail.open(props.faction.id); }

async function onMemberMoveUp(idx) {
  if (idx <= 0) return;
  const a = members.value[idx].entity.id;
  const b = members.value[idx - 1].entity.id;
  await swapMembershipOrder(props.faction.id, a, b);
}
async function onMemberMoveDown(idx) {
  if (idx >= members.value.length - 1) return;
  const a = members.value[idx].entity.id;
  const b = members.value[idx + 1].entity.id;
  await swapMembershipOrder(props.faction.id, a, b);
}
</script>

<style scoped>
/*
  Faction-column width hugs one member card:
    width = card width (--card-w) + 2 * horizontal padding.
  The column scales with cardScale via the padding terms and --card-w
  itself, so making cards smaller naturally makes columns thinner.

  Members inside stack vertically (member-grid is a flex column) — the
  row-level packing happens at the FactionsGrid layer.
*/
.faction-column {
  --col-pad-x: calc(14px * var(--scale, 1));
  --col-pad-y: calc(12px * var(--scale, 1));
  width: calc(var(--card-w, 180px) + 2 * var(--col-pad-x));
  flex: 0 0 auto;
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
}

.faction-header.vis-restricted {
  background: #1f2c3a;
  border-bottom-color: var(--blue);
}
.faction-header.vis-dm-only {
  background: #3a1f1f;
  border-bottom-color: var(--red);
}

.header-main {
  display: flex;
  align-items: center;
  gap: calc(10px * var(--faction-scale, 1));
  cursor: pointer;
  flex: 1;
  min-width: 0;
}
.header-main:hover .faction-name { color: var(--gold-bright); }
.faction-name {
  font-weight: 500;
  font-size: calc(1.1rem * var(--faction-scale, 1));
  color: var(--gold);
  line-height: 1.2;
  letter-spacing: 0.04em;
}
.member-grid {
  display: flex;
  flex-direction: column;
  gap: var(--card-spacing);
  align-items: stretch;
}
.empty {
  font-size: calc(0.75rem * var(--scale, 1));
  color: var(--text-dim);
  font-style: italic;
  padding: calc(6px * var(--scale, 1)) calc(8px * var(--scale, 1));
}
</style>
