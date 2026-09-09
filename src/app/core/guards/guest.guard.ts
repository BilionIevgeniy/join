import { RoutesEnum } from '../models/routes.model';
import { createAuthGuard } from './guard.utils';

/** Blocks access to guest-only routes (login/signup) for logged-in users, redirecting to summary. */
export const guestGuard = createAuthGuard(
  (authService) => !authService.isLoggedIn(),
  RoutesEnum.SUMMARY,
);
