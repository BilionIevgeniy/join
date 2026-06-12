import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-avatar',
  standalone: true,
  template: `
    <div class="user-avatar" [style.background]="color">
      {{ initials }}
    </div>
  `,
  styleUrl: './avatar.scss',
})
export class Avatar {
  @Input() initials: string = '';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() color: string = 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)';
}