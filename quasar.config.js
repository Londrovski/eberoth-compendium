// Quasar config — minimal Vite + Vue 3 + Pinia + Router setup.
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
    config: {},
    plugins: ['Notify', 'Dialog', 'Loading']
  },

  animations: []
}));
