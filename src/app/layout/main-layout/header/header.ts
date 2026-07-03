import { Component, ElementRef, HostListener, signal } from '@angular/core';
import { Avatar } from '@shared/avatar/avatar';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [Avatar],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  userEmail = signal('sofia.mueller@join.com');
  userInitials = signal('SM');
  userColor = signal('linear-gradient(135deg, #3498db 0%, #2980b9 100%)');

  isLoggedIn = signal(true);
  isDropdownOpen = signal(false);
  isDropdownClosing = signal(false);

  constructor(private elementRef: ElementRef<HTMLElement>) {}

  toggleDropdown(): void {
    if (this.isDropdownOpen()) {
      this.closeDropdown();
    } else {
      this.isDropdownOpen.set(true);
    }
  }

  closeDropdown(): void {
    this.isDropdownClosing.set(true);
    setTimeout(() => {
      this.isDropdownOpen.set(false);
      this.isDropdownClosing.set(false);
    }, 200);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isDropdownOpen() || this.isDropdownClosing()) return;
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.closeDropdown();
    }
  }
}