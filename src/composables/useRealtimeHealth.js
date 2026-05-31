// useRealtimeHealth — opens a dedicated lightweight Supabase Realtime
// channel and exposes its connection status as reactive state.
//
// Status values come from supabase-js subscribe() callbacks:
//   - SUBSCRIBED    healthy, connected
//   - CHANNEL_ERROR error from the server
//   - TIMED_OUT     no response in time
//   - CLOSED        socket closed cleanly
//
// We map these to a coarse health bucket:
//   green  → SUBSCRIBED, last status change within the healthy window
//   amber  → reconnecting / stale (>30s since heartbeat)
//   red    → CHANNEL_ERROR | TIMED_OUT | CLOSED
//
// This composable is a SINGLETON. Repeated calls return the same
// reactive state so we don't burn channels per consumer.

import { ref, computed, onScopeDispose } from 'vue';
import { supabase } from 'boot/supabase';

const HEARTBEAT_WINDOW_MS = 30_000;

let _state = null;
let _channel = null;
let _refCount = 0;

function ensureState() {
  if (_state) return _state;
  _state = {
    status: ref('CONNECTING'),
    lastChangeAt: ref(Date.now()),
    error: ref(null),
    tick: ref(0)
  };

  // Tick once a second so the "lastChange" derivation stays fresh
  // without requiring a status event.
  const tickTimer = setInterval(() => { _state.tick.value++; }, 1000);

  _channel = supabase.channel('realtime_health');
  _channel
    .on('system', { event: '*' }, () => {
      _state.lastChangeAt.value = Date.now();
    })
    .subscribe((status, err) => {
      _state.status.value = status || 'UNKNOWN';
      _state.lastChangeAt.value = Date.now();
      _state.error.value = err || null;
    });

  // Clean teardown on full app shutdown (mostly relevant for HMR).
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      clearInterval(tickTimer);
      try { _channel?.unsubscribe(); } catch {}
    });
  }
  return _state;
}

export function useRealtimeHealth() {
  const s = ensureState();
  _refCount++;

  const isSubscribed = computed(() => s.status.value === 'SUBSCRIBED');
  const ageMs = computed(() => {
    // tick is read just to keep the computed reactive.
    void s.tick.value;
    return Date.now() - s.lastChangeAt.value;
  });

  const bucket = computed(() => {
    const st = s.status.value;
    if (st === 'CHANNEL_ERROR' || st === 'TIMED_OUT' || st === 'CLOSED') {
      return 'red';
    }
    if (st === 'SUBSCRIBED') {
      return ageMs.value > HEARTBEAT_WINDOW_MS ? 'amber' : 'green';
    }
    return 'amber';
  });

  const label = computed(() => {
    const st = s.status.value;
    const sec = Math.round(ageMs.value / 1000);
    return `Realtime · ${st.toLowerCase()} · ${sec}s since last event`;
  });

  onScopeDispose(() => {
    _refCount--;
    // We deliberately keep the channel open even when refCount hits
    // zero — reopening costs a websocket round-trip and the channel
    // is shared across the whole app lifetime.
  });

  return {
    status:       s.status,
    lastChangeAt: s.lastChangeAt,
    error:        s.error,
    ageMs,
    bucket,
    label,
    isSubscribed
  };
}
