// useEntityView — single façade for everything a card / panel needs
// to know about an entity from the *current viewer's* point of view.
//
// This composable is ADDITIVE. It does not change any rendering today.
// Consumers can opt in opportunistically; until they do, they keep
// calling useVisibilityIndicator / useGlow / entities.byId directly,
// and nothing changes.
//
// Why it exists: visibility logic is currently spread across multiple
// composables and ad-hoc filters in home-page components. Future
// states (party-only, hidden, archived, time-locked, conditional on
// other entities) become hard to add cleanly. Putting one façade in
// place now lets us migrate consumers one at a time later, then
// refactor the internals safely.
//
// Shape — see EntityView (jsdoc below). All fields are reactive (the
// returned object is wrapped in reactive() so Vue auto-unwraps in
// templates).
//
// Migration strategy:
//   1. (now) Façade exists, delegates to current composables. No-op
//      change to behaviour.
//   2. (later) Touch a card for unrelated reasons → swap to
//      useEntityView. Repeat for ~6 components over time.
//   3. (later) Once all consumers are migrated, refactor the
//      internals — collapse useVisibilityIndicator + useGlow into
//      pure helpers, add new states (party-only etc), expand the
//      `reasons` array for diagnostics.

import { computed, reactive, unref } from 'vue';
import { useEntitiesStore } from 'src/stores/entities';
import { useViewer } from 'src/composables/useViewer';
import { useVisibilityIndicator } from 'src/composables/useVisibilityIndicator';
import { useGlow } from 'src/composables/useGlow';
import { useDmHighlightStore } from 'src/stores/dm-highlight';

const PLAYER_BUCKETS = ['baker', 'butcher', 'charlie'];

/**
 * @typedef {Object} EntityView
 * @property {Object|null} entity           Raw record from entities store.
 * @property {boolean}     visible          Can the current viewer see this at all.
 * @property {boolean}     restricted       Visible but flagged restricted (blue).
 * @property {boolean}     dmOnly           DM-only entity (red).
 * @property {string|null} visClass         Legacy class string from useVisibilityIndicator,
 *                                          preserved so existing card CSS keeps working.
 * @property {boolean}     glow             Currently glowing for this viewer.
 * @property {boolean}     highlighted      Being pulsed by the DM right now.
 * @property {boolean}     isOwnEntity      The viewer's PC entity (gold-tint family).
 * @property {string[]}    factionIds       Factions this entity is a member of (any role).
 * @property {boolean}     isOrphan         Not a member of any faction AND not pinned.
 * @property {string[]}    reasons          Diagnostic — only meaningful for DM debugging.
 */

function computeVisible(entity, viewer) {
  if (!entity) return false;
  if (viewer.isDM) return true;
  const vis = entity.visible_to;
  if (!vis || vis.size === 0) return false;
  if (vis.has('*')) return true;
  return !!viewer.bucket && vis.has(viewer.bucket);
}

function computeFactionIds(entity, entities) {
  if (!entity?.id) return [];
  try {
    const factions = entities.factionsOfEntity(entity.id) || [];
    return factions.map(f => f.id);
  } catch {
    return [];
  }
}

function computeIsOwn(entity, viewer) {
  if (!entity || !viewer.bucket) return false;
  // PCs are tagged with kind=player and a bucket field that maps to
  // baker / butcher / charlie. The current site treats "ownership" as
  // either the matching player record or anything personal-pinned to
  // that bucket.
  if (entity.kind === 'player' && entity.bucket === viewer.bucket) return true;
  if (entity.personal_for && entity.personal_for === viewer.bucket) return true;
  return false;
}

export function useEntityView(entityIdRef) {
  const entities    = useEntitiesStore();
  const viewer      = useViewer();
  const visClassRef = useVisibilityIndicator(entityIdRef);
  const glowRef     = useGlow(entityIdRef);
  const highlight   = useDmHighlightStore();

  const idC = computed(() => {
    return typeof entityIdRef === 'string' ? entityIdRef : unref(entityIdRef);
  });

  const entityC = computed(() => entities.byId[idC.value] || null);

  const visibleC = computed(() => computeVisible(entityC.value, viewer));

  const restrictedC = computed(() => visClassRef.value === 'vis-restricted');
  const dmOnlyC     = computed(() => visClassRef.value === 'vis-dm-only');

  const factionIdsC = computed(() => computeFactionIds(entityC.value, entities));

  const isOrphanC = computed(() => {
    const e = entityC.value;
    if (!e) return false;
    if (factionIdsC.value.length > 0) return false;
    // Pin status — entities store may or may not expose a getter; fall
    // back to inspecting flags on the entity.
    if (typeof entities.isPinned === 'function') {
      try {
        if (entities.isPinned(e.id, viewer.bucket)) return false;
      } catch { /* ignore */ }
    }
    return true;
  });

  const isOwnC = computed(() => computeIsOwn(entityC.value, viewer));

  const highlightedC = computed(() => {
    const h = highlight.current;
    if (!h) return false;
    if (h.kind === 'entity' && h.id === idC.value) return true;
    return false;
  });

  const reasonsC = computed(() => {
    if (!viewer.isDM) return [];
    const r = [];
    if (restrictedC.value) r.push('restricted-visibility');
    if (dmOnlyC.value)     r.push('dm-only');
    if (glowRef.value)     r.push('glow');
    if (highlightedC.value) r.push('dm-highlighted');
    if (isOwnC.value)       r.push('own-entity');
    if (isOrphanC.value)    r.push('orphan');
    return r;
  });

  return reactive({
    entity:      entityC,
    visible:     visibleC,
    restricted:  restrictedC,
    dmOnly:      dmOnlyC,
    visClass:    visClassRef,
    glow:        glowRef,
    highlighted: highlightedC,
    isOwnEntity: isOwnC,
    factionIds:  factionIdsC,
    isOrphan:    isOrphanC,
    reasons:     reasonsC
  });
}

// Pure helper exports — used by the pinning tests so they can lock
// behaviour without spinning up the full Vue/Pinia runtime.
export const _internals = {
  PLAYER_BUCKETS,
  computeVisible,
  computeFactionIds,
  computeIsOwn
};
