// useViewport — thin shim over Quasar's built-in $q.platform.is.mobile.
//
// Previously this was a homebrew detection system with width
// breakpoints, media-query checks, UA regex, localStorage overrides,
// and a kill switch. It was over-engineered and buggy. Quasar already
// solves this correctly — `Platform.is.mobile` is true only for real
// phone user agents. That's the contract we want.
//
// The shape of the returned object stays the same so callers don't
// have to change. `isMobile` is the only field anyone reads in
// practice; everything else is left as harmless stubs.

import { computed, ref } from 'vue';
import { Platform } from 'quasar';

const _alwaysFalse = ref(false);
const _stableBreakpoint = ref(600);

export function useViewport() {
  // Quasar's Platform.is.mobile is true for real mobile UAs. That's the
  // single source of truth we want.
  const isMobile = computed(() => !!Platform.is.mobile);

  return {
    // What we actually use anywhere:
    isMobile,

    // Backwards-compat stubs. Components that used to read these
    // still get sane non-mobile defaults.
    width:            ref(typeof window !== 'undefined' ? window.innerWidth  : 1024),
    height:           ref(typeof window !== 'undefined' ? window.innerHeight : 768),
    breakpoint:       _stableBreakpoint,
    mediaMobile:      _alwaysFalse,
    uaMobile:         isMobile,
    forceDesktop:     _alwaysFalse,
    mobileEnabled:    isMobile,
    naturallyMobile:  isMobile,
    setForceDesktop: () => {}
  };
}
