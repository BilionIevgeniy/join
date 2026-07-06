import { Routes } from '@angular/router';
import { RoutesEnum } from './core/models/routes.model';

export const routes: Routes = [
  // ─── AUTH ROUTES (no sidebar) ─────────────────────────────
  {
    path: '',
    loadComponent: () => import('./layout/auth-layout/auth-layout').then((m) => m.AuthLayout),
    children: [
      {
        path: RoutesEnum.LOGIN,
        // canActivate: [guestGuard],
        loadComponent: () => import('./pages/auth/login/login').then((m) => m.Login),
      },
      {
        path: RoutesEnum.SIGNUP,
        // canActivate: [guestGuard],
        loadComponent: () => import('./pages/auth/signup/signup').then((m) => m.Signup),
      },
      { path: '', redirectTo: RoutesEnum.LOGIN, pathMatch: 'full' },
    ],
  },

  // ─── MAIN LAYOUT ROUTES (with sidebar) ────────────────────
  // Public pages (privacy, legal, help) — accessible by everyone
  // Protected pages (summary, board, contacts, add-task) — auth guard added later
  {
    path: '',
    loadComponent: () => import('./layout/main-layout/main-layout').then((m) => m.MainLayout),
    children: [
      // Protected — canActivate: [authGuard] added later
      {
        path: RoutesEnum.SUMMARY,
        // canActivate: [authGuard],
        loadComponent: () => import('./pages/summary/summary').then((m) => m.Summary),
      },
      {
        path: RoutesEnum.BOARD,
        // canActivate: [authGuard],
        loadComponent: () => import('./pages/board/board').then((m) => m.Board),
      },
      {
        path: RoutesEnum.ADD_TASK,
        // canActivate: [authGuard],
        loadComponent: () => import('./pages/add-task/add-task').then((m) => m.AddTaskPage),
      },
      {
        path: RoutesEnum.CONTACTS,
        // canActivate: [authGuard],
        loadComponent: () => import('./pages/contacts/contacts').then((m) => m.Contacts),
      },

      // Public — accessible without authentication
      // {
      //   path: RoutesEnum.PRIVACY,
      //   loadComponent: () =>
      //     import('./pages/privacy/privacy').then((m) => m.Privacy),
      // },
      // {
      //   path: RoutesEnum.TERMS,
      //   loadComponent: () =>
      //     import('./pages/terms/terms').then((m) => m.Terms),
      // },
      // {
      //   path: RoutesEnum.HELP,
      //   loadComponent: () =>
      //     import('./pages/help/help').then((m) => m.Help),
      // },

      { path: '', redirectTo: RoutesEnum.SUMMARY, pathMatch: 'full' },
    ],
  },

  // ─── FALLBACK ─────────────────────────────────────────────
  { path: '**', redirectTo: RoutesEnum.LOGIN },
];
