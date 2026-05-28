// Player config — read from the entities store at runtime.
// The DM is the only hardcoded row because DM has no entity record.
// Every PC's bucket↔character mapping is now sourced from
// entities.auth_bucket + entities.display_name in Supabase.
//
// Add a 4th player = INSERT one row in entities (kind='player',
// auth_bucket='X', display_name='Y'). Zero code change required.
//
// Keep this file small. It's only the runtime glue between the
// auth bucket and the player entity.

import { useEntitiesStore } from 'src/stores/entities';

const DM = { bucket: 'dm', playerId: null, characterName: 'DM' };

function playersFromStore() {
  const entities = useEntitiesStore();
  return entities.players
    .filter(p => p.auth_bucket)
    .map(p => ({
      bucket: p.auth_bucket,
      playerId: p.id,
      characterName: p.display_name || p.name
    }));
}

export function allPlayers() {
  return [DM, ...playersFromStore()];
}

export function characterFromBucket(bucket) {
  if (bucket === 'dm') return 'DM';
  return playersFromStore().find(p => p.bucket === bucket)?.characterName || null;
}

export function playerIdFromBucket(bucket) {
  if (bucket === 'dm') return null;
  return playersFromStore().find(p => p.bucket === bucket)?.playerId || null;
}

export function bucketFromPlayerId(playerId) {
  return playersFromStore().find(p => p.playerId === playerId)?.bucket || null;
}
