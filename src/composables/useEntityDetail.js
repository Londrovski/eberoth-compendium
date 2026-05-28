// Tiny global event channel so any card can request the detail panel
// to open without prop-drilling. The DetailPanel listens.
import { ref } from 'vue';

const currentEntityId = ref(null);
const isOpen = ref(false);

export function useEntityDetail() {
  return {
    currentEntityId,
    isOpen,
    open(id) {
      currentEntityId.value = id;
      isOpen.value = true;
    },
    close() {
      isOpen.value = false;
      currentEntityId.value = null;
    }
  };
}
