export enum RoutesEnum {
  SUMMARY = 'summary',
  BOARD = 'board',
  ADD_TASK = 'add-task',
  CONTACTS = 'contacts',
  LOGIN = 'login',
  SIGNUP = 'signup',
}

export interface NavItem {
  label: string;
  route: string;
  icon: string;
}
