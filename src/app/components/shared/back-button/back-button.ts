import { Component, input } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-back-button',
  standalone: true,
  templateUrl: './back-button.html',
  styleUrl: './back-button.scss',
})
export class BackButton {
  fallbackRoute = input<string | null>(null);

  constructor(
    private location: Location,
    private router: Router,
  ) {}

  goBack(): void {
    const fallbackRoute = this.fallbackRoute();
    if (fallbackRoute) {
      this.router.navigateByUrl(fallbackRoute);
      return;
    }
    this.location.back();
  }
}
