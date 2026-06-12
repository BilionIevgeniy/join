import { Component, signal } from '@angular/core';
import { Avatar } from '../../components/shared/avatar/avatar';

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

  toggleDropdown() {
    this.isDropdownOpen.update(value => !value);
  }
}