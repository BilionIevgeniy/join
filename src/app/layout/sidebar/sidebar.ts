import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { RoutesEnum } from '../../core/models/routes.enum';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  navItems: NavItem[] = [
    {
      label: 'Summary',
      route: RoutesEnum.SUMMARY,
      icon: '/assets/icons/summary-icon.svg',
    },
    {
      label: 'Board',
      route: RoutesEnum.BOARD,
      icon: '/assets/icons/board-icon.svg',
    },
    {
      label: 'Add Task',
      route: RoutesEnum.ADD_TASK,
      icon: '/assets/icons/add-task-icon.svg',
    },
    {
      label: 'Contacts',
      route: RoutesEnum.CONTACTS,
      icon: '/assets/icons/contacts-icon.svg',
    },
  ];
}