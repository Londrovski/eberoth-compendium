// Single source of truth for the bucket ↔ player ↔ character mapping.
// Imported by anything that needs to translate between the three.
//
// Verified against the Supabase data (entity_personal_to.player_id
// cross-referenced with entity_player_tag.viewer for known personals).
//
//   bucket: stored in the JWT email's local-part. The auth axis.
//   playerId: entity id of the player character in Supabase.
//   characterName: display name we show to humans.
//
// Drift between these three has been a real bug source. Keep this
// file the ONLY place where the mapping is defined.

export const PLAYERS = [
  { bucket: 'dm',      playerId: null,      characterName: 'DM' },
  { bucket: 'baker',   playerId: 'kalvorn', characterName: 'Kalvorn' },
  { bucket: 'butcher', playerId: 'dirk',    characterName: 'Dirk' },
  { bucket: 'charlie', playerId: 'azrael',  characterName: 'Azrael' }
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
