// Register Pinia with the app + expose the store registry to other boot files.
import { boot } from 'quasar/wrappers';
import { createPinia } from 'pinia';

export default boot(({ app }) => {
  const pinia = createPinia();
  app.use(pinia);
});
