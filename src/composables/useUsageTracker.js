// useUsageTracker — single shared tracker. Anyone in the app can
// import { track } and fire-and-forget. Honours the user opt-out
// pref (userPrefs.usageDisabled) and silently no-ops when no user
// is signed in.
//
// Event shapes (loose contract):
//   type=page_view       target_id=route name      metadata={ path }
//   type=entity_open     target_id=entity uuid     metadata={ source }
//   type=session_open    target_id=session id      metadata={ source }
//   type=mention_click   target_id=mention id      metadata={ kind, source }
//   type=pulse_fire      target_id=entity|session  metadata={ kind }
//   type=dm_tool_change  target_id=setting key     metadata={ value }
//
// A per-tab session_id is generated on first call so events from one
// browser tab can be grouped server-side.

import { enqueue } from 'src/api/usage';
import { useAuthStore } from 'src/stores/auth';
import { useUserPrefsStore } from 'src/stores/user-prefs';

let tabSessionId = null;
function getTabSessionId() {
  if (tabSessionId) return tabSessionId;
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    tabSessionId = crypto.randomUUID();
  } else {
    tabSessionId = 'tab_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
  return tabSessionId;
}

export function track(type, targetId, metadata) {
  try {
    const auth = useAuthStore();
    const prefs = useUserPrefsStore();
    if (!auth.user?.email || !auth.actualBucket) return;
    if (prefs.usageDisabled) return;
    enqueue({
      viewer:     auth.user.email,
      bucket:     auth.actualBucket,
      session_id: getTabSessionId(),
      type:       String(type),
      target_id:  targetId == null ? null : String(targetId),
      metadata:   metadata && typeof metadata === 'object' ? metadata : {}
    });
  } catch (e) {
    // Best-effort. Never let tracking break the UI.
    // eslint-disable-next-line no-console
    console.warn('[usage] track failed', e);
  }
}

export function useUsageTracker() {
  return { track };
}
