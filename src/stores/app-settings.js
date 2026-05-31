// DM-controlled global config store. Source of truth: Supabase
// app_settings table. We subscribe to Realtime so any DM change
// propagates live to every connected client.

import { defineStore } from 'pinia';
import { supabase } from 'boot/supabase';
import * as appSettingsApi from 'src/api/app-settings';

const DEFAULT_TYPOGRAPHY = {
  body_card:       { color: '#e8e2d4', size: 14 },
  body_session:    { color: '#c9bfa9', size: 15 },
  bold_accent:     { color: '#d8c98a' },
  section_heading: { color: '#8a7544', size: 11, letterSpacing: 3 }
};

const DEFAULT_EXTERNALS = {
  zoom: { url: '' },
  dndbeyond: { baker: '', butcher: '', charlie: '', dm: '' }
};

const DEFAULT_BACKGROUND = {
  mode: 'none',
  opacity: 0.35,
  size: 0.8,
  bgColor: '#000000'
};

const DEFAULT_LINES = {
  thickness: 2,        // px — master border thickness
  color:     '#8a7544',
  spacing:   16,       // px — gap between cards / faction columns
  boxOpacity: 1.0      // 0..1 — faction box infill opacity
};

const DEFAULTS = {
  card_scale:        { scale: 1.0 },
  faction_scale:     { scale: 1.0 },
  faction_order:     { order: [] },
  dm_show_personals: { show: true },
  typo_body_card:       DEFAULT_TYPOGRAPHY.body_card,
  typo_body_session:    DEFAULT_TYPOGRAPHY.body_session,
  typo_bold_accent:     DEFAULT_TYPOGRAPHY.bold_accent,
  typo_section_heading: DEFAULT_TYPOGRAPHY.section_heading,
  external_zoom_url:        DEFAULT_EXTERNALS.zoom,
  external_dndbeyond_urls:  DEFAULT_EXTERNALS.dndbeyond,
  site_background:          DEFAULT_BACKGROUND,
  site_lines:               DEFAULT_LINES
};

// Faction box base colours (in sync with the previous hardcoded ones).
const BOX_BASE = {
  default:    { r: 26, g: 24, b: 20 },   // ~#1a1814 (var(--bg-panel))
  restricted: { r: 22, g: 32, b: 44 },   // ~#16202c
  dmOnly:     { r: 42, g: 23, b: 23 }    // ~#2a1717
};

function rgba({ r, g, b }, a) {
  const alpha = Math.max(0, Math.min(1, Number(a) || 0));
  return `rgba(${r},${g},${b},${alpha})`;
}

export const useAppSettingsStore = defineStore('appSettings', {
  state: () => ({
    cardScale: 1.0,
    factionScale: 1.0,
    factionOrder: [],
    showPersonals: true,
    typography: {
      bodyCard:       { ...DEFAULT_TYPOGRAPHY.body_card },
      bodySession:    { ...DEFAULT_TYPOGRAPHY.body_session },
      boldAccent:     { ...DEFAULT_TYPOGRAPHY.bold_accent },
      sectionHeading: { ...DEFAULT_TYPOGRAPHY.section_heading }
    },
    externalZoomUrl: '',
    externalDndbeyondUrls: { ...DEFAULT_EXTERNALS.dndbeyond },
    siteBackground: { ...DEFAULT_BACKGROUND },
    siteLines: { ...DEFAULT_LINES },
    _subscribed: false,
    _channel: null
  }),
  getters: {
    dndbeyondUrlFor: (s) => (bucket) => {
      if (!bucket) return '';
      const map = s.externalDndbeyondUrls || {};
      return map[bucket] || map.dm || '';
    }
  },
  actions: {
    async load() {
      const rows = await appSettingsApi.fetchAll();
      const byKey = Object.fromEntries(rows.map(r => [r.key, r.value]));
      Object.keys(DEFAULTS).forEach(k => {
        this._applyRow(k, byKey[k] || DEFAULTS[k]);
      });
      this.applyCssVars();
    },
    _applyRow(key, value) {
      if (key === 'card_scale')        this.cardScale     = value?.scale ?? 1.0;
      if (key === 'faction_scale')     this.factionScale  = value?.scale ?? 1.0;
      if (key === 'faction_order')     this.factionOrder  = value?.order ?? [];
      if (key === 'dm_show_personals') this.showPersonals = value?.show ?? true;
      if (key === 'typo_body_card') {
        this.typography.bodyCard = {
          color: value?.color ?? DEFAULT_TYPOGRAPHY.body_card.color,
          size:  value?.size  ?? DEFAULT_TYPOGRAPHY.body_card.size
        };
      }
      if (key === 'typo_body_session') {
        this.typography.bodySession = {
          color: value?.color ?? DEFAULT_TYPOGRAPHY.body_session.color,
          size:  value?.size  ?? DEFAULT_TYPOGRAPHY.body_session.size
        };
      }
      if (key === 'typo_bold_accent') {
        this.typography.boldAccent = {
          color: value?.color ?? DEFAULT_TYPOGRAPHY.bold_accent.color
        };
      }
      if (key === 'typo_section_heading') {
        this.typography.sectionHeading = {
          color:         value?.color         ?? DEFAULT_TYPOGRAPHY.section_heading.color,
          size:          value?.size          ?? DEFAULT_TYPOGRAPHY.section_heading.size,
          letterSpacing: value?.letterSpacing ?? DEFAULT_TYPOGRAPHY.section_heading.letterSpacing
        };
      }
      if (key === 'external_zoom_url') {
        this.externalZoomUrl = value?.url ?? '';
      }
      if (key === 'external_dndbeyond_urls') {
        this.externalDndbeyondUrls = {
          baker:   value?.baker   ?? '',
          butcher: value?.butcher ?? '',
          charlie: value?.charlie ?? '',
          dm:      value?.dm      ?? ''
        };
      }
      if (key === 'site_background') {
        this.siteBackground = {
          mode:    value?.mode    ?? DEFAULT_BACKGROUND.mode,
          opacity: value?.opacity ?? DEFAULT_BACKGROUND.opacity,
          size:    value?.size    ?? DEFAULT_BACKGROUND.size,
          bgColor: value?.bgColor ?? DEFAULT_BACKGROUND.bgColor
        };
      }
      if (key === 'site_lines') {
        this.siteLines = {
          thickness:  value?.thickness  ?? DEFAULT_LINES.thickness,
          color:      value?.color      ?? DEFAULT_LINES.color,
          spacing:    value?.spacing    ?? DEFAULT_LINES.spacing,
          boxOpacity: value?.boxOpacity ?? DEFAULT_LINES.boxOpacity
        };
      }
      if ((key.startsWith('typo_') || key === 'site_lines') && typeof document !== 'undefined') {
        this.applyCssVars();
      }
    },
    applyCssVars() {
      if (typeof document === 'undefined') return;
      const root = document.documentElement;
      const t = this.typography;
      root.style.setProperty('--body-card-color',     t.bodyCard.color);
      root.style.setProperty('--body-card-size',      t.bodyCard.size + 'px');
      root.style.setProperty('--body-session-color', t.bodySession.color);
      root.style.setProperty('--body-session-size',  t.bodySession.size + 'px');
      root.style.setProperty('--bold-accent-color',  t.boldAccent.color);
      root.style.setProperty('--section-heading-color',   t.sectionHeading.color);
      root.style.setProperty('--section-heading-size',    t.sectionHeading.size + 'px');
      root.style.setProperty('--section-heading-spacing', t.sectionHeading.letterSpacing + 'px');
      const l = this.siteLines;
      root.style.setProperty('--line-thickness', (l.thickness ?? 2) + 'px');
      root.style.setProperty('--line-color',     l.color || '#8a7544');
      root.style.setProperty('--card-spacing',   (l.spacing ?? 16) + 'px');
      const a = l.boxOpacity ?? 1;
      root.style.setProperty('--faction-box-bg',            rgba(BOX_BASE.default,    a));
      root.style.setProperty('--faction-box-bg-restricted', rgba(BOX_BASE.restricted, a));
      root.style.setProperty('--faction-box-bg-dm',         rgba(BOX_BASE.dmOnly,     a));
    },
    async setCardScale(scale) {
      this.cardScale = scale;
      await appSettingsApi.setKey('card_scale', { scale });
    },
    async setFactionScale(scale) {
      this.factionScale = scale;
      await appSettingsApi.setKey('faction_scale', { scale });
    },
    async setFactionOrder(order) {
      this.factionOrder = order;
      await appSettingsApi.setKey('faction_order', { order });
    },
    async setShowPersonals(show) {
      this.showPersonals = !!show;
      await appSettingsApi.setKey('dm_show_personals', { show: !!show });
    },
    async setBodyCard(patch) {
      this.typography.bodyCard = { ...this.typography.bodyCard, ...patch };
      this.applyCssVars();
      await appSettingsApi.setKey('typo_body_card', this.typography.bodyCard);
    },
    async setBodySession(patch) {
      this.typography.bodySession = { ...this.typography.bodySession, ...patch };
      this.applyCssVars();
      await appSettingsApi.setKey('typo_body_session', this.typography.bodySession);
    },
    async setBoldAccent(patch) {
      this.typography.boldAccent = { ...this.typography.boldAccent, ...patch };
      this.applyCssVars();
      await appSettingsApi.setKey('typo_bold_accent', this.typography.boldAccent);
    },
    async setSectionHeading(patch) {
      this.typography.sectionHeading = { ...this.typography.sectionHeading, ...patch };
      this.applyCssVars();
      await appSettingsApi.setKey('typo_section_heading', this.typography.sectionHeading);
    },
    async resetTypography() {
      this.typography.bodyCard       = { ...DEFAULT_TYPOGRAPHY.body_card };
      this.typography.bodySession    = { ...DEFAULT_TYPOGRAPHY.body_session };
      this.typography.boldAccent     = { ...DEFAULT_TYPOGRAPHY.bold_accent };
      this.typography.sectionHeading = { ...DEFAULT_TYPOGRAPHY.section_heading };
      this.applyCssVars();
      await Promise.all([
        appSettingsApi.setKey('typo_body_card',       this.typography.bodyCard),
        appSettingsApi.setKey('typo_body_session',    this.typography.bodySession),
        appSettingsApi.setKey('typo_bold_accent',     this.typography.boldAccent),
        appSettingsApi.setKey('typo_section_heading', this.typography.sectionHeading)
      ]);
    },
    async setZoomUrl(url) {
      this.externalZoomUrl = url || '';
      await appSettingsApi.setKey('external_zoom_url', { url: url || '' });
    },
    async setDndbeyondUrls(map) {
      const next = {
        baker:   map?.baker   ?? '',
        butcher: map?.butcher ?? '',
        charlie: map?.charlie ?? '',
        dm:      map?.dm      ?? ''
      };
      this.externalDndbeyondUrls = next;
      await appSettingsApi.setKey('external_dndbeyond_urls', next);
    },
    async setSiteBackground(patch) {
      const next = {
        mode:    patch?.mode    ?? this.siteBackground.mode,
        opacity: patch?.opacity ?? this.siteBackground.opacity,
        size:    patch?.size    ?? this.siteBackground.size,
        bgColor: patch?.bgColor ?? this.siteBackground.bgColor
      };
      this.siteBackground = next;
      await appSettingsApi.setKey('site_background', next);
    },
    async setSiteLines(patch) {
      const next = {
        thickness:  patch?.thickness  ?? this.siteLines.thickness,
        color:      patch?.color      ?? this.siteLines.color,
        spacing:    patch?.spacing    ?? this.siteLines.spacing,
        boxOpacity: patch?.boxOpacity ?? this.siteLines.boxOpacity
      };
      this.siteLines = next;
      this.applyCssVars();
      await appSettingsApi.setKey('site_lines', next);
    },
    async moveFactionUp(factionId) {
      const i = this.factionOrder.indexOf(factionId);
      if (i <= 0) return;
      const next = [...this.factionOrder];
      [next[i - 1], next[i]] = [next[i], next[i - 1]];
      await this.setFactionOrder(next);
    },
    async moveFactionDown(factionId) {
      const i = this.factionOrder.indexOf(factionId);
      if (i < 0 || i >= this.factionOrder.length - 1) return;
      const next = [...this.factionOrder];
      [next[i + 1], next[i]] = [next[i], next[i + 1]];
      await this.setFactionOrder(next);
    },

    subscribeRealtime() {
      if (this._subscribed) return;
      this._subscribed = true;
      this._channel = supabase
        .channel('app_settings_changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'app_settings' },
          (payload) => {
            const row = payload.new || payload.record;
            if (!row || !row.key) return;
            this._applyRow(row.key, row.value);
          }
        )
        .subscribe();
    }
  }
});

export const useLayoutStore = useAppSettingsStore;
