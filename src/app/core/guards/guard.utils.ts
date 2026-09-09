import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RoutesEnum } from '../models/routes.model';

/**
 * Builds a `CanActivateFn` that allows navigation when `condition` is true,
 * redirecting to `redirectTo` otherwise. Shared by {@link authGuard} and
 * {@link guestGuard}, which only differ in the condition and redirect target.
 */
export function createAuthGuard(
  condition: (authService: AuthService) => boolean,
  redirectTo: RoutesEnum,
): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    return condition(authService) ? true : router.createUrlTree([redirectTo]);
  };
}
