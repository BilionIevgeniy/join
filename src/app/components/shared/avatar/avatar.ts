import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-avatar',
  standalone: true,
  template: `
    <div class="user-avatar" [style.background]="getGradient()">
      {{ initials }}
    </div>
  `,
  styleUrl: './avatar.scss',
})
export class Avatar {
  @Input() initials: string = '';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';

  getGradient(): string {
    const colors: { [key: string]: string } = {
      A: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
      B: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
      C: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)',
      D: 'linear-gradient(135deg, #f39c12 0%, #d68910 100%)',
      E: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)',
      F: 'linear-gradient(135deg, #1abc9c 0%, #16a085 100%)',
    };

    // Erste Initiale nehmen
    const firstLetter = this.initials.charAt(0).toUpperCase();
    return colors[firstLetter] || 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)';
  }
}