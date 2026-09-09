import { Component, computed, inject } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { loggedInAwareBackRoute } from '@core/utils/route.utils';
import { BackButton } from '@shared/back-button/back-button';

/** Static privacy-policy page, reachable both from the auth flow and from within the logged-in app. */
@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [BackButton],
  templateUrl: './privacy-policy.html',
  styleUrl: './privacy-policy.scss',
})
export class PrivacyPolicy {
  private authService = inject(AuthService);

  backRoute = computed(() => loggedInAwareBackRoute(this.authService));
}
