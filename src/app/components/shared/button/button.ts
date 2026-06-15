import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [],
  templateUrl: './button.html',
  styleUrl: './button.scss',
})
export class Button {
  @Input() label: string = '';
  @Input() variant: 'primary' | 'secondary' | 'outline' | 'text' = 'primary';
  @Input() icon: string = '';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() weight: 'regular' | 'medium' | 'bold' = 'bold';
  @Input() fontSize: 'small' | 'medium' | 'large' = 'medium';
  @Input() disabled: boolean = false;
  @Input() fullWidth: boolean = false;
}
