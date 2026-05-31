// useViewport — reactive viewport state. Singleton so all consumers
// share one resize listener.
//
// isMobile is true when the window is at or below the active breakpoint,
// OR when the DM has flipped the "Preview mobile" toggle in DM Tools
// (so the desktop browser can simulate mobile layout for tuning).
//
// The breakpoint itself is DM-tunable via app_settings.mobile_layout
// (key: `breakpoint`). Default 600 — true phone-only. Anything wider
// is tablet/laptop/desktop and keeps the full layout.

import { ref, computed, onScopeDispose } from 'vue';
import { useAppSettingsStore } from 'src/stores/app-settings';

export const DEFAULT_MOBILE_BREAKPOINT = 600;

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

  const breakpoint = computed(() => {
    const v = settings.mobile?.breakpoint;
    return typeof v === 'number' && v > 0 ? v : DEFAULT_MOBILE_BREAKPOINT;
  });

  const naturallyMobile = computed(() => s.innerWidth.value <= breakpoint.value);
  const isMobile = computed(() => naturallyMobile.value || !!settings.mobilePreviewForce);

  onScopeDispose(() => {
    // Keep the singleton listener alive across the app lifetime.
  });

  return {
    width:           s.innerWidth,
    height:          s.innerHeight,
    breakpoint,
    naturallyMobile,
    isMobile
  };
}
