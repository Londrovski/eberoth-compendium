// useViewport — harmless stub returning isMobile=false.
// The mobile responsive layer was rolled back. This file remains
// only so any leftover import doesn't break the build.

import { ref, computed } from 'vue';

const _false = ref(false);

export function useViewport() {
  return {
    isMobile:        computed(() => false),
    width:           ref(typeof window !== 'undefined' ? window.innerWidth  : 1024),
    height:          ref(typeof window !== 'undefined' ? window.innerHeight : 768),
    breakpoint:      ref(600),
    mediaMobile:     _false,
    uaMobile:        _false,
    forceDesktop:    _false,
    mobileEnabled:   _false,
    naturallyMobile: _false,
    setForceDesktop: () => {}
  };
}
