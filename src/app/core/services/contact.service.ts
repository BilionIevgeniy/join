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

@Injectable({ providedIn: 'root' })
export class ContactService {
  private supabase = inject(SupabaseService);
  private toastService = inject(ToastService);

  // Signals
  private contactsMap = signal<Record<string, Contact>>({});
  isLoading = signal(false);

  // Computed signals
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

  async getAll(): Promise<void> {
    this.isLoading.set(true);
    try {
      const { data, error } = await this.supabase.db.from('contacts').select('*');
      if (error) throw error;
      const map: Record<string, Contact> = {};
      data.forEach((c: Contact) => {
        if (c.id) map[c.id] = c;
      });
      this.contactsMap.set(map);
    } catch (err) {
      console.error('getAll contacts failed:', err);
      this.toastService.error('Failed to load contacts.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async addContact(dto: CreateContactDto): Promise<Contact | null> {
    this.isLoading.set(true);
    try {
      const payload = {
        ...dto,
        initials: generateInitials(dto.first_name, dto.last_name),
        color: generateAvatarColor(dto.first_name),
      };
      const { data, error } = await this.supabase.db
        .from('contacts')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      this.setOne(data);
      this.toastService.success('Contact added successfully.');
      return data;
    } catch (err) {
      console.error('addContact failed:', err);
      this.toastService.error('Failed to add contact.');
      return null;
    } finally {
      this.isLoading.set(false);
    }
  }

  async updateContact(id: string, dto: UpdateContactDto): Promise<Contact | null> {
    const existing = this.contactsMap()[id];
    if (!existing) return null;
    this.isLoading.set(true);
    try {
      const patch = {
        ...dto,
        // Recalculate initials only if both name fields are provided
        ...(dto.first_name &&
          dto.last_name && {
            initials: generateInitials(dto.first_name, dto.last_name),
          }),
      };
      const { data, error } = await this.supabase.db
        .from('contacts')
        .update(patch)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      this.setOne(data);
      this.toastService.success('Contact updated successfully.');
      return data;
    } catch (err) {
      console.error('updateContact failed:', err);
      this.toastService.error('Failed to update contact.');
      return null;
    } finally {
      this.isLoading.set(false);
    }
  }

  async deleteContact(id: string): Promise<boolean> {
    this.isLoading.set(true);
    try {
      const { error } = await this.supabase.db.from('contacts').delete().eq('id', id);
      if (error) throw error;
      this.contactsMap.update((map) => {
        const next = { ...map };
        delete next[id];
        return next;
      });
      this.toastService.success('Contact deleted successfully.');
      return true;
    } catch (err) {
      console.error('deleteContact failed:', err);
      this.toastService.error('Failed to delete contact.');
      return false;
    } finally {
      this.isLoading.set(false);
    }
  }

  // ─── AUTH HELPERS ──────────────────────────────────────────────

  // Called during signIn — find contact by Supabase Auth user id
  async getByAuthUserId(authUserId: string): Promise<Contact | null> {
    const { data, error } = await this.supabase.db
      .from('contacts')
      .select('*')
      .eq('auth_user_id', authUserId)
      .single();
    if (error || !data) return null;
    return data;
  }

  // Called during signUp — upsert contact by email (update if exists, create if not)
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
      console.error('upsertFromAuth failed:', err);
      return null;
    }
  }

  // ─── PRIVATE ───────────────────────────────────────────────────

  private setOne(contact: Contact): void {
    if (!contact.id) return;
    this.contactsMap.update((map) => ({ ...map, [contact.id!]: contact }));
  }
}
