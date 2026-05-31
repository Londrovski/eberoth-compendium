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

const DEFAULTS = {
  card_scale:        { scale: 1.0 },
  faction_scale:     { scale: 1.0 },
  faction_order:     { order: [] },
  dm_show_personals: { show: true },
  typo_body_card:       DEFAULT_TYPOGRAPHY.body_card,
  typo_body_session:    DEFAULT_TYPOGRAPHY.body_session,
  typo_bold_accent:     DEFAULT_TYPOGRAPHY.bold_accent,
  typo_section_heading: DEFAULT_TYPOGRAPHY.section_heading
};

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
    _subscribed: false,
    _channel: null
  }),
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
      // Re-emit CSS vars after any typography change.
      if (key.startsWith('typo_') && typeof document !== 'undefined') {
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
