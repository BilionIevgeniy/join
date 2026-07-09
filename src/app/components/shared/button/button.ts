import { Component, ViewEncapsulation, input } from '@angular/core';

/** Shared button used across the app; styling and icon are fully driven by inputs, no internal state. */
@Component({
  selector: 'app-button',
  standalone: true,
  imports: [],
  templateUrl: './button.html',
  styleUrl: './button.scss',
  encapsulation: ViewEncapsulation.None,
})
export class Button {
  label = input<string>('');
  variant = input<'primary' | 'secondary' | 'outline' | 'text'>('primary');
  /** Filename only, e.g. `'check.svg'` — the `/assets/icons/` path is added in the template. */
  icon = input<string>('');
  /** Filename only, swapped in for `icon` on hover if set. */
  hoverIcon = input<string>('');
  size = input<'xxsmall' | 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge'>('medium');
  iconPosition = input<'left' | 'right'>('right');
  weight = input<'regular' | 'medium' | 'bold'>('bold');
  fontSize = input<'small' | 'medium' | 'large'>('medium');
  disabled = input<boolean>(false);
  fullWidth = input<boolean>(false);
  type = input<'button' | 'submit' | 'reset'>('button');
}
