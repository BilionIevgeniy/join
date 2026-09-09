import { Component, input, output, signal } from '@angular/core';

/** CheckboxButton — icon-based checkbox that briefly flags `justChecked` to trigger a check animation. */
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

  justChecked = signal(false);

  toggle(): void {
    const next = !this.checked();
    this.toggled.emit(next);
    if (next) {
      this.justChecked.set(false);
      requestAnimationFrame(() => this.justChecked.set(true));
    }
  }

  get icon(): string {
    return this.checked() ? 'ckeck-button-active-default.svg' : 'choice-quarder-icon.svg';
  }
}
