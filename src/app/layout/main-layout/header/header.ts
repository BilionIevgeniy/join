import { Component, ElementRef, HostListener, computed, inject, signal } from '@angular/core';
import { Avatar } from '@shared/avatar/avatar';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [Avatar],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private authService = inject(AuthService);

  isLoggedIn = this.authService.isLoggedIn;
  userInitials = computed(() => this.authService.currentUser()?.initials ?? '');
  userColor = computed(() => this.authService.currentUser()?.color ?? '');

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

  async logout(): Promise<void> {
    await this.authService.signOut();
  }
}
