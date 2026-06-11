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
  
  isDropdownOpen = signal(false);

  toggleDropdown() {
    this.isDropdownOpen.update(value => !value);
  }
}