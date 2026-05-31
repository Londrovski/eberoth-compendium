// useViewport — reactive viewport state. Singleton so all consumers
// share one resize listener.
//
// isMobile is true when the window is at or below MOBILE_BREAKPOINT,
// OR when the DM has flipped the "Mobile preview" toggle in DM Tools
// (so the desktop browser can simulate mobile layout for tuning).
//
// The mobile-preview override reads from the app-settings store, so
// flipping it on a desktop instantly re-flows the layout without a
// resize event.

import { ref, computed, onScopeDispose } from 'vue';
import { useAppSettingsStore } from 'src/stores/app-settings';

export const MOBILE_BREAKPOINT = 700;

let _state = null;

function ensureState() {
  if (_state) return _state;
  const innerWidth = ref(typeof window === 'undefined' ? 1024 : window.innerWidth);
  const innerHeight = ref(typeof window === 'undefined' ? 768 : window.innerHeight);

  function onResize() {
    innerWidth.value = window.innerWidth;
    innerHeight.value = window.innerHeight;
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', onResize, { passive: true });
  }

  _state = { innerWidth, innerHeight, onResize };
  return _state;
}

export function useViewport() {
  const s = ensureState();
  const settings = useAppSettingsStore();

  const naturallyMobile = computed(() => s.innerWidth.value <= MOBILE_BREAKPOINT);
  const isMobile = computed(() => naturallyMobile.value || !!settings.mobilePreviewForce);

  onScopeDispose(() => {
    // Keep the singleton listener alive across the app lifetime.
  });

  return {
    width:           s.innerWidth,
    height:          s.innerHeight,
    naturallyMobile,
    isMobile
  };
}
