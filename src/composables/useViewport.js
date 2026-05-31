// useViewport — reactive viewport state. Singleton so all consumers
// share one resize listener.
//
// isMobile is true when the window is at or below MOBILE_BREAKPOINT,
// OR when the DM has flipped the "Mobile preview" toggle in DM Tools
// (so the desktop browser can simulate mobile layout for tuning).
//
// 600px is the proper phone-only breakpoint — anything wider is a
// tablet or desktop and gets the full layout. The breakpoint was
// originally 700px to match the legacy NotesPage media query, but
// that was an internal layout concern, not a mobile/desktop split.

import { ref, computed, onScopeDispose } from 'vue';
import { useAppSettingsStore } from 'src/stores/app-settings';

export const MOBILE_BREAKPOINT = 600;

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
