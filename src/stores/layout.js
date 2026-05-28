// Back-compat shim. The store moved to src/stores/app-settings.js.
// Anything still importing useLayoutStore from here keeps working.
export { useAppSettingsStore, useLayoutStore } from 'src/stores/app-settings';
