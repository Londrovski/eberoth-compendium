// Auth store. Tracks who is signed in (passphrase → email).
// Also tracks viewing-as (DM previewing another player).
//
// Buckets: dm | baker | butcher | charlie | guest | null
//
// effectiveBucket() returns viewingAs if set, otherwise actual.
// All visibility-aware reads should key off effectiveBucket.
//
// Source of truth: Supabase session. We subscribe to onAuthStateChange
// so the store stays in sync — if the session expires or is signed
// out, actualBucket falls back to null automatically.

import { defineStore } from 'pinia';
import { supabase } from 'boot/supabase';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    actualBucket: null,
    viewingAs: null,
    hydrated: false
  }),
  getters: {
    isDM:         (s) => s.actualBucket === 'dm',
    isViewingAs:  (s) => s.isDM && s.viewingAs && s.viewingAs !== 'dm',
    effectiveBucket: (s) => s.isViewingAs ? s.viewingAs : s.actualBucket
  },
  actions: {
    async hydrate() {
      // Pull the current session and seed state.
      const { data } = await supabase.auth.getSession();
      this._applySession(data?.session);

      // Subscribe once for live updates. If signOut happens or token
      // refresh fails, this fires SIGNED_OUT and clears state.
      if (!this.hydrated) {
        supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_OUT') {
            this._clearSession();
          } else if (session) {
            this._applySession(session);
          }
        });
        this.hydrated = true;
      }
    },
    _applySession(session) {
      if (session && session.user) {
        this.user = session.user;
        this.actualBucket = bucketFor(session.user.email);
      } else {
        this._clearSession();
      }
    },
    _clearSession() {
      this.user = null;
      this.actualBucket = null;
      this.viewingAs = null;
    },
    async signInWithPassphrase(passphrase) {
      const email = emailFor(passphrase);
      if (!email) return { error: new Error('Unknown passphrase') };
      const password = passphrase;
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error };
      this._applySession(data.session);
      return { user: data.user };
    },
    async signOut() {
      await supabase.auth.signOut();
      this._clearSession();
    },
    setViewingAs(bucket) {
      if (!this.isDM) return;
      this.viewingAs = (bucket === 'dm' || !bucket) ? null : bucket;
    }
  }
});

const MAP = {
  'dungeon-master':  { email: 'dm@compendium.local',       bucket: 'dm'      },
  'kalvorn':         { email: 'baker@compendium.local',    bucket: 'baker'   },
  'azrael':          { email: 'charlie@compendium.local',  bucket: 'charlie' },
  'dirk':            { email: 'butcher@compendium.local',  bucket: 'butcher' }
};
function emailFor(passphrase)  { return MAP[passphrase]?.email  || null; }
function bucketFor(email)      { return Object.values(MAP).find(m => m.email === email)?.bucket || null; }
