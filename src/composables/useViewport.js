// useViewport — matchMedia-based mobile detection.
// Uses the CSS layout viewport engine, NOT window.innerWidth, so it
// never fires incorrectly in DevTools or when the browser window is
// narrowed on a desktop monitor.
//
// A phone at 390px CSS width → isMobile = true
// A desktop at 1440px         → isMobile = false
// DevTools responsive mode     → follows actual simulated width correctly

import { ref, computed, onMounted, onUnmounted } from 'vue';

const BREAKPOINT = 600; // px — phones only, matches Quasar xs/sm boundary

export function useViewport() {
  const isMobile = ref(false);
  let mq = null;

  function update(e) {
    isMobile.value = e.matches;
  }

  onMounted(() => {
    if (typeof window === 'undefined') return;
    mq = window.matchMedia(`(max-width: ${BREAKPOINT}px)`);
    isMobile.value = mq.matches;
    mq.addEventListener('change', update);
  });

  onUnmounted(() => {
    mq?.removeEventListener('change', update);
  });

  return {
    isMobile: computed(() => isMobile.value)
  };
}
