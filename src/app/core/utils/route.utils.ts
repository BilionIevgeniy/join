import { AuthService } from '@core/services/auth.service';
import { RoutesEnum } from '@core/models/routes.model';

/**
 * Back-navigation target for public pages (privacy policy, legal notice) that are
 * reachable both logged in and logged out — summary if logged in, login otherwise.
 */
export function loggedInAwareBackRoute(authService: AuthService): string {
  return authService.isLoggedIn() ? `/${RoutesEnum.SUMMARY}` : `/${RoutesEnum.LOGIN}`;
}
