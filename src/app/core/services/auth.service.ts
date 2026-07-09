import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase.service';
import { ContactService } from './contact.service';
import { ToastService } from './toast.service';
import { Contact } from '../models/contact.model';
import { RoutesEnum } from '../models/routes.model';
import { generateAvatarColor, generateInitials } from '../utils/contact.utils';
import { logAndNotify, withLoading } from '../utils/async.utils';
import { GREETING_INTRO_SESSION_KEY } from '@app/components/summary/summary';

// Guest placeholder — lives only in memory, never stored in DB
const GUEST_USER: Contact = {
  id: 'guest',
  first_name: 'Guest',
  last_name: '',
  email: 'guest@join.com',
  phone: null,
  color: '#9327FF',
  initials: 'G',
  auth_user_id: '',
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  // ─── DEPENDENCIES ───────────────────────────────────────────
  private supabase = inject(SupabaseService);
  private contactService = inject(ContactService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  // ─── STATE ────────────────────────────────────────────────
  currentUser = signal<Contact | null>(null);
  isLoading = signal(false);

  // ─── COMPUTED ─────────────────────────────────────────────
  isLoggedIn = computed(() => !!this.currentUser());
  isGuest = computed(() => this.currentUser()?.id === 'guest');

  // ─── SESSION ──────────────────────────────────────────────

  /** Called once in app.component on startup, before any routing. */
  async loadSession(): Promise<void> {
    if (this.restoreGuestSession()) return;

    // Check for existing Supabase Auth session (reads from localStorage — no DB call)
    const { data } = await this.supabase.db.auth.getSession();
    if (!data.session) {
      this.currentUser.set(null);
      return;
    }

    // Load contact data for authenticated user (one DB call)
    await this.loadContactForUser(data.session.user.id);
  }

  // ─── AUTH ─────────────────────────────────────────────────

  /** Creates a Supabase Auth user and its linked contact, then signs the user in. */
  async signUp(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  ): Promise<boolean> {
    return withLoading(this.isLoading, async () => {
      try {
        const contact = await this.createAuthUserAndContact(firstName, lastName, email, password);
        this.currentUser.set(contact);
        this.toastService.success('You signed up successfully!');
        this.router.navigate([RoutesEnum.SUMMARY]);
        return true;
      } catch (err: any) {
        this.reportSignUpError(err);
        return false;
      }
    });
  }

  /** Signs in with email/password and loads the linked contact. */
  async signIn(email: string, password: string): Promise<boolean> {
    return withLoading(this.isLoading, async () => {
      try {
        const { data, error } = await this.supabase.db.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        await this.loadContactForUser(data.user.id);
        this.router.navigate([RoutesEnum.SUMMARY]);
        return true;
      } catch (err) {
        logAndNotify(this.toastService, 'signIn', err, 'Email or password is incorrect.');
        return false;
      }
    });
  }

  /** Signs in with the in-memory guest placeholder — no Supabase Auth call, no persistence. */
  signInAsGuest(): void {
    sessionStorage.setItem('isGuest', 'true');
    this.currentUser.set(GUEST_USER);
    this.router.navigate([RoutesEnum.SUMMARY]);
  }

  /** Signs out (real or guest session) and returns to the login page. */
  async signOut(): Promise<void> {
    await withLoading(this.isLoading, async () => {
      try {
        if (!this.isGuest()) {
          await this.supabase.db.auth.signOut();
        }
        sessionStorage.removeItem('isGuest');
        sessionStorage.removeItem(GREETING_INTRO_SESSION_KEY);
        this.currentUser.set(null);
        this.toastService.success('You have been signed out.');
        this.router.navigate([RoutesEnum.LOGIN]);
      } catch (err) {
        logAndNotify(this.toastService, 'signOut', err, 'Failed to sign out.');
      }
    });
  }

  // ─── PRIVATE ──────────────────────────────────────────────

  /** Restores the guest session from sessionStorage, if present. Returns whether it did. */
  private restoreGuestSession(): boolean {
    if (sessionStorage.getItem('isGuest') !== 'true') return false;
    this.currentUser.set(GUEST_USER);
    return true;
  }

  /** Step 1: creates the Supabase Auth user. Step 2: upserts its linked contact. */
  private async createAuthUserAndContact(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  ): Promise<Contact> {
    const { data, error } = await this.supabase.db.auth.signUp({ email, password });
    if (error) throw error;
    if (!data.user) throw new Error('No user returned from signUp');

    const contact = await this.contactService.upsertFromAuth({
      first_name: firstName,
      last_name: lastName,
      email,
      color: generateAvatarColor(firstName),
      initials: generateInitials(firstName, lastName),
      auth_user_id: data.user.id,
    });
    if (!contact) throw new Error('Failed to create contact');
    return contact;
  }

  /** Logs the signUp failure and shows a user-facing message, distinguishing duplicate emails. */
  private reportSignUpError(err: any): void {
    console.error('signUp failed:', err);
    const message = err?.message?.includes('already registered')
      ? 'This email is already registered.'
      : 'Registration failed.';
    this.toastService.error(message);
  }

  private async loadContactForUser(authUserId: string): Promise<void> {
    const contact = await this.contactService.getByAuthUserId(authUserId);
    if (!contact) {
      console.error('loadContactForUser: contact not found for authUserId:', authUserId);
      this.toastService.error('Failed to load user data.');
      this.currentUser.set(null);
      return;
    }
    this.currentUser.set(contact);
  }
}
