<template>
  <q-dialog
    v-model="open"
    position="right"
    :maximized="$q.screen.lt.sm"
    :seamless="false"
    transition-show="slide-left"
    transition-hide="slide-right"
  >
    <q-card class="detail-card column">
      <DetailHeader
        :entity="entity"
        :editing="editing"
        @close="close"
        @edit="onEdit"
        @cancel-edit="onCancelEdit"
      />

      <q-scroll-area class="col">
        <DetailEditForm
          v-if="editing && entity"
          :entity="entity"
          @cancel="onCancelEdit"
          @saved="onSaved"
        />

        <div class="q-pa-md" v-else-if="entity">
          <DetailIdentity :entity="entity" />
          <DetailMemberships :entity="entity" v-if="memberships.length" :memberships="memberships" />
          <DetailPersonalTo :entity="entity" v-if="personalTo" :personal-to="personalTo" />
          <DetailBody :entity="entity" />
          <DetailFacts :facts="entity.facts" v-if="entity.facts && entity.facts.length" />
          <DetailNotes :entity-id="entity.id" />
        </div>

        <div v-else class="q-pa-xl text-center text-grey-7">
          <q-spinner size="32px" v-if="isOpenRef" />
        </div>
      </q-scroll-area>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useEntitiesStore } from 'src/stores/entities';
import { useEntityDetail } from 'src/composables/useEntityDetail';
import DetailHeader from 'components/detail/DetailHeader.vue';
import DetailIdentity from 'components/detail/DetailIdentity.vue';
import DetailMemberships from 'components/detail/DetailMemberships.vue';
import DetailPersonalTo from 'components/detail/DetailPersonalTo.vue';
import DetailBody from 'components/detail/DetailBody.vue';
import DetailFacts from 'components/detail/DetailFacts.vue';
import DetailNotes from 'components/detail/DetailNotes.vue';
import DetailEditForm from 'components/detail/DetailEditForm.vue';

const entities = useEntitiesStore();
const detail   = useEntityDetail();

const isOpenRef = detail.isOpen;
const currentIdRef = detail.currentEntityId;

const editing = ref(false);

const open = computed({
  get: () => isOpenRef.value,
  set: (v) => { if (!v) close(); }
});

const entity = computed(() =>
  currentIdRef.value ? entities.byId[currentIdRef.value] : null
);

watch(currentIdRef, () => { editing.value = false; });

const memberships = computed(() => {
  if (!entity.value) return [];
  return entities.memberships
    .filter(m => m.entity_id === entity.value.id)
    .map(m => ({ faction: entities.byId[m.faction_id], role: m.role }))
    .filter(x => x.faction);
});

const personalTo = computed(() => {
  if (!entity.value) return null;
  const row = entities.personals.find(p => p.entity_id === entity.value.id);
  if (!row) return null;
  const player = entities.byId[row.player_id];
  if (!player) return null;
  return { player, relationship: row.relationship };
});

function close() {
  detail.close();
  editing.value = false;
}
function onEdit()       { editing.value = true; }
function onCancelEdit() { editing.value = false; }
function onSaved()      { editing.value = false; }
</script>

<style scoped>
.detail-card {
  width: 520px;
  max-width: 100vw;
  height: 100vh;
  background: #fdfaf2;
  color: #1f1b16;
}
@media (max-width: 600px) {
  .detail-card { width: 100vw; }
}
</style>
