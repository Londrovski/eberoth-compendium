<template>
  <q-dialog :model-value="true" persistent @hide="$emit('close')">
    <q-card style="min-width: 380px; max-width: 95vw;">
      <q-card-section>
        <div class="text-h6">{{ title }}</div>
        <div class="text-caption text-grey-7">
          Creates with DM-only visibility. Open the detail panel to set
          visibility, memberships and per-player content.
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none q-gutter-sm column">
        <q-input
          v-model="name"
          label="Name"
          dense filled autofocus
          @update:model-value="onNameInput"
        />
        <q-input
          v-model="id"
          label="ID (kebab-case, must be unique)"
          dense filled
          hint="Auto-generated from name. You can override."
        />
        <q-input
          v-model="sub"
          label="Subtitle / role-line (optional)"
          dense filled
        />
        <q-input
          v-model="image"
          :label="kind === 'faction' ? 'Sigil filename (optional)' : 'Portrait filename (optional)'"
          dense filled
          hint="e.g. House Foo.png"
        />
        <div v-if="error" class="text-negative q-mt-xs">{{ error }}</div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" @click="$emit('close')" />
        <q-btn
          color="primary"
          label="Create"
          :loading="saving"
          :disable="!canCreate"
          @click="onCreate"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useEntityDetail } from 'src/composables/useEntityDetail';
import { useEntitiesStore } from 'src/stores/entities';
import { createEntity, suggestId } from 'src/api/entities-create';

const props = defineProps({
  kind: { type: String, required: true } // 'faction' | 'npc' | 'lore'
});
const emit = defineEmits(['close']);

const $q       = useQuasar();
const detail   = useEntityDetail();
const entities = useEntitiesStore();

const KIND_LABEL = {
  faction: 'New faction',
  npc:     'New NPC',
  lore:    'New lore'
};
const title = computed(() => KIND_LABEL[props.kind] || 'New entity');

const name  = ref('');
const id    = ref('');
const sub   = ref('');
const image = ref('');
const saving = ref(false);
const error  = ref(null);

// Auto-fill id from name only while the user hasn't manually edited id.
let idTouched = false;
function onNameInput(v) {
  if (!idTouched) id.value = suggestId(v);
}
function onIdInput() { idTouched = true; }

const canCreate = computed(() => name.value.trim() && id.value.trim());

async function onCreate() {
  if (!canCreate.value) return;
  saving.value = true;
  error.value = null;
  try {
    const newId = await createEntity({
      id: id.value.trim(),
      kind: props.kind,
      name: name.value.trim(),
      sub: sub.value.trim() || null,
      image: image.value.trim() || null
    });
    // Refresh the store so the new row appears (Realtime would catch
    // it too, but force it for immediate UI consistency).
    await entities.load();
    $q.notify({ type: 'positive', message: 'Created — set visibility next.' });
    detail.open(newId);
    emit('close');
  } catch (e) {
    error.value = e.message || String(e);
  } finally {
    saving.value = false;
  }
}
</script>
