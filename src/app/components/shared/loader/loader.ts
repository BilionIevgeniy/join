import { Component } from '@angular/core';

/** Full-overlay spinner. Visibility is controlled by the parent via `@if`, driven by a service's `isLoading` signal. */
@Component({
  selector: 'app-loader',
  standalone: true,
  template: `
    <div class="loader-overlay">
      <div class="loader-spinner"></div>
    </div>
  `,
  styleUrl: './loader.scss',
})
export class Loader {}
