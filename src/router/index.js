// Router. Hash mode because Cloudflare Pages doesn't need server-side
// route rewrites for a SPA, and hash mode just works.
//
// Auth guard: every route except /landing requires a Supabase session.
// Unauthed users get bounced to /landing.

import { defineRouter } from '#q-app/wrappers';
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router';
import routes from './routes';
import { useAuthStore } from 'src/stores/auth';

export default defineRouter(function () {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory);

  const router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE)
  });

  router.beforeEach((to, _from, next) => {
    const auth = useAuthStore();
    const isLandingRoute = to.name === 'landing';
    if (auth.user) {
      // Signed in. If they navigate to landing, send them home.
      if (isLandingRoute) return next({ name: 'home' });
      return next();
    }
    // Not signed in. Only landing allowed.
    if (isLandingRoute) return next();
    return next({ name: 'landing' });
  });

  return router;
});
