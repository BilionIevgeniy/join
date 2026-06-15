export enum RoutesEnum {
  SUMMARY = 'summary',
  BOARD = 'board',
  ADD_TASK = 'add-task',
  CONTACTS = 'contacts',
}

export interface NavItem {
  label: string;
  route: string;
  icon: string;
}
