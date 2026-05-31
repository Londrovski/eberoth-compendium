// Per-user UI preferences. Server-backed via user_prefs table, one
// row per JWT email. Keeps a single jsonb blob so new prefs can be
// added without schema changes.
//
// Current prefs:
//   notesDrawerWidth   number   px width of the notes-page resizer
//   userZoom           number   page-wide zoom multiplier on desktop
//   userZoomMobile     number   page-wide zoom multiplier on mobile
//   usageDisabled      boolean  if true, suppress usage_events writes
//
// On change we debounce-save (1s) so dragging a slider doesn't
// hammer the DB.

import { defineStore } from 'pinia';
import { useAuthStore } from 'src/stores/auth';
import * as api from 'src/api/user-prefs';

const DEFAULTS = {
  notesDrawerWidth: 340,
  userZoom: 1.0,
  userZoomMobile: 1.0,
  usageDisabled: false
};

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

export const useUserPrefsStore = defineStore('userPrefs', {
  state: () => ({
    notesDrawerWidth: DEFAULTS.notesDrawerWidth,
    userZoom: DEFAULTS.userZoom,
    userZoomMobile: DEFAULTS.userZoomMobile,
    usageDisabled: DEFAULTS.usageDisabled,
    _loadedFor: null,
    _saveTimer: null
  }),
  actions: {
    async load() {
      const auth = useAuthStore();
      const email = auth.user?.email || null;
      if (!email) { this._loadedFor = null; this._applyDefaults(); return; }
      if (this._loadedFor === email) return;
      this._loadedFor = email;
      try {
        const row = await api.fetchMine(email);
        const prefs = row?.prefs || {};
        this.notesDrawerWidth = prefs.notesDrawerWidth ?? DEFAULTS.notesDrawerWidth;
        this.userZoom         = prefs.userZoom         ?? DEFAULTS.userZoom;
        this.userZoomMobile   = prefs.userZoomMobile   ?? DEFAULTS.userZoomMobile;
        this.usageDisabled    = !!prefs.usageDisabled;
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('[userPrefs] load failed', e);
        this._applyDefaults();
      }
      this.applyCssVars();
    },
    _applyDefaults() {
      this.notesDrawerWidth = DEFAULTS.notesDrawerWidth;
      this.userZoom         = DEFAULTS.userZoom;
      this.userZoomMobile   = DEFAULTS.userZoomMobile;
      this.usageDisabled    = DEFAULTS.usageDisabled;
      this.applyCssVars();
    },
    applyCssVars() {
      if (typeof document === 'undefined') return;
      document.documentElement.style.setProperty(
        '--user-zoom', String(this.userZoom || 1)
      );
      document.documentElement.style.setProperty(
        '--user-zoom-mobile', String(this.userZoomMobile || 1)
      );
    },
    _scheduleSave() {
      const auth = useAuthStore();
      const email = auth.user?.email || null;
      if (!email) return;
      if (this._saveTimer) clearTimeout(this._saveTimer);
      this._saveTimer = setTimeout(async () => {
        this._saveTimer = null;
        try {
          await api.upsertMine(email, {
            notesDrawerWidth: this.notesDrawerWidth,
            userZoom: this.userZoom,
            userZoomMobile: this.userZoomMobile,
            usageDisabled: this.usageDisabled
          });
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('[userPrefs] save failed', e);
        }
      }, 800);
    },
    setNotesDrawerWidth(px) {
      this.notesDrawerWidth = clamp(Math.round(px), 240, 1200);
      this._scheduleSave();
    },
    setUserZoom(z) {
      this.userZoom = clamp(Number(z) || 1, 0.6, 1.6);
      this.applyCssVars();
      this._scheduleSave();
    },
    setUserZoomMobile(z) {
      this.userZoomMobile = clamp(Number(z) || 1, 0.7, 1.5);
      this.applyCssVars();
      this._scheduleSave();
    },
    resetZoom() {
      this.setUserZoom(DEFAULTS.userZoom);
    },
    resetZoomMobile() {
      this.setUserZoomMobile(DEFAULTS.userZoomMobile);
    },
    setUsageDisabled(v) {
      this.usageDisabled = !!v;
      this._scheduleSave();
    }
  }
});
