import { Component, OnInit, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { RoutesEnum } from '@core/models/routes.model';
import { SignupHint } from '@shared/signup-hint/signup-hint';

/** AuthLayout — shell for unauthenticated pages; plays the login intro animation and toggles the signup hint. */
@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet, RouterLink, SignupHint],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.scss',
})
export class AuthLayout implements OnInit {
  // ─── DEPENDENCIES ───────────────────────────────────────────
  private router = inject(Router);

  // ─── STATE ────────────────────────────────────────────────
  animating = signal(true);
  hideSignupHint = signal(false);

  // ─── LIFECYCLE ────────────────────────────────────────────

  ngOnInit(): void {
    this.updateForUrl(this.router.url);

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => this.updateForUrl(event.urlAfterRedirects));
  }

  // ─── PRIVATE ──────────────────────────────────────────────

  /** Re-evaluates intro-animation and signup-hint visibility for the current URL. */
  private updateForUrl(url: string): void {
    this.playIntroIfLogin(url);
    this.hideSignupHint.set(url.includes(RoutesEnum.SIGNUP));
  }

  private playIntroIfLogin(url: string): void {
    if (!url.includes(RoutesEnum.LOGIN)) return;

    this.animating.set(true);
    setTimeout(() => this.animating.set(false), 900);
  }
}
