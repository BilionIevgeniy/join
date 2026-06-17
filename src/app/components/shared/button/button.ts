import { Component, input } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [],
  templateUrl: './button.html',
  styleUrl: './button.scss',
})
export class Button {
  label = input<string>('');
  variant = input<'primary' | 'secondary' | 'outline' | 'text'>('primary');
  icon = input<string>('');
  hoverIcon = input<string>('');
  size = input<'xsmall' | 'small' | 'medium' | 'large'>('medium');
  iconPosition = input<'left' | 'right'>('right');
  weight = input<'regular' | 'medium' | 'bold'>('bold');
  fontSize = input<'small' | 'medium' | 'large'>('medium');
  disabled = input<boolean>(false);
  fullWidth = input<boolean>(false);
  type = input<'button' | 'submit' | 'reset'>('button');
}
