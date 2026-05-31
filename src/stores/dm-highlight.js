// Pinia store for the DM's "push to players" highlight. Mirrors the
// app-settings pattern: load once, subscribe to Realtime UPDATEs so
// every connected client reacts within ~250ms.
import { defineStore } from 'pinia';
import { supabase } from 'boot/supabase';
import * as api from 'src/api/dm-highlight';

export const useDmHighlightStore = defineStore('dmHighlight', {
  state: () => ({
    kind:        null,   // 'entity' | 'session' | null
    targetId:    null,
    targetLabel: null,
    createdAt:   null,
    _subscribed: false,
    _channel:    null
  }),
  getters: {
    isActive: (s) => !!s.kind && !!s.targetId
  },
  actions: {
    async load() {
      try {
        const row = await api.fetchCurrent();
        this._apply(row || {});
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('[dmHighlight] load failed', e);
      }
    },
    _apply(row) {
      this.kind        = row?.kind        ?? null;
      this.targetId    = row?.target_id   ?? null;
      this.targetLabel = row?.target_label ?? null;
      this.createdAt   = row?.created_at  ?? null;
    },
    async setEntity(entity) {
      await api.setHighlight({
        kind: 'entity',
        targetId: entity.id,
        targetLabel: entity.short_name || entity.name || 'this card'
      });
    },
    async setSession(session) {
      await api.setHighlight({
        kind: 'session',
        targetId: session.id,
        targetLabel: session.title || ('Session ' + session.number)
      });
    },
    async clear() { await api.clearHighlight(); },

    subscribeRealtime() {
      if (this._subscribed) return;
      this._subscribed = true;
      this._channel = supabase
        .channel('dm_highlight_changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'dm_highlight' },
          (payload) => {
            const row = payload.new || payload.record;
            if (!row) return;
            this._apply(row);
          }
        )
        .subscribe();
    }
  }
});
