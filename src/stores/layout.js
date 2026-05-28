// Layout store. DM-controlled UI state: per-section scales + faction order.
// Stored in Supabase layout_settings, world-readable.

import { defineStore } from 'pinia';
import * as layoutApi from 'src/api/layout';

export const useLayoutStore = defineStore('layout', {
  state: () => ({
    cardScale: 1.0,
    factionScale: 1.0,
    factionOrder: []
  }),
  actions: {
    async load() {
      const rows = await layoutApi.fetchAll();
      const byKey = Object.fromEntries(rows.map(r => [r.key, r.value]));
      this.cardScale    = byKey.card_scale?.scale    ?? 1.0;
      this.factionScale = byKey.faction_scale?.scale ?? 1.0;
      this.factionOrder = byKey.faction_order?.order ?? [];
    },
    async setCardScale(scale) {
      this.cardScale = scale;
      await layoutApi.setKey('card_scale', { scale });
    },
    async setFactionScale(scale) {
      this.factionScale = scale;
      await layoutApi.setKey('faction_scale', { scale });
    },
    async setFactionOrder(order) {
      this.factionOrder = order;
      await layoutApi.setKey('faction_order', { order });
    }
  }
});
