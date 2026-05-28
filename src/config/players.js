// Single source of truth for the bucket ↔ player↔character mapping.
// Imported by anything that needs to translate between the three.
//
// bucket: stored in the JWT email's local-part. The auth axis.
// playerId: entity id of the player character in Supabase.
// characterName: display name we show to humans.
//
// Drift between these three was a real bug source. Keep this file
// the only place where the mapping is defined.

export const PLAYERS = [
  { bucket: 'dm',      playerId: null,      characterName: 'DM' },
  { bucket: 'baker',   playerId: 'kalvorn', characterName: 'Kalvorn' },
  { bucket: 'butcher', playerId: 'azrael',  characterName: 'Azrael' },
  { bucket: 'charlie', playerId: 'dirk',    characterName: 'Dirk' }
];

export function characterFromBucket(bucket) {
  return PLAYERS.find(p => p.bucket === bucket)?.characterName || null;
}

export function playerIdFromBucket(bucket) {
  return PLAYERS.find(p => p.bucket === bucket)?.playerId || null;
}

export function bucketFromPlayerId(playerId) {
  return PLAYERS.find(p => p.playerId === playerId)?.bucket || null;
}

// Buckets we offer in the View-As dropdown (DM previewing players).
export const VIEW_AS_BUCKETS = PLAYERS.filter(p => p.bucket !== 'dm' || true);
