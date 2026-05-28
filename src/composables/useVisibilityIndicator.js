// DM-only visibility class for a card. Returns a reactive string:
//   'vis-restricted'  blue glow — visible to a subset of players, not '*'
//   'vis-dm-only'     red  glow — visible only to DM, or no one
//   null              no class — visible to '*' or viewer is not DM
//
// Players never see these indicators — only DM does. So it's both a
// visibility-state preview tool (DM sees at a glance what's restricted)
// and useful while in View-As mode (still know the underlying state).

import { computed, unref } from 'vue';
import { useEntitiesStore } from 'src/stores/entities';
import { useViewer } from 'src/composables/useViewer';

const PLAYER_BUCKETS = ['baker', 'butcher', 'charlie'];

function stateOf(entity) {
  const vis = entity?.visible_to;
  if (!vis || vis.size === 0) return 'vis-dm-only';
  if (vis.has('*')) return null;
  const hasPlayer = PLAYER_BUCKETS.some(b => vis.has(b));
  if (!hasPlayer) return 'vis-dm-only';
  return 'vis-restricted';
}

export function useVisibilityIndicator(entityIdRef) {
  const entities = useEntitiesStore();
  const viewer = useViewer();
  return computed(() => {
    if (!viewer.isDM) return null;
    const id = typeof entityIdRef === 'string' ? entityIdRef : unref(entityIdRef);
    const e = entities.byId[id];
    return stateOf(e);
  });
}
