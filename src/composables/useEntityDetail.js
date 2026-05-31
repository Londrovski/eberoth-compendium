// Tiny global event channel so any card can request the detail panel
// to open without prop-drilling. The DetailPanel listens.
//
// Now also maintains a back-stack so when a user follows an internal
// link inside the panel (e.g. clicks a faction chip), they can step
// back to the previous entity. The current entity is *not* in the
// stack — the stack holds the breadcrumb behind it.
import { ref, computed } from 'vue';
import { track } from 'src/composables/useUsageTracker';

const currentEntityId = ref(null);
const isOpen = ref(false);
const history = ref([]); // ids visited before currentEntityId

export function useEntityDetail() {
  return {
    currentEntityId,
    isOpen,
    canGoBack: computed(() => history.value.length > 0),
    historyDepth: computed(() => history.value.length),
    open(id, source) {
      if (isOpen.value && currentEntityId.value && currentEntityId.value !== id) {
        history.value.push(currentEntityId.value);
      }
      currentEntityId.value = id;
      isOpen.value = true;
      track('entity_open', id, { source: source || 'unknown' });
    },
    back() {
      if (!history.value.length) return;
      const prev = history.value.pop();
      currentEntityId.value = prev;
      isOpen.value = true;
      track('entity_open', prev, { source: 'back' });
    },
    close() {
      isOpen.value = false;
      currentEntityId.value = null;
      history.value = [];
    }
  };
}
