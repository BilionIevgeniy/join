import { Component, input, output, signal } from '@angular/core';

/** SearchInput — controlled text input emitting `searchChange` on every keystroke. */
@Component({
  selector: 'app-search-input',
  standalone: true,
  templateUrl: './search-input.html',
  styleUrl: './search-input.scss',
})
export class SearchInput {
  placeholder = input<string>('Find Task');
  searchChange = output<string>();

  isFocused = signal(false);
  value = signal('');

  onInput(value: string): void {
    this.value.set(value);
    this.searchChange.emit(value);
  }
}
