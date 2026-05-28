// Should this entity glow for the current viewer?
// Reactive — re-evaluates when bucket changes (View-As swap).
import { computed } from 'vue';
import { useEntitiesStore } from 'src/stores/entities';
import { useViewer } from 'src/composables/useViewer';

export function useGlow(entityIdRef) {
  const entities = useEntitiesStore();
  const { bucket } = useViewer();
  return computed(() => {
    const id = typeof entityIdRef === 'string' ? entityIdRef : entityIdRef?.value;
    if (!id || !bucket.value) return false;
    return entities.glowsFor(id, bucket.value);
  });
}
