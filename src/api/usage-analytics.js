// usage-analytics: DM read-side queries against usage_events.
// All queries rely on RLS: only the DM JWT can SELECT, so a player
// hitting these returns 0 rows rather than 403. We never expose
// raw row contents to non-DM viewers anyway because the page
// itself is route-guarded.
//
// Keep this file focused on RAW data fetches. UI shaping happens in
// the components.

import { supabase } from 'boot/supabase';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function isoDaysAgo(days) {
  return new Date(Date.now() - days * ONE_DAY_MS).toISOString();
}

/**
 * Fetch raw events within the last N days, newest first.
 * Capped by `limit` so dashboards stay responsive.
 */
export async function fetchRecent({ days = 14, limit = 2000 } = {}) {
  const since = isoDaysAgo(days);
  const { data, error } = await supabase
    .from('usage_events')
    .select('id, viewer, bucket, session_id, type, target_id, metadata, created_at')
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

/**
 * Aggregate counts by type within a window — handy for "what are
 * people actually doing".
 */
export async function countByType({ days = 14 } = {}) {
  const rows = await fetchRecent({ days, limit: 5000 });
  const map = {};
  for (const r of rows) {
    map[r.type] = (map[r.type] || 0) + 1;
  }
  return Object.entries(map)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Distinct viewers active per day for the last N days. Returns an
 * array of { date: 'YYYY-MM-DD', viewers: Set, viewerCount: number,
 * eventCount: number } sorted oldest → newest.
 */
export async function dailyActives({ days = 14 } = {}) {
  const rows = await fetchRecent({ days, limit: 5000 });
  const byDay = new Map();
  for (const r of rows) {
    const day = (r.created_at || '').slice(0, 10);
    if (!day) continue;
    let bucket = byDay.get(day);
    if (!bucket) {
      bucket = { date: day, viewers: new Set(), eventCount: 0 };
      byDay.set(day, bucket);
    }
    bucket.viewers.add(r.viewer);
    bucket.eventCount++;
  }
  return Array.from(byDay.values())
    .map(d => ({ date: d.date, viewerCount: d.viewers.size, eventCount: d.eventCount }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Top-N opened targets, optionally filtered by event type.
 */
export async function topTargets({ type = 'entity_open', days = 14, limit = 10 } = {}) {
  const rows = await fetchRecent({ days, limit: 5000 });
  const map = new Map();
  for (const r of rows) {
    if (r.type !== type || !r.target_id) continue;
    map.set(r.target_id, (map.get(r.target_id) || 0) + 1);
  }
  return Array.from(map.entries())
    .map(([target_id, count]) => ({ target_id, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Per-viewer activity summary for the window.
 */
export async function perViewer({ days = 14 } = {}) {
  const rows = await fetchRecent({ days, limit: 5000 });
  const map = new Map();
  for (const r of rows) {
    let bucket = map.get(r.viewer);
    if (!bucket) {
      bucket = {
        viewer:     r.viewer,
        bucket:     r.bucket,
        eventCount: 0,
        lastSeen:   r.created_at
      };
      map.set(r.viewer, bucket);
    }
    bucket.eventCount++;
    if (r.created_at > bucket.lastSeen) bucket.lastSeen = r.created_at;
  }
  return Array.from(map.values())
    .sort((a, b) => b.eventCount - a.eventCount);
}
