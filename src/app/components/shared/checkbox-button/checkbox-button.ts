import { Component, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-checkbox-button',
  standalone: true,
  templateUrl: './checkbox-button.html',
  styleUrl: './checkbox-button.scss',
})
export class CheckboxButton {
  checked = input<boolean>(false);
  label = input<string>('');
  toggled = output<boolean>();

  isHovered = signal(false);

  toggle(): void {
    this.toggled.emit(!this.checked());
  }

  get icon(): string {
    if (this.checked()) {
      return this.isHovered() ? 'ckeck-button-active-hover.svg' : 'ckeck-button-active-default.svg';
    }
    return this.isHovered() ? 'ckeck-button-hover.svg' : 'check-button-default.svg';
  }
}
