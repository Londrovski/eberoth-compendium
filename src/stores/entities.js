// Entities store. Holds the world: factions, players, NPCs, lore.
// Plus the cross-cutting tables: visibility, per-player bodies, tags,
// memberships, personal-to.
//
// All filtered through the current effective bucket so consuming
// components don't need to think about visibility.

import { defineStore } from 'pinia';
import { useAuthStore } from 'src/stores/auth';
import * as entitiesApi from 'src/api/entities';
import * as membershipsApi from 'src/api/memberships';
import * as personalsApi from 'src/api/personals';

export const useEntitiesStore = defineStore('entities', {
  state: () => ({
    byId: {},
    memberships: [],
    personals:   [],
    loading: false,
    error: null
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
      const playerEntity = Object.values(s.byId).find(x => x.kind === 'player' && x.bucket === viewer);
      if (!playerEntity) return false;
      return s.personals.some(p => p.entity_id === entityId && p.player_id === playerEntity.id);
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
        console.error('[entities] load failed', e);
      } finally {
        this.loading = false;
      }
    }
  }
});
