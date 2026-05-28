<template>
  <div class="faction-column" :style="colStyle">
    <div class="faction-header" @click="openFaction">
      <EntityAvatar :entity="faction" :size="headerSize" />
      <div class="faction-name">{{ faction.short_name || faction.name }}</div>
    </div>
    <div class="member-list" v-if="members.length">
      <MemberCard
        v-for="row in members"
        :key="row.entity.id"
        :entity="row.entity"
        :role="row.role"
        :faction-id="faction.id"
      />
    </div>
    <div class="empty" v-else>No members yet.</div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import EntityAvatar from 'components/shared/EntityAvatar.vue';
import MemberCard from 'components/home/MemberCard.vue';
import { useEntitiesStore } from 'src/stores/entities';
import { useLayoutStore } from 'src/stores/layout';
import { useEntityDetail } from 'src/composables/useEntityDetail';

const props = defineProps({
  faction: { type: Object, required: true }
});

const entities = useEntitiesStore();
const layout   = useLayoutStore();
const detail   = useEntityDetail();

const members = computed(() => entities.membersOf(props.faction.id));
const headerSize = computed(() => Math.round(30 * layout.factionScale));
const colStyle = computed(() => ({
  '--faction-scale': layout.factionScale,
  '--scale': layout.cardScale
}));

function openFaction() { detail.open(props.faction.id); }
</script>

<style scoped>
.faction-column {
  display: flex;
  flex-direction: column;
  gap: calc(8px * var(--scale, 1));
}
.faction-header {
  display: flex;
  align-items: center;
  gap: calc(8px * var(--faction-scale, 1));
  padding-bottom: calc(6px * var(--faction-scale, 1));
  border-bottom: 1px solid #d8cfb8;
  cursor: pointer;
}
.faction-header:hover .faction-name { color: #6b4f2e; }
.faction-name {
  font-weight: 500;
  font-size: calc(0.95rem * var(--faction-scale, 1));
  color: #1f1b16;
  line-height: 1.2;
}
.member-list {
  display: flex;
  flex-direction: column;
  gap: calc(6px * var(--scale, 1));
}
.empty {
  font-size: calc(0.75rem * var(--scale, 1));
  color: #a89572;
  font-style: italic;
  padding: calc(6px * var(--scale, 1)) calc(8px * var(--scale, 1));
}
</style>
