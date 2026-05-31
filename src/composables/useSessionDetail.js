// Global session-detail channel. Mirrors useEntityDetail.
import { ref, computed } from 'vue';
import { track } from 'src/composables/useUsageTracker';

const currentSession = ref(null);
const isOpen = ref(false);
const history = ref([]);

export function useSessionDetail() {
  return {
    currentSession,
    isOpen,
    canGoBack: computed(() => history.value.length > 0),
    historyDepth: computed(() => history.value.length),
    open(session, source) {
      if (!session) return;
      if (
        isOpen.value &&
        currentSession.value &&
        currentSession.value.id !== session.id
      ) {
        history.value.push(currentSession.value);
      }
      currentSession.value = session;
      isOpen.value = true;
      track('session_open', session.id, {
        source: source || 'unknown',
        number: session.number
      });
    },
    back() {
      if (!history.value.length) return;
      const prev = history.value.pop();
      currentSession.value = prev;
      isOpen.value = true;
      track('session_open', prev?.id, { source: 'back' });
    },
    close() {
      isOpen.value = false;
      currentSession.value = null;
      history.value = [];
    }
  };
}
