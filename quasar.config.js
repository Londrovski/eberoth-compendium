// Quasar config — minimal Vite + Vue 3 + Pinia + Router setup.
// (Touch to trigger a fresh Cloudflare build against the current branch tip
// after a "Retry deployment" was re-running an old broken commit.)
import { defineConfig } from '#q-app/wrappers';

export default defineConfig(() => ({
  boot: ['supabase', 'auth'],
  css: ['app.scss'],
  extras: ['material-icons'],

  build: {
    target: { browser: ['es2022', 'firefox115', 'chrome115', 'safari14'], node: 'node20' },
    vueRouterMode: 'hash',
    vitePlugins: []
  },

  devServer: { open: false, port: 9000 },

  framework: {
    // Force dark mode — without this Quasar puts body--light on <body>,
    // which makes q-card / q-menu / q-field default to white and beats
    // our app.scss overrides on specificity. With dark: true the body
    // gets body--dark and Quasar's component defaults flip to use the
    // $dark / $dark-page tokens we set in quasar.variables.scss.
    config: { dark: true },
    plugins: ['Notify', 'Dialog', 'Loading']
  },

  animations: []
}));
