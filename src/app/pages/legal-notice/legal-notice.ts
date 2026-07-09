import { Component, computed, inject } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { loggedInAwareBackRoute } from '@core/utils/route.utils';
import { BackButton } from '@shared/back-button/back-button';

@Component({
  selector: 'app-legal-notice',
  standalone: true,
  imports: [BackButton],
  templateUrl: './legal-notice.html',
  styleUrl: './legal-notice.scss',
})
export class LegalNotice {
  private authService = inject(AuthService);

  backRoute = computed(() => loggedInAwareBackRoute(this.authService));
}
