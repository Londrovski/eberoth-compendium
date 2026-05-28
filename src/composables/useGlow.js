// Should this entity glow for the current viewer?
// Reactive — re-evaluates when bucket changes (View-As swap).
//
// Glow rules (in entities store glowsFor):
//   - entity is tagged for this viewer (entity_player_tag), OR
//   - entity IS the player whose bucket = current viewer (own PC), OR
//   - entity is personal to the player whose bucket = current viewer.
import { computed, unref } from 'vue';
import { useEntitiesStore } from 'src/stores/entities';
import { useViewer } from 'src/composables/useViewer';

export function useGlow(entityIdRef) {
  const entities = useEntitiesStore();
  const viewer = useViewer();
  return computed(() => {
    const id = typeof entityIdRef === 'string' ? entityIdRef : unref(entityIdRef);
    const bucket = viewer.bucket;
    if (!id || !bucket) return false;
    return entities.glowsFor(id, bucket);
  });
}
