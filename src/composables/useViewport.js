// useViewport — reactive viewport state. Singleton so all consumers
// share one resize listener.
//
// Mobile detection model:
//   1. Pointer/hover media queries — `(pointer: coarse)` + `(hover: none)`.
//      This is the most reliable signal. Real phones match both.
//   2. UA regex — belt-and-braces.
//   3. localStorage `eb_force_desktop` — if "1", never go mobile.
//      Escape hatch in case detection ever misfires again.
//   4. URL `?desktop=1` query string — same behaviour, one-shot.
//      Sets the localStorage flag so it sticks across reloads.
//   5. `settings.mobilePreviewForce` — DM forces mobile for tuning.

import { ref, computed, onScopeDispose } from 'vue';
import { useAppSettingsStore } from 'src/stores/app-settings';

let _state = null;

const MOBILE_UA_RE = /Mobi|Android|iPhone|iPad|iPod|Mobile Safari|webOS|BlackBerry|Opera Mini|IEMobile/i;
const FORCE_KEY = 'eb_force_desktop';

function detectMobileUA() {
  if (typeof navigator === 'undefined') return false;
  return MOBILE_UA_RE.test(navigator.userAgent || '');
}

function detectMobileMedia() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  try {
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const noHover = window.matchMedia('(hover: none)').matches;
    return coarse && noHover;
  } catch {
    return false;
  }
}

function readForceDesktop() {
  if (typeof window === 'undefined') return false;
  try {
    // Honour ?desktop=1 in the URL and persist it.
    const u = new URL(window.location.href);
    if (u.searchParams.get('desktop') === '1') {
      window.localStorage.setItem(FORCE_KEY, '1');
    }
    if (u.searchParams.get('desktop') === '0') {
      window.localStorage.removeItem(FORCE_KEY);
    }
    return window.localStorage.getItem(FORCE_KEY) === '1';
  } catch {
    return false;
  }
}

function ensureState() {
  if (_state) return _state;
  const innerWidth   = ref(typeof window === 'undefined' ? 1024 : window.innerWidth);
  const innerHeight  = ref(typeof window === 'undefined' ? 768  : window.innerHeight);
  const mediaMobile  = ref(detectMobileMedia());
  const uaMobile     = ref(detectMobileUA());
  const forceDesktop = ref(readForceDesktop());

  function onResize() {
    innerWidth.value = window.innerWidth;
    innerHeight.value = window.innerHeight;
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('resize', onResize, { passive: true });
    try {
      const coarse  = window.matchMedia('(pointer: coarse)');
      const noHover = window.matchMedia('(hover: none)');
      const update = () => { mediaMobile.value = detectMobileMedia(); };
      coarse.addEventListener?.('change', update);
      noHover.addEventListener?.('change', update);
    } catch { /* ignore */ }

    // Expose a console-callable escape hatch:
    //   __ebForceDesktop(true)  to lock desktop mode.
    //   __ebForceDesktop(false) to release.
    window.__ebForceDesktop = (v) => {
      try {
        if (v) window.localStorage.setItem(FORCE_KEY, '1');
        else window.localStorage.removeItem(FORCE_KEY);
        forceDesktop.value = !!v;
      } catch {}
      return forceDesktop.value;
    };
  }

  _state = { innerWidth, innerHeight, mediaMobile, uaMobile, forceDesktop };
  return _state;
}

export function useViewport() {
  const s = ensureState();
  const settings = useAppSettingsStore();

  const naturallyMobile = computed(() => s.mediaMobile.value || s.uaMobile.value);

  const breakpoint = computed(() => settings.mobile?.breakpoint ?? 600);

  // The verdict.
  // Force-desktop wins over everything including DM preview.
  const isMobile = computed(() => {
    if (s.forceDesktop.value) return false;
    return naturallyMobile.value || !!settings.mobilePreviewForce;
  });

  function setForceDesktop(v) {
    if (typeof window === 'undefined') return;
    try {
      if (v) window.localStorage.setItem(FORCE_KEY, '1');
      else window.localStorage.removeItem(FORCE_KEY);
      s.forceDesktop.value = !!v;
    } catch {}
  }

  onScopeDispose(() => {
    // Singleton listener stays alive for the app lifetime.
  });

  return {
    width:           s.innerWidth,
    height:          s.innerHeight,
    breakpoint,
    mediaMobile:     s.mediaMobile,
    uaMobile:        s.uaMobile,
    forceDesktop:    s.forceDesktop,
    setForceDesktop,
    naturallyMobile,
    isMobile
  };
}
