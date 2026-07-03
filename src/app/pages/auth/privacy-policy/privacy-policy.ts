import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="placeholder-page">
      <h1>Privacy Policy</h1>
      <p>Content coming soon.</p>
      <a routerLink="/login">← Back to Login</a>
    </div>
  `,
  styles: [`
    .placeholder-page {
      padding: 40px;
      font-family: var(--font-family-main);
      color: var(--text-color);

      h1 { margin-bottom: 16px; }
      a { color: var(--btn-primary-bg); text-decoration: none; }
    }
  `],
})
export class PrivacyPolicy {}
