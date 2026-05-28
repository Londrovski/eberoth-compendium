<template>
  <section class="party-section" :style="sectionStyle">
    <div class="section-label">The Party &amp; Personal</div>
    <div class="row-wrap">
      <PartyCard v-for="pc in players" :key="pc.id" :entity="pc" />

      <template v-if="hasAnyPersonals">
        <div class="divider" aria-hidden="true"></div>

        <template v-if="viewer.isDM">
          <template v-for="pc in players" :key="'g-' + pc.id">
            <template v-if="personalsOf(pc.id).length">
              <div class="group-chip">{{ pc.short_name || pc.name }}:</div>
              <PersonalCard
                v-for="row in personalsOf(pc.id)"
                :key="pc.id + '-' + row.entity.id"
                :entity="row.entity"
                :relationship="row.relationship"
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
import { useLayoutStore } from 'src/stores/layout';
import PartyCard from 'components/home/PartyCard.vue';
import PersonalCard from 'components/home/PersonalCard.vue';

const entities = useEntitiesStore();
const viewer   = useViewer();
const auth     = useAuthStore();
const layout   = useLayoutStore();

const BUCKET_TO_PLAYER = {
  baker:   'kalvorn',
  butcher: 'azrael',
  charlie: 'dirk'
};

const players = computed(() =>
  [...entities.players].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
);

function personalsOf(playerId) { return entities.personalsOf(playerId); }

const myPersonals = computed(() => {
  const bucket = auth.effectiveBucket;
  const pid = BUCKET_TO_PLAYER[bucket];
  if (!pid) return [];
  return entities.personalsOf(pid);
});

const hasAnyPersonals = computed(() => {
  if (viewer.isDM) {
    return players.value.some(p => personalsOf(p.id).length > 0);
  }
  return myPersonals.value.length > 0;
});

const sectionStyle = computed(() => ({
  '--scale': layout.cardScale
}));
</script>

<style scoped>
.party-section {
  padding: calc(12px * var(--scale, 1)) 0 calc(16px * var(--scale, 1));
  border-bottom: 1px solid #d8cfb8;
}
.section-label {
  font-size: calc(0.75rem * var(--scale, 1));
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: #8a7148;
  margin-bottom: calc(10px * var(--scale, 1));
}
.row-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: calc(8px * var(--scale, 1));
  align-items: center;
}
.divider {
  width: 1px;
  align-self: stretch;
  background: #d8cfb8;
  margin: 0 calc(6px * var(--scale, 1));
}
.group-chip {
  font-size: calc(0.75rem * var(--scale, 1));
  font-weight: 500;
  color: #8a7148;
  padding: calc(4px * var(--scale, 1)) calc(8px * var(--scale, 1));
  background: #ede4d1;
  border-radius: calc(4px * var(--scale, 1));
  white-space: nowrap;
}
</style>
