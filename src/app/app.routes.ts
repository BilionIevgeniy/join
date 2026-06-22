import { Routes } from '@angular/router';

export const routes: Routes = [
  // Public routes
  // {
  //   path: 'login',
  //   loadComponent: () => import('./pages/auth/login/login').then((m) => m.Login),
  // },
  // {
  //   path: 'signup',
  //   loadComponent: () =>
  //     import('./pages/auth/signup/signup').then((m) => m.Signup),
  // },

  // Protected routes (require authentication)
  {
    path: '',
    // Layout with sidebar — all pages are nested inside
    loadComponent: () => import('./layout/main-layout/main-layout').then((m) => m.MainLayout),
    children: [
      {
        path: 'summary',
        loadComponent: () => import('./pages/summary/summary').then((m) => m.Summary),
      },
      {
        path: 'board',
        loadComponent: () => import('./pages/board/board').then((m) => m.Board),
      },
      // {
      //   path: 'add-task',
      //   loadComponent: () =>
      //     import('./pages/task/add-task-page/add-task-page').then(
      //       (m) => m.AddTaskPageComponent,
      //     ),
      // },
      {
        path: 'contacts',
        loadComponent: () => import('./pages/contacts/contacts').then((m) => m.Contacts),
      },
      // Redirect from root
      { path: '', redirectTo: 'summary', pathMatch: 'full' },
    ],
  },

  // Fallback
  { path: '**', redirectTo: '' },
];
