import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NavItem, RoutesEnum } from '@core/models/routes.model';
import { AuthService } from '@core/services/auth.service';

/** Sidebar — primary navigation, shown only when a user is logged in. */
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  private authService = inject(AuthService);

  isLoggedIn = this.authService.isLoggedIn;

  navItems: NavItem[] = [
    {
      label: 'Summary',
      route: RoutesEnum.SUMMARY,
      icon: 'assets/icons/summary-icon.svg',
    },
    {
      label: 'Add Task',
      route: RoutesEnum.ADD_TASK,
      icon: 'assets/icons/add-task-icon.svg',
    },
    {
      label: 'Board',
      route: RoutesEnum.BOARD,
      icon: 'assets/icons/board-icon.svg',
    },
    {
      label: 'Contacts',
      route: RoutesEnum.CONTACTS,
      icon: 'assets/icons/contacts-icon.svg',
    },
  ];
}
