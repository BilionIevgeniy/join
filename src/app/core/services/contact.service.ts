/**
 * ContactService — CRUD over Supabase `contacts` table.
 *
 * Supabase query-builder cheatsheet (used in this file):
 *
 *  .from('table')           — select the target table
 *  .select('*')             — SELECT all columns
 *  .insert(payload)         — INSERT a single row or array of rows
 *  .update(patch)           — UPDATE; always chain .eq() to avoid full-table update
 *  .delete()                — DELETE; always chain .eq() to avoid full-table delete
 *  .upsert(payload, opts)   — INSERT or UPDATE on conflict
 *  .eq('col', value)        — WHERE col = value
 *  .select() after mutation — returns persisted rows
 *  .single()                — unwraps [{...}] → {...}
 */
import { Injectable, computed, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { ToastService } from './toast.service';
import {
  Contact,
  CreateContactDto,
  UpdateContactDto,
  UpsertContactDto,
} from '../models/contact.model';
import { generateAvatarColor, generateInitials } from '../utils/contact.utils';
import { logAndNotify, withLoading } from '../utils/toast.utils';
import { toMapById } from '../utils/collection.utils';

@Injectable({ providedIn: 'root' })
export class ContactService {
  // ─── DEPENDENCIES ───────────────────────────────────────────
  private supabase = inject(SupabaseService);
  private toastService = inject(ToastService);

  // ─── STATE ────────────────────────────────────────────────
  private contactsMap = signal<Record<string, Contact>>({});
  isLoading = signal(false);

  // ─── COMPUTED ─────────────────────────────────────────────
  contacts = computed(() => Object.values(this.contactsMap()));
  sortedContacts = computed(() =>
    [...this.contacts()].sort((a, b) => a.first_name.localeCompare(b.first_name)),
  );
  groupedContacts = computed(() => {
    const groups: Record<string, Contact[]> = {};
    this.sortedContacts().forEach((contact) => {
      const letter = contact.first_name[0].toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(contact);
    });
    return groups;
  });

  // ─── CRUD ──────────────────────────────────────────────────────

  /** Loads all contacts from Supabase into local state. */
  async getAll(): Promise<void> {
    await withLoading(this.isLoading, async () => {
      try {
        const { data, error } = await this.supabase.db.from('contacts').select('*');
        if (error) throw error;
        this.contactsMap.set(toMapById(data));
      } catch (err) {
        logAndNotify(this.toastService, 'getAll contacts', err, 'Failed to load contacts.');
      }
    });
  }

  /** Creates a contact, deriving its initials/avatar color from the provided names. */
  async addContact(dto: CreateContactDto): Promise<Contact | null> {
    return withLoading(this.isLoading, async () => {
      try {
        const query = this.supabase.db
          .from('contacts')
          .insert(this.buildCreatePayload(dto))
          .select()
          .single();
        return await this.persistAndNotify(query, 'Contact added successfully.');
      } catch (err) {
        logAndNotify(this.toastService, 'addContact', err, 'Failed to add contact.');
        return null;
      }
    });
  }

  /** Updates an existing contact; no-op returning `null` if the id is unknown locally. */
  async updateContact(id: string, dto: UpdateContactDto): Promise<Contact | null> {
    const existing = this.contactsMap()[id];
    if (!existing) return null;
    return withLoading(this.isLoading, async () => {
      try {
        const query = this.supabase.db
          .from('contacts')
          .update(this.buildUpdatePatch(dto))
          .eq('id', id)
          .select()
          .single();
        return await this.persistAndNotify(query, 'Contact updated successfully.');
      } catch (err) {
        logAndNotify(this.toastService, 'updateContact', err, 'Failed to update contact.');
        return null;
      }
    });
  }

  /**
   * Deletes a contact, also removing its linked auth user (if any) via an Edge Function.
   * @param currentAuthUserId - the currently signed-in user's auth id, used to detect self-deletion
   * @returns `success` — whether the delete succeeded; `shouldSignOut` — true when the
   * deleted contact was the caller's own account, so the caller must sign out immediately.
   */
  async deleteContact(
    contact: Contact,
    currentAuthUserId?: string,
  ): Promise<{ success: boolean; shouldSignOut: boolean }> {
    return withLoading(this.isLoading, async () => {
      try {
        await this.deleteAuthUserIfLinked(contact);
        const { error } = await this.supabase.db.from('contacts').delete().eq('id', contact.id);
        if (error) throw error;

        this.removeOne(contact.id!);
        this.toastService.success('Contact deleted successfully.');

        const shouldSignOut = !!contact.auth_user_id && contact.auth_user_id === currentAuthUserId;
        return { success: true, shouldSignOut };
      } catch (err) {
        logAndNotify(this.toastService, 'deleteContact', err, 'Failed to delete contact.');
        return { success: false, shouldSignOut: false };
      }
    });
  }

  // ─── AUTH HELPERS ──────────────────────────────────────────────

  /** Called during signIn — finds a contact by its linked Supabase Auth user id. */
  async getByAuthUserId(authUserId: string): Promise<Contact | null> {
    const { data, error } = await this.supabase.db
      .from('contacts')
      .select('*')
      .eq('auth_user_id', authUserId)
      .single();
    if (error || !data) return null;
    return data;
  }

  /** Called during signUp — upserts a contact by email (updates if it exists, creates otherwise). */
  async upsertFromAuth(dto: UpsertContactDto): Promise<Contact | null> {
    try {
      const { data, error } = await this.supabase.db
        .from('contacts')
        .upsert(dto, { onConflict: 'email' })
        .select()
        .single();
      if (error) throw error;
      this.setOne(data);
      return data;
    } catch (err) {
      // No toast here — caller (AuthService.signUp) reports its own failure message.
      console.error('upsertFromAuth failed:', err);
      return null;
    }
  }

  // ─── PRIVATE ───────────────────────────────────────────────────

  /**
   * Awaits an insert/update query, updates local state, and shows a success toast.
   * Shared by {@link addContact} and {@link updateContact}, which only differ in
   * how the query itself is built.
   */
  private async persistAndNotify(
    query: PromiseLike<{ data: Contact | null; error: unknown }>,
    successMessage: string,
  ): Promise<Contact> {
    const { data, error } = await query;
    if (error || !data) throw error ?? new Error('No data returned');
    this.setOne(data);
    this.toastService.success(successMessage);
    return data;
  }

  /** Deletes the contact's linked auth.users row via Edge Function, if it has one. */
  private async deleteAuthUserIfLinked(contact: Contact): Promise<void> {
    if (!contact.auth_user_id) return;
    const { error } = await this.supabase.db.functions.invoke('delete-user', {
      body: { auth_user_id: contact.auth_user_id },
    });
    if (error) throw error;
  }

  /** Builds the insert payload for a new contact, deriving initials and avatar color. */
  private buildCreatePayload(dto: CreateContactDto): CreateContactDto & {
    initials: string;
    color: string;
  } {
    return {
      ...dto,
      initials: generateInitials(dto.first_name, dto.last_name),
      color: generateAvatarColor(dto.first_name),
    };
  }

  /** Builds an update patch, recalculating initials only when both name fields are provided. */
  private buildUpdatePatch(dto: UpdateContactDto): UpdateContactDto & { initials?: string } {
    return {
      ...dto,
      ...(dto.first_name &&
        dto.last_name && {
          initials: generateInitials(dto.first_name, dto.last_name),
        }),
    };
  }

  private setOne(contact: Contact): void {
    if (!contact.id) return;
    this.contactsMap.update((map) => ({ ...map, [contact.id!]: contact }));
  }

  private removeOne(id: string): void {
    this.contactsMap.update((map) => {
      const next = { ...map };
      delete next[id];
      return next;
    });
  }
}
