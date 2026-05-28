// Reactive viewer info. Returns computeds — components import and
// dereference .value in <script>, or use viewer.isDM in templates
// (the returned object is reactive so Vue auto-unwraps).
//
// NOTE: previously returned a plain object whose properties were
// computeds. Template usage like `v-if="viewer.isDM"` was always
// truthy because the computed object itself is truthy. Now using
// reactive() so Vue auto-unwraps the inner computed values.

import { computed, reactive } from 'vue';
import { useAuthStore } from 'src/stores/auth';

export function useViewer() {
  const auth = useAuthStore();
  return reactive({
    bucket:        computed(() => auth.effectiveBucket),
    actualBucket:  computed(() => auth.actualBucket),
    isDM:          computed(() => auth.isDM),
    isViewingAs:   computed(() => auth.isViewingAs)
  });
}
