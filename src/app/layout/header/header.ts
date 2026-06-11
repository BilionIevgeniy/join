import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  // Benutzer-Info (später aus Service)
  userName = signal('Sofia Müller');
  userEmail = signal('sofia.mueller@join.com');
  userInitials = signal('SM');
  
  isDropdownOpen = signal(false);

  toggleDropdown() {
    this.isDropdownOpen.update(value => !value);
  }
}