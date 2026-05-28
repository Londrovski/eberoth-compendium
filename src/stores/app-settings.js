// DM-controlled global config store. Source of truth: Supabase
// app_settings table. We subscribe to Realtime so any DM change
// propagates live to every connected client.

import { defineStore } from 'pinia';
import { supabase } from 'boot/supabase';
import * as appSettingsApi from 'src/api/app-settings';

const DEFAULTS = {
  card_scale:    { scale: 1.0 },
  faction_scale: { scale: 1.0 },
  faction_order: { order: [] }
};

export const useAppSettingsStore = defineStore('appSettings', {
  state: () => ({
    cardScale: 1.0,
    factionScale: 1.0,
    factionOrder: [],
    _subscribed: false,
    _channel: null
  }),
  actions: {
    async load() {
      const rows = await appSettingsApi.fetchAll();
      const byKey = Object.fromEntries(rows.map(r => [r.key, r.value]));
      this._applyRow('card_scale',    byKey.card_scale    || DEFAULTS.card_scale);
      this._applyRow('faction_scale', byKey.faction_scale || DEFAULTS.faction_scale);
      this._applyRow('faction_order', byKey.faction_order || DEFAULTS.faction_order);
    },
    _applyRow(key, value) {
      if (key === 'card_scale')    this.cardScale    = value?.scale ?? 1.0;
      if (key === 'faction_scale') this.factionScale = value?.scale ?? 1.0;
      if (key === 'faction_order') this.factionOrder = value?.order ?? [];
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
