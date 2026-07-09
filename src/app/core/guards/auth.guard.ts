import { RoutesEnum } from '../models/routes.model';
import { createAuthGuard } from './guard.utils';

/** Blocks access to authenticated routes for logged-out users, redirecting to login. */
export const authGuard = createAuthGuard((authService) => authService.isLoggedIn(), RoutesEnum.LOGIN);
