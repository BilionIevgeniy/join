import { Routes } from '@angular/router';
import { RoutesEnum } from './core/models/routes.model';

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
        path: RoutesEnum.SUMMARY,
        loadComponent: () => import('./pages/summary/summary').then((m) => m.Summary),
      },
      // {
      //   path: 'board',
      //   loadComponent: () => import('./pages/board/board').then((m) => m.Board),
      // },
      {
        path: RoutesEnum.ADD_TASK,
        loadComponent: () => import('./pages/add-task/add-task').then((m) => m.AddTaskPage),
      },
      {
        path: RoutesEnum.CONTACTS,
        loadComponent: () => import('./pages/contacts/contacts').then((m) => m.Contacts),
      },
      // Redirect from root
      { path: '', redirectTo: RoutesEnum.SUMMARY, pathMatch: 'full' },
    ],
  },

  // Fallback
  { path: '**', redirectTo: RoutesEnum.SUMMARY },
];
