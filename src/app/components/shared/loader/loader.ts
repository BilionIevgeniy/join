import { Component } from '@angular/core';

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
