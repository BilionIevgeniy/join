import { Component, computed, inject } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { RoutesEnum } from '@core/models/routes.model';
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

  backRoute = computed(() =>
    this.authService.isLoggedIn() ? `/${RoutesEnum.SUMMARY}` : `/${RoutesEnum.LOGIN}`,
  );
}
