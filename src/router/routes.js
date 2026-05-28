// Route table. Add new pages here, keep the file under 50 lines.

const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '',      name: 'home',  component: () => import('pages/HomePage.vue') },
      { path: 'notes', name: 'notes', component: () => import('pages/NotesPage.vue') }
    ]
  },
  {
    path: '/landing',
    name: 'landing',
    component: () => import('pages/LandingPage.vue')
  },
  // Legacy redirects — old bookmarks of /sessions or /threads land on Notes.
  { path: '/sessions', redirect: { name: 'notes' } },
  { path: '/threads',  redirect: { name: 'notes' } },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/NotFoundPage.vue')
  }
];

export default routes;
