import { Component } from '@angular/core';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  template: `
    <div class="placeholder-page">
      <h1>Privacy Policy</h1>
      <p>Content coming soon.</p>
    </div>
  `,
  styles: [`
    .placeholder-page {
      padding: 40px;
      font-family: var(--font-family-main);
      color: var(--text-color);

      h1 { margin-bottom: 16px; }
    }
  `],
})
export class PrivacyPolicy {}
