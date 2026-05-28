<template>
  <div class="faction-column">
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
const headerSize = computed(() => Math.round(30 * layout.cardScale));

function openFaction() { detail.open(props.faction.id); }
</script>

<style scoped>
.faction-column {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.faction-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid #d8cfb8;
  cursor: pointer;
}
.faction-header:hover .faction-name { color: #6b4f2e; }
.faction-name {
  font-weight: 500;
  font-size: 0.95rem;
  color: #1f1b16;
  line-height: 1.2;
}
.member-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.empty {
  font-size: 0.7rem;
  color: #a89572;
  font-style: italic;
  padding: 6px 8px;
}
</style>
