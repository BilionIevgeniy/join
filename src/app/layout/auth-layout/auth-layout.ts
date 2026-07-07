import { Component, OnInit, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { RoutesEnum } from '@core/models/routes.model';
import { SignupHint } from '@shared/signup-hint/signup-hint';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet, RouterLink, SignupHint],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.scss',
})
export class AuthLayout implements OnInit {
  private router = inject(Router);

  animating = signal(true);
  hideSignupHint = signal(false);

  ngOnInit(): void {
    this.playIntroIfLogin(this.router.url);
    this.hideSignupHint.set(this.router.url.includes(RoutesEnum.SIGNUP));

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.playIntroIfLogin(event.urlAfterRedirects);
        this.hideSignupHint.set(event.urlAfterRedirects.includes(RoutesEnum.SIGNUP));
      });
  }

  private playIntroIfLogin(url: string): void {
    if (!url.includes(RoutesEnum.LOGIN)) return;

    this.animating.set(true);
    setTimeout(() => this.animating.set(false), 900);
  }
}
