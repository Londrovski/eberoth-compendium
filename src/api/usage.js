// Lightweight usage analytics. Events are buffered for 1.5s then
// flushed in a single insert so a burst of activity (e.g. opening a
// detail panel that fires page_view + entity_open + many mention
// renders) costs at most one round-trip.
//
// RLS: each authenticated user can only insert rows where viewer
// matches their JWT email. DM-only select.

import { supabase } from 'boot/supabase';

const FLUSH_INTERVAL_MS = 1500;
const MAX_BUFFER = 50;

let buffer = [];
let flushTimer = null;
let inFlight = false;

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(flush, FLUSH_INTERVAL_MS);
}

async function flush() {
  flushTimer = null;
  if (!buffer.length || inFlight) return;
  const batch = buffer;
  buffer = [];
  inFlight = true;
  try {
    const { error } = await supabase.from('usage_events').insert(batch);
    if (error) {
      // Best-effort: drop on persistent error to avoid retry storms.
      // eslint-disable-next-line no-console
      console.warn('[usage] insert failed', error.message);
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[usage] insert threw', e);
  } finally {
    inFlight = false;
    if (buffer.length) scheduleFlush();
  }
}

/**
 * Enqueue one event. Caller passes only the variable bits; viewer
 * + bucket + session_id are filled in by the tracker composable.
 */
export function enqueue(row) {
  if (!row || !row.viewer || !row.type) return;
  buffer.push(row);
  if (buffer.length >= MAX_BUFFER) {
    if (flushTimer) { clearTimeout(flushTimer); flushTimer = null; }
    flush();
  } else {
    scheduleFlush();
  }
}

/** Flush remaining events on page unload. */
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (buffer.length) {
      // Fire and forget — best effort, not awaited.
      flush();
    }
  });
}
