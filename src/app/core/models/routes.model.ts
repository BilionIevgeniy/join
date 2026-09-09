/** Route path segments used for navigation and for matching the current URL (e.g. in {@link AuthLayout}). */
export enum RoutesEnum {
  SUMMARY = 'summary',
  BOARD = 'board',
  ADD_TASK = 'add-task',
  CONTACTS = 'contacts',
  LOGIN = 'login',
  SIGNUP = 'signup',
  PRIVACY_POLICY = 'privacy-policy',
  LEGAL_NOTICE = 'legal-notice',
  HELP = 'help',
}

/** One entry in the sidebar navigation, rendered by {@link Sidebar}. */
export interface NavItem {
  label: string;
  route: string;
  icon: string;
}
