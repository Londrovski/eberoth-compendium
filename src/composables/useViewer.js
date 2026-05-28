// Reactive viewer info for any component that needs to render
// viewer-aware UI without coupling to the auth store directly.
import { computed } from 'vue';
import { useAuthStore } from 'src/stores/auth';

export function useViewer() {
  const auth = useAuthStore();
  return {
    bucket:        computed(() => auth.effectiveBucket),
    actualBucket:  computed(() => auth.actualBucket),
    isDM:          computed(() => auth.isDM),
    isViewingAs:   computed(() => auth.isViewingAs)
  };
}
