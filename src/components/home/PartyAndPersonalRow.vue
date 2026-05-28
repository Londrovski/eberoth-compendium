<template>
  <section class="party-section">
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
import PartyCard from 'components/home/PartyCard.vue';
import PersonalCard from 'components/home/PersonalCard.vue';

const entities = useEntitiesStore();
const viewer   = useViewer();
const auth     = useAuthStore();

const BUCKET_TO_PLAYER = {
  baker:   'kalvorn',
  butcher: 'dirk',
  charlie: 'azrael'
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
  if (viewer.isDM.value) {
    return players.value.some(p => personalsOf(p.id).length > 0);
  }
  return myPersonals.value.length > 0;
});
</script>

<style scoped>
.party-section {
  padding: 12px 0 16px;
  border-bottom: 1px solid #d8cfb8;
}
.section-label {
  font-size: 0.7rem;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: #8a7148;
  margin-bottom: 10px;
}
.row-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
.divider {
  width: 1px;
  align-self: stretch;
  background: #d8cfb8;
  margin: 0 6px;
}
.group-chip {
  font-size: 0.7rem;
  font-weight: 500;
  color: #8a7148;
  padding: 4px 8px;
  background: #ede4d1;
  border-radius: 4px;
  white-space: nowrap;
}
</style>
