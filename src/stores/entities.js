// Entities store. Holds the world: factions, players, NPCs, lore.
// Plus the cross-cutting tables: visibility, per-player bodies, tags,
// memberships, personal-to.
//
// View-As filter: when DM is in view-as mode (auth.isViewingAs), all
// list getters filter to what the viewed-as bucket would see. Real
// players don't need this — RLS pre-filters their fetches.

import { defineStore } from 'pinia';
import { useAuthStore } from 'src/stores/auth';
import { supabase } from 'boot/supabase';
import * as entitiesApi from 'src/api/entities';
import * as membershipsApi from 'src/api/memberships';
import * as personalsApi from 'src/api/personals';
import { playerIdFromBucket } from 'src/config/players';

const REALTIME_TABLES = [
  'entities',
  'entity_visibility',
  'entity_player_body',
  'entity_player_tag',
  'entity_facts',
  'entity_memberships',
  'entity_personal_to'
];

// Returns either null (no filter, viewer sees everything in byId) or
// a predicate (e) => boolean that decides if an entity is visible to
// the currently-viewed-as bucket.
function viewAsFilter() {
  const auth = useAuthStore();
  if (!auth.isViewingAs) return null;
  const bucket = auth.viewingAs;
  return (e) => !!e && (e.visible_to?.has(bucket) || e.visible_to?.has('*'));
}

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
    all: (s) => {
      const f = viewAsFilter();
      const list = Object.values(s.byId);
      return f ? list.filter(f) : list;
    },
    players: (s) => {
      const f = viewAsFilter();
      const list = Object.values(s.byId).filter(e => e.kind === 'player');
      return f ? list.filter(f) : list;
    },
    factions: (s) => {
      const f = viewAsFilter();
      const list = Object.values(s.byId).filter(e => e.kind === 'faction');
      return f ? list.filter(f) : list;
    },
    npcs: (s) => {
      const f = viewAsFilter();
      const list = Object.values(s.byId).filter(e => e.kind === 'npc');
      return f ? list.filter(f) : list;
    },
    lore: (s) => {
      const f = viewAsFilter();
      const list = Object.values(s.byId).filter(e => e.kind === 'lore');
      return f ? list.filter(f) : list;
    },

    membersOf: (s) => (factionId) => {
      const f = viewAsFilter();
      return s.memberships
        .filter(m => m.faction_id === factionId)
        .sort((a, b) => a.sort_order - b.sort_order)
        .map(m => ({ entity: s.byId[m.entity_id], role: m.role, sort_order: m.sort_order }))
        .filter(x => x.entity && (!f || f(x.entity)));
    },
    personalsOf: (s) => (playerId) => {
      const f = viewAsFilter();
      return s.personals
        .filter(p => p.player_id === playerId)
        .sort((a, b) => a.sort_order - b.sort_order)
        .map(p => ({ entity: s.byId[p.entity_id], relationship: p.relationship, sort_order: p.sort_order }))
        .filter(x => x.entity && (!f || f(x.entity)));
    },
    factionsOfEntity: (s) => (entityId) => {
      const f = viewAsFilter();
      const list = s.memberships
        .filter(m => m.entity_id === entityId)
        .map(m => s.byId[m.faction_id])
        .filter(Boolean);
      return f ? list.filter(f) : list;
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

    _scheduleRefetch() {
      if (this._refetchTimer) clearTimeout(this._refetchTimer);
      this._refetchTimer = setTimeout(() => {
        this._refetchTimer = null;
        this.load();
      }, 250);
    },

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
