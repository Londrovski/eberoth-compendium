// Back-compat shim. Old code may import from src/api/layout; redirect
// to the new app-settings module so renames don't break anything.
export { fetchAll, setKey } from 'src/api/app-settings';
