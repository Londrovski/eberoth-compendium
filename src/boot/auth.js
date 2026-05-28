// Hydrate any persisted Supabase session before the router mounts,
// so guards see the correct state on first nav.
import { boot } from 'quasar/wrappers';
import { useAuthStore } from 'src/stores/auth';

export default boot(async () => {
  const auth = useAuthStore();
  await auth.hydrate();
});
