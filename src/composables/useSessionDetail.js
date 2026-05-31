// Global session-detail channel. Mirrors useEntityDetail: any
// component (session row, internal link inside a session, etc) can
// request the session panel to open. Maintains a back-stack so users
// can step back through previously opened sessions.
import { ref, computed } from 'vue';

const currentSession = ref(null);
const isOpen = ref(false);
const history = ref([]); // session objects visited before currentSession

export function useSessionDetail() {
  return {
    currentSession,
    isOpen,
    canGoBack: computed(() => history.value.length > 0),
    historyDepth: computed(() => history.value.length),
    open(session) {
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
    },
    back() {
      if (!history.value.length) return;
      const prev = history.value.pop();
      currentSession.value = prev;
      isOpen.value = true;
    },
    close() {
      isOpen.value = false;
      currentSession.value = null;
      history.value = [];
    }
  };
}
