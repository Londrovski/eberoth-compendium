// Entities store. Holds the world: factions, players, NPCs, lore.
// Plus the cross-cutting tables: visibility, per-player bodies, tags,
// memberships, personal-to.
//
// Supabase Realtime: any change to entities or the 6 cross-cutting
// tables triggers a refresh of the relevant slice so the UI updates
// without a page reload.

import { defineStore } from 'pinia';
import { useAuthStore } from 'src/stores/auth';
import { supabase } from 'boot/supabase';
import * as entitiesApi from 'src/api/entities';
import * as membershipsApi from 'src/api/memberships';
import * as personalsApi from 'src/api/personals';
import { playerIdFromBucket } from 'src/config/players';

// Tables we subscribe to. Any change refetches the corresponding slice.
const REALTIME_TABLES = [
  'entities',
  'entity_visibility',
  'entity_player_body',
  'entity_player_tag',
  'entity_facts',
  'entity_memberships',
  'entity_personal_to'
];

export const useEntitiesStore = defineStore('entities', {
  state: () => ({
    byId: {},
    memberships: [],
    personals:   [],
    loading: false,
    error: null,
    _subscribed: false,
    _channel: null,
    _refetchTimer: null
  }),
  getters: {
    all:       (s) => Object.values(s.byId),
    players:   (s) => Object.values(s.byId).filter(e => e.kind === 'player'),
    factions:  (s) => Object.values(s.byId).filter(e => e.kind === 'faction'),
    npcs:      (s) => Object.values(s.byId).filter(e => e.kind === 'npc'),
    lore:      (s) => Object.values(s.byId).filter(e => e.kind === 'lore'),

    membersOf: (s) => (factionId) => {
      return s.memberships
        .filter(m => m.faction_id === factionId)
        .sort((a, b) => a.sort_order - b.sort_order)
        .map(m => ({ entity: s.byId[m.entity_id], role: m.role, sort_order: m.sort_order }))
        .filter(x => x.entity);
    },
    personalsOf: (s) => (playerId) => {
      return s.personals
        .filter(p => p.player_id === playerId)
        .sort((a, b) => a.sort_order - b.sort_order)
        .map(p => ({ entity: s.byId[p.entity_id], relationship: p.relationship, sort_order: p.sort_order }))
        .filter(x => x.entity);
    },
    factionsOfEntity: (s) => (entityId) => {
      return s.memberships
        .filter(m => m.entity_id === entityId)
        .map(m => s.byId[m.faction_id])
        .filter(Boolean);
    },
    glowsFor: (s) => (entityId, viewer) => {
      const e = s.byId[entityId];
      if (!e || !viewer) return false;
      if (e.tagged_viewers?.has(viewer)) return true;
      const ownPlayerId = playerIdFromBucket(viewer);
      if (!ownPlayerId) return false;
      if (entityId === ownPlayerId) return true;
      return s.personals.some(p => p.entity_id === entityId && p.player_id === ownPlayerId);
    }
  },
  actions: {
    async load() {
      const auth = useAuthStore();
      this.loading = true;
      this.error = null;
      try {
        const [ents, mems, pers] = await Promise.all([
          entitiesApi.fetchAll(auth.effectiveBucket),
          membershipsApi.fetchAll(),
          personalsApi.fetchAll()
        ]);
        this.byId = Object.fromEntries(ents.map(e => [e.id, e]));
        this.memberships = mems;
        this.personals = pers;
      } catch (e) {
        this.error = e;
        // eslint-disable-next-line no-console
        console.error('[entities] load failed', e);
      } finally {
        this.loading = false;
      }
    },

    // Debounced refetch — several Realtime events in quick succession
    // (e.g. a bulk edit) collapse into one network round trip.
    _scheduleRefetch() {
      if (this._refetchTimer) clearTimeout(this._refetchTimer);
      this._refetchTimer = setTimeout(() => {
        this._refetchTimer = null;
        this.load();
      }, 250);
    },

    // Open Realtime channels on all data tables. Any UPDATE/INSERT/
    // DELETE triggers a debounced refetch. Idempotent: only subscribes
    // once per app lifetime.
    subscribeRealtime() {
      if (this._subscribed) return;
      this._subscribed = true;
      const ch = supabase.channel('entities_changes');
      REALTIME_TABLES.forEach(table => {
        ch.on('postgres_changes',
          { event: '*', schema: 'public', table },
          () => this._scheduleRefetch()
        );
      });
      this._channel = ch.subscribe();
    }
  }
});
