// useViewport — reactive viewport state.
//
// 2026-05-31 final form after a long debugging session: mobile mode
// is DISABLED by default. The DM has to explicitly enable it via
// app_settings.mobile_layout.enabled. This stops any layered
// detection bug from accidentally tripping mobile mode on a desktop
// — and there were several over the day.
//
// When enabled, the detection model is intentionally extremely
// conservative:
//   1. innerWidth < 500 (true phones only, no desktop window can
//      sanely be that narrow), OR
//   2. (pointer: coarse) AND (hover: none), OR
//   3. mobile UA regex.
//
// Force-desktop overrides everything regardless.

import { ref, computed, onScopeDispose } from 'vue';
import { useAppSettingsStore } from 'src/stores/app-settings';

let _state = null;

const MOBILE_UA_RE = /Mobi|Android|iPhone|iPad|iPod|Mobile Safari|webOS|BlackBerry|Opera Mini|IEMobile/i;
const FORCE_KEY = 'eb_force_desktop';
const SAFE_WIDTH_THRESHOLD = 500;

function detectMobileUA() {
  if (typeof navigator === 'undefined') return false;
  return MOBILE_UA_RE.test(navigator.userAgent || '');
}

function detectMobileMedia() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  try {
    return window.matchMedia('(pointer: coarse)').matches
        && window.matchMedia('(hover: none)').matches;
  } catch {
    return false;
  }
}

function readForceDesktop() {
  if (typeof window === 'undefined') return false;
  try {
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

  // Conservative natural-mobile detection. ALL three signals plus
  // safe-width fallback.
  const naturallyMobile = computed(() => {
    // True phone width — even cosmically small desktop windows
    // shouldn't go below this.
    if (s.innerWidth.value <= SAFE_WIDTH_THRESHOLD) return true;
    if (s.mediaMobile.value) return true;
    if (s.uaMobile.value) return true;
    return false;
  });

  const breakpoint = computed(() => settings.mobile?.breakpoint ?? 600);

  // Kill switch — mobile mode entirely off unless the DM enables it.
  const mobileEnabled = computed(() => settings.mobile?.enabled === true);

  const isMobile = computed(() => {
    if (s.forceDesktop.value) return false;
    if (!mobileEnabled.value) return false;  // kill switch.
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

  onScopeDispose(() => { /* singleton */ });

  return {
    width:           s.innerWidth,
    height:          s.innerHeight,
    breakpoint,
    mediaMobile:     s.mediaMobile,
    uaMobile:        s.uaMobile,
    forceDesktop:    s.forceDesktop,
    mobileEnabled,
    setForceDesktop,
    naturallyMobile,
    isMobile
  };
}
