import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-avatar',
  standalone: true,
  template: `
    @if (initials) {
      <div class="user-avatar"
        [class.small]="size === 'small'"
        [class.medium]="size === 'medium'"
        [class.large]="size === 'large'"
        [style.background]="color"
        [style.border]="border">
        {{ initials }}
      </div>
    } @else {
      <div class="user-avatar user-avatar--default"
        [class.small]="size === 'small'"
        [class.medium]="size === 'medium'"
        [class.large]="size === 'large'">
        <img src="/assets/icons/person.svg" alt="avatar" class="user-avatar__icon" />
      </div>
    }
  `,
  styleUrl: './avatar.scss',
})
export class Avatar {
  @Input() initials: string = '';
  @Input() border: string = '1px solid transparent';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() color: string = 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)';
}
