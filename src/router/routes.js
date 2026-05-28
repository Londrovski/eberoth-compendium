// Route table. Add new pages here, keep the file under 50 lines.

const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '',          name: 'home',     component: () => import('pages/HomePage.vue') },
      { path: 'sessions',  name: 'sessions', component: () => import('pages/SessionsPage.vue') },
      { path: 'notes',     name: 'notes',    component: () => import('pages/NotesPage.vue') },
      { path: 'threads',   name: 'threads',  component: () => import('pages/ThreadsPage.vue') }
    ]
  },
  {
    path: '/landing',
    name: 'landing',
    component: () => import('pages/LandingPage.vue')
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/NotFoundPage.vue')
  }
];

export default routes;
