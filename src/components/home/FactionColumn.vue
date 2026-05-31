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
.faction-column {
  display: flex;
  flex-direction: column;
  gap: calc(12px * var(--scale, 1));
  background: var(--bg-panel);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: calc(12px * var(--scale, 1)) calc(14px * var(--scale, 1));
}
.faction-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: calc(10px * var(--faction-scale, 1));
  padding-bottom: calc(10px * var(--faction-scale, 1));
  border-bottom: 1px solid var(--border);
}

.faction-header.vis-restricted {
  border-bottom-color: var(--blue);
}
.faction-header.vis-dm-only {
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
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: calc(10px * var(--scale, 1));
}
@media (max-width: 500px) {
  .member-grid { grid-template-columns: 1fr; }
}
.empty {
  font-size: calc(0.75rem * var(--scale, 1));
  color: var(--text-dim);
  font-style: italic;
  padding: calc(6px * var(--scale, 1)) calc(8px * var(--scale, 1));
}
</style>
