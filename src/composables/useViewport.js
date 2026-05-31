// useViewport — reactive viewport state. Singleton so all consumers
// share one resize listener.
//
// Mobile detection model (rewritten 2026-05-31):
//
// Width-based detection is unreliable. A desktop window dragged
// narrow looks identical to a tablet. Modern browsers expose far
// better signals via media queries:
//
//   (pointer: coarse)  — the primary pointing device is imprecise
//                        (finger). Mice are "fine".
//   (hover: none)      — the primary input cannot hover.
//
// Real phones and most tablets match BOTH. Desktops and laptops
// (even touchscreens with a primary mouse) match NEITHER.
//
// We also UA-sniff as a belt-and-braces fallback for cases where
// the browser misreports media queries.
//
// The DM can still force mobile mode for tuning via
// settings.mobilePreviewForce.

import { ref, computed, onScopeDispose } from 'vue';
import { useAppSettingsStore } from 'src/stores/app-settings';

let _state = null;

const MOBILE_UA_RE = /Mobi|Android|iPhone|iPad|iPod|Mobile Safari|webOS|BlackBerry|Opera Mini|IEMobile/i;

function detectMobileUA() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return MOBILE_UA_RE.test(ua);
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

function ensureState() {
  if (_state) return _state;
  const innerWidth  = ref(typeof window === 'undefined' ? 1024 : window.innerWidth);
  const innerHeight = ref(typeof window === 'undefined' ? 768  : window.innerHeight);
  const mediaMobile = ref(detectMobileMedia());
  const uaMobile    = ref(detectMobileUA());

  function onResize() {
    innerWidth.value  = window.innerWidth;
    innerHeight.value = window.innerHeight;
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('resize', onResize, { passive: true });

    // Re-evaluate the media queries on change (devices with
    // detachable keyboards, screen mirroring, etc).
    try {
      const coarse  = window.matchMedia('(pointer: coarse)');
      const noHover = window.matchMedia('(hover: none)');
      const update = () => { mediaMobile.value = detectMobileMedia(); };
      coarse.addEventListener?.('change', update);
      noHover.addEventListener?.('change', update);
    } catch { /* ignore */ }
  }

  _state = { innerWidth, innerHeight, mediaMobile, uaMobile };
  return _state;
}

export function useViewport() {
  const s = ensureState();
  const settings = useAppSettingsStore();

  // Real mobile = pointer/hover media query matches, OR the UA
  // explicitly says mobile. Width never enters this decision.
  const naturallyMobile = computed(() => s.mediaMobile.value || s.uaMobile.value);

  // For backwards-compat with components that read `breakpoint` from
  // the viewport — keep the value visible but disconnect it from the
  // verdict. It's now informational only.
  const breakpoint = computed(() => settings.mobile?.breakpoint ?? 600);

  const isMobile = computed(() => naturallyMobile.value || !!settings.mobilePreviewForce);

  onScopeDispose(() => {
    // Singleton listener stays alive for the app lifetime.
  });

  return {
    width:           s.innerWidth,
    height:          s.innerHeight,
    breakpoint,
    mediaMobile:     s.mediaMobile,
    uaMobile:        s.uaMobile,
    naturallyMobile,
    isMobile
  };
}
