import { Component, computed, inject } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { RoutesEnum } from '@core/models/routes.model';
import { BackButton } from '@shared/back-button/back-button';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [BackButton],
  templateUrl: './privacy-policy.html',
  styleUrl: './privacy-policy.scss',
})
export class PrivacyPolicy {
  private authService = inject(AuthService);

  backRoute = computed(() =>
    this.authService.isLoggedIn() ? `/${RoutesEnum.SUMMARY}` : `/${RoutesEnum.LOGIN}`,
  );
}
