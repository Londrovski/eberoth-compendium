// Auth store. Tracks who is signed in (passphrase → email).
// Also tracks viewing-as (DM previewing another player).
//
// Buckets: dm | baker | butcher | charlie | guest | null
//
// effectiveBucket() returns viewingAs if set, otherwise actual.
// All visibility-aware reads should key off effectiveBucket.

import { defineStore } from 'pinia';
import { supabase } from 'boot/supabase';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    actualBucket: null,
    viewingAs: null
  }),
  getters: {
    isDM:         (s) => s.actualBucket === 'dm',
    isViewingAs:  (s) => s.isDM && s.viewingAs && s.viewingAs !== 'dm',
    effectiveBucket: (s) => s.isViewingAs ? s.viewingAs : s.actualBucket
  },
  actions: {
    async hydrate() {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        this.user = data.session.user;
        this.actualBucket = bucketFor(data.session.user.email);
      }
    },
    async signInWithPassphrase(passphrase) {
      const email = emailFor(passphrase);
      if (!email) return { error: new Error('Unknown passphrase') };
      const password = passphrase;
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error };
      this.user = data.user;
      this.actualBucket = bucketFor(email);
      return { user: data.user };
    },
    async signOut() {
      await supabase.auth.signOut();
      this.user = null;
      this.actualBucket = null;
      this.viewingAs = null;
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
