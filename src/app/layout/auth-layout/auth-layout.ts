import { Component, OnInit, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { RoutesEnum } from '@core/models/routes.model';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.scss',
})
export class AuthLayout implements OnInit {
  private router = inject(Router);

  animating = signal(true);

  ngOnInit(): void {
    this.playIntroIfLogin(this.router.url);

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => this.playIntroIfLogin(event.urlAfterRedirects));
  }

  private playIntroIfLogin(url: string): void {
    if (!url.includes(RoutesEnum.LOGIN)) return;

    this.animating.set(true);
    // After the logo animation completes, switch to static layout
    setTimeout(() => this.animating.set(false), 900);
  }
}
