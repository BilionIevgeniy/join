import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase.service';
import { ContactService } from './contact.service';
import { ToastService } from './toast.service';
import { Contact } from '../models/contact.model';
import { RoutesEnum } from '../models/routes.model';
import { generateAvatarColor, generateInitials } from '../utils/contact.utils';
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
  private supabase = inject(SupabaseService);
  private contactService = inject(ContactService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  currentUser = signal<Contact | null>(null);
  isLoading = signal(false);

  isLoggedIn = computed(() => !!this.currentUser());
  isGuest = computed(() => this.currentUser()?.id === 'guest');

  // ─── SESSION ──────────────────────────────────────────────

  // Called once in app.component on startup — before any routing
  async loadSession(): Promise<void> {
    console.log('loadSession');
    // Guest session stored in sessionStorage
    if (sessionStorage.getItem('isGuest') === 'true') {
      this.currentUser.set(GUEST_USER);
      return;
    }

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

  async signUp(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  ): Promise<boolean> {
    this.isLoading.set(true);
    try {
      // Step 1: create auth user in Supabase Auth
      const { data, error } = await this.supabase.db.auth.signUp({ email, password });
      if (error) throw error;
      if (!data.user) throw new Error('No user returned from signUp');

      // Step 2: upsert contact — update if email exists, create if not
      const contact = await this.contactService.upsertFromAuth({
        first_name: firstName,
        last_name: lastName,
        email,
        color: generateAvatarColor(firstName),
        initials: generateInitials(firstName, lastName),
        auth_user_id: data.user.id,
      });

      if (!contact) throw new Error('Failed to create contact');

      this.currentUser.set(contact);
      this.toastService.success('You signed up successfully!');
      this.router.navigate([RoutesEnum.SUMMARY]);
      return true;
    } catch (err: any) {
      console.error('signUp failed:', err);
      const message = err?.message?.includes('already registered')
        ? 'This email is already registered.'
        : 'Registration failed.';
      this.toastService.error(message);
      return false;
    } finally {
      this.isLoading.set(false);
    }
  }

  async signIn(email: string, password: string): Promise<boolean> {
    this.isLoading.set(true);
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
      console.error('signIn failed:', err);
      this.toastService.error('Email or password is incorrect.');
      return false;
    } finally {
      this.isLoading.set(false);
    }
  }

  signInAsGuest(): void {
    sessionStorage.setItem('isGuest', 'true');
    this.currentUser.set(GUEST_USER);
    this.router.navigate([RoutesEnum.SUMMARY]);
  }

  async signOut(): Promise<void> {
    this.isLoading.set(true);
    try {
      if (!this.isGuest()) {
        await this.supabase.db.auth.signOut();
      }
      sessionStorage.removeItem('isGuest');
      this.currentUser.set(null);
      this.toastService.success('You have been signed out.');
      this.router.navigate([RoutesEnum.LOGIN]);
      sessionStorage.removeItem(GREETING_INTRO_SESSION_KEY);
    } catch (err) {
      console.error('signOut failed:', err);
      this.toastService.error('Failed to sign out.');
    } finally {
      this.isLoading.set(false);
    }
  }

  // ─── PRIVATE ──────────────────────────────────────────────

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
